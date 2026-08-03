import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, bookingAPI } from '../../services/api';
import { Ticket, CalendarDays, CheckCircle, DollarSign, Search } from 'lucide-react';
import AnimatedCount from '../../components/common/AnimatedCount';
import './Dashboard.css';

const UserDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashStatsResult, bookingsResult] = await Promise.allSettled([
        dashboardAPI.userDashboard(),
        bookingAPI.myBookings(),
      ]);

      if (dashStatsResult.status === 'fulfilled') {
        setStats(dashStatsResult.value.data);
      } else {
        setError('Failed to load dashboard stats');
        console.error('Stats error:', dashStatsResult.reason);
      }

      if (bookingsResult.status === 'fulfilled') {
        const allBookings = bookingsResult.value.data.results || bookingsResult.value.data;
        setRecentBookings(allBookings.slice(0, 5));
        setUpcomingBookings(
          allBookings
            .filter(b => b.status === 'CONFIRMED' && new Date(b.event?.start_date) >= new Date())
            .slice(0, 5)
        );
      } else {
        console.error('Bookings error:', bookingsResult.reason);
      }
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
          <h1>My Dashboard</h1>
          <p>Welcome back! Here's your event activity overview</p>
        </div>
      </div>

      {error && <div className="container alert alert-danger" style={{ marginTop: '20px' }}>{error}</div>}

      <div className="container dashboard-content">
        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid stagger-children">
            <StatCard
              title="Total Bookings"
              value={stats.total_bookings || 0}
              icon={<Ticket size={22} />}
              color="primary"
            />
            <StatCard
              title="Upcoming Events"
              value={stats.upcoming_events || 0}
              icon={<CalendarDays size={22} />}
              color="success"
            />
            <StatCard
              title="Past Events"
              value={stats.past_events || 0}
              icon={<CheckCircle size={22} />}
              color="info"
            />
            <StatCard
              title="Total Spent"
              value={`₹${(stats.total_spent || 0).toFixed(2)}`}
              icon={<DollarSign size={22} />}
              color="warning"
            />
          </div>
        )}

        <div className="dashboard-grid">
          {/* Recent Bookings */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Recent Bookings</h2>
              <Link to="/user/bookings" className="view-all">View All</Link>
            </div>

            {recentBookings.length > 0 ? (
              <div className="bookings-list stagger-children">
                {recentBookings.map(booking => (
                  <BookingItem key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <p className="empty-state">No bookings yet</p>
            )}
          </section>

          {/* Upcoming Events */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Upcoming Events</h2>
              <Link to="/events" className="view-all">Browse More</Link>
            </div>

            {upcomingBookings.length > 0 ? (
              <div className="events-list stagger-children">
                {upcomingBookings.map(booking => (
                  <EventItem key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <p className="empty-state">No upcoming bookings</p>
            )}
          </section>
        </div>

        {/* Quick Actions */}
        <section className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/events" className="action-button">
              <Search size={16} /> Find Events
            </Link>
            <Link to="/user/bookings" className="action-button">
              <Ticket size={16} /> My Bookings
            </Link>
            <Link to="/user/experiences" className="action-button">
              <CheckCircle size={16} /> My Experiences
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const isNumeric = !isNaN(parseFloat(value)) && isFinite(value);
  return (
    <div className={`stat-card hover-lift stat-${color}`}>
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

const BookingItem = ({ booking }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'CONFIRMED': return 'status-confirmed';
      case 'PENDING': return 'status-pending';
      case 'PENDING_APPROVAL': return 'status-pending';
      case 'CANCELLED': return 'status-cancelled';
      case 'REJECTED': return 'status-cancelled';
      default: return '';
    }
  };

  return (
    <div className="booking-item">
      <div className="booking-info">
        <h3>{booking.event?.title || booking.event_title}</h3>
        <p className="booking-date">{formatDate(booking.event?.start_date || booking.event_start_date)}</p>
        <p className="booking-ref">Ref: {booking.booking_reference}</p>
      </div>
      <div className="booking-meta">
        <span className={`badge ${getStatusClass(booking.status)}`}>
          {booking.status}
        </span>
        <p className="booking-price">{booking.number_of_tickets} tickets</p>
      </div>
    </div>
  );
};

const EventItem = ({ booking }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="event-item">
      <div className="event-details">
        <h3>{booking.event?.title || booking.event_title}</h3>
        <p className="event-date">{formatDate(booking.event?.start_date || booking.event_start_date)}</p>
        <p className="event-location">{booking.event?.city || booking.event_city}</p>
      </div>
      <Link to={`/events/${booking.event?.id}`} className="view-button">
        View
      </Link>
    </div>
  );
};

export default UserDashboard;
