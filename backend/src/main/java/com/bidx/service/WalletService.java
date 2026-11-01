package com.bidx.service;

import com.bidx.dto.TransactionDto;
import com.bidx.dto.WalletDto;
import com.bidx.entity.TransactionType;
import com.bidx.entity.User;
import com.bidx.entity.Wallet;
import com.bidx.entity.WalletTransaction;
import com.bidx.exception.BadRequestException;
import com.bidx.exception.ResourceNotFoundException;
import com.bidx.repository.WalletRepository;
import com.bidx.repository.WalletTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WalletTransactionRepository transactionRepository;

    public WalletDto getWalletDto(User user) {
        Wallet wallet = getOrCreateWallet(user);
        return new WalletDto(wallet.getAvailableBalance(), wallet.getReservedBalance(), wallet.getUpdatedAt());
    }

    public Wallet getOrCreateWallet(User user) {
        return walletRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Wallet newWallet = new Wallet(user, BigDecimal.valueOf(50000.00));
                    return walletRepository.save(newWallet);
                });
    }

    @Transactional
    public WalletDto depositDemoFunds(User user, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Deposit amount must be greater than zero");
        }
        Wallet wallet = walletRepository.findByUserIdWithPessimisticLock(user.getId())
                .orElseGet(() -> new Wallet(user, BigDecimal.ZERO));

        wallet.setAvailableBalance(wallet.getAvailableBalance().add(amount));
        wallet.setUpdatedAt(LocalDateTime.now());
        wallet = walletRepository.save(wallet);

        WalletTransaction tx = new WalletTransaction(
                wallet,
                user,
                TransactionType.DEPOSIT,
                amount,
                "Demo funds deposited to wallet",
                null
        );
        transactionRepository.save(tx);

        return new WalletDto(wallet.getAvailableBalance(), wallet.getReservedBalance(), wallet.getUpdatedAt());
    }

    /**
     * Reserve funds for placing a bid.
     * Prevents bidding with money the user doesn't possess.
     */
    @Transactional
    public void reserveForBid(User user, BigDecimal amount, Long auctionId) {
        Wallet wallet = walletRepository.findByUserIdWithPessimisticLock(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        if (wallet.getAvailableBalance().compareTo(amount) < 0) {
            throw new BadRequestException("Insufficient balance. Required: ₹" + amount + ", Available: ₹" + wallet.getAvailableBalance());
        }

        wallet.setAvailableBalance(wallet.getAvailableBalance().subtract(amount));
        wallet.setReservedBalance(wallet.getReservedBalance().add(amount));
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);

        WalletTransaction tx = new WalletTransaction(
                wallet,
                user,
                TransactionType.BID_RESERVATION,
                amount,
                "Funds reserved for bid on Auction #" + auctionId,
                auctionId
        );
        transactionRepository.save(tx);
    }

    /**
     * Release reservation when user is outbid.
     */
    @Transactional
    public void refundOutbidUser(User user, BigDecimal amount, Long auctionId) {
        Wallet wallet = walletRepository.findByUserIdWithPessimisticLock(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        BigDecimal amountToUnreserve = amount.min(wallet.getReservedBalance());
        wallet.setReservedBalance(wallet.getReservedBalance().subtract(amountToUnreserve));
        wallet.setAvailableBalance(wallet.getAvailableBalance().add(amountToUnreserve));
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);

        WalletTransaction tx = new WalletTransaction(
                wallet,
                user,
                TransactionType.BID_REFUND,
                amountToUnreserve,
                "Outbid refund released for Auction #" + auctionId,
                auctionId
        );
        transactionRepository.save(tx);
    }

    /**
     * Final settlement payment when auction ends.
     */
    @Transactional
    public void settleAuctionPayment(User winner, User seller, BigDecimal amount, Long auctionId) {
        // Debit winner's reserved balance
        Wallet winnerWallet = walletRepository.findByUserIdWithPessimisticLock(winner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Winner wallet not found"));

        BigDecimal deductAmount = amount.min(winnerWallet.getReservedBalance());
        winnerWallet.setReservedBalance(winnerWallet.getReservedBalance().subtract(deductAmount));
        winnerWallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(winnerWallet);

        WalletTransaction winnerTx = new WalletTransaction(
                winnerWallet,
                winner,
                TransactionType.AUCTION_PAYMENT,
                deductAmount,
                "Winning payment deducted for Auction #" + auctionId,
                auctionId
        );
        transactionRepository.save(winnerTx);

        // Credit seller's available balance
        Wallet sellerWallet = walletRepository.findByUserIdWithPessimisticLock(seller.getId())
                .orElseGet(() -> walletRepository.save(new Wallet(seller, BigDecimal.ZERO)));

        sellerWallet.setAvailableBalance(sellerWallet.getAvailableBalance().add(amount));
        sellerWallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(sellerWallet);

        WalletTransaction sellerTx = new WalletTransaction(
                sellerWallet,
                seller,
                TransactionType.AUCTION_PAYOUT,
                amount,
                "Auction payout received for Auction #" + auctionId,
                auctionId
        );
        transactionRepository.save(sellerTx);
    }

    public List<TransactionDto> getUserTransactions(User user) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(t -> new TransactionDto(
                        t.getId(),
                        t.getType().name(),
                        t.getAmount(),
                        t.getDescription(),
                        t.getReferenceId(),
                        t.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }
}
