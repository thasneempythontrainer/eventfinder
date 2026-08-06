import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { participantRequestAPI, categoryAPI } from '../../services/api';
import { Users, CalendarDays, MapPin, AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react';
import '../events/Events.css';

const ParticipantRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.list();
      const data = response.data.results || response.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = { status: 'OPEN' };
      if (selectedCategory) params.category = selectedCategory;
      const response = await participantRequestAPI.list(params);
      setRequests(response.data.results || response.data);
    } catch (err) {
      setError('Failed to load participant requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilter = () => setSelectedCategory('');

  return (
    <div className="page-enter" style={{ padding: '40px 0' }}>
      <div className="container">
        <div className="list-header">
          <h1>Open Participant Requests</h1>
          <p>Events looking for participants - express your interest!</p>
        </div>

        {/* Category Filter */}
        <div className="filter-group" style={{ maxWidth: '320px', marginBottom: '24px' }}>
          <label><Filter size={14} /> Filter by Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="loading">Loading requests...</div>
        ) : requests.length > 0 ? (
          <div className="events-grid stagger-children">
            {requests.map(req => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
        ) : (
          <div className="no-events-found">
            <p>No open participant requests in this category</p>
            {selectedCategory && (
              <button onClick={clearFilter} className="reset-button" style={{ marginTop: '15px', display: 'inline-block' }}>
                Show All Categories
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const RequestCard = ({ request }) => {
  const progress = Math.min(
    Math.round((request.current_participants / request.required_participants) * 100),
    100
  );

  return (
    <Link to={`/participant-requests/${request.id}`} className="event-card">
      <div className="event-info">
        <div className="event-category">{request.category_name || 'Event'}</div>
        <h3>{request.event_title}</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>
          {request.description?.substring(0, 120)}
          {request.description?.length > 120 ? '...' : ''}
        </p>
        <div className="event-meta">
          <span><Users size={14} /> {request.current_participants}/{request.required_participants} participants</span>
        </div>
        <div style={{
          background: '#e9ecef', borderRadius: '8px', height: '8px',
          margin: '10px 0', overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`, height: '100%',
            background: progress >= 100 ? '#27ae60' : '#e8622c',
            borderRadius: '8px', transition: 'width 0.3s'
          }} />
        </div>
        <div className="event-footer">
          <span className="price">
            {request.status === 'OPEN' ? (
              <><Clock size={14} /> Open</>
            ) : request.status === 'FULFILLED' ? (
              <><CheckCircle size={14} /> Fulfilled</>
            ) : (
              <><AlertCircle size={14} /> Closed</>
            )}
          </span>
          <span className="rating">{progress}% filled</span>
        </div>
      </div>
    </Link>
  );
};

export default ParticipantRequestList;
