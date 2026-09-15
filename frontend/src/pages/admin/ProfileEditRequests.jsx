import { useState, useEffect } from 'react';
import { profileEditAPI } from '../../services/api';
import { CheckCircle, XCircle, Clock, User, Mail, Shield, PenLine, UserCheck } from 'lucide-react';
import '../user/Dashboard.css';
import '../common/Profile.css';

const ProfileEditRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('PENDING');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNotes, setRejectNotes] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await profileEditAPI.allRequests();
      const data = response.data.results || response.data || [];
      setRequests(data);
    } catch (err) {
      setError('Failed to load profile edit requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = activeTab === 'ALL'
    ? requests
    : requests.filter(r => r.status === activeTab);

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  const handleApprove = async (requestId) => {
    setActionLoading(`approve-${requestId}`);
    try {
      await profileEditAPI.approve(requestId);
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to approve request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    setActionLoading(`reject-${requestId}`);
    try {
      await profileEditAPI.reject(requestId, rejectNotes);
      setRejectingId(null);
      setRejectNotes('');
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };

  const roleLabel = (role) => {
    const labels = { USER: 'User', ORGANIZER: 'Organizer', ADMIN: 'Admin' };
    return labels[role] || role;
  };

  const statusLabel = (status) => {
    const labels = { PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected' };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    if (status === 'PENDING') return 'status-pending';
    if (status === 'APPROVED') return 'status-confirmed';
    return 'status-rejected';
  };

  const isPending = (req) => req.status === 'PENDING';

  if (loading) {
    return <div className="container" style={{ padding: '40px 20px' }}><p>Loading profile edit requests...</p></div>;
  }

  return (
    <div className="dashboard-page page-enter">
      <div className="dashboard-header">
        <div className="container">
          <h1>Profile Edit Requests</h1>
          <p>Review and approve user profile change requests</p>
        </div>
      </div>

      {error && (
        <div className="container alert alert-danger" style={{ marginTop: '20px' }}>
          {error}
          <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', color: '#a33', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
        </div>
      )}

      <div className="container" style={{ padding: '30px 20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {[
            { key: 'PENDING', label: `Pending (${pendingCount})` },
            { key: 'APPROVED', label: 'Approved' },
            { key: 'REJECTED', label: 'Rejected' },
            { key: 'ALL', label: 'All' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 18px',
                borderRadius: '20px',
                border: '1px solid #ddd',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                background: activeTab === tab.key ? '#e8622c' : 'white',
                color: activeTab === tab.key ? 'white' : '#555',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredRequests.length > 0 ? (
          <div style={{ display: 'grid', gap: '20px' }}>
            {filteredRequests.map(req => (
              <div key={req.id} style={{
                background: 'white', padding: '24px', borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderLeft: isPending(req)
                  ? '4px solid #f39c12'
                  : req.status === 'APPROVED'
                    ? '4px solid #2ecc71'
                    : '4px solid #e74c3c',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <h3 style={{ margin: 0, fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={18} color="#e8622c" />
                        {req.user_username}
                      </h3>
                      <span className={`badge ${getStatusClass(req.status)}`}>{statusLabel(req.status)}</span>
                    </div>
                    <p style={{ margin: '4px 0', color: '#666', fontSize: '13px' }}>
                      <Mail size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      {req.user_email}
                      <span style={{ margin: '0 8px', color: '#ccc' }}>•</span>
                      <Shield size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      {roleLabel(req.user_role)}
                    </p>
                    <p style={{ margin: '4px 0 12px 0', fontSize: '12px', color: '#999' }}>
                      Submitted {new Date(req.created_at).toLocaleDateString()}{' '}
                      {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {req.reviewed_by_username && (
                        <>
                          <span style={{ margin: '0 8px', color: '#ccc' }}>•</span>
                          Reviewed by {req.reviewed_by_username}
                        </>
                      )}
                    </p>

                    <div style={{ margin: '12px 0' }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#555', fontWeight: '600' }}>
                        <PenLine size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                        Proposed changes
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {Object.entries(req.proposed_data || {}).map(([field, value]) => (
                          <span key={field} className="change-tag">
                            <strong style={{ color: '#333' }}>{field.replace(/_/g, ' ')}:</strong>{' '}
                            {typeof value === 'string' ? value.substring(0, 60) : String(value ?? '')}
                          </span>
                        ))}
                      </div>
                    </div>

                    {!isPending(req) && req.admin_notes && (
                      <div style={{
                        marginTop: '10px', padding: '10px 14px', background: '#f8f9fa',
                        borderRadius: '6px', fontSize: '13px', color: '#666',
                      }}>
                        <strong>Admin notes:</strong> {req.admin_notes}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', flexShrink: 0 }}>
                    {isPending(req) && (
                      <>
                        {rejectingId === req.id ? (
                          <div style={{
                            display: 'flex', flexDirection: 'column', gap: '8px',
                            background: '#fff5f5', padding: '12px', borderRadius: '8px',
                            border: '1px solid #f0c0c0', minWidth: '260px',
                          }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#c0392b' }}>
                              Rejection reason (optional)
                            </label>
                            <textarea
                              rows={3}
                              value={rejectNotes}
                              onChange={(e) => setRejectNotes(e.target.value)}
                              placeholder="e.g. Username already taken"
                              style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '13px', resize: 'vertical' }}
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
                                onClick={() => { setRejectingId(null); setRejectNotes(''); }}
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
                                border: 'none', borderRadius: '5px', cursor: actionLoading === `approve-${req.id}` ? 'not-allowed' : 'pointer',
                                fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px',
                                opacity: actionLoading === `approve-${req.id}` ? 0.6 : 1,
                              }}
                            >
                              <CheckCircle size={16} />
                              {actionLoading === `approve-${req.id}` ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => setRejectingId(req.id)}
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
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#999' }}>
            {activeTab === 'PENDING' ? (
              <>
                <UserCheck size={48} color="#2ecc71" style={{ marginBottom: '16px' }} />
                <p style={{ fontSize: '18px', color: '#333', fontWeight: '600' }}>All caught up!</p>
                <p style={{ color: '#999' }}>No pending profile edit requests</p>
              </>
            ) : (
              <>
                <Clock size={48} color="#999" style={{ marginBottom: '16px' }} />
                <p style={{ fontSize: '18px', color: '#333', fontWeight: '600' }}>No requests found</p>
                <p style={{ color: '#999' }}>No {statusLabel(activeTab).toLowerCase()} profile edit requests</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileEditRequests;