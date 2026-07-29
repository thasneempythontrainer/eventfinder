import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { participantRequestAPI, participantResponseAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users, CalendarDays, ArrowLeft, Send, CheckCircle,
  Clock, AlertCircle, User, MessageCircle
} from 'lucide-react';

const ParticipantRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [request, setRequest] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);

  useEffect(() => {
    fetchRequestDetail();
  }, [id]);

  const fetchRequestDetail = async () => {
    try {
      setLoading(true);
      const res = await participantRequestAPI.get(id);
      setRequest(res.data);

      const respRes = await participantResponseAPI.list({ participant_request: id });
      const respData = respRes.data.results || respRes.data;
      const responsesList = Array.isArray(respData) ? respData : [];
      setResponses(responsesList);
      setHasResponded(responsesList.some(r => r.user === user?.id));
    } catch (err) {
      setError('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'USER') {
      setError('Only regular users can respond to participant requests');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await participantResponseAPI.create({
        participant_request: parseInt(id),
        message: message,
      });
      setMessage('');
      fetchRequestDetail();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to respond');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '40px 0' }}><p>Loading...</p></div>;

  if (!request) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <p>Request not found</p>
        <button onClick={() => navigate(-1)} className="reset-button">Go Back</button>
      </div>
    );
  }

  const progress = Math.min(
    Math.round((request.current_participants / request.required_participants) * 100),
    100
  );

  const isOrganizer = user?.id === request.organizer;

  return (
    <div className="event-detail-page page-enter">
      <div className="container" style={{ padding: '40px 0' }}>
        <button onClick={() => navigate(-1)} className="back-button" style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
          color: '#666', marginBottom: '20px', fontSize: '14px'
        }}>
          <ArrowLeft size={16} /> Back
        </button>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="event-detail-content">
          <div className="event-detail-main">
            <h1>{request.event_title}</h1>

            <div className="event-details" style={{ marginTop: '20px' }}>
              <div className="detail-section">
                <h3><Users size={18} /> Participants Needed</h3>
                <p>{request.current_participants} / {request.required_participants} filled</p>
                <div style={{
                  background: '#e9ecef', borderRadius: '8px', height: '12px',
                  margin: '10px 0', overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progress}%`, height: '100%',
                    background: progress >= 100 ? '#27ae60' : '#e8622c',
                    borderRadius: '8px', transition: 'width 0.3s'
                  }} />
                </div>
                <p style={{ fontSize: '13px', color: '#666' }}>
                  {progress >= 100
                    ? 'Target reached!'
                    : `${progress}% filled - ${request.required_participants - request.current_participants} more needed`
                  }
                </p>
              </div>

              <div className="detail-section">
                <h3>Description</h3>
                <p>{request.description}</p>
              </div>

              <div className="detail-section">
                <h3>Status</h3>
                <p style={{
                  color: request.status === 'OPEN' ? '#e8622c'
                    : request.status === 'FULFILLED' ? '#27ae60' : '#95a5a6'
                }}>
                  {request.status === 'OPEN' && <><Clock size={14} /> Open for responses</>}
                  {request.status === 'FULFILLED' && <><CheckCircle size={14} /> Fulfilled</>}
                  {request.status === 'CLOSED' && <><AlertCircle size={14} /> Closed</>}
                </p>
              </div>

              {request.deadline && (
                <div className="detail-section">
                  <h3><CalendarDays size={18} /> Deadline</h3>
                  <p>{new Date(request.deadline).toLocaleString()}</p>
                </div>
              )}

              <div className="detail-section">
                <h3>Organizer</h3>
                <p>{request.organizer_name}</p>
              </div>
            </div>

            {request.status === 'OPEN' && !isOrganizer && (
              <div className="booking-card" style={{ marginTop: '30px', padding: '20px' }}>
                {isAuthenticated ? (
                  hasResponded ? (
                    <div style={{ textAlign: 'center', color: '#27ae60' }}>
                      <CheckCircle size={24} />
                      <p style={{ marginTop: '10px' }}>You've already responded to this request!</p>
                    </div>
                  ) : (
                    <>
                      <h3 style={{ marginBottom: '15px' }}>Express Interest</h3>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell the organizer why you're interested (optional)..."
                        className="form-control"
                        rows="3"
                        style={{ marginBottom: '15px', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                      />
                      <button
                        onClick={handleRespond}
                        className="booking-button"
                        disabled={submitting}
                        style={{ width: '100%' }}
                      >
                        {submitting ? 'Submitting...' : <><Send size={16} /> I'm Interested</>}
                      </button>
                    </>
                  )
                ) : (
                  <p style={{ textAlign: 'center' }}>
                    <a href="/login" style={{ color: '#e8622c' }}>Login</a> to respond to this request
                  </p>
                )}
              </div>
            )}
          </div>

          <aside className="event-detail-sidebar">
            <div className="booking-card">
              <h3 style={{ marginBottom: '15px' }}>
                <MessageCircle size={16} /> Responses ({responses.length})
              </h3>
              {responses.length > 0 ? (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {responses.map(resp => (
                    <div key={resp.id} style={{
                      padding: '12px', borderBottom: '1px solid #eee',
                      display: 'flex', gap: '10px', alignItems: 'flex-start'
                    }}>
                      <div className="user-avatar" style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: '#e8622c', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', flexShrink: 0
                      }}>
                        {resp.user_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '14px' }}>{resp.user_name}</p>
                        {resp.message && <p style={{ fontSize: '13px', color: '#666' }}>{resp.message}</p>}
                        <p style={{ fontSize: '11px', color: '#999' }}>
                          {new Date(resp.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#999', fontSize: '14px', textAlign: 'center' }}>No responses yet</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ParticipantRequestDetail;
