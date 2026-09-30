import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';
import { getNotificationIcon, getNotificationLink, formatNotificationTime } from '../../utils/notificationUtils';
import { Bell } from 'lucide-react';
import './NotificationBell.css';

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!user) return;
    let active = true;

    const pollUnreadCount = async () => {
      try {
        const res = await notificationAPI.getUnreadCount();
        if (active) setUnreadCount(res.data.unread_count || 0);
      } catch (err) {
        console.error(err);
      }
    };

    pollUnreadCount();
    const interval = setInterval(pollUnreadCount, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOpen = async () => {
    if (!isOpen) {
      setLoading(true);
      try {
        const res = await notificationAPI.list();
        setNotifications(res.data.results || res.data || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    setIsOpen(!isOpen);
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (n) => {
    const link = getNotificationLink(n, user?.role);
    if (!n.is_read) await markAsRead(n.id);
    setIsOpen(false);
    navigate(link);
  };

  // Shown to every signed-in role. Attendees are the main recipients of event
  // postponements and cancellations, so hiding it from them hid the alerts
  // that matter most to them.
  if (!user) return null;

  return (
    <div className="notification-bell-wrapper" ref={ref}>
      <button className="notification-bell-btn" onClick={toggleOpen}>
        <Bell size={20} />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notif-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="notif-mark-all">Mark all read</button>
            )}
          </div>
          <div className="notif-list">
            {loading ? (
              <div className="notif-empty">Loading...</div>
            ) : notifications.length > 0 ? (
              notifications.map(n => (
                <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                     onClick={() => handleNotificationClick(n)}>
                  <div className="notif-icon">{getNotificationIcon(n.notification_type)}</div>
                  <div className="notif-content">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-message">{n.message}</div>
                    <div className="notif-time">{formatNotificationTime(n.created_at)}</div>
                  </div>
                  {!n.is_read && <div className="notif-dot" />}
                </div>
              ))
            ) : (
              <div className="notif-empty">No notifications yet</div>
            )}
          </div>
          {notifications.length > 0 && (
            <button
              className="notif-view-all"
              onClick={() => { setIsOpen(false); navigate('/notifications'); }}
            >
              View all notifications
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
