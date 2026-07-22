import { useState, useEffect } from 'react';
import { dashboardAPI, authAPI } from '../../services/api';
import { CheckCircle, XCircle, FileText, Building2 } from 'lucide-react';
import '../user/Dashboard.css';

const OrganizerApprovals = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.adminPendingApprovals();
      setPendingApprovals(response.data || []);
    } catch (err) {
      setError('Failed to load pending approvals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const handleApprove = async (userId, profileId) => {
    setActionLoading(userId);
    try {
      await authAPI.approveOrganizer(userId);
      setPendingApprovals(prev => prev.filter(p => p.user_id !== userId));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to approve organizer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId, profileId) => {
    setActionLoading(userId);
    try {
      await authAPI.rejectOrganizer(userId);
      setPendingApprovals(prev => prev.filter(p => p.user_id !== userId));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reject organizer');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="container"><p>Loading pending approvals...</p></div>;
  }

  return (
    <div className="dashboard-page page-enter">
      <div className="dashboard-header">
        <div className="container">
          <h1>Organizer Approvals</h1>
          <p>Review and approve pending organizer registrations</p>
        </div>
      </div>

      {error && (
        <div className="container alert alert-danger" style={{ marginTop: '20px' }}>{error}</div>
      )}

      <div className="container" style={{ padding: '40px 20px' }}>
        {pendingApprovals.length > 0 ? (
          <div style={{ display: 'grid', gap: '20px' }}>
            {pendingApprovals.map(approval => (
              <div key={approval.profile_id} style={{
                background: 'white', padding: '25px', borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid #f39c12'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={20} color="#e8622c" />
                      {approval.organization_name || approval.username}
                    </h3>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Username:</strong> {approval.username}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>User ID:</strong> {approval.user_id}
                    </p>
                    {approval.government_id && (
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Government ID:</strong>{' '}
                        <a href={approval.government_id} target="_blank" rel="noopener noreferrer"
                           style={{ color: '#e8622c', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <FileText size={14} /> View Document
                        </a>
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                    <button
                      onClick={() => handleApprove(approval.user_id, approval.profile_id)}
                      disabled={actionLoading === approval.user_id}
                      style={{
                        padding: '10px 20px', background: '#2ecc71', color: 'white',
                        border: 'none', borderRadius: '5px', cursor: actionLoading === approval.user_id ? 'not-allowed' : 'pointer',
                        fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px',
                        opacity: actionLoading === approval.user_id ? 0.6 : 1
                      }}
                    >
                      <CheckCircle size={16} />
                      {actionLoading === approval.user_id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(approval.user_id, approval.profile_id)}
                      disabled={actionLoading === approval.user_id}
                      style={{
                        padding: '10px 20px', background: '#e74c3c', color: 'white',
                        border: 'none', borderRadius: '5px', cursor: actionLoading === approval.user_id ? 'not-allowed' : 'pointer',
                        fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px',
                        opacity: actionLoading === approval.user_id ? 0.6 : 1
                      }}
                    >
                      <XCircle size={16} />
                      {actionLoading === approval.user_id ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#999' }}>
            <CheckCircle size={48} color="#2ecc71" style={{ marginBottom: '16px' }} />
            <p style={{ fontSize: '18px', color: '#333', fontWeight: '600' }}>All caught up!</p>
            <p style={{ color: '#999' }}>No pending organizer approvals</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerApprovals;
