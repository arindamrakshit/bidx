package com.bidx.service;

import com.bidx.dto.AuctionResponse;
import com.bidx.dto.CreateAuctionRequest;
import com.bidx.entity.Auction;
import com.bidx.entity.AuctionStatus;
import com.bidx.entity.User;
import com.bidx.exception.BadRequestException;
import com.bidx.exception.ResourceNotFoundException;
import com.bidx.repository.AuctionRepository;
import com.bidx.repository.WatchlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuctionService {

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private WatchlistRepository watchlistRepository;

    public Page<AuctionResponse> getAuctions(String statusStr, String category, String search, String sortBy, int page, int size, User currentUser) {
        AuctionStatus status = null;
        if (statusStr != null && !statusStr.isBlank() && !"ALL".equalsIgnoreCase(statusStr)) {
            try {
                status = AuctionStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("endingSoon".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "endTime");
        } else if ("priceAsc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "currentBid");
        } else if ("priceDesc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "currentBid");
        } else if ("popular".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "totalBids");
        }

        PageRequest pageRequest = PageRequest.of(page, size, sort);
        Page<Auction> auctions = auctionRepository.searchAuctions(
                status,
                (category == null || category.isBlank() || "ALL".equalsIgnoreCase(category)) ? null : category,
                (search == null || search.isBlank()) ? null : search,
                pageRequest
        );

        return auctions.map(a -> mapToDto(a, currentUser));
    }

    public AuctionResponse getAuctionById(Long id, User currentUser) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with ID: " + id));
        return mapToDto(auction, currentUser);
    }

    @Transactional
    public AuctionResponse createAuction(CreateAuctionRequest request, User seller) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startTime = request.getStartTime() != null ? request.getStartTime() : now;

        if (request.getEndTime().isBefore(startTime)) {
            throw new BadRequestException("End time must be after start time");
        }

        Auction auction = new Auction();
        auction.setTitle(request.getTitle());
        auction.setDescription(request.getDescription());
        auction.setCategory(request.getCategory());
        auction.setStartingPrice(request.getStartingPrice());
        auction.setCurrentBid(request.getStartingPrice());
        auction.setMinIncrement(request.getMinIncrement());
        auction.setStartTime(startTime);
        auction.setEndTime(request.getEndTime());
        auction.setSeller(seller);
        auction.setImageUrl(request.getImageUrl() != null && !request.getImageUrl().isBlank()
                ? request.getImageUrl()
                : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80");

        if (startTime.isAfter(now.plusSeconds(30))) {
            auction.setStatus(AuctionStatus.SCHEDULED);
        } else {
            auction.setStatus(AuctionStatus.ACTIVE);
        }

        auction = auctionRepository.save(auction);
        return mapToDto(auction, seller);
    }

    public List<AuctionResponse> getSellerAuctions(Long sellerId, User currentUser) {
        return auctionRepository.findBySellerId(sellerId).stream()
                .map(a -> mapToDto(a, currentUser))
                .collect(Collectors.toList());
    }

    public List<AuctionResponse> getWonAuctions(Long userId, User currentUser) {
        return auctionRepository.findByHighestBidderIdAndStatus(userId, AuctionStatus.SETTLED).stream()
                .map(a -> mapToDto(a, currentUser))
                .collect(Collectors.toList());
    }

    public AuctionResponse mapToDto(Auction auction, User currentUser) {
        AuctionResponse dto = new AuctionResponse();
        dto.setId(auction.getId());
        dto.setTitle(auction.getTitle());
        dto.setDescription(auction.getDescription());
        dto.setCategory(auction.getCategory());
        dto.setStartingPrice(auction.getStartingPrice());
        dto.setCurrentBid(auction.getCurrentBid());
        dto.setMinIncrement(auction.getMinIncrement());
        
        // Next minimum allowed bid calculation
        BigDecimal minNext = (auction.getTotalBids() == 0)
                ? auction.getStartingPrice()
                : auction.getCurrentBid().add(auction.getMinIncrement());
        dto.setMinNextBid(minNext);

        dto.setStartTime(auction.getStartTime());
        dto.setEndTime(auction.getEndTime());
        dto.setStatus(auction.getStatus());
        dto.setImageUrl(auction.getImageUrl());
        dto.setTotalBids(auction.getTotalBids());
        dto.setVersion(auction.getVersion());
        dto.setCreatedAt(auction.getCreatedAt());

        if (auction.getSeller() != null) {
            dto.setSellerId(auction.getSeller().getId());
            dto.setSellerName(auction.getSeller().getFullName() != null ? auction.getSeller().getFullName() : auction.getSeller().getUsername());
        }

        if (auction.getHighestBidder() != null) {
            dto.setHighestBidderId(auction.getHighestBidder().getId());
            dto.setHighestBidderName(auction.getHighestBidder().getUsername());
        }

        if (currentUser != null) {
            dto.setUserWatched(watchlistRepository.existsByUserIdAndAuctionId(currentUser.getId(), auction.getId()));
        }

        return dto;
    }
}
