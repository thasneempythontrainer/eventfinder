import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { participantRequestAPI } from '../../services/api';
import { Users, PlusCircle, CalendarDays, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';

const OrganizerParticipantRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await participantRequestAPI.list();
      const data = response.data.results || response.data;
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this participant request?')) return;
    try {
      await participantRequestAPI.delete(id);
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError('Failed to delete request');
    }
  };

  return (
    <div className="page-enter" style={{ padding: '40px 0' }}>
      <div className="container">
        <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>My Participant Requests</h1>
            <p>Manage requests for participants for your events</p>
          </div>
          <Link to="/organizer/create-participant-request" className="nav-button">
            <PlusCircle size={16} /> New Request
          </Link>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="loading">Loading requests...</div>
        ) : requests.length > 0 ? (
          <div className="events-grid stagger-children">
            {requests.map(req => (
              <RequestCard key={req.id} request={req} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="no-events-found">
            <p>No participant requests yet</p>
            <Link to="/organizer/create-participant-request" className="reset-button" style={{ marginTop: '15px', display: 'inline-block' }}>
              Create Your First Request
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const RequestCard = ({ request, onDelete }) => {
  const progress = Math.min(
    Math.round((request.current_participants / request.required_participants) * 100),
    100
  );

  const statusIcon = {
    OPEN: <Clock size={14} />,
    FULFILLED: <CheckCircle size={14} />,
    CLOSED: <AlertCircle size={14} />,
  };

  const statusColor = {
    OPEN: '#e8622c',
    FULFILLED: '#27ae60',
    CLOSED: '#95a5a6',
  };

  return (
    <div className="event-card">
      <div className="event-info">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3>{request.event_title}</h3>
          <button
            onClick={(e) => { e.preventDefault(); onDelete(request.id); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', padding: '4px' }}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
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
          <span className="price" style={{ color: statusColor[request.status] || '#666' }}>
            {statusIcon[request.status]} {request.status}
          </span>
          <span className="rating">{request.response_count} response(s)</span>
        </div>
      </div>
    </div>
  );
};

export default OrganizerParticipantRequests;
