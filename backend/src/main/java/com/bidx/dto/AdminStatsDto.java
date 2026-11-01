package com.bidx.dto;

import java.math.BigDecimal;

public class AdminStatsDto {
    private long totalUsers;
    private long activeAuctions;
    private long completedAuctions;
    private long totalAuctions;
    private long totalBids;
    private BigDecimal totalPlatformVolume;

    public AdminStatsDto() {}

    public AdminStatsDto(long totalUsers, long activeAuctions, long completedAuctions, long totalAuctions, long totalBids, BigDecimal totalPlatformVolume) {
        this.totalUsers = totalUsers;
        this.activeAuctions = activeAuctions;
        this.completedAuctions = completedAuctions;
        this.totalAuctions = totalAuctions;
        this.totalBids = totalBids;
        this.totalPlatformVolume = totalPlatformVolume;
    }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getActiveAuctions() { return activeAuctions; }
    public void setActiveAuctions(long activeAuctions) { this.activeAuctions = activeAuctions; }

    public long getCompletedAuctions() { return completedAuctions; }
    public void setCompletedAuctions(long completedAuctions) { this.completedAuctions = completedAuctions; }

    public long getTotalAuctions() { return totalAuctions; }
    public void setTotalAuctions(long totalAuctions) { this.totalAuctions = totalAuctions; }

    public long getTotalBids() { return totalBids; }
    public void setTotalBids(long totalBids) { this.totalBids = totalBids; }

    public BigDecimal getTotalPlatformVolume() { return totalPlatformVolume; }
    public void setTotalPlatformVolume(BigDecimal totalPlatformVolume) { this.totalPlatformVolume = totalPlatformVolume; }
}
