package com.bidx.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BidResponse {
    private Long id;
    private Long auctionId;
    private Long bidderId;
    private String bidderUsername;
    private BigDecimal amount;
    private LocalDateTime bidTime;

    public BidResponse() {}

    public BidResponse(Long id, Long auctionId, Long bidderId, String bidderUsername, BigDecimal amount, LocalDateTime bidTime) {
        this.id = id;
        this.auctionId = auctionId;
        this.bidderId = bidderId;
        this.bidderUsername = bidderUsername;
        this.amount = amount;
        this.bidTime = bidTime;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAuctionId() { return auctionId; }
    public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }

    public Long getBidderId() { return bidderId; }
    public void setBidderId(Long bidderId) { this.bidderId = bidderId; }

    public String getBidderUsername() { return bidderUsername; }
    public void setBidderUsername(String bidderUsername) { this.bidderUsername = bidderUsername; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDateTime getBidTime() { return bidTime; }
    public void setBidTime(LocalDateTime bidTime) { this.bidTime = bidTime; }
}
