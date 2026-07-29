import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { participantRequestAPI, eventAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Users, CalendarDays, AlertCircle, ArrowLeft } from 'lucide-react';

const CreateParticipantRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    event: '',
    description: '',
    required_participants: '',
    deadline: '',
  });

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const response = await eventAPI.myEvents();
      setEvents(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to load events', err);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.event || !formData.description || !formData.required_participants) {
      setError('Please fill in all required fields');
      return;
    }

    const numParticipants = parseInt(formData.required_participants);
    if (isNaN(numParticipants) || numParticipants < 1) {
      setError('Required participants must be a valid number at least 1');
      return;
    }

    setLoading(true);
    try {
      const data = {
        event: formData.event,
        description: formData.description,
        required_participants: numParticipants,
      };
      if (formData.deadline) {
        data.deadline = formData.deadline;
      }
      await participantRequestAPI.create(data);
      setSuccess('Participant request created successfully!');
      setTimeout(() => navigate('/organizer/participant-requests'), 1500);
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'string') {
        setError(data);
      } else if (data?.detail) {
        setError(data.detail);
      } else if (data) {
        const msgs = Object.entries(data)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('; ');
        setError(msgs || 'Failed to create request');
      } else {
        setError('Failed to create request');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ padding: '40px 0' }}>
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button" style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
          color: '#666', marginBottom: '20px', fontSize: '14px'
        }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="form-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '8px' }}>Request Participants</h1>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            Let users know you're looking for participants for your event
          </p>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="create-event-form">
            <div className="form-group">
              <label>Event *</label>
              <select
                name="event"
                value={formData.event}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Select an event</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                rows="4"
                placeholder="Describe what kind of participants you're looking for, requirements, etc."
                required
              />
            </div>

            <div className="form-group">
              <label>Required Participants *</label>
              <input
                type="number"
                name="required_participants"
                value={formData.required_participants}
                onChange={handleChange}
                className="form-control"
                min="1"
                placeholder="Minimum number of participants needed"
                required
              />
            </div>

            <div className="form-group">
              <label>Deadline (optional)</label>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <button
              type="submit"
              className="booking-button"
              disabled={loading}
              style={{ width: '100%', marginTop: '20px' }}
            >
              {loading ? 'Creating...' : 'Create Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateParticipantRequest;
