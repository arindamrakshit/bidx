package com.bidx.controller;

import com.bidx.dto.TransactionDto;
import com.bidx.dto.WalletDto;
import com.bidx.entity.User;
import com.bidx.service.AuthService;
import com.bidx.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<WalletDto> getWallet() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(walletService.getWalletDto(user));
    }

    @PostMapping("/deposit")
    public ResponseEntity<WalletDto> deposit(@RequestBody Map<String, BigDecimal> body) {
        User user = authService.getCurrentUser();
        BigDecimal amount = body.get("amount");
        return ResponseEntity.ok(walletService.depositDemoFunds(user, amount));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionDto>> getTransactions() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(walletService.getUserTransactions(user));
    }
}
