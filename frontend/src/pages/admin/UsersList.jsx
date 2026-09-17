import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminUserAPI } from '../../services/api';
import { Users, User, Search, Building2, Eye, Filter } from 'lucide-react';
import '../user/Dashboard.css';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async (searchQuery) => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (searchQuery) params.search = searchQuery;
      const response = await adminUserAPI.list(params);
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleToggleActive = async (userId) => {
    setActionLoading(userId);
    try {
      const response = await adminUserAPI.toggleActive(userId);
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, is_active: response.data.is_active } : u
      ));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update user');
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ORGANIZER': return <Building2 size={16} />;
      case 'ADMIN': return <Users size={16} />;
      default: return <User size={16} />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ORGANIZER': return '#e8622c';
      case 'ADMIN': return '#8e44ad';
      default: return '#3498db';
    }
  };

  return (
    <div className="dashboard-page page-enter">
      <div className="dashboard-header">
        <div className="container">
          <h1>Users & Organizers</h1>
          <p>Manage all registered users and organizers</p>
        </div>
      </div>

      {error && (
        <div className="container" style={{ padding: '20px 0' }}>
          <div style={{ padding: '12px 16px', background: '#fce4ec', color: '#c62828', borderRadius: '8px', border: '1px solid #ef9a9a' }}>
            {error}
          </div>
        </div>
      )}

      <div className="container" style={{ padding: '40px 20px' }}>
        <div className="users-toolbar">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by name, username, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
              Search
            </button>
          </form>
          <div className="filter-group">
            <Filter size={16} />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              <option value="USER">Users</option>
              <option value="ORGANIZER">Organizers</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>

        <div className="users-count">
          Showing {users.length} user{users.length !== 1 ? 's' : ''}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>Loading...</div>
        ) : users.length > 0 ? (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-cell-avatar" style={{ background: getRoleColor(u.role) }}>
                          {u.first_name?.charAt(0)?.toUpperCase() || u.username?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div className="user-cell-name">
                            {u.first_name} {u.last_name}
                            {u.pending_edit_requests?.length > 0 && (
                              <span className="pending-badge" title={`${u.pending_edit_requests.length} pending change request(s)`}>
                                {u.pending_edit_requests.length}
                              </span>
                            )}
                          </div>
                          <div className="user-cell-username">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="role-badge" style={{ background: getRoleColor(u.role) + '15', color: getRoleColor(u.role) }}>
                        {getRoleIcon(u.role)} {u.role}
                      </span>
                    </td>
                    <td className="text-muted">{u.email}</td>
                    <td className="text-muted">{u.phone_number || '—'}</td>
                    <td className="text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      {u.role === 'ORGANIZER' ? (
                        <span className={`badge status-${(u.organizer_profile?.approval_status || 'PENDING').toLowerCase()}`}>
                          {u.organizer_profile?.approval_status || 'PENDING'}
                        </span>
                      ) : (
                        <>
                          <span className={`status-dot ${u.is_active ? 'active' : 'inactive'}`} />
                          {u.is_active ? 'Active' : 'Inactive'}
                        </>
                      )}
                    </td>
                    <td>
                      {u.role === 'USER' && (
                        <span className="detail-chip">{u.total_bookings || 0} bookings</span>
                      )}
                      {u.role === 'ORGANIZER' && (
                        <span className="detail-chip">{u.total_events || 0} events</span>
                      )}
                      {u.role === 'ADMIN' && '—'}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/admin/users/${u.id}`} className="action-btn view" title="View Details">
                          <Eye size={14} />
                        </Link>
                        {u.role !== 'ADMIN' && (
                          <label
                            className="toggle-switch"
                            title={u.is_active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                          >
                            <input
                              type="checkbox"
                              checked={u.is_active}
                              onChange={() => handleToggleActive(u.id)}
                              disabled={actionLoading === u.id}
                            />
                            <span className="toggle-slider" />
                          </label>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#999' }}>
            <Users size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p style={{ fontSize: '18px', color: '#333', fontWeight: '600' }}>No users found</p>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersList;
