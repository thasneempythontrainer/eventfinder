import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import {
  CheckCircle, CalendarDays, MapPin, Ticket, Download, ArrowRight,
  CreditCard, Clock, Hash, User, Mail
} from 'lucide-react';
import './Payment.css';

const PaymentReceipt = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const {
    booking_reference,
    razorpay_payment_id,
    razorpay_order_id,
  } = location.state || {};

  useEffect(() => {
    if (!booking_reference) {
      navigate('/user/bookings');
      return;
    }
    fetchBooking();
  }, [booking_reference]);

  const fetchBooking = async () => {
    try {
      const response = await bookingAPI.list();
      const allBookings = response.data.results || response.data;
      const found = allBookings.find(b => b.booking_reference === booking_reference);
      if (found) {
        setBooking(found);
      }
    } catch (err) {
      console.error('Failed to fetch booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTickets = async () => {
    if (!booking) return;
    setDownloading(true);
    try {
      const response = await bookingAPI.downloadTickets(booking.id);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tickets_${booking_reference}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download tickets:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="payment-loading">
          <div className="spinner" />
          <p>Loading your receipt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page page-enter">
      <div className="receipt-container">
        <div className="receipt-success-icon">
          <div className="success-circle">
            <CheckCircle size={48} />
          </div>
          <div className="success-ripple" />
          <div className="success-ripple delay" />
        </div>

        <h1 className="receipt-title">Payment Successful!</h1>
        <p className="receipt-subtitle">Your booking has been confirmed</p>

        <div className="receipt-card">
          <div className="receipt-card-header">
            <div className="receipt-brand">
              <span className="receipt-brand-text">Event<span style={{ color: '#e8622c' }}>Finder</span></span>
            </div>
            <span className="receipt-status-badge">CONFIRMED</span>
          </div>

          <div className="receipt-divider" />

          <div className="receipt-section">
            <h3>Booking Details</h3>
            <div className="receipt-grid">
              <div className="receipt-field">
                <Hash size={14} />
                <div>
                  <span className="receipt-label">Booking Reference</span>
                  <span className="receipt-value">{booking_reference}</span>
                </div>
              </div>
              {booking?.event && (
                <>
                  <div className="receipt-field">
                    <CalendarDays size={14} />
                    <div>
                      <span className="receipt-label">Event</span>
                      <span className="receipt-value">{booking.event.title}</span>
                    </div>
                  </div>
                  <div className="receipt-field">
                    <CalendarDays size={14} />
                    <div>
                      <span className="receipt-label">Date</span>
                      <span className="receipt-value">
                        {new Date(booking.event.start_date).toLocaleDateString('en-US', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="receipt-field">
                    <MapPin size={14} />
                    <div>
                      <span className="receipt-label">Venue</span>
                      <span className="receipt-value">{booking.event.venue}, {booking.event.city}</span>
                    </div>
                  </div>
                  <div className="receipt-field">
                    <Ticket size={14} />
                    <div>
                      <span className="receipt-label">Tickets</span>
                      <span className="receipt-value">{booking.number_of_tickets} ticket(s)</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="receipt-divider" />

          <div className="receipt-section">
            <h3>Payment Details</h3>
            <div className="receipt-grid">
              {booking?.user_name && (
                <div className="receipt-field">
                  <User size={14} />
                  <div>
                    <span className="receipt-label">Name</span>
                    <span className="receipt-value">{booking.user_name}</span>
                  </div>
                </div>
              )}
              <div className="receipt-field">
                <CreditCard size={14} />
                <div>
                  <span className="receipt-label">Payment ID</span>
                  <span className="receipt-value receipt-mono">{razorpay_payment_id}</span>
                </div>
              </div>
              <div className="receipt-field">
                <Hash size={14} />
                <div>
                  <span className="receipt-label">Order ID</span>
                  <span className="receipt-value receipt-mono">{razorpay_order_id}</span>
                </div>
              </div>
              <div className="receipt-field">
                <Clock size={14} />
                <div>
                  <span className="receipt-label">Date & Time</span>
                  <span className="receipt-value">
                    {new Date().toLocaleString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="receipt-total-bar">
            <span>Total Paid</span>
            <span className="receipt-total-amount">₹{booking?.total_price}</span>
          </div>
        </div>

        <div className="receipt-actions">
          <button
            className="btn btn-primary receipt-btn"
            onClick={handleDownloadTickets}
            disabled={downloading || !booking}
          >
            <Download size={16} />
            {downloading ? 'Downloading...' : 'Download Tickets'}
          </button>
          <Link to="/user/bookings" className="btn btn-secondary receipt-btn">
            View All Bookings
            <ArrowRight size={16} />
          </Link>
        </div>

        <p className="receipt-note">
          A confirmation has been saved. You can download your tickets anytime from My Bookings.
        </p>
      </div>
    </div>
  );
};

export default PaymentReceipt;
