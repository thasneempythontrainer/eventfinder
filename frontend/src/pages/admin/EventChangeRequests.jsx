import { useState, useEffect } from 'react';
import { eventChangeAPI } from '../../services/api';
import {
  CheckCircle, XCircle, Clock, User, PenLine, ArrowRight,
  GitCompare, FileText, AlertTriangle,
} from 'lucide-react';
import '../user/Dashboard.css';

const STATUS_TABS = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'SUPERSEDED', label: 'Superseded' },
  { key: 'ALL', label: 'All' },
];

const statusLabel = (status) => {
  const labels = {
    PENDING: 'Pending Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    SUPERSEDED: 'Superseded',
  };
  return labels[status] || status;
};

const statusClass = (status) => {
  if (status === 'PENDING') return 'status-pending';
  if (status === 'APPROVED') return 'status-confirmed';
  if (status === 'REJECTED') return 'status-rejected';
  return 'status-cancelled';
};

const borderClass = (status) => {
  if (status === 'PENDING') return '#f39c12';
  if (status === 'APPROVED') return '#2ecc71';
  if (status === 'REJECTED') return '#e74c3c';
  return '#95a5a6';
};

const DiffRow = ({ change }) => (
  <tr>
    <td style={{ padding: '10px 12px', fontWeight: '600', color: '#333', fontSize: '13px', whiteSpace: 'nowrap' }}>
      {change.label}
    </td>
    <td style={{ padding: '10px 12px', fontSize: '13px' }}>
      <span style={{
        display: 'block', padding: '6px 10px', borderRadius: '5px',
        background: '#fdecea', color: '#922b21', textDecoration: 'line-through',
        wordBreak: 'break-word',
      }}>
        {change.old !== '' ? change.old : <em style={{ opacity: 0.6 }}>empty</em>}
      </span>
    </td>
    <td style={{ padding: '0 4px', textAlign: 'center', color: '#bbb' }}>
      <ArrowRight size={15} style={{ margin: '0 auto', display: 'block' }} />
    </td>
    <td style={{ padding: '10px 12px', fontSize: '13px' }}>
      <span style={{
        display: 'block', padding: '6px 10px', borderRadius: '5px',
        background: '#eafaf1', color: '#1e6b3a', fontWeight: '600',
        wordBreak: 'break-word',
      }}>
        {change.new !== '' ? change.new : <em style={{ opacity: 0.6 }}>empty</em>}
      </span>
    </td>
  </tr>
);

const EventChangeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('PENDING');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [notes, setNotes] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await eventChangeAPI.list();
      const data = response.data.results || response.data || [];
      setRequests(data);
    } catch (err) {
      setError('Failed to load event change requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filtered =
    activeTab === 'ALL'
      ? requests
      : requests.filter(r => r.status === activeTab);

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  const handleApprove = async (id) => {
    setActionLoading(`approve-${id}`);
    setError('');
    try {
      await eventChangeAPI.approve(id, notes);
      setNotes('');
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to approve the changes');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(`reject-${id}`);
    setError('');
    try {
      await eventChangeAPI.reject(id, notes);
      setRejectingId(null);
      setNotes('');
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reject the changes');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <p>Loading event change requests...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page page-enter">
      <div className="dashboard-header">
        <div className="container">
          <h1>Event Update Reviews</h1>
          <p>Compare what an organizer changed, then approve or reject it</p>
        </div>
      </div>

      {error && (
        <div className="container alert alert-danger" style={{ marginTop: '20px' }}>
          {error}
          <button
            onClick={() => setError('')}
            style={{ float: 'right', background: 'none', border: 'none', color: '#a33', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ×
          </button>
        </div>
      )}

      <div className="container" style={{ padding: '30px 20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 18px', borderRadius: '20px', border: '1px solid #ddd',
                fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                background: activeTab === tab.key ? '#e8622c' : 'white',
                color: activeTab === tab.key ? 'white' : '#555',
              }}
            >
              {tab.key === 'PENDING' ? `${tab.label} (${pendingCount})` : tab.label}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div style={{ display: 'grid', gap: '20px' }}>
            {filtered.map(req => {
              const isPending = req.status === 'PENDING';
              const isExpanded = expandedId === req.id;
              return (
                <div
                  key={req.id}
                  style={{
                    background: 'white', padding: '24px', borderRadius: '10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderLeft: `4px solid ${borderClass(req.status)}`,
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
                        <h3 style={{ margin: 0, fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={18} color="#e8622c" />
                          {req.event_title}
                        </h3>
                        <span className={`badge ${statusClass(req.status)}`}>{statusLabel(req.status)}</span>
                      </div>
                      <p style={{ margin: '4px 0', color: '#666', fontSize: '13px' }}>
                        <User size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        {req.organizer_name}
                        <span style={{ margin: '0 8px', color: '#ccc' }}>•</span>
                        <GitCompare size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        {req.changed_field_count} field{req.changed_field_count === 1 ? '' : 's'} changed
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>
                        Submitted {new Date(req.created_at).toLocaleDateString()}{' '}
                        {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {req.reviewed_by_username && (
                          <>
                            <span style={{ margin: '0 8px', color: '#ccc' }}>•</span>
                            Reviewed by {req.reviewed_by_username}
                          </>
                        )}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', flexShrink: 0 }}>
                      {isPending ? (
                        rejectingId === req.id ? (
                          <div style={{
                            display: 'flex', flexDirection: 'column', gap: '8px',
                            background: '#fff5f5', padding: '12px', borderRadius: '8px',
                            border: '1px solid #f0c0c0', minWidth: '280px',
                          }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#c0392b' }}>
                              Rejection reason (optional)
                            </label>
                            <textarea
                              rows={3}
                              value={notes}
                              onChange={e => setNotes(e.target.value)}
                              placeholder="e.g. New venue is not permitted by policy"
                              style={{
                                width: '100%', padding: '8px', borderRadius: '5px',
                                border: '1px solid #ddd', fontSize: '13px', resize: 'vertical',
                              }}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleReject(req.id)}
                                disabled={actionLoading === `reject-${req.id}`}
                                style={{
                                  flex: 1, padding: '8px 12px', background: '#e74c3c', color: 'white',
                                  border: 'none', borderRadius: '5px', cursor: 'pointer',
                                  fontWeight: '600', fontSize: '13px',
                                }}
                              >
                                {actionLoading === `reject-${req.id}` ? 'Rejecting...' : 'Confirm Reject'}
                              </button>
                              <button
                                onClick={() => { setRejectingId(null); setNotes(''); }}
                                style={{
                                  padding: '8px 12px', background: '#eee', color: '#555',
                                  border: 'none', borderRadius: '5px', cursor: 'pointer',
                                  fontWeight: '600', fontSize: '13px',
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleApprove(req.id)}
                              disabled={actionLoading === `approve-${req.id}`}
                              style={{
                                padding: '10px 20px', background: '#2ecc71', color: 'white',
                                border: 'none', borderRadius: '5px',
                                cursor: actionLoading === `approve-${req.id}` ? 'not-allowed' : 'pointer',
                                fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px',
                                opacity: actionLoading === `approve-${req.id}` ? 0.6 : 1,
                              }}
                            >
                              <CheckCircle size={16} />
                              {actionLoading === `approve-${req.id}` ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => { setRejectingId(req.id); setNotes(''); }}
                              style={{
                                padding: '10px 20px', background: '#e74c3c', color: 'white',
                                border: 'none', borderRadius: '5px', cursor: 'pointer',
                                fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px',
                              }}
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                          </>
                        )
                      ) : (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : req.id)}
                          style={{
                            padding: '8px 14px', background: 'white', color: '#555',
                            border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer',
                            fontWeight: '600', fontSize: '13px',
                            display: 'flex', alignItems: 'center', gap: '6px',
                          }}
                        >
                          <GitCompare size={14} />
                          {isExpanded ? 'Hide' : 'View'} comparison
                        </button>
                      )}
                    </div>
                  </div>

                  {(isPending || isExpanded) && (
                    <div style={{ marginTop: '18px' }}>
                      <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#555', fontWeight: '600' }}>
                        <PenLine size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                        Before vs after
                      </p>
                      <div style={{ overflowX: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', color: '#666' }}>
                                Field
                              </th>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', color: '#922b21' }}>
                                Before
                              </th>
                              <th style={{ width: '32px' }} />
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', color: '#1e6b3a' }}>
                                After (proposed)
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(req.changes || []).map(change => (
                              <DiffRow key={change.field} change={change} />
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {isPending && (
                        <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#999', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <AlertTriangle size={13} />
                          The event stays live with its current details until you approve.
                        </p>
                      )}
                    </div>
                  )}

                  {req.admin_notes && (
                    <div style={{
                      marginTop: '14px', padding: '10px 14px', background: '#f8f9fa',
                      borderRadius: '6px', fontSize: '13px', color: '#666',
                    }}>
                      <strong>Admin notes:</strong> {req.admin_notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#999' }}>
            {activeTab === 'PENDING' ? (
              <>
                <CheckCircle size={48} color="#2ecc71" style={{ marginBottom: '16px' }} />
                <p style={{ fontSize: '18px', color: '#333', fontWeight: '600' }}>All caught up!</p>
                <p style={{ color: '#999' }}>No pending event updates to review</p>
              </>
            ) : (
              <>
                <Clock size={48} color="#999" style={{ marginBottom: '16px' }} />
                <p style={{ fontSize: '18px', color: '#333', fontWeight: '600' }}>No requests found</p>
                <p style={{ color: '#999' }}>
                  No {statusLabel(activeTab).toLowerCase()} event updates
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventChangeRequests;
