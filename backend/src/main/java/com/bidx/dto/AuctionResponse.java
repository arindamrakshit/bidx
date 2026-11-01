package com.bidx.dto;

import com.bidx.entity.AuctionStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AuctionResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private BigDecimal startingPrice;
    private BigDecimal currentBid;
    private BigDecimal minIncrement;
    private BigDecimal minNextBid;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private AuctionStatus status;
    private String imageUrl;
    private Integer totalBids;
    private Long sellerId;
    private String sellerName;
    private Long highestBidderId;
    private String highestBidderName;
    private Long version;
    private LocalDateTime createdAt;
    private boolean userWatched;

    public AuctionResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getStartingPrice() { return startingPrice; }
    public void setStartingPrice(BigDecimal startingPrice) { this.startingPrice = startingPrice; }

    public BigDecimal getCurrentBid() { return currentBid; }
    public void setCurrentBid(BigDecimal currentBid) { this.currentBid = currentBid; }

    public BigDecimal getMinIncrement() { return minIncrement; }
    public void setMinIncrement(BigDecimal minIncrement) { this.minIncrement = minIncrement; }

    public BigDecimal getMinNextBid() { return minNextBid; }
    public void setMinNextBid(BigDecimal minNextBid) { this.minNextBid = minNextBid; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public AuctionStatus getStatus() { return status; }
    public void setStatus(AuctionStatus status) { this.status = status; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Integer getTotalBids() { return totalBids; }
    public void setTotalBids(Integer totalBids) { this.totalBids = totalBids; }

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public Long getHighestBidderId() { return highestBidderId; }
    public void setHighestBidderId(Long highestBidderId) { this.highestBidderId = highestBidderId; }

    public String getHighestBidderName() { return highestBidderName; }
    public void setHighestBidderName(String highestBidderName) { this.highestBidderName = highestBidderName; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isUserWatched() { return userWatched; }
    public void setUserWatched(boolean userWatched) { this.userWatched = userWatched; }
}
