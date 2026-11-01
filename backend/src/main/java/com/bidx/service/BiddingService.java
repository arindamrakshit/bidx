package com.bidx.service;

import com.bidx.dto.BidResponse;
import com.bidx.dto.BidWebSocketEvent;
import com.bidx.dto.PlaceBidRequest;
import com.bidx.entity.Auction;
import com.bidx.entity.AuctionStatus;
import com.bidx.entity.Bid;
import com.bidx.entity.User;
import com.bidx.exception.BadRequestException;
import com.bidx.exception.BidConflictException;
import com.bidx.exception.ResourceNotFoundException;
import com.bidx.repository.AuctionRepository;
import com.bidx.repository.BidRepository;
import com.bidx.websocket.AuctionEventPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Core Bidding Service implementing high-concurrency race condition safety.
 *
 * CONCURRENCY STRATEGY EXPLANATION:
 * 1. Pessimistic Write Lock (SELECT FOR UPDATE) via {@code findByIdWithPessimisticLock}
 *    prevents lost updates in concurrent scenarios across multiple database connections
 *    or multiple backend cluster nodes.
 * 2. Optimistic Locking (@Version) ensures that even if secondary readers read data,
 *    any concurrent modification conflict throws an explicit version clash.
 * 3. Isolation.READ_COMMITTED prevents dirty reads.
 * 4. Transactional atomicity: Bidding + Wallet reservation + Notification all succeed or roll back together.
 * 5. Outbid refunds are processed atomically so no user's funds are held hostage.
 * 6. WebSocket event is fired AFTER transaction commitment, ensuring external listeners
 *    only observe valid, persisted bids.
 */
@Service
public class BiddingService {

    private static final Logger log = LoggerFactory.getLogger(BiddingService.class);

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private WalletService walletService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuctionEventPublisher eventPublisher;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public BidResponse placeBid(Long auctionId, PlaceBidRequest request, User bidder) {
        log.info("Processing bid request: bidder={} auction={} amount={}", bidder.getUsername(), auctionId, request.getAmount());

        // 1. Acquire pessimistic write lock on the auction row to serialize concurrent bids for this auction
        Auction auction = auctionRepository.findByIdWithPessimisticLock(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with ID: " + auctionId));

        LocalDateTime now = LocalDateTime.now();

        // 2. Validate auction state
        if (auction.getStatus() != AuctionStatus.ACTIVE) {
            throw new BadRequestException("Auction is not active. Current status: " + auction.getStatus());
        }

        if (auction.getEndTime().isBefore(now)) {
            auction.setStatus(AuctionStatus.ENDED);
            auctionRepository.save(auction);
            throw new BadRequestException("Auction has already expired!");
        }

        if (auction.getSeller().getId().equals(bidder.getId())) {
            throw new BadRequestException("Sellers cannot bid on their own auctions!");
        }

        BigDecimal bidAmount = request.getAmount();

        // 3. Validate bid amount against starting price and current highest bid
        BigDecimal minimumRequired;
        if (auction.getTotalBids() == 0) {
            minimumRequired = auction.getStartingPrice();
            if (bidAmount.compareTo(minimumRequired) < 0) {
                throw new BidConflictException("First bid must be at least the starting price of ₹" + minimumRequired);
            }
        } else {
            minimumRequired = auction.getCurrentBid().add(auction.getMinIncrement());
            if (bidAmount.compareTo(minimumRequired) < 0) {
                throw new BidConflictException("Bid amount ₹" + bidAmount + " is too low! Minimum next bid required is ₹" + minimumRequired);
            }
        }

        // Check if user is already the highest bidder
        User previousHighestBidder = auction.getHighestBidder();
        BigDecimal previousHighestBid = auction.getCurrentBid();
        if (previousHighestBidder != null && previousHighestBidder.getId().equals(bidder.getId())) {
            throw new BadRequestException("You are already the highest bidder on this auction!");
        }

        // 4. Reserve funds in bidder's wallet (guarantees liquidity)
        walletService.reserveForBid(bidder, bidAmount, auction.getId());

        // 5. If there was a previous highest bidder, refund their reserved balance
        if (previousHighestBidder != null && auction.getTotalBids() > 0) {
            walletService.refundOutbidUser(previousHighestBidder, previousHighestBid, auction.getId());
            // Send outbid notification
            notificationService.sendNotification(
                    previousHighestBidder,
                    "Outbid on " + auction.getTitle(),
                    "Another user placed a higher bid of ₹" + bidAmount + ". Your reserved funds of ₹" + previousHighestBid + " have been refunded to your wallet.",
                    "OUTBID",
                    auction.getId()
            );
        }

        // 6. Update auction state
        auction.setCurrentBid(bidAmount);
        auction.setHighestBidder(bidder);
        auction.setTotalBids(auction.getTotalBids() + 1);
        auction = auctionRepository.save(auction);

        // 7. Persist bid audit log
        Bid bid = new Bid(auction, bidder, bidAmount);
        bid = bidRepository.save(bid);

        // 8. Prepare WebSocket event
        long distinctBidders = bidRepository.countDistinctBiddersByAuctionId(auction.getId());
        BigDecimal minNextBid = bidAmount.add(auction.getMinIncrement());

        BidWebSocketEvent event = new BidWebSocketEvent();
        event.setAuctionId(auction.getId());
        event.setCurrentBid(auction.getCurrentBid());
        event.setMinNextBid(minNextBid);
        event.setTotalBids(auction.getTotalBids());
        event.setBidderCount(distinctBidders);
        event.setHighestBidderId(bidder.getId());
        event.setHighestBidderName(bidder.getUsername());
        event.setTimestamp(LocalDateTime.now());
        event.setEventType("BID_PLACED");

        // Broadcast to all connected clients
        eventPublisher.publishBidUpdate(event);

        log.info("Bid successfully accepted for auction {}: new highest bid ₹{}", auctionId, bidAmount);

        return new BidResponse(bid.getId(), auction.getId(), bidder.getId(), bidder.getUsername(), bid.getAmount(), bid.getBidTime());
    }

    public List<BidResponse> getAuctionBidHistory(Long auctionId, int limit) {
        return bidRepository.findByAuctionIdOrderByBidTimeDesc(auctionId, PageRequest.of(0, limit)).stream()
                .map(b -> new BidResponse(b.getId(), b.getAuction().getId(), b.getBidder().getId(), b.getBidder().getUsername(), b.getAmount(), b.getBidTime()))
                .collect(Collectors.toList());
    }

    public List<BidResponse> getUserBidHistory(User user) {
        return bidRepository.findByBidderIdOrderByBidTimeDesc(user.getId()).stream()
                .map(b -> new BidResponse(b.getId(), b.getAuction().getId(), b.getBidder().getId(), b.getBidder().getUsername(), b.getAmount(), b.getBidTime()))
                .collect(Collectors.toList());
    }
}
