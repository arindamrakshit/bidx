import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { wsService } from '../services/websocket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bidx_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [wallet, setWallet] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWallet = async () => {
    try {
      const res = await api.get('/wallet');
      setWallet(res.data);
    } catch (err) {
      console.error("Wallet fetch error", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/user/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Notifications fetch error", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWallet();
      fetchNotifications();

      // Connect to WebSocket and listen for private user notifications
      const unsub = wsService.subscribeToUserNotifications(user.id, (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        fetchWallet(); // Automatically refresh wallet on outbid/won notifications
      });

      return () => {
        if (unsub) unsub();
      };
    }
  }, [user?.id]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (usernameOrEmail, password) => {
    const res = await api.post('/auth/login', { usernameOrEmail, password });
    const authData = res.data;
    localStorage.setItem('bidx_token', authData.token);
    const userData = {
      id: authData.id,
      username: authData.username,
      email: authData.email,
      fullName: authData.fullName,
      role: authData.role
    };
    localStorage.setItem('bidx_user', JSON.stringify(userData));
    setUser(userData);
    fetchWallet();
    return userData;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    const authData = res.data;
    localStorage.setItem('bidx_token', authData.token);
    const userData = {
      id: authData.id,
      username: authData.username,
      email: authData.email,
      fullName: authData.fullName,
      role: authData.role
    };
    localStorage.setItem('bidx_user', JSON.stringify(userData));
    setUser(userData);
    fetchWallet();
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('bidx_token');
    localStorage.removeItem('bidx_user');
    setUser(null);
    setWallet(null);
    setNotifications([]);
  };

  return (
    <AuthContext.Provider value={{
      user,
      wallet,
      notifications,
      loading,
      login,
      register,
      logout,
      refreshWallet: fetchWallet,
      refreshNotifications: fetchNotifications
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
