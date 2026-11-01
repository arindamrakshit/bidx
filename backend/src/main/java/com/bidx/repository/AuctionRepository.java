package com.bidx.repository;

import com.bidx.entity.Auction;
import com.bidx.entity.AuctionStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {

    /**
     * Pessimistic write lock for critical race-condition bidding sequence.
     * Guarantees atomic row-level isolation during concurrent bid placement.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Auction a WHERE a.id = :id")
    Optional<Auction> findByIdWithPessimisticLock(@Param("id") Long id);

    Page<Auction> findByStatus(AuctionStatus status, Pageable pageable);

    @Query("SELECT a FROM Auction a WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:category IS NULL OR a.category = :category) AND " +
           "(:search IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Auction> searchAuctions(
            @Param("status") AuctionStatus status,
            @Param("category") String category,
            @Param("search") String search,
            Pageable pageable);

    List<Auction> findBySellerId(Long sellerId);

    List<Auction> findByHighestBidderIdAndStatus(Long bidderId, AuctionStatus status);

    /**
     * Finds active auctions that have crossed their endTime and need automatic settlement.
     */
    @Query("SELECT a FROM Auction a WHERE a.status = 'ACTIVE' AND a.endTime <= :now")
    List<Auction> findExpiredActiveAuctions(@Param("now") LocalDateTime now);

    @Query("SELECT a FROM Auction a WHERE a.status = 'SCHEDULED' AND a.startTime <= :now")
    List<Auction> findAuctionsToActivate(@Param("now") LocalDateTime now);

    long countByStatus(AuctionStatus status);
}
