// src/context/AuthContext.jsx
// Keeps the logged-in user and token in one place for the whole React app.
// Any component can call useAuth() to read the user or log in/out.

import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'pawhaven_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // On page refresh, restore the user from the saved token.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((response) => setUser(response.data.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  // Load the unread notification number and refresh it every 30 seconds.
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    refreshUnreadCount();
    const timer = setInterval(refreshUnreadCount, 30000);
    return () => clearInterval(timer);
  }, [user]);

  async function refreshUnreadCount() {
    try {
      const response = await api.get('/notifications');
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      // If the token expired, the next protected request will log the user out.
    }
  }

  async function login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, response.data.token);
    setUser(response.data.user);
    return response.data.user;
  }

  async function register(formData) {
    const response = await api.post('/auth/register', formData);
    localStorage.setItem(TOKEN_KEY, response.data.token);
    setUser(response.data.user);
    return response.data.user;
  }

  async function refreshUser() {
    const response = await api.get('/auth/me');
    setUser(response.data.user);
    return response.data.user;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setUnreadCount(0);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        unreadCount,
        refreshUnreadCount,
        login,
        register,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }

  return context;
}
