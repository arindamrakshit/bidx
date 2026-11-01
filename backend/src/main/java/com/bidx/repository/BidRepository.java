package com.bidx.repository;

import com.bidx.entity.Bid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByAuctionIdOrderByBidTimeDesc(Long auctionId, Pageable pageable);
    List<Bid> findByBidderIdOrderByBidTimeDesc(Long bidderId);
    
    @Query("SELECT COUNT(b) FROM Bid b WHERE b.auction.id = :auctionId")
    long countByAuctionId(@Param("auctionId") Long auctionId);

    @Query("SELECT COUNT(DISTINCT b.bidder.id) FROM Bid b WHERE b.auction.id = :auctionId")
    long countDistinctBiddersByAuctionId(@Param("auctionId") Long auctionId);
}
