import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.reconnectTimeout = null;
  }

  connect(onConnectedCallback) {
    if (this.connected && this.stompClient) {
      if (onConnectedCallback) onConnectedCallback();
      return;
    }

    const defaultWs = (typeof window !== 'undefined' && window.location.hostname !== 'localhost')
      ? 'https://bidx-backend-stc1.onrender.com/ws'
      : 'http://localhost:8080/ws';

    const socketUrl = import.meta.env.VITE_WS_URL || defaultWs;
    const socket = new SockJS(socketUrl);
    this.stompClient = Stomp.over(socket);
    this.stompClient.debug = null;

    this.stompClient.connect({}, () => {
      this.connected = true;
      if (onConnectedCallback) onConnectedCallback();
    }, (error) => {
      this.connected = false;
      this.reconnectTimeout = setTimeout(() => this.connect(onConnectedCallback), 4000);
    });
  }

  subscribeToAuction(auctionId, callback) {
    const topic = `/topic/auction/${auctionId}`;
    return this.subscribe(topic, callback);
  }

  subscribeToUserNotifications(userId, callback) {
    const topic = `/topic/user/${userId}/notifications`;
    return this.subscribe(topic, callback);
  }

  subscribe(topic, callback) {
    if (!this.connected || !this.stompClient) {
      this.connect(() => {
        const sub = this.stompClient.subscribe(topic, (message) => {
          callback(JSON.parse(message.body));
        });
        this.subscriptions.set(topic, sub);
      });
      return () => this.unsubscribe(topic);
    }

    const sub = this.stompClient.subscribe(topic, (message) => {
      callback(JSON.parse(message.body));
    });
    this.subscriptions.set(topic, sub);

    return () => this.unsubscribe(topic);
  }

  unsubscribe(topic) {
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic).unsubscribe();
      this.subscriptions.delete(topic);
    }
  }

  disconnect() {
    if (this.stompClient && this.connected) {
      this.stompClient.disconnect();
      this.connected = false;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
  }
}

export const wsService = new WebSocketService();
