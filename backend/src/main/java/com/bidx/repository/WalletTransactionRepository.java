package com.bidx.repository;

import com.bidx.entity.WalletTransaction;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    List<WalletTransaction> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<WalletTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
}
