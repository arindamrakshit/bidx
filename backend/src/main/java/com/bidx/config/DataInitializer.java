package com.bidx.config;

import com.bidx.entity.*;
import com.bidx.repository.AuctionRepository;
import com.bidx.repository.UserRepository;
import com.bidx.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Configuration
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Already initialized
        }

        // 1. Create Default Users
        User admin = new User("admin", "admin@bidx.io", passwordEncoder.encode("admin123"), "Platform Administrator", Role.ROLE_ADMIN);
        userRepository.save(admin);
        walletRepository.save(new Wallet(admin, BigDecimal.valueOf(1000000.00)));

        User seller = new User("luxurystore", "seller@bidx.io", passwordEncoder.encode("seller123"), "Apex Luxury Curations", Role.ROLE_SELLER);
        userRepository.save(seller);
        walletRepository.save(new Wallet(seller, BigDecimal.valueOf(250000.00)));

        User bidder1 = new User("arindam", "arindam@bidx.io", passwordEncoder.encode("user123"), "Arindam CS", Role.ROLE_USER);
        userRepository.save(bidder1);
        walletRepository.save(new Wallet(bidder1, BigDecimal.valueOf(150000.00)));

        User bidder2 = new User("cryptowhale", "whale@bidx.io", passwordEncoder.encode("user123"), "Elena Rostova", Role.ROLE_USER);
        userRepository.save(bidder2);
        walletRepository.save(new Wallet(bidder2, BigDecimal.valueOf(500000.00)));

        User bidder3 = new User("techcollector", "tech@bidx.io", passwordEncoder.encode("user123"), "Marcus Vance", Role.ROLE_USER);
        userRepository.save(bidder3);
        walletRepository.save(new Wallet(bidder3, BigDecimal.valueOf(80000.00)));

        // 2. Create High-Quality Mock Auctions across Luxury, Electronics, Collectibles
        createAuction(
                seller,
                "Rolex Submariner Date 'Kermit' 50th Anniversary",
                "Authentic 2003 Rolex Submariner reference 16610LV with pristine green aluminum bezel, Maxi dial, original oyster bracelet, box, and certified provenance documentation.",
                "Watches",
                BigDecimal.valueOf(950000.00),
                BigDecimal.valueOf(15000.00),
                LocalDateTime.now().minusHours(1),
                LocalDateTime.now().plusHours(48),
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80"
        );

        createAuction(
                seller,
                "Porsche 911 GT3 RS (992) Weissach Package Allocation",
                "Confirmed build slot allocation for the 2024 Porsche 911 GT3 RS with Weissach carbon package, magnesium lightweight wheels, and Clubsport safety cage.",
                "Automobiles",
                BigDecimal.valueOf(25000000.00),
                BigDecimal.valueOf(100000.00),
                LocalDateTime.now().minusHours(2),
                LocalDateTime.now().plusHours(72),
                "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1000&auto=format&fit=crop&q=80"
        );

        createAuction(
                seller,
                "MacBook Pro 16\" M3 Max (128GB Unified Memory, 8TB SSD)",
                "Space Black flagship studio powerhouse with 16-core CPU, 40-core GPU, Liquid Retina XDR display, brand new sealed in factory package.",
                "Electronics",
                BigDecimal.valueOf(420000.00),
                BigDecimal.valueOf(5000.00),
                LocalDateTime.now().minusHours(3),
                LocalDateTime.now().plusHours(24),
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000&auto=format&fit=crop&q=80"
        );

        createAuction(
                seller,
                "1986 Fleer Michael Jordan Rookie Card #57 (PSA 10 Gem Mint)",
                "The quintessential modern sports collectible in pristine PSA 10 Gem Mint condition. Flawless centering, crisp corners, and certified vault storage security.",
                "Collectibles",
                BigDecimal.valueOf(1850000.00),
                BigDecimal.valueOf(25000.00),
                LocalDateTime.now().minusHours(1),
                LocalDateTime.now().plusHours(36),
                "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=1000&auto=format&fit=crop&q=80"
        );

        createAuction(
                seller,
                "Leica M11-P Rangefinder Camera w/ Summilux-M 35mm f/1.4",
                "World's first camera with Content Authenticity Initiative hardware cryptographic signature, paired with high-performance Summilux glass.",
                "Electronics",
                BigDecimal.valueOf(820000.00),
                BigDecimal.valueOf(10000.00),
                LocalDateTime.now().minusHours(4),
                LocalDateTime.now().plusHours(12),
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1000&auto=format&fit=crop&q=80"
        );

        createAuction(
                seller,
                "Original Takashi Murakami 'Superflat Flowers' Acrylic on Canvas",
                "Signed original 2018 artwork by Takashi Murakami with Kaikai Kiki gallery verification certificate and museum-grade archival UV framing.",
                "Artwork",
                BigDecimal.valueOf(3200000.00),
                BigDecimal.valueOf(50000.00),
                LocalDateTime.now().minusHours(5),
                LocalDateTime.now().plusHours(60),
                "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1000&auto=format&fit=crop&q=80"
        );
    }

    private void createAuction(User seller, String title, String desc, String category, BigDecimal price, BigDecimal inc, LocalDateTime start, LocalDateTime end, String img) {
        Auction auction = new Auction();
        auction.setSeller(seller);
        auction.setTitle(title);
        auction.setDescription(desc);
        auction.setCategory(category);
        auction.setStartingPrice(price);
        auction.setCurrentBid(price);
        auction.setMinIncrement(inc);
        auction.setStartTime(start);
        auction.setEndTime(end);
        auction.setImageUrl(img);
        auction.setStatus(AuctionStatus.ACTIVE);
        auction.setTotalBids(0);
        auctionRepository.save(auction);
    }
}
