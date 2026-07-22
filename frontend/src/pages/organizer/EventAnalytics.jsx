import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { eventAPI } from '../../services/api';
import { BarChart3, Ticket, Users, DollarSign, Clock, TrendingUp, Banknote, CalendarDays } from 'lucide-react';
import './Analytics.css';

const EventAnalytics = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchEventData();
    }
  }, [id]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const eventRes = await eventAPI.get(id);
      setEvent(eventRes.data);
      const soldTickets = (eventRes.data.total_seats || 0) - (eventRes.data.available_seats || 0);
      setAnalytics({
        booking_stats: {
          confirmed: soldTickets,
          pending: 0,
          cancelled: 0
        },
        revenue_stats: {
          total: (eventRes.data.ticket_price || 0) * soldTickets
        }
      });
    } catch (err) {
      setError('Failed to load event analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <div className="container">
            <h1><BarChart3 size={28} /> Event Analytics</h1>
          </div>
        </div>
        <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <div className="container">
            <h1><BarChart3 size={28} /> Event Analytics</h1>
          </div>
        </div>
        <div className="container" style={{ padding: '40px 20px' }}>
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    );
  }

  const bookingStats = analytics?.booking_stats || {};
  const revenueStats = analytics?.revenue_stats || {};
  const occupancyRate = event ? Math.round(((event.total_seats - event.available_seats) / event.total_seats) * 100) : 0;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div className="container">
          <h1><BarChart3 size={28} /> Event Analytics</h1>
          <p>{event?.title}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 20px' }}>
        {/* Key Metrics */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon"><Ticket size={24} /></div>
            <div className="metric-content">
              <p className="metric-label">Total Bookings</p>
              <p className="metric-value">{(event?.total_seats || 0) - (event?.available_seats || 0)}</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon"><Users size={24} /></div>
            <div className="metric-content">
              <p className="metric-label">Occupancy Rate</p>
              <p className="metric-value">{occupancyRate}%</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon"><DollarSign size={24} /></div>
            <div className="metric-content">
              <p className="metric-label">Total Revenue</p>
              <p className="metric-value">₹{((event?.ticket_price || 0) * ((event?.total_seats || 0) - (event?.available_seats || 0))).toFixed(2)}</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon"><Clock size={24} /></div>
            <div className="metric-content">
              <p className="metric-label">Available Tickets</p>
              <p className="metric-value">
                {event?.available_seats || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-card">
            <h3><TrendingUp size={18} /> Booking Breakdown</h3>
            <div className="booking-breakdown">
              <div className="breakdown-item">
                <div className="breakdown-label">
                  <span className="status-badge confirmed">Confirmed</span>
                </div>
                <div className="breakdown-bar">
                  <div 
                    className="bar-fill confirmed"
                    style={{ width: `${(bookingStats.confirmed || 0) / ((event?.total_seats || 1) - (event?.available_seats || 0) || 1) * 100}%` }}
                  >
                    {bookingStats.confirmed || 0}
                  </div>
                </div>
              </div>

              <div className="breakdown-item">
                <div className="breakdown-label">
                  <span className="status-badge pending">Pending</span>
                </div>
                <div className="breakdown-bar">
                  <div 
                    className="bar-fill pending"
                    style={{ width: `${(bookingStats.pending || 0) / ((event?.total_seats || 1) - (event?.available_seats || 0) || 1) * 100}%` }}
                  >
                    {bookingStats.pending || 0}
                  </div>
                </div>
              </div>

              <div className="breakdown-item">
                <div className="breakdown-label">
                  <span className="status-badge cancelled">Cancelled</span>
                </div>
                <div className="breakdown-bar">
                  <div 
                    className="bar-fill cancelled"
                    style={{ width: `${(bookingStats.cancelled || 0) / ((event?.total_seats || 1) - (event?.available_seats || 0) || 1) * 100}%` }}
                  >
                    {bookingStats.cancelled || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <h3><Banknote size={18} /> Revenue Summary</h3>
            <div className="revenue-summary">
              <div className="revenue-item">
                <span>Ticket Price:</span>
                <strong>₹{event?.ticket_price || 0}</strong>
              </div>
              <div className="revenue-item">
                <span>Total Tickets:</span>
                <strong>{event?.total_seats || 0}</strong>
              </div>
              <div className="revenue-item">
                <span>Sold Tickets:</span>
                <strong>{(event?.total_seats || 0) - (event?.available_seats || 0)}</strong>
              </div>
              <div className="revenue-item highlight">
                <span>Total Revenue:</span>
                <strong>₹{((event?.ticket_price || 0) * ((event?.total_seats || 0) - (event?.available_seats || 0))).toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="event-details-section">
          <h3><CalendarDays size={18} /> Event Details</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className={`status-badge ${event?.status?.toLowerCase()}`}>
                {event?.status}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Start Date:</span>
              <span>
                {event?.start_date ? new Date(event.start_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">End Date:</span>
              <span>
                {event?.end_date ? new Date(event.end_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Location:</span>
              <span>{event?.city}, {event?.venue}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventAnalytics;
