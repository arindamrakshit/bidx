package com.bidx.controller;

import com.bidx.dto.AuctionResponse;
import com.bidx.dto.BidResponse;
import com.bidx.dto.CreateAuctionRequest;
import com.bidx.dto.PlaceBidRequest;
import com.bidx.entity.User;
import com.bidx.service.AuctionService;
import com.bidx.service.AuthService;
import com.bidx.service.BiddingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auctions")
public class AuctionController {

    @Autowired
    private AuctionService auctionService;

    @Autowired
    private BiddingService biddingService;

    @Autowired
    private AuthService authService;

    private User getOptionalCurrentUser() {
        try {
            return authService.getCurrentUser();
        } catch (Exception e) {
            return null;
        }
    }

    @GetMapping
    public ResponseEntity<Page<AuctionResponse>> getAuctions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        User currentUser = getOptionalCurrentUser();
        return ResponseEntity.ok(auctionService.getAuctions(status, category, search, sortBy, page, size, currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuctionResponse> getAuctionById(@PathVariable Long id) {
        User currentUser = getOptionalCurrentUser();
        return ResponseEntity.ok(auctionService.getAuctionById(id, currentUser));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<AuctionResponse> createAuction(@Valid @RequestBody CreateAuctionRequest request) {
        User seller = authService.getCurrentUser();
        return ResponseEntity.ok(auctionService.createAuction(request, seller));
    }

    @PostMapping("/{id}/bids")
    public ResponseEntity<BidResponse> placeBid(
            @PathVariable Long id,
            @Valid @RequestBody PlaceBidRequest request) {
        User bidder = authService.getCurrentUser();
        return ResponseEntity.ok(biddingService.placeBid(id, request, bidder));
    }

    @GetMapping("/{id}/bids")
    public ResponseEntity<List<BidResponse>> getAuctionBids(
            @PathVariable Long id,
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(biddingService.getAuctionBidHistory(id, limit));
    }
}
