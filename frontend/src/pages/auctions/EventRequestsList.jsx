import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventRequestAPI, categoryAPI } from '../../services/api';
import {
  Search, MapPin, Calendar, DollarSign, Users, MessageSquare,
  ThumbsUp, Plus, TrendingUp, Gavel, Filter
} from 'lucide-react';
import './Auctions.css';

const EventRequestsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.list();
      setCategories(response.data.results || response.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      const response = await eventRequestAPI.list(params);
      setRequests(response.data.results || response.data || []);
    } catch (err) {
      setError('Failed to load event requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleSupport = async (e, requestId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await eventRequestAPI.support(requestId);
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, supports_count: (req.supports_count || 0) + 1, is_supported_by_user: !req.is_supported_by_user }
            : req
        )
      );
    } catch (err) {
      console.error('Failed to toggle support:', err);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatBudget = (min, max) => {
    const minVal = min ? `$${Number(min).toLocaleString()}` : '$0';
    const maxVal = max ? `$${Number(max).toLocaleString()}` : 'Any';
    return `${minVal} - ${maxVal}`;
  };

  return (
    <div className="auctions-page page-enter">
      <div className="auctions-header">
        <div>
          <h1>Event Requests</h1>
          <p>Browse event requests or submit a bid as an organizer</p>
        </div>
        {user && user.role === 'USER' && (
          <Link to="/user/create-request" className="create-btn">
            <Plus size={18} /> Create Request
          </Link>
        )}
      </div>

      <div className="auction-filters">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search event requests..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </form>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="RECEIVING_BIDS">Receiving Bids</option>
          <option value="SELECTED">Selected</option>
          <option value="CONVERTED">Converted</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {error && <div style={{ padding: '0 20px' }}><div className="alert alert-danger">{error}</div></div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>Loading event requests...</div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <TrendingUp size={48} />
          <h3>No event requests found</h3>
          <p>There are no event requests matching your criteria.</p>
          {user && user.role === 'USER' && (
            <Link to="/user/create-request">
              <Plus size={16} /> Create a Request
            </Link>
          )}
        </div>
      ) : (
        <div className="request-grid">
          {requests.map(request => (
            <Link
              key={request.id}
              to={`/event-requests/${request.id}`}
              className="request-card-link"
            >
              <div className="request-card">
                <div className="request-card-header">
                  <h3>{request.title}</h3>
                  <div className="request-card-badges">
                    <span className={`status-badge ${request.status}`}>{request.status?.replace('_', ' ')}</span>
                    {request.demand_level && (
                      <span className={`demand-badge ${request.demand_level}`}>{request.demand_level}</span>
                    )}
                  </div>
                </div>
                <div className="request-card-body">
                  <div className="request-card-meta">
                    {request.user_name && (
                      <span><Users size={14} /> {request.user_name}</span>
                    )}
                    {(request.preferred_location || request.location) && (
                      <span><MapPin size={14} /> {request.preferred_location || request.location}</span>
                    )}
                    {(request.preferred_date || request.event_date) && (
                      <span><Calendar size={14} /> {formatDate(request.preferred_date || request.event_date)}</span>
                    )}
                  </div>
                  <div className="request-card-budget">
                    <DollarSign size={16} />
                    {formatBudget(request.budget_min, request.budget_max)}
                  </div>
                </div>
                <div className="request-card-footer">
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="support-count">
                      <ThumbsUp size={14} /> {request.supports_count || 0}
                    </span>
                    <span className="bid-count">
                      <Gavel size={14} /> {request.bids_count || 0}
                    </span>
                  </div>
                  <button
                    className={`support-btn ${request.is_supported_by_user ? 'active' : ''}`}
                    onClick={(e) => handleSupport(e, request.id)}
                  >
                    <ThumbsUp size={14} fill={request.is_supported_by_user ? 'currentColor' : 'none'} />
                    {request.is_supported_by_user ? 'Supported' : 'Support'}
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventRequestsList;
