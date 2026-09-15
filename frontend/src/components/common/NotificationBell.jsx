import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';
import { Bell, Check, Clock, CheckCircle, XCircle, Calendar, Trash2, PenLine } from 'lucide-react';
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
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationAPI.getUnreadCount();
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.error(err);
    }
  };

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

  const getIcon = (type) => {
    switch (type) {
      case 'ORGANIZER_APPROVAL': return <CheckCircle size={16} color="#2ecc71" />;
      case 'ORGANIZER_REJECTED': return <XCircle size={16} color="#e74c3c" />;
      case 'EVENT_APPROVED': return <CheckCircle size={16} color="#2ecc71" />;
      case 'EVENT_REJECTED': return <XCircle size={16} color="#e74c3c" />;
      case 'BOOKING_CONFIRMATION': return <Check size={16} color="#3498db" />;
      case 'EVENT_UPDATE': return <Calendar size={16} color="#e8622c" />;
      case 'PROFILE_EDIT_REQUEST': return <PenLine size={16} color="#f39c12" />;
      case 'PROFILE_EDIT_APPROVED': return <CheckCircle size={16} color="#2ecc71" />;
      case 'PROFILE_EDIT_REJECTED': return <XCircle size={16} color="#e74c3c" />;
      default: return <Bell size={16} color="#666" />;
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getNotificationLink = (n) => {
    if (n.related_event) return `/events/${n.related_event}`;
    if (n.related_booking) return '/user/bookings';
    switch (n.notification_type) {
      case 'ORGANIZER_APPROVAL':
      case 'ORGANIZER_REJECTED':
        return user?.role === 'ADMIN' ? '/admin/approvals' : '/organizer/dashboard';
      case 'PROFILE_EDIT_REQUEST':
        return '/admin/profile-edit-requests';
      case 'EVENT_APPROVED':
      case 'EVENT_REJECTED':
      case 'EVENT_UPDATE':
        return '/events';
      case 'BOOKING_CONFIRMATION':
      case 'BOOKING_REMINDER':
        return '/user/bookings';
      case 'PARTICIPANT_REQUEST_NEW':
      case 'PARTICIPANT_RESPONSE':
        return `/participant-requests/${n.related_event}`;
      case 'FULLY_BOOKED':
      case 'SEATS_AVAILABLE':
        return n.related_event ? `/events/${n.related_event}` : '/organizer/events';
      case 'EVENT_FEEDBACK_REMINDER':
        return user?.role === 'USER' ? '/user/experiences' : '/user/dashboard';
      default:
        return user?.role === 'ADMIN' ? '/admin/dashboard'
          : user?.role === 'ORGANIZER' ? '/organizer/dashboard'
          : '/user/dashboard';
    }
  };

  const handleNotificationClick = async (n) => {
    const link = getNotificationLink(n);
    if (!n.is_read) await markAsRead(n.id);
    setIsOpen(false);
    navigate(link);
  };

  if (!user || user.role === 'USER') return null;

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
                  <div className="notif-icon">{getIcon(n.notification_type)}</div>
                  <div className="notif-content">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-message">{n.message}</div>
                    <div className="notif-time">{formatTime(n.created_at)}</div>
                  </div>
                  {!n.is_read && <div className="notif-dot" />}
                </div>
              ))
            ) : (
              <div className="notif-empty">No notifications yet</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
