import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventAPI } from '../../services/api';
import { Clock, Calendar, MapPin, Edit3, Trash2, Plus, Eye, Ticket as TicketIcon } from 'lucide-react';
import '../user/Dashboard.css';

const OrganizerEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.myEvents();
      setEvents(response.data.results || response.data);
    } catch (err) {
      setError('Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await eventAPI.delete(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete event');
    }
  };

  const statusStyle = (status) => {
    const map = {
      PENDING: { bg: '#fff3cd', color: '#856404', label: 'Awaiting Approval' },
      UPCOMING: { bg: '#d4edda', color: '#155724', label: 'Upcoming' },
      ONGOING: { bg: '#cfe2ff', color: '#084298', label: 'Ongoing' },
      COMPLETED: { bg: '#e2e3e5', color: '#383d41', label: 'Completed' },
      CANCELLED: { bg: '#f8d7da', color: '#721c24', label: 'Cancelled' },
    };
    return map[status] || { bg: '#e2e3e5', color: '#383d41', label: status };
  };

  if (loading) {
    return <div className="container"><p>Loading your events...</p></div>;
  }

  return (
    <div className="dashboard-page page-enter">
      <div className="dashboard-header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>My Events</h1>
            <p>Manage all your events</p>
          </div>
          <Link to="/organizer/create-event" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', background: 'rgba(255,255,255,0.95)', color: '#e8622c',
            borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '14px',
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            <Plus size={18} /> Create Event
          </Link>
        </div>
      </div>

      {error && <div className="container alert alert-danger" style={{ marginTop: '20px' }}>{error}</div>}

      <div className="container" style={{ padding: '40px 20px' }}>
        {events.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }} className="stagger-children">
            {events.map(event => {
              const st = statusStyle(event.status);
              const canEdit = !['ONGOING', 'COMPLETED'].includes(event.status);
              return (
                <div key={event.id} style={{
                  background: 'white', borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden'
                }}>
                  {event.banner && (
                    <div style={{ height: '160px', overflow: 'hidden' }}>
                      <img src={event.banner} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '15px', flex: 1 }}>{event.title}</h3>
                      <span style={{
                        padding: '3px 10px', borderRadius: '12px', fontSize: '11px',
                        fontWeight: '600', background: st.bg, color: st.color, whiteSpace: 'nowrap', marginLeft: '8px'
                      }}>
                        {st.label}
                      </span>
                    </div>
                    <p style={{ margin: '6px 0', color: '#666', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} /> {event.start_date}
                    </p>
                    <p style={{ margin: '6px 0', color: '#666', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} /> {event.city || 'N/A'}
                    </p>
                    {event.booking_count !== undefined && (
                      <p style={{ margin: '6px 0', color: '#666', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TicketIcon size={13} /> {event.booking_count} booking{event.booking_count !== 1 ? 's' : ''}
                      </p>
                    )}
                    {event.status === 'PENDING' && (
                      <div style={{
                        marginTop: '8px', padding: '8px 12px', background: '#fff3cd',
                        borderRadius: '6px', fontSize: '12px', color: '#856404',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}>
                        <Clock size={14} />
                        Waiting for admin approval
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                      <button
                        onClick={() => navigate(`/events/${event.id}`)}
                        style={{
                          flex: 1, padding: '8px', background: '#f0f4ff', border: 'none',
                          borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                          color: '#084298', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                        }}
                      >
                        <Eye size={14} /> View
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => navigate(`/organizer/events/${event.id}/edit`)}
                          style={{
                            flex: 1, padding: '8px', background: '#e8f4fd', border: 'none',
                            borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                            color: '#e8622c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                          }}
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                      )}
                      {canEdit && !event.booking_count && (
                        <button
                          onClick={() => handleDelete(event.id, event.title)}
                          style={{
                            padding: '8px 12px', background: '#f8d7da', border: 'none',
                            borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                            color: '#721c24', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                          }}
                          title="Delete event"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      {canEdit && event.booking_count > 0 && (
                        <button
                          onClick={() => alert(`Cannot delete "${event.title}" — it has ${event.booking_count} booking(s). Only an admin can delete events with bookings. Please contact the admin.`)}
                          style={{
                            padding: '4px 8px', background: '#f8d7da', border: 'none',
                            borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                            color: '#721c24', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.6, cursor: 'pointer'
                          }} title="Has bookings - contact admin to delete">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
            <p style={{ fontSize: '18px', marginBottom: '16px' }}>No events yet</p>
            <Link to="/organizer/create-event" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', background: '#e8622c', color: 'white',
              borderRadius: '8px', textDecoration: 'none', fontWeight: '600'
            }}>
              <Plus size={18} /> Create Your First Event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerEvents;
