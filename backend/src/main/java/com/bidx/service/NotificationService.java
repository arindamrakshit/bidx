package com.bidx.service;

import com.bidx.dto.NotificationDto;
import com.bidx.entity.Notification;
import com.bidx.entity.User;
import com.bidx.repository.NotificationRepository;
import com.bidx.websocket.AuctionEventPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AuctionEventPublisher eventPublisher;

    @Transactional
    public void sendNotification(User user, String title, String message, String type, Long referenceId) {
        Notification notification = new Notification(user, title, message, type, referenceId);
        notification = notificationRepository.save(notification);

        NotificationDto dto = new NotificationDto(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getReferenceId(),
                notification.isRead(),
                notification.getCreatedAt()
        );
        eventPublisher.publishNotification(user.getId(), dto);
    }

    public List<NotificationDto> getUserNotifications(User user) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(n -> new NotificationDto(n.getId(), n.getTitle(), n.getMessage(), n.getType(), n.getReferenceId(), n.isRead(), n.getCreatedAt()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
