package com.bidx.service;

import com.bidx.dto.AdminStatsDto;
import com.bidx.entity.AuctionStatus;
import com.bidx.repository.AuctionRepository;
import com.bidx.repository.BidRepository;
import com.bidx.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private BidRepository bidRepository;

    public AdminStatsDto getSystemStats() {
        long totalUsers = userRepository.count();
        long activeAuctions = auctionRepository.countByStatus(AuctionStatus.ACTIVE);
        long completedAuctions = auctionRepository.countByStatus(AuctionStatus.SETTLED) + auctionRepository.countByStatus(AuctionStatus.ENDED);
        long totalAuctions = auctionRepository.count();
        long totalBids = bidRepository.count();

        // Calculate platform volume from settled auctions
        BigDecimal totalVolume = auctionRepository.findAll().stream()
                .filter(a -> a.getStatus() == AuctionStatus.SETTLED || a.getStatus() == AuctionStatus.ACTIVE)
                .map(a -> a.getCurrentBid() != null ? a.getCurrentBid() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new AdminStatsDto(totalUsers, activeAuctions, completedAuctions, totalAuctions, totalBids, totalVolume);
    }
}
