import { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import { CalendarDays, Users, Ticket, DollarSign, Building2, Clock } from 'lucide-react';
import AnimatedCount from '../../components/common/AnimatedCount';
import '../user/Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.adminDashboard();
      setStats(response.data);
    } catch (err) {
      setError('Failed to load admin stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><p>Loading admin dashboard...</p></div>;
  }

  return (
    <div className="dashboard-page page-enter">
      <div className="dashboard-header">
        <div className="container">
          <h1>Admin Dashboard</h1>
          <p>Platform overview and management</p>
        </div>
      </div>

      {error && <div className="container alert alert-danger" style={{ marginTop: '20px' }}>{error}</div>}

      <div className="container dashboard-content">
        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid">
            <StatCard
              title="Total Events"
              value={stats.total_events || 0}
              icon={<CalendarDays size={22} />}
              color="primary"
            />
            <StatCard
              title="Total Users"
              value={stats.total_users || 0}
              icon={<Users size={22} />}
              color="success"
            />
            <StatCard
              title="Total Bookings"
              value={stats.total_bookings || 0}
              icon={<Ticket size={22} />}
              color="info"
            />
            <StatCard
              title="Platform Revenue"
              value={`₹${(stats.total_revenue || 0).toFixed(2)}`}
              icon={<DollarSign size={22} />}
              color="warning"
            />
            <StatCard
              title="Organizers"
              value={stats.total_organizers || 0}
              icon={<Building2 size={22} />}
              color="primary"
            />
            <StatCard
              title="Pending Approvals"
              value={stats.pending_approvals || 0}
              icon={<Clock size={22} />}
              color="warning"
            />
          </div>
        )}

        {/* Platform Stats */}
        {stats && (
          <section className="dashboard-section">
            <h2>Bookings Breakdown</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <p style={{ margin: '0', fontSize: '13px', color: '#999', textTransform: 'uppercase' }}>
                  Confirmed
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '700', color: '#333' }}>
                  {stats.confirmed_bookings || 0}
                </p>
              </div>
              <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <p style={{ margin: '0', fontSize: '13px', color: '#999', textTransform: 'uppercase' }}>
                  Cancelled
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '700', color: '#333' }}>
                  {stats.cancelled_bookings || 0}
                </p>
              </div>
              <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <p style={{ margin: '0', fontSize: '13px', color: '#999', textTransform: 'uppercase' }}>
                  Total Events
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '700', color: '#333' }}>
                  {stats.total_events || 0}
                </p>
              </div>
              <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <p style={{ margin: '0', fontSize: '13px', color: '#999', textTransform: 'uppercase' }}>
                  Total Experiences
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '700', color: '#333' }}>
                  {stats.total_experiences || 0}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const isNumeric = !isNaN(parseFloat(value)) && value !== null && value !== undefined;
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <p className="stat-value">
          {isNumeric ? <AnimatedCount value={value} /> : value}
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
