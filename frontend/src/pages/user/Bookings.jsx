import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import { Ticket, DollarSign, Download, XCircle } from 'lucide-react';
import './Dashboard.css';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.myBookings();
      setBookings(response.data.results || response.data);
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;
    if (statusFilter) {
      filtered = filtered.filter(b => b.status === statusFilter);
    }
    setFilteredBookings(filtered);
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingAPI.cancel(bookingId);
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      alert('Failed to cancel booking');
    }
  };

  const handleDownloadTickets = async (bookingId, bookingRef) => {
    try {
      const response = await bookingAPI.downloadTickets(bookingId);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tickets_${bookingRef}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download tickets');
    }
  };

  if (loading) {
    return <div className="container"><p>Loading bookings...</p></div>;
  }

  return (
    <div className="dashboard-page page-enter">
      <div className="dashboard-header">
        <div className="container">
          <h1>My Bookings</h1>
          <p>View all your event bookings</p>
        </div>
      </div>

      {error && <div className="container alert alert-danger" style={{ marginTop: '20px' }}>{error}</div>}

      <div className="container bookings-content">
        <div className="bookings-sidebar">
          <h3>Filter</h3>
          <div className="filter-group">
            <label>Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Bookings</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <p className="filter-info">
            Total: <strong>{filteredBookings.length}</strong> booking{filteredBookings.length !== 1 ? 's' : ''}
          </p>
        </div>

        <main className="bookings-main">
          {filteredBookings.length > 0 ? (
            <div className="bookings-list stagger-children">
              {filteredBookings.map(booking => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <div>
                       <h2>{booking.event?.title || booking.event_title}</h2>
                      <p className="booking-ref">Booking Reference: {booking.booking_reference}</p>
                    </div>
                    <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </div>

                   <div className="booking-details">
                     <div className="detail-item">
                       <span className="label">Date:</span>
                       <span className="value">
                         {new Date(booking.event?.start_date || booking.event_start_date).toLocaleDateString('en-US', {
                           month: 'long',
                           day: 'numeric',
                           year: 'numeric'
                         })}
                       </span>
                     </div>
                     <div className="detail-item">
                       <span className="label">Location:</span>
                       <span className="value">{booking.event?.city || booking.event_city}</span>
                     </div>
                    <div className="detail-item">
                      <span className="label"><Ticket size={14} /> Tickets:</span>
                      <span className="value">{booking.number_of_tickets}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label"><DollarSign size={14} /> Total Price:</span>
                      <span className="value">₹{booking.total_price}</span>
                    </div>
                  </div>

                  <div className="booking-actions">
                     <Link to={`/events/${booking.event?.id || booking.event}`} className="action-link">
                      View Event
                    </Link>
                    {booking.status !== 'CANCELLED' && (
                      <button 
                        onClick={() => handleDownloadTickets(booking.id, booking.booking_reference)}
                        className="action-button primary"
                      >
                        <Download size={14} /> Download Tickets
                      </button>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <button 
                        onClick={() => handleCancel(booking.id)}
                        className="action-button danger"
                      >
                        <XCircle size={14} /> Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-large">
              <p>No bookings found</p>
              <Link to="/events" className="cta-button">
                Browse Events
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserBookings;
