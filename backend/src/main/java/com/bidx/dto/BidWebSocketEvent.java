package com.bidx.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BidWebSocketEvent {
    private Long auctionId;
    private BigDecimal currentBid;
    private BigDecimal minNextBid;
    private Integer totalBids;
    private Long bidderCount;
    private Long highestBidderId;
    private String highestBidderName;
    private LocalDateTime timestamp;
    private String eventType; // "BID_PLACED", "AUCTION_ENDED", "AUCTION_ACTIVATED"

    public BidWebSocketEvent() {}

    public Long getAuctionId() { return auctionId; }
    public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }

    public BigDecimal getCurrentBid() { return currentBid; }
    public void setCurrentBid(BigDecimal currentBid) { this.currentBid = currentBid; }

    public BigDecimal getMinNextBid() { return minNextBid; }
    public void setMinNextBid(BigDecimal minNextBid) { this.minNextBid = minNextBid; }

    public Integer getTotalBids() { return totalBids; }
    public void setTotalBids(Integer totalBids) { this.totalBids = totalBids; }

    public Long getBidderCount() { return bidderCount; }
    public void setBidderCount(Long bidderCount) { this.bidderCount = bidderCount; }

    public Long getHighestBidderId() { return highestBidderId; }
    public void setHighestBidderId(Long highestBidderId) { this.highestBidderId = highestBidderId; }

    public String getHighestBidderName() { return highestBidderName; }
    public void setHighestBidderName(String highestBidderName) { this.highestBidderName = highestBidderName; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
}
