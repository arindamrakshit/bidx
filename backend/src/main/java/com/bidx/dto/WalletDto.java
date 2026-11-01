package com.bidx.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WalletDto {
    private BigDecimal availableBalance;
    private BigDecimal reservedBalance;
    private BigDecimal totalBalance;
    private LocalDateTime updatedAt;

    public WalletDto() {}

    public WalletDto(BigDecimal availableBalance, BigDecimal reservedBalance, LocalDateTime updatedAt) {
        this.availableBalance = availableBalance;
        this.reservedBalance = reservedBalance;
        this.totalBalance = (availableBalance != null ? availableBalance : BigDecimal.ZERO)
                .add(reservedBalance != null ? reservedBalance : BigDecimal.ZERO);
        this.updatedAt = updatedAt;
    }

    public BigDecimal getAvailableBalance() { return availableBalance; }
    public void setAvailableBalance(BigDecimal availableBalance) { this.availableBalance = availableBalance; }

    public BigDecimal getReservedBalance() { return reservedBalance; }
    public void setReservedBalance(BigDecimal reservedBalance) { this.reservedBalance = reservedBalance; }

    public BigDecimal getTotalBalance() { return totalBalance; }
    public void setTotalBalance(BigDecimal totalBalance) { this.totalBalance = totalBalance; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
