import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/api';
import NotificationCenter from './UI/NotificationCenter';
import '../styles/Navbar.css';

function Navbar({ userRole, onLogout }) {
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch unread count on component mount
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch unread count');
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleNotificationClick = () => {
    setNotificationOpen(!notificationOpen);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand" onClick={() => navigate(userRole === 'ADMIN' ? '/admin' : '/user')}>
            <h1>📦 Resource Allocation</h1>
          </div>
          <div className="navbar-content">
            <span className="user-role">
              {userRole === 'ADMIN' ? '👑 Admin' : '👤 User'}
            </span>
            
            <button 
              className="btn-notifications"
              onClick={handleNotificationClick}
              title="Notifications"
            >
              🔔
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <NotificationCenter 
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />
    </>
  );
}

export default Navbar;
