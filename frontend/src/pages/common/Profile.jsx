import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, profileEditAPI } from '../../services/api';
import { User, Mail, Phone, Edit3, Send, Clock, CheckCircle, XCircle, Building2, Shield } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    username: '',
    organization_name: '',
    address: '',
  });

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        username: user.username || '',
        organization_name: user.organizer_profile?.organization_name || '',
        address: user.organizer_profile?.address || '',
      });
    }
    if (!isAdmin) {
      fetchPendingRequests();
    }
  }, [user]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await profileEditAPI.myRequests();
      const data = response.data.results || response.data;
      setPendingRequests(data.filter(r => r.status === 'PENDING'));
    } catch (err) {
      console.error('Failed to load pending requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      if (isAdmin) {
        const data = {};
        if (formData.first_name !== (user.first_name || '')) data.first_name = formData.first_name;
        if (formData.last_name !== (user.last_name || '')) data.last_name = formData.last_name;
        if (formData.phone_number !== (user.phone_number || '')) data.phone_number = formData.phone_number || null;
        if (formData.username !== (user.username || '')) data.username = formData.username;

        if (Object.keys(data).length > 0) {
          const response = await authAPI.updateProfile(data);
          setUser(response.data);
          setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } else {
          setMessage({ type: 'info', text: 'No changes to save.' });
        }
        setEditing(false);
      } else {
        const proposedData = {};
        if (formData.first_name !== (user.first_name || '')) proposedData.first_name = formData.first_name;
        if (formData.last_name !== (user.last_name || '')) proposedData.last_name = formData.last_name;
        if (formData.email !== (user.email || '')) proposedData.email = formData.email;
        if (formData.phone_number !== (user.phone_number || '')) proposedData.phone_number = formData.phone_number || '';
        if (formData.username !== (user.username || '')) proposedData.username = formData.username;
        if (user.role === 'ORGANIZER') {
          if (formData.organization_name !== (user.organizer_profile?.organization_name || '')) {
            proposedData.organization_name = formData.organization_name;
          }
          if (formData.address !== (user.organizer_profile?.address || '')) {
            proposedData.address = formData.address;
          }
        }

        if (Object.keys(proposedData).length === 0) {
          setMessage({ type: 'info', text: 'No changes to submit.' });
          setEditing(false);
          return;
        }

        await profileEditAPI.create({ proposed_data: proposedData });
        setMessage({ type: 'success', text: 'Changes submitted for admin approval!' });
        setEditing(false);
        fetchPendingRequests();
      }
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.proposed_data?.[0] || 'Failed to save changes';
      setMessage({ type: 'error', text: detail });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone_number: user.phone_number || '',
      username: user.username || '',
      organization_name: user.organizer_profile?.organization_name || '',
      address: user.organizer_profile?.address || '',
    });
    setEditing(false);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="dashboard-page page-enter">
      <div className="dashboard-header">
        <div className="container">
          <h1>My Profile</h1>
          <p>{isAdmin ? 'Manage your account settings' : 'View and request profile changes'}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 20px', maxWidth: '800px' }}>
        {message.text && (
          <div className={`profile-alert profile-alert-${message.type}`}>
            {message.type === 'success' && <CheckCircle size={18} />}
            {message.type === 'error' && <XCircle size={18} />}
            {message.type === 'info' && <Clock size={18} />}
            {message.text}
          </div>
        )}

        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-avatar-large">
              {user?.first_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2>{user?.first_name} {user?.last_name}</h2>
              <p className="profile-role-badge">{user?.role}</p>
            </div>
            {!editing && (
              <button className="btn btn-primary" onClick={() => setEditing(true)} style={{ marginLeft: 'auto' }}>
                <Edit3 size={16} /> Edit Profile
              </button>
            )}
          </div>

          <div className="profile-divider" />

          {editing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="profile-form-grid">
                <div className="form-group">
                  <label><User size={14} /> First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label><User size={14} /> Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label><Mail size={14} /> Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isAdmin}
                  />
                  {!isAdmin && <span className="form-hint">Email changes require admin approval</span>}
                </div>
                <div className="form-group">
                  <label><Phone size={14} /> Phone Number</label>
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="form-group">
                  <label><Shield size={14} /> Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={!isAdmin}
                  />
                  {!isAdmin && <span className="form-hint">Username changes require admin approval</span>}
                </div>

                {user?.role === 'ORGANIZER' && (
                  <>
                    <div className="form-group">
                      <label><Building2 size={14} /> Organization Name</label>
                      <input
                        type="text"
                        name="organization_name"
                        value={formData.organization_name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Address</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                      />
                    </div>
                  </>
                )}
              </div>

              {!isAdmin && (
                <div className="profile-notice">
                  <Clock size={16} />
                  <span>Your changes will be sent to an admin for approval before taking effect.</span>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  <Send size={16} />
                  {submitting ? 'Saving...' : isAdmin ? 'Save Changes' : 'Submit for Approval'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="profile-info-row">
                <span className="profile-label"><User size={14} /> First Name</span>
                <span className="profile-value">{user?.first_name || '—'}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-label"><User size={14} /> Last Name</span>
                <span className="profile-value">{user?.last_name || '—'}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-label"><Mail size={14} /> Email</span>
                <span className="profile-value">{user?.email}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-label"><Phone size={14} /> Phone</span>
                <span className="profile-value">{user?.phone_number || '—'}</span>
              </div>
              <div className="profile-info-row">
                <span className="profile-label"><Shield size={14} /> Username</span>
                <span className="profile-value">{user?.username}</span>
              </div>
              {user?.role === 'ORGANIZER' && user?.organizer_profile && (
                <>
                  <div className="profile-info-row">
                    <span className="profile-label"><Building2 size={14} /> Organization</span>
                    <span className="profile-value">{user.organizer_profile.organization_name}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-label">Address</span>
                    <span className="profile-value">{user.organizer_profile.address || '—'}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {!isAdmin && pendingRequests.length > 0 && (
          <div className="profile-card" style={{ marginTop: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#333' }}>
              <Clock size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
              Pending Change Requests ({pendingRequests.length})
            </h3>
            {pendingRequests.map(req => (
              <div key={req.id} className="pending-request">
                <div className="pending-request-info">
                  <p className="pending-request-date">
                    Submitted {new Date(req.created_at).toLocaleDateString()}
                  </p>
                  <div className="pending-request-changes">
                    {Object.entries(req.proposed_data).map(([field, value]) => (
                      <span key={field} className="change-tag">
                        {field}: {typeof value === 'string' ? value.substring(0, 30) : String(value)}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="badge status-pending">Pending</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
