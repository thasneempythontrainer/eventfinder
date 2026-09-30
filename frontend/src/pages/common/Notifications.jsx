import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';
import {
  getNotificationIcon,
  getNotificationLink,
  formatNotificationTime,
  humanizeNotificationType,
} from '../../utils/notificationUtils';
import { CheckCheck, Inbox } from 'lucide-react';
import './Notifications.css';

const PAGE_SIZE = 10;

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'EVENT_POSTPONED', label: 'Postponed' },
  { key: 'EVENT_CANCELLED', label: 'Cancelled' },
  { key: 'BOOKING_CONFIRMED', label: 'Bookings' },
];

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchPage = async () => {
      try {
        // Filtering happens server-side so the count and page count match
        // what is actually on screen.
        const params = { page, page_size: PAGE_SIZE };
        if (filter === 'unread') params.unread = 'true';
        else if (filter !== 'all') params.type = filter;

        const res = await notificationAPI.list(params);
        if (!active) return;
        const data = res.data || {};

        setNotifications(data.results || (Array.isArray(data) ? data : []));
        setCount(data.count ?? 0);
        setTotalPages(Math.max(1, Math.ceil((data.count ?? 0) / PAGE_SIZE)));
      } catch (err) {
        if (!active) return;
        setError('Failed to load notifications');
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    const fetchUnreadCount = async () => {
      try {
        const res = await notificationAPI.getUnreadCount();
        if (active) setUnreadCount(res.data.unread_count || 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPage();
    fetchUnreadCount();

    return () => {
      active = false;
    };
  }, [page, filter, reloadKey]);

  // Bumping reloadKey re-runs the effect; used to recover from a failed
  // optimistic update.
  const reload = () => setReloadKey(k => k + 1);

  // Resetting the page belongs in the click handler: doing it in an effect
  // triggered by `filter` renders twice for one user action.
  const handleFilterChange = (key) => {
    setFilter(key);
    setPage(1);
    setLoading(true);
    setError('');
  };

  const handlePageChange = (next) => {
    setPage(next);
    setLoading(true);
    setError('');
  };

  const handleMarkAsRead = async (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await notificationAPI.markAsRead(id);
    } catch (err) {
      console.error(err);
      reload();
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await notificationAPI.markAllAsRead();
    } catch (err) {
      console.error(err);
      reload();
    }
  };

  const handleClick = async (n) => {
    if (!n.is_read) await handleMarkAsRead(n.id);
    navigate(getNotificationLink(n, user?.role));
  };

  return (
    <div className="notifications-page page-enter">
      <div className="notifications-header">
        <div className="container">
          <h1>Notifications</h1>
          <p>Everything that needs your attention</p>
        </div>
      </div>

      <div className="container notifications-container">
        <div className="notifications-toolbar">
          <div className="notifications-filters">
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`filter-chip ${filter === f.key ? 'active' : ''}`}
                onClick={() => handleFilterChange(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button className="mark-all-btn" onClick={handleMarkAllRead}>
              <CheckCheck size={16} /> Mark all read
            </button>
          )}
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="notifications-empty">
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">
            <Inbox size={44} color="#c9c9c9" />
            <h3>Nothing here</h3>
            <p>
              {filter === 'all'
                ? "You don't have any notifications yet."
                : `No ${humanizeNotificationType(filter).toLowerCase()} notifications right now.`}
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map(n => (
              <button
                key={n.id}
                className={`notification-row ${n.is_read ? '' : 'unread'}`}
                onClick={() => handleClick(n)}
              >
                <div className="row-icon">{getNotificationIcon(n.notification_type)}</div>
                <div className="row-body">
                  <div className="row-title">{n.title}</div>
                  <div className="row-message">{n.message}</div>
                  <div className="row-meta">
                    <span className="row-type">
                      {humanizeNotificationType(n.notification_type)}
                    </span>
                    <span className="row-time">{formatNotificationTime(n.created_at)}</span>
                  </div>
                </div>
                {!n.is_read && <span className="row-dot" />}
              </button>
            ))}
          </div>
        )}

        {!loading && count > PAGE_SIZE && (
          <div className="notifications-pagination">
            <button
              className="page-btn"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Previous
            </button>
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            <button
              className="page-btn"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
