package com.bidx.service;

import com.bidx.dto.AuthResponse;
import com.bidx.dto.LoginRequest;
import com.bidx.dto.RegisterRequest;
import com.bidx.entity.Role;
import com.bidx.entity.User;
import com.bidx.entity.Wallet;
import com.bidx.exception.BadRequestException;
import com.bidx.exception.ResourceNotFoundException;
import com.bidx.repository.UserRepository;
import com.bidx.repository.WalletRepository;
import com.bidx.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use!");
        }

        Role role = Role.ROLE_USER;
        if (request.getRole() != null) {
            String roleUpper = request.getRole().toUpperCase();
            if (roleUpper.contains("SELLER")) role = Role.ROLE_SELLER;
            else if (roleUpper.contains("ADMIN")) role = Role.ROLE_ADMIN;
        }

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                role
        );
        user = userRepository.save(user);

        // Initialize demo wallet with starting bonus ₹50,000 for users to test bidding immediately
        BigDecimal startingBonus = BigDecimal.valueOf(50000.00);
        Wallet wallet = new Wallet(user, startingBonus);
        walletRepository.save(wallet);

        String token = jwtUtils.generateTokenFromUsername(user.getUsername());
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail(), user.getFullName(), user.getRole().name(), wallet.getAvailableBalance());
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseGet(() -> walletRepository.save(new Wallet(user, BigDecimal.valueOf(50000.00))));

        String token = jwtUtils.generateTokenFromUsername(user.getUsername());
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail(), user.getFullName(), user.getRole().name(), wallet.getAvailableBalance());
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new BadRequestException("User not authenticated");
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }
}
