import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI, bookingAPI, waitlistAPI } from '../../services/api';
import {
  ArrowLeft, Check, X, Users, Ticket as TicketIcon, Download,
  User, Phone, Mail, RefreshCw, FileDown
} from 'lucide-react';
import '../user/Dashboard.css';

const STATUS_LABELS = {
  PENDING: 'Pending',
  PENDING_APPROVAL: 'Awaiting Confirmation',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
};

const EventBookings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventRes, bookingsRes, waitlistRes] = await Promise.all([
        eventAPI.get(id),
        bookingAPI.eventBookings({ event_id: id }),
        waitlistAPI.list({ event_id: id }),
      ]);
      setEvent(eventRes.data);
      setBookings(bookingsRes.data.results || bookingsRes.data || []);
      setWaitlist(waitlistRes.data.results || waitlistRes.data || []);
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (bookingId) => {
    setBusyId(bookingId);
    try {
      await bookingAPI.confirm(bookingId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to confirm booking');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (booking) => {
    if (!window.confirm(`Reject booking ${booking.booking_reference} for ${booking.user_name}?`)) return;
    setBusyId(booking.id);
    try {
      await bookingAPI.reject(booking.id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to reject booking');
    } finally {
      setBusyId(null);
    }
  };

  const handleDownloadParticipants = async () => {
    try {
      const response = await eventAPI.participantsPdf(id);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `participants_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to download participant list');
    }
  };

  const filteredBookings = filter ? bookings.filter(b => b.status === filter) : bookings;

  if (loading) {
    return <div className="container"><p>Loading bookings...</p></div>;
  }

  return (
    <div className="dashboard-page page-enter">
      <div className="dashboard-header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Event Bookings</h1>
            <p>{event?.title}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleDownloadParticipants} style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 20px', background: 'rgba(255,255,255,0.95)', color: '#e8622c',
              borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px',
              border: '2px solid rgba(255,255,255,0.3)', cursor: 'pointer'
            }}>
              <FileDown size={16} /> Participants PDF
            </button>
            <button onClick={() => navigate('/organizer/events')} style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 20px', background: 'rgba(255,255,255,0.95)', color: '#333',
              borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px',
              border: '2px solid rgba(255,255,255,0.3)', cursor: 'pointer'
            }}>
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>
      </div>

      {error && <div className="container alert alert-danger" style={{ marginTop: '20px' }}>{error}</div>}

      <div className="container" style={{ padding: '30px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}><TicketIcon size={18} style={{ verticalAlign: 'middle' }} /> Bookings ({bookings.length})</h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
            <option value="">All Statuses</option>
            <option value="PENDING_APPROVAL">Awaiting Confirmation</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {filteredBookings.length > 0 ? (
          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '760px' }}>
              <thead>
                <tr style={{ background: '#f8f4f0', color: '#7a3b1e', textAlign: 'left' }}>
                  <th style={{ padding: '12px 14px' }}>Attendee</th>
                  <th style={{ padding: '12px 14px' }}>Contact</th>
                  <th style={{ padding: '12px 14px' }}>Tickets</th>
                  <th style={{ padding: '12px 14px' }}>Amount</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(booking => (
                  <tr key={booking.id} style={{ borderTop: '1px solid #f0ece8' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <strong>{booking.user_name}</strong>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#666' }}>
                      <div><Mail size={11} style={{ verticalAlign: 'middle' }} /> {booking.user_email || '-'}</div>
                      <div><Phone size={11} style={{ verticalAlign: 'middle' }} /> {booking.user_phone || '-'}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>{booking.number_of_tickets}</td>
                    <td style={{ padding: '12px 14px' }}>₹{booking.total_price}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                        {STATUS_LABELS[booking.status] || booking.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {booking.status === 'PENDING_APPROVAL' ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleConfirm(booking.id)}
                            disabled={busyId === booking.id}
                            title="Confirm booking"
                            style={{
                              padding: '7px 12px', background: '#2d8b4e', color: 'white', border: 'none',
                              borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px'
                            }}
                          >
                            <Check size={14} /> Confirm
                          </button>
                          <button
                            onClick={() => handleReject(booking)}
                            disabled={busyId === booking.id}
                            title="Reject booking"
                            style={{
                              padding: '7px 12px', background: '#c0392b', color: 'white', border: 'none',
                              borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px'
                            }}
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      ) : booking.status === 'CANCELLED' || booking.status === 'REJECTED' ? (
                        <button
                          onClick={() => handleConfirm(booking.id)}
                          disabled={busyId === booking.id}
                          title="Reinstate as confirmed"
                          style={{
                            padding: '7px 12px', background: '#f0f4ff', color: '#084298', border: 'none',
                            borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px'
                          }}
                        >
                          <RefreshCw size={14} /> Reinstate
                        </button>
                      ) : (
                        <span style={{ color: '#999' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999', background: 'white', borderRadius: '10px' }}>
            No bookings match this filter.
          </div>
        )}

        <h2 style={{ margin: '32px 0 16px', fontSize: '18px' }}>
          <Users size={18} style={{ verticalAlign: 'middle' }} /> Waitlist ({waitlist.filter(w => w.status === 'WAITING').length})
        </h2>
        {waitlist.filter(w => w.status === 'WAITING').length > 0 ? (
          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: '#f8f4f0', color: '#7a3b1e', textAlign: 'left' }}>
                  <th style={{ padding: '12px 14px' }}>#</th>
                  <th style={{ padding: '12px 14px' }}>User</th>
                  <th style={{ padding: '12px 14px' }}>Contact</th>
                  <th style={{ padding: '12px 14px' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {waitlist.filter(w => w.status === 'WAITING').map(entry => (
                  <tr key={entry.id} style={{ borderTop: '1px solid #f0ece8' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: '#e8622c' }}>#{entry.position}</td>
                    <td style={{ padding: '12px 14px' }}><User size={12} style={{ verticalAlign: 'middle' }} /> {entry.user_name}</td>
                    <td style={{ padding: '12px 14px', color: '#666' }}>{entry.user_email}</td>
                    <td style={{ padding: '12px 14px', color: '#666' }}>
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px', color: '#999', background: 'white', borderRadius: '10px' }}>
            No one on the waitlist right now.
          </div>
        )}
      </div>
    </div>
  );
};

export default EventBookings;
