package com.bidx.websocket;

import com.bidx.dto.BidWebSocketEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class AuctionEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(AuctionEventPublisher.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void publishBidUpdate(BidWebSocketEvent event) {
        String destination = "/topic/auction/" + event.getAuctionId();
        log.info("Broadcasting WebSocket bid update to {}: currentBid={}", destination, event.getCurrentBid());
        messagingTemplate.convertAndSend(destination, event);

        // Also broadcast to general auction updates topic
        messagingTemplate.convertAndSend("/topic/auctions", event);
    }

    public void publishNotification(Long userId, Object notification) {
        String destination = "/topic/user/" + userId + "/notifications";
        log.info("Sending private notification to {}", destination);
        messagingTemplate.convertAndSend(destination, notification);
    }
}
