package com.bidx.service;

import com.bidx.dto.BidWebSocketEvent;
import com.bidx.entity.Auction;
import com.bidx.entity.AuctionStatus;
import com.bidx.entity.User;
import com.bidx.repository.AuctionRepository;
import com.bidx.websocket.AuctionEventPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuctionLifecycleService {

    private static final Logger log = LoggerFactory.getLogger(AuctionLifecycleService.class);

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private WalletService walletService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuctionEventPublisher eventPublisher;

    /**
     * Periodic scheduled background task to check for expired auctions and settle them.
     * Runs every 5 seconds. Idempotent.
     */
    @Scheduled(fixedRate = 5000)
    public void processAuctionLifecycle() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Activate scheduled auctions
        List<Auction> toActivate = auctionRepository.findAuctionsToActivate(now);
        for (Auction auction : toActivate) {
            activateAuction(auction);
        }

        // 2. Settle expired active auctions
        List<Auction> expired = auctionRepository.findExpiredActiveAuctions(now);
        for (Auction auction : expired) {
            settleExpiredAuction(auction);
        }
    }

    @Transactional
    public void activateAuction(Auction auction) {
        log.info("Activating scheduled auction: ID={}", auction.getId());
        auction.setStatus(AuctionStatus.ACTIVE);
        auctionRepository.save(auction);

        BidWebSocketEvent event = new BidWebSocketEvent();
        event.setAuctionId(auction.getId());
        event.setCurrentBid(auction.getCurrentBid());
        event.setMinNextBid(auction.getCurrentBid().add(auction.getMinIncrement()));
        event.setTotalBids(auction.getTotalBids());
        event.setTimestamp(LocalDateTime.now());
        event.setEventType("AUCTION_ACTIVATED");
        eventPublisher.publishBidUpdate(event);
    }

    @Transactional
    public void settleExpiredAuction(Auction auction) {
        log.info("Settling expired auction: ID={}, totalBids={}", auction.getId(), auction.getTotalBids());

        // Mark as ENDED first to stop any ongoing bids
        auction.setStatus(AuctionStatus.ENDED);

        User highestBidder = auction.getHighestBidder();
        User seller = auction.getSeller();

        if (highestBidder != null && auction.getTotalBids() > 0) {
            // Settle financial transaction: deduct from winner's reserved balance & credit seller
            walletService.settleAuctionPayment(highestBidder, seller, auction.getCurrentBid(), auction.getId());
            auction.setStatus(AuctionStatus.SETTLED);

            // Notify winner
            notificationService.sendNotification(
                    highestBidder,
                    "Congratulations! You won the auction!",
                    "You won '" + auction.getTitle() + "' with the winning bid of ₹" + auction.getCurrentBid() + "!",
                    "AUCTION_WON",
                    auction.getId()
            );

            // Notify seller
            notificationService.sendNotification(
                    seller,
                    "Auction Sold: " + auction.getTitle(),
                    "Your auction ended with a winning bid of ₹" + auction.getCurrentBid() + " by @" + highestBidder.getUsername() + ". Funds have been credited to your wallet.",
                    "AUCTION_PAYOUT",
                    auction.getId()
            );
        } else {
            // No bids were placed; simply conclude
            auction.setStatus(AuctionStatus.ENDED);
            notificationService.sendNotification(
                    seller,
                    "Auction Ended without Bids",
                    "Your auction '" + auction.getTitle() + "' ended with no bids placed.",
                    "AUCTION_ENDED",
                    auction.getId()
            );
        }

        auctionRepository.save(auction);

        // Broadcast WebSocket event
        BidWebSocketEvent event = new BidWebSocketEvent();
        event.setAuctionId(auction.getId());
        event.setCurrentBid(auction.getCurrentBid());
        event.setTotalBids(auction.getTotalBids());
        event.setHighestBidderId(highestBidder != null ? highestBidder.getId() : null);
        event.setHighestBidderName(highestBidder != null ? highestBidder.getUsername() : null);
        event.setTimestamp(LocalDateTime.now());
        event.setEventType("AUCTION_ENDED");
        eventPublisher.publishBidUpdate(event);
    }
}
