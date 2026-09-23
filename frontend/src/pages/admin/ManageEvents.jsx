import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventAPI, authAPI, dashboardAPI } from '../../services/api';
import { CheckCircle, XCircle, Clock, Eye, Users, Calendar,
  ChevronLeft, MapPin, DollarSign, Ticket as TicketIcon, FileText, Trash2 } from 'lucide-react';
import '../user/Dashboard.css';

const ManageEvents = () => {
  const navigate = useNavigate();
  const [pendingEvents, setPendingEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [allEventsCount, setAllEventsCount] = useState(0);
  const [pendingOrganizers, setPendingOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('organizer-approval');
  const [actionLoading, setActionLoading] = useState(null);
  const [detailView, setDetailView] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [pendingRes, allRes, orgRes] = await Promise.all([
        eventAPI.pendingApproval(),
        eventAPI.list({ page_size: 500 }),
        dashboardAPI.adminPendingApprovals()
      ]);
      setPendingEvents(pendingRes.data || []);
      const allData = allRes.data.results || allRes.data;
      setAllEvents(allData);
      setAllEventsCount(
        allRes.data.count !== undefined ? allRes.data.count : allData.length
      );
      setPendingOrganizers(orgRes.data || []);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrganizer = async (userId) => {
    setActionLoading(`org-${userId}`);
    try {
      await authAPI.approveOrganizer(userId);
      setPendingOrganizers(prev => prev.filter(p => p.user_id !== userId));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectOrganizer = async (userId) => {
    setActionLoading(`org-${userId}`);
    try {
      await authAPI.rejectOrganizer(userId);
      setPendingOrganizers(prev => prev.filter(p => p.user_id !== userId));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveEvent = async (eventId) => {
    setActionLoading(`evt-${eventId}`);
    try {
      await eventAPI.approveEvent(eventId);
      const evt = pendingEvents.find(e => e.id === eventId);
      setPendingEvents(prev => prev.filter(e => e.id !== eventId));
      if (evt) setAllEvents(prev => [{ ...evt, status: 'UPCOMING' }, ...prev]);
      setDetailView(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectEvent = async (eventId) => {
    setActionLoading(`evt-${eventId}`);
    try {
      await eventAPI.rejectEvent(eventId);
      const evt = pendingEvents.find(e => e.id === eventId);
      setPendingEvents(prev => prev.filter(e => e.id !== eventId));
      if (evt) setAllEvents(prev => [{ ...evt, status: 'CANCELLED' }, ...prev]);
      setDetailView(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteEvent = async (eventId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    setActionLoading(`del-${eventId}`);
    try {
      await eventAPI.delete(eventId);
      setAllEvents(prev => prev.filter(e => e.id !== eventId));
      setPendingEvents(prev => prev.filter(e => e.id !== eventId));
      setDetailView(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete event');
    } finally {
      setActionLoading(null);
    }
  };

  const statusStyle = (status) => {
    const map = {
      PENDING: { bg: '#fff3cd', color: '#856404' },
      UPCOMING: { bg: '#d4edda', color: '#155724' },
      ONGOING: { bg: '#cfe2ff', color: '#084298' },
      COMPLETED: { bg: '#e2e3e5', color: '#383d41' },
      CANCELLED: { bg: '#f8d7da', color: '#721c24' },
    };
    return map[status] || { bg: '#e2e3e5', color: '#383d41' };
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  // Detail View for an event
  if (detailView) {
    const evt = detailView;
    const st = statusStyle(evt.status);
    return (
      <div className="dashboard-page page-enter">
        <div className="dashboard-header">
          <div className="container">
            <button onClick={() => setDetailView(null)} style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '14px', marginBottom: '8px', padding: '4px 8px', borderRadius: '4px'
            }}>
              <ChevronLeft size={16} /> Back to list
            </button>
            <h1>{evt.title}</h1>
            <span style={{
              padding: '4px 12px', borderRadius: '12px', fontSize: '12px',
              fontWeight: '600', background: 'rgba(255,255,255,0.2)', color: 'white'
            }}>
              {evt.status}
            </span>
          </div>
        </div>
        <div className="container" style={{ padding: '40px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '30px' }}>
            <div style={{ background: 'white', borderRadius: '10px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              {evt.banner && (
                <img src={evt.banner} alt="" style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '8px', marginBottom: '20px' }} />
              )}
              <h2 style={{ margin: '0 0 16px' }}>{evt.title}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555' }}>
                  <Calendar size={16} color="#e8622c" />
                  <div>
                    <div style={{ fontSize: '12px', color: '#999' }}>Date</div>
                    <div style={{ fontWeight: '600' }}>{evt.start_date} to {evt.end_date}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555' }}>
                  <Clock size={16} color="#e8622c" />
                  <div>
                    <div style={{ fontSize: '12px', color: '#999' }}>Time</div>
                    <div style={{ fontWeight: '600' }}>{evt.start_time} to {evt.end_time}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555' }}>
                  <MapPin size={16} color="#e8622c" />
                  <div>
                    <div style={{ fontSize: '12px', color: '#999' }}>Location</div>
                    <div style={{ fontWeight: '600' }}>{evt.venue}, {evt.city}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555' }}>
                  <DollarSign size={16} color="#e8622c" />
                  <div>
                    <div style={{ fontSize: '12px', color: '#999' }}>Price & Seats</div>
                    <div style={{ fontWeight: '600' }}>Rs.{evt.ticket_price} / {evt.total_seats} seats</div>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 8px', color: '#333' }}>Description</h4>
                <p style={{ color: '#555', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{evt.description}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
                <Users size={16} color="#e8622c" />
                <div>
                  <div style={{ fontSize: '12px', color: '#999' }}>Organizer</div>
                  <div style={{ fontWeight: '600' }}>{evt.organizer_name || 'Unknown'}</div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ background: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 16px' }}>Status</h3>
                <div style={{
                  padding: '12px', borderRadius: '8px', textAlign: 'center',
                  background: st.bg, color: st.color, fontWeight: '600', fontSize: '14px'
                }}>
                  {evt.status}
                </div>
              </div>

              {evt.status === 'PENDING' && (
                <div style={{ background: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ margin: '0 0 16px' }}>Admin Actions</h3>
                  <button
                    onClick={() => handleApproveEvent(evt.id)}
                    disabled={actionLoading === `evt-${evt.id}`}
                    style={{
                      width: '100%', padding: '12px', background: '#2ecc71', color: 'white',
                      border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
                      fontSize: '14px', marginBottom: '10px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', gap: '8px',
                      opacity: actionLoading === `evt-${evt.id}` ? 0.6 : 1
                    }}
                  >
                    <CheckCircle size={18} /> Approve Event
                  </button>
                  <button
                    onClick={() => handleRejectEvent(evt.id)}
                    disabled={actionLoading === `evt-${evt.id}`}
                    style={{
                      width: '100%', padding: '12px', background: '#e74c3c', color: 'white',
                      border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
                      fontSize: '14px', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '8px',
                      opacity: actionLoading === `evt-${evt.id}` ? 0.6 : 1
                    }}
                  >
                    <XCircle size={18} /> Reject Event
                  </button>
                </div>
              )}

              {evt.gallery && evt.gallery.length > 0 && (
                <div style={{ background: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ margin: '0 0 12px' }}>Gallery ({evt.gallery.length})</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {evt.gallery.slice(0, 4).map(img => (
                      <img key={img.id} src={img.image} alt="" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
                    ))}
                  </div>
                </div>
              )}

              <div style={{ background: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px', color: '#c0392b' }}>Danger Zone</h3>
                <button
                  onClick={() => handleDeleteEvent(evt.id, evt.title)}
                  disabled={actionLoading === `del-${evt.id}`}
                  style={{
                    width: '100%', padding: '12px', background: '#e74c3c', color: 'white',
                    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
                    fontSize: '14px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '8px',
                    opacity: actionLoading === `del-${evt.id}` ? 0.6 : 1
                  }}
                >
                  <Trash2 size={18} /> Permanently Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page page-enter">
      <div className="dashboard-header">
        <div className="container">
          <h1>Admin Panel</h1>
          <p>Manage organizer registrations and event approvals</p>
        </div>
      </div>

      {error && <div className="container alert alert-danger" style={{ marginTop: '20px' }}>{error}</div>}

      <div className="container" style={{ padding: '40px 20px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '2px solid #eee' }}>
          {[
            { id: 'organizer-approval', icon: Users, label: 'Organizer Approval', count: pendingOrganizers.length, color: '#f39c12' },
            { id: 'event-approval', icon: Calendar, label: 'Event Approval', count: pendingEvents.length, color: '#3498db' },
            { id: 'all-events', icon: FileText, label: 'All Events', count: allEventsCount, color: '#2ecc71' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '12px 20px', border: 'none', cursor: 'pointer', fontWeight: '600',
              fontSize: '14px', borderRadius: '8px 8px 0 0', transition: 'all 0.2s',
              background: activeTab === tab.id ? `${tab.color}22` : 'transparent',
              color: activeTab === tab.id ? tab.color : '#666',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <tab.icon size={16} />
              {tab.label}
              {(tab.id === 'all-events' || tab.count > 0) && (
                <span style={{
                  padding: '2px 8px', borderRadius: '10px', fontSize: '11px',
                  background: activeTab === tab.id ? tab.color : '#ddd',
                  color: activeTab === tab.id ? 'white' : '#666'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Organizer Approval Tab */}
        {activeTab === 'organizer-approval' && (
          <div>
            <h2 style={{ margin: '0 0 20px', fontSize: '20px' }}>Pending Organizer Registrations</h2>
            {pendingOrganizers.length > 0 ? (
              <div style={{ display: 'grid', gap: '16px' }} className="stagger-children">
                {pendingOrganizers.map(org => (
                  <div key={org.profile_id} style={{
                    background: 'white', padding: '20px', borderRadius: '10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid #f39c12'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'start' }}>
                      <div>
                        <h3 style={{ margin: '0 0 8px' }}>{org.organization_name || org.username}</h3>
                        <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}><strong>Username:</strong> {org.username}</p>
                        {org.government_id && (
                          <p style={{ margin: '4px 0', fontSize: '14px' }}>
                            <strong>ID Document:</strong>{' '}
                            <a href={org.government_id} target="_blank" rel="noopener noreferrer"
                               style={{ color: '#e8622c' }}>View Document</a>
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleApproveOrganizer(org.user_id)}
                          disabled={actionLoading === `org-${org.user_id}`}
                          style={{
                            padding: '10px 20px', background: '#2ecc71', color: 'white',
                            border: 'none', borderRadius: '6px', cursor: 'pointer',
                            fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px'
                          }}
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectOrganizer(org.user_id)}
                          disabled={actionLoading === `org-${org.user_id}`}
                          style={{
                            padding: '10px 20px', background: '#e74c3c', color: 'white',
                            border: 'none', borderRadius: '6px', cursor: 'pointer',
                            fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px'
                          }}
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                <CheckCircle size={48} color="#2ecc71" style={{ marginBottom: '16px' }} />
                <p style={{ fontSize: '16px', color: '#333', fontWeight: '600' }}>All caught up!</p>
                <p>No pending organizer registrations</p>
              </div>
            )}
          </div>
        )}

        {/* Event Approval Tab */}
        {activeTab === 'event-approval' && (
          <div>
            <h2 style={{ margin: '0 0 20px', fontSize: '20px' }}>Pending Event Approvals</h2>
            {pendingEvents.length > 0 ? (
              <div style={{ display: 'grid', gap: '16px' }} className="stagger-children">
                {pendingEvents.map(evt => (
                  <div key={evt.id} style={{
                    background: 'white', padding: '20px', borderRadius: '10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid #3498db'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 8px' }}>{evt.title}</h3>
                        <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}><strong>Organizer:</strong> {evt.organizer_name}</p>
                        <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}><strong>Category:</strong> {evt.category_name || 'N/A'}</p>
                        <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}><strong>Date:</strong> {evt.start_date} to {evt.end_date}</p>
                        <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}><strong>Price:</strong> Rs.{evt.ticket_price} | <strong>Seats:</strong> {evt.total_seats}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                        <button
                          onClick={() => setDetailView(evt)}
                          style={{
                            padding: '10px 16px', background: '#3498db', color: 'white',
                            border: 'none', borderRadius: '6px', cursor: 'pointer',
                            fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px'
                          }}
                        >
                          <Eye size={16} /> View Details
                        </button>
                        <button
                          onClick={() => handleApproveEvent(evt.id)}
                          disabled={actionLoading === `evt-${evt.id}`}
                          style={{
                            padding: '10px 16px', background: '#2ecc71', color: 'white',
                            border: 'none', borderRadius: '6px', cursor: 'pointer',
                            fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px'
                          }}
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectEvent(evt.id)}
                          disabled={actionLoading === `evt-${evt.id}`}
                          style={{
                            padding: '10px 16px', background: '#e74c3c', color: 'white',
                            border: 'none', borderRadius: '6px', cursor: 'pointer',
                            fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px'
                          }}
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                <CheckCircle size={48} color="#2ecc71" style={{ marginBottom: '16px' }} />
                <p style={{ fontSize: '16px', color: '#333', fontWeight: '600' }}>All caught up!</p>
                <p>No events waiting for approval</p>
              </div>
            )}
          </div>
        )}

        {/* All Events Tab */}
        {activeTab === 'all-events' && (
          <div>
            <h2 style={{ margin: '0 0 20px', fontSize: '20px' }}>All Events</h2>
            {allEvents.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '10px', overflow: 'hidden' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Event</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Organizer</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Price</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="stagger-children">
                    {allEvents.map(evt => {
                      const st = statusStyle(evt.status);
                      return (
                        <tr key={evt.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px', fontWeight: '600' }}>{evt.title}</td>
                          <td style={{ padding: '12px' }}>{evt.organizer_name || 'Unknown'}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              padding: '4px 10px', borderRadius: '4px', fontSize: '12px',
                              fontWeight: '600', background: st.bg, color: st.color
                            }}>{evt.status}</span>
                          </td>
                          <td style={{ padding: '12px', fontSize: '13px' }}>{evt.start_date}</td>
                          <td style={{ padding: '12px', fontWeight: '600' }}>Rs.{evt.ticket_price}</td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => setDetailView(evt)}
                                style={{
                                  padding: '6px 12px', background: '#f0f4ff', border: 'none',
                                  borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
                                  fontWeight: '600', color: '#084298', display: 'flex',
                                  alignItems: 'center', gap: '4px'
                                }}
                              >
                                <Eye size={14} /> View
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(evt.id, evt.title)}
                                disabled={actionLoading === `del-${evt.id}`}
                                style={{
                                  padding: '6px 12px', background: '#f8d7da', border: 'none',
                                  borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
                                  fontWeight: '600', color: '#721c24', display: 'flex',
                                  alignItems: 'center', gap: '4px',
                                  opacity: actionLoading === `del-${evt.id}` ? 0.6 : 1
                                }}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                <p style={{ fontSize: '18px' }}>No events found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageEvents;
