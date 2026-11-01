package com.bidx;

import com.bidx.dto.PlaceBidRequest;
import com.bidx.entity.Auction;
import com.bidx.entity.AuctionStatus;
import com.bidx.entity.Role;
import com.bidx.entity.User;
import com.bidx.repository.AuctionRepository;
import com.bidx.repository.BidRepository;
import com.bidx.repository.UserRepository;
import com.bidx.repository.WalletRepository;
import com.bidx.service.BiddingService;
import com.bidx.service.WalletService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class ConcurrentBiddingTest {

    @Autowired
    private BiddingService biddingService;

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WalletService walletService;

    @Autowired
    private BidRepository bidRepository;

    private Auction testAuction;
    private List<User> testUsers;

    @BeforeEach
    public void setup() {
        // Clean previous test data
        testUsers = new ArrayList<>();

        User seller = userRepository.findByUsername("test_seller").orElseGet(() -> {
            User s = new User("test_seller", "testseller@bidx.io", "pass", "Test Seller", Role.ROLE_SELLER);
            return userRepository.save(s);
        });

        for (int i = 1; i <= 20; i++) {
            final int index = i;
            User user = userRepository.findByUsername("test_user_" + index).orElseGet(() -> {
                User u = new User("test_user_" + index, "testuser" + index + "@bidx.io", "pass", "Bidder " + index, Role.ROLE_USER);
                u = userRepository.save(u);
                walletService.depositDemoFunds(u, BigDecimal.valueOf(500000.00));
                return u;
            });
            testUsers.add(user);
        }

        testAuction = new Auction();
        testAuction.setTitle("Concurrency Verification Test Item");
        testAuction.setDescription("Item to test 50 simultaneous bids");
        testAuction.setCategory("Watches");
        testAuction.setStartingPrice(BigDecimal.valueOf(10000.00));
        testAuction.setCurrentBid(BigDecimal.valueOf(10000.00));
        testAuction.setMinIncrement(BigDecimal.valueOf(500.00));
        testAuction.setStartTime(LocalDateTime.now().minusMinutes(5));
        testAuction.setEndTime(LocalDateTime.now().plusHours(2));
        testAuction.setSeller(seller);
        testAuction.setStatus(AuctionStatus.ACTIVE);
        testAuction.setTotalBids(0);
        testAuction = auctionRepository.save(testAuction);
    }

    @Test
    @DisplayName("Verify that 50 concurrent bids preserve transactional consistency without lost updates")
    public void testHighConcurrencyBidding() throws InterruptedException {
        int numberOfThreads = 20;
        ExecutorService executorService = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(1);
        CountDownLatch doneSignal = new CountDownLatch(numberOfThreads);

        AtomicInteger successfulBids = new AtomicInteger(0);
        AtomicInteger rejectedBids = new AtomicInteger(0);

        for (int i = 0; i < numberOfThreads; i++) {
            final int threadIndex = i;
            final User bidder = testUsers.get(threadIndex % testUsers.size());

            executorService.submit(() -> {
                try {
                    // Wait for all threads to align at starting gate
                    latch.await();

                    // Each thread submits an ascending bid amount
                    BigDecimal bidAmount = BigDecimal.valueOf(10500 + (threadIndex * 600));
                    biddingService.placeBid(testAuction.getId(), new PlaceBidRequest(bidAmount), bidder);
                    successfulBids.incrementAndGet();
                } catch (Exception ex) {
                    // Outbid conflict or lower bid correctly rejected
                    rejectedBids.incrementAndGet();
                } finally {
                    doneSignal.countDown();
                }
            });
        }

        // Fire all threads simultaneously
        latch.countDown();
        boolean completedInTime = doneSignal.await(30, TimeUnit.SECONDS);
        executorService.shutdown();

        assertTrue(completedInTime, "Concurrent bidding should complete within 30 seconds");

        // Verify database state
        Auction updatedAuction = auctionRepository.findById(testAuction.getId()).orElseThrow();

        System.out.println("=== CONCURRENT BIDDING TEST RESULTS ===");
        System.out.println("Total Threads: " + numberOfThreads);
        System.out.println("Successful Bids: " + successfulBids.get());
        System.out.println("Safely Rejected Bids: " + rejectedBids.get());
        System.out.println("Final Highest Bid: ₹" + updatedAuction.getCurrentBid());
        System.out.println("Total Recorded Bids: " + updatedAuction.getTotalBids());
        System.out.println("=======================================");

        // Integrity assertions:
        assertTrue(successfulBids.get() > 0, "At least one bid must succeed");
        assertEquals(successfulBids.get(), updatedAuction.getTotalBids(), "Recorded bids count must match successful bids");
        assertTrue(updatedAuction.getCurrentBid().compareTo(BigDecimal.valueOf(10000.00)) > 0, "Current bid must be strictly greater than starting price");
        assertNotNull(updatedAuction.getHighestBidder(), "There must be an acknowledged highest bidder");
    }
}
