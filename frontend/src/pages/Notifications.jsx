// src/pages/Notifications.jsx
// Simple in-app notifications list.

import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/format';
import PageHeader from '../components/PageHeader';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';

const typeIcons = {
  application: '📝',
  adoption: '❤️',
  verification: '🛡️',
  reminder: '⏰',
  general: '🔔',
};

export default function Notifications() {
  const { refreshUnreadCount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadNotifications() {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications);
      await refreshUnreadCount();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function markAllRead() {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map((item) => ({ ...item, isRead: true })));
      await refreshUnreadCount();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function markOneRead(notification) {
    if (notification.isRead) return;

    try {
      await api.put(`/notifications/${notification._id}/read`);
      setNotifications(
        notifications.map((item) =>
          item._id === notification._id ? { ...item, isRead: true } : item
        )
      );
      await refreshUnreadCount();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading) {
    return (
      <div className="container page">
        <Loading message="Loading notifications..." />
      </div>
    );
  }

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <div className="container page narrow-page">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        subtitle={
          unreadCount > 0
            ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}.`
            : 'You are all caught up.'
        }
        actions={
          unreadCount > 0 && (
            <button type="button" className="btn btn-outline" onClick={markAllRead}>
              Mark all as read
            </button>
          )
        }
      />

      <Alert type="error" onClose={() => setError('')}>
        {error}
      </Alert>

      {notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No notifications yet"
          text="Application updates and care reminders will appear here."
        />
      ) : (
        <div className="notification-list">
          {notifications.map((notification) => (
            <button
              type="button"
              key={notification._id}
              className={`notification-item ${notification.isRead ? '' : 'unread'}`}
              onClick={() => markOneRead(notification)}
            >
              <span className="notification-icon">
                {typeIcons[notification.type] || typeIcons.general}
              </span>
              <div className="notification-body">
                <div className="notification-top">
                  <strong>{notification.title}</strong>
                  {!notification.isRead && <span className="unread-dot" />}
                </div>
                <p>{notification.message}</p>
                <small>{formatDateTime(notification.createdAt)}</small>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
