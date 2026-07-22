import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminUserAPI, profileEditAPI, authAPI } from '../../services/api';
import { ArrowLeft, User, Mail, Phone, Calendar, Building2, Ticket, CalendarDays, CheckCircle, XCircle, Clock, DollarSign, Shield } from 'lucide-react';
import '../user/Dashboard.css';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const response = await adminUserAPI.detail(id);
      setUserDetail(response.data);
    } catch (err) {
      setError('Failed to load user details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEdit = async (requestId) => {
    setActionLoading(`approve-${requestId}`);
    try {
      await profileEditAPI.approve(requestId);
      fetchUserDetail();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectEdit = async (requestId) => {
    setActionLoading(`reject-${requestId}`);
    try {
      await profileEditAPI.reject(requestId);
      fetchUserDetail();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveOrganizer = async () => {
    setActionLoading('org-approve');
    try {
      await authAPI.approveOrganizer(id);
      fetchUserDetail();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to approve organizer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectOrganizer = async () => {
    setActionLoading('org-reject');
    try {
      await authAPI.rejectOrganizer(id);
      fetchUserDetail();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reject organizer');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page page-enter">
        <div className="dashboard-header">
          <div className="container">
            <h1>User Details</h1>
          </div>
        </div>
        <div className="container" style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
          Loading user details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page page-enter">
        <div className="dashboard-header">
          <div className="container">
            <h1>User Details</h1>
          </div>
        </div>
        <div className="container" style={{ padding: '40px 20px' }}>
          <div style={{ padding: '12px 16px', background: '#fce4ec', color: '#c62828', borderRadius: '8px', border: '1px solid #ef9a9a' }}>
            {error}
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/users')} style={{ marginTop: '16px' }}>
            <ArrowLeft size={16} /> Back to Users
          </button>
        </div>
      </div>
    );
  }

  if (!userDetail) return null;

  return (
    <div className="dashboard-page page-enter">
      <div className="dashboard-header">
        <div className="container">
          <button
            onClick={() => navigate('/admin/users')}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              marginBottom: '12px', fontSize: '14px', padding: 0
            }}
          >
            <ArrowLeft size={16} /> Back to Users
          </button>
          <h1>{userDetail.first_name} {userDetail.last_name}</h1>
          <p>@{userDetail.username} &middot; {userDetail.role}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 20px', maxWidth: '900px' }}>
        <div className="detail-grid">
          <div className="profile-card">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#333' }}>
              <User size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
              Profile Information
            </h3>
            <div className="profile-info">
              <div className="profile-info-row">
                <span className="profile-label"><User size={14} /> Full Name</span>
                <span className="profile-value">{userDetail.first_name} {userDetail.last_name}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-label"><Mail size={14} /> Email</span>
                <span className="profile-value">{userDetail.email}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-label"><Phone size={14} /> Phone</span>
                <span className="profile-value">{userDetail.phone_number || '—'}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-label"><Shield size={14} /> Role</span>
                <span className="profile-value">{userDetail.role}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-label"><Calendar size={14} /> Joined</span>
                <span className="profile-value">{new Date(userDetail.created_at).toLocaleDateString()}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-label">Status</span>
                <span className="profile-value">
                  <span className={`status-dot ${userDetail.is_active ? 'active' : 'inactive'}`} style={{ marginRight: '6px' }} />
                  {userDetail.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {userDetail.is_verified && (
                <div className="profile-info-row">
                  <span className="profile-label">Verified</span>
                  <span className="profile-value" style={{ color: '#2ecc71' }}>Yes</span>
                </div>
              )}
            </div>
          </div>

          <div className="profile-card">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#333' }}>
              Statistics
            </h3>
            <div className="stats-grid" style={{ gridTemplateColumns: '1fr' }}>
              {userDetail.role === 'USER' && (
                <>
                  <div className="stat-card stat-info" style={{ animation: 'none' }}>
                    <div className="stat-icon"><Ticket size={20} /></div>
                    <div className="stat-content">
                      <p className="stat-title">Total Bookings</p>
                      <p className="stat-value">{userDetail.total_bookings || 0}</p>
                    </div>
                  </div>
                  <div className="stat-card stat-success" style={{ animation: 'none' }}>
                    <div className="stat-icon"><DollarSign size={20} /></div>
                    <div className="stat-content">
                      <p className="stat-title">Total Spent</p>
                      <p className="stat-value">₹{(userDetail.total_spent || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </>
              )}
              {userDetail.role === 'ORGANIZER' && (
                <>
                  <div className="stat-card stat-primary" style={{ animation: 'none' }}>
                    <div className="stat-icon"><CalendarDays size={20} /></div>
                    <div className="stat-content">
                      <p className="stat-title">Total Events</p>
                      <p className="stat-value">{userDetail.total_events || 0}</p>
                    </div>
                  </div>
                  <div className="stat-card stat-success" style={{ animation: 'none' }}>
                    <div className="stat-icon"><DollarSign size={20} /></div>
                    <div className="stat-content">
                      <p className="stat-title">Total Revenue</p>
                      <p className="stat-value">₹{(userDetail.total_revenue || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </>
              )}
              {userDetail.role === 'ADMIN' && (
                <div className="stat-card stat-warning" style={{ animation: 'none' }}>
                  <div className="stat-icon"><Shield size={20} /></div>
                  <div className="stat-content">
                    <p className="stat-title">Admin Account</p>
                    <p className="stat-value">Platform Administrator</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {userDetail.role === 'ORGANIZER' && userDetail.organizer_profile && (
          <div className="profile-card" style={{ marginTop: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#333' }}>
              <Building2 size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
              Organizer Details
            </h3>
            <div className="profile-info">
              <div className="profile-info-row">
                <span className="profile-label">Organization</span>
                <span className="profile-value">{userDetail.organizer_profile.organization_name}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-label">Address</span>
                <span className="profile-value">{userDetail.organizer_profile.address || '—'}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-label">Approval Status</span>
                <span className="profile-value">
                  <span className={`badge status-${userDetail.organizer_profile.approval_status.toLowerCase()}`}>
                    {userDetail.organizer_profile.approval_status}
                  </span>
                </span>
              </div>
              {userDetail.organizer_profile.government_id && (
                <div className="profile-info-row">
                  <span className="profile-label">Government ID</span>
                  <a
                    href={userDetail.organizer_profile.government_id}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#e8622c', fontWeight: '600' }}
                  >
                    View Document
                  </a>
                </div>
              )}
            </div>

            {userDetail.organizer_profile.approval_status === 'PENDING' && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleApproveOrganizer}
                  disabled={actionLoading === 'org-approve'}
                  style={{ background: '#2ecc71' }}
                >
                  <CheckCircle size={16} />
                  {actionLoading === 'org-approve' ? 'Processing...' : 'Approve'}
                </button>
                <button
                  className="btn"
                  onClick={handleRejectOrganizer}
                  disabled={actionLoading === 'org-reject'}
                  style={{ background: '#e74c3c', color: 'white' }}
                >
                  <XCircle size={16} />
                  {actionLoading === 'org-reject' ? 'Processing...' : 'Reject'}
                </button>
              </div>
            )}
          </div>
        )}

        {userDetail.pending_edit_requests?.length > 0 && (
          <div className="profile-card" style={{ marginTop: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#333' }}>
              <Clock size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
              Pending Profile Edit Requests ({userDetail.pending_edit_requests.length})
            </h3>
            {userDetail.pending_edit_requests.map(req => (
              <div key={req.id} style={{
                padding: '16px', background: '#f8f9fa', borderRadius: '8px',
                borderLeft: '3px solid #f39c12', marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
                      Submitted {new Date(req.created_at).toLocaleDateString()}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {Object.entries(req.proposed_data).map(([field, value]) => (
                        <span key={field} className="change-tag">
                          <strong>{field}:</strong> {typeof value === 'string' ? value.substring(0, 40) : String(value)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                      className="btn"
                      onClick={() => handleApproveEdit(req.id)}
                      disabled={actionLoading === `approve-${req.id}`}
                      style={{ background: '#2ecc71', color: 'white', padding: '8px 16px', fontSize: '13px' }}
                    >
                      <CheckCircle size={14} />
                      {actionLoading === `approve-${req.id}` ? '...' : 'Approve'}
                    </button>
                    <button
                      className="btn"
                      onClick={() => handleRejectEdit(req.id)}
                      disabled={actionLoading === `reject-${req.id}`}
                      style={{ background: '#e74c3c', color: 'white', padding: '8px 16px', fontSize: '13px' }}
                    >
                      <XCircle size={14} />
                      {actionLoading === `reject-${req.id}` ? '...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetail;
