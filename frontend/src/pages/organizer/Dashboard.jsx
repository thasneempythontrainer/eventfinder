import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../../services/api';
import { CalendarDays, Ticket, DollarSign, BarChart3, ClipboardList, Search } from 'lucide-react';
import AnimatedCount from '../../components/common/AnimatedCount';
import '../user/Dashboard.css';

const OrganizerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashStats, eventsRes, bookingsRes] = await Promise.all([
        dashboardAPI.organizerDashboard(),
        dashboardAPI.organizerMyEvents(),
        dashboardAPI.organizerRecentBookings(),
      ]);
      setStats(dashStats.data);
      setEvents(eventsRes.data || []);
      setRecentBookings(bookingsRes.data || []);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><p>Loading dashboard...</p></div>;
  }

  return (
    <div className="dashboard-page page-enter">
      <div className="dashboard-header">
        <div className="container">
          <h1>Organizer Dashboard</h1>
          <p>Manage your events and track performance</p>
        </div>
      </div>

      {error && <div className="container alert alert-danger" style={{ marginTop: '20px' }}>{error}</div>}

      <div className="container dashboard-content">
        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid">
            <StatCard
              title="Total Events"
              value={stats.total_events || 0}
              icon={<CalendarDays size={22} />}
              color="primary"
            />
            <StatCard
              title="Total Bookings"
              value={stats.total_bookings || 0}
              icon={<Ticket size={22} />}
              color="success"
            />
            <StatCard
              title="Total Revenue"
              value={`₹${(stats.total_revenue || 0).toFixed(2)}`}
              icon={<DollarSign size={22} />}
              color="warning"
            />
            <StatCard
              title="This Month"
              value={`₹${(stats.revenue_this_month || 0).toFixed(2)}`}
              icon={<BarChart3 size={22} />}
              color="info"
            />
          </div>
        )}

        <div className="dashboard-grid">
          {/* My Events */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>My Events</h2>
              <Link to="/organizer/create-event" className="view-all">+ Create</Link>
            </div>

            {events && events.length > 0 ? (
              <div className="events-list">
                {events.map(event => (
                  <EventItem key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <p className="empty-state">No events created yet</p>
            )}
          </section>

          {/* Recent Bookings */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Recent Bookings</h2>
              <Link to="/organizer/events" className="view-all">View All</Link>
            </div>

            {recentBookings && recentBookings.length > 0 ? (
              <div className="bookings-list">
                {recentBookings.map(booking => (
                  <BookingItem key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <p className="empty-state">No bookings yet</p>
            )}
          </section>
        </div>

        {/* Quick Actions */}
        <section className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/organizer/create-event" className="action-button">
              + Create Event
            </Link>
            <Link to="/organizer/events" className="action-button">
              <ClipboardList size={16} /> My Events
            </Link>
            <Link to="/events" className="action-button">
              <Search size={16} /> Browse Platform
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const isNumeric = !isNaN(parseFloat(value)) && value !== null && value !== undefined;
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <p className="stat-value">
          {isNumeric ? <AnimatedCount value={value} /> : value}
        </p>
      </div>
    </div>
  );
};

const EventItem = ({ event }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'PENDING': return 'status-pending';
      case 'UPCOMING': return 'status-upcoming';
      case 'ONGOING': return 'status-ongoing';
      case 'COMPLETED': return 'status-completed';
      default: return '';
    }
  };

  return (
    <div className="event-item">
      <div>
        <h3>{event.title}</h3>
        <p className="event-date">{formatDate(event.start_date)}</p>
      </div>
      <div className="event-meta">
        <span className={`badge ${getStatusClass(event.status)}`}>
          {event.status}
        </span>
        <p style={{ margin: '5px 0 0 0', fontWeight: '600' }}>
          {event.booking_count || event.bookings || 0} bookings
        </p>
      </div>
      <Link to={`/organizer/events/${event.event_id || event.id}/analytics`} className="view-button">
        Analytics
      </Link>
    </div>
  );
};

const BookingItem = ({ booking }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="booking-item">
      <div>
        <h3>{booking.user_name || booking.user?.first_name || 'User'}</h3>
        <p style={{ margin: '5px 0', fontSize: '13px', color: '#666' }}>
          {booking.event_title || booking.event?.title}
        </p>
        <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
          {formatDate(booking.created_at)}
        </p>
      </div>
      <div className="booking-meta">
        <p style={{ margin: '0', fontWeight: '600' }}>
          {booking.number_of_tickets} tickets
        </p>
        <p style={{ margin: '5px 0 0 0', fontWeight: '600', color: '#e8622c' }}>
          ₹{booking.amount || booking.total_price}
        </p>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
