import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/api';
import { showError } from '../../utils/toast';
import { formatDate } from '../../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import '../styles/NotificationCenter.css';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isOpen, page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications(page, 10);
      setNotifications(response.data.notifications);
    } catch (error) {
      showError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch unread count');
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      showError('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      showError('Failed to mark all as read');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      fetchNotifications();
    } catch (error) {
      showError('Failed to delete notification');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-center-overlay" onClick={onClose}>
      <div className="notification-center" onClick={(e) => e.stopPropagation()}>
        <div className="notification-center-header">
          <h3>Notifications {unreadCount > 0 && `(${unreadCount} new)`}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {unreadCount > 0 && (
          <div className="notification-center-actions">
            <button onClick={handleMarkAllAsRead} className="mark-all-btn">
              Mark all as read
            </button>
          </div>
        )}

        <div className="notification-center-list">
          {loading ? (
            <LoadingSpinner />
          ) : notifications.length === 0 ? (
            <div className="empty-notification">
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}
              >
                <div className="notification-content">
                  <h4>{notif.title}</h4>
                  <p>{notif.message}</p>
                  <small>{formatDate(notif.createdAt)}</small>
                </div>
                <div className="notification-actions">
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="mark-read-btn"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif._id)}
                    className="delete-btn"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
