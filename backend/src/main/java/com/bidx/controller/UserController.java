package com.bidx.controller;

import com.bidx.dto.AuctionResponse;
import com.bidx.dto.BidResponse;
import com.bidx.dto.NotificationDto;
import com.bidx.entity.User;
import com.bidx.entity.Watchlist;
import com.bidx.repository.AuctionRepository;
import com.bidx.repository.WatchlistRepository;
import com.bidx.service.AuctionService;
import com.bidx.service.AuthService;
import com.bidx.service.BiddingService;
import com.bidx.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private AuthService authService;

    @Autowired
    private AuctionService auctionService;

    @Autowired
    private BiddingService biddingService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private WatchlistRepository watchlistRepository;

    @Autowired
    private AuctionRepository auctionRepository;

    @GetMapping("/bids")
    public ResponseEntity<List<BidResponse>> getMyBids() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(biddingService.getUserBidHistory(user));
    }

    @GetMapping("/seller/auctions")
    public ResponseEntity<List<AuctionResponse>> getMySellerAuctions() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(auctionService.getSellerAuctions(user.getId(), user));
    }

    @GetMapping("/won-auctions")
    public ResponseEntity<List<AuctionResponse>> getMyWonAuctions() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(auctionService.getWonAuctions(user.getId(), user));
    }

    @GetMapping("/watchlist")
    public ResponseEntity<List<AuctionResponse>> getMyWatchlist() {
        User user = authService.getCurrentUser();
        List<AuctionResponse> list = watchlistRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(w -> auctionService.mapToDto(w.getAuction(), user))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/watchlist/{auctionId}")
    @Transactional
    public ResponseEntity<?> toggleWatchlist(@PathVariable Long auctionId) {
        User user = authService.getCurrentUser();
        var existing = watchlistRepository.findByUserIdAndAuctionId(user.getId(), auctionId);
        if (existing.isPresent()) {
            watchlistRepository.delete(existing.get());
            return ResponseEntity.ok(Map.of("watched", false));
        } else {
            var auction = auctionRepository.findById(auctionId).orElseThrow();
            watchlistRepository.save(new Watchlist(user, auction));
            return ResponseEntity.ok(Map.of("watched", true));
        }
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationDto>> getNotifications() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(notificationService.getUserNotifications(user));
    }

    @PostMapping("/notifications/read")
    public ResponseEntity<?> markNotificationsRead() {
        User user = authService.getCurrentUser();
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok(Map.of("message", "Marked all as read"));
    }
}
