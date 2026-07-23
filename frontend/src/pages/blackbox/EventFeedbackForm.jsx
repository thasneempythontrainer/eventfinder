import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventFeedbackAPI, eventAPI } from '../../services/api';
import { Star, CheckCircle, AlertTriangle, Send, ArrowLeft, ThumbsUp, XCircle } from 'lucide-react';
import './BlackBox.css';

export default function EventFeedbackForm() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [positiveChecks, setPositiveChecks] = useState([]);
  const [problemChecks, setProblemChecks] = useState([]);
  const [suggestions, setSuggestions] = useState('');

  const positiveOptions = ['Venue', 'Speaker Quality', 'Activities', 'Organization', 'Networking'];
  const problemOptions = ['Late Start', 'Poor Management', 'Too Crowded', 'High Price', 'Poor Location', 'Technical Issues', 'Other'];

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventAPI.detail(eventId);
        const eventData = response.data?.data || response.data;
        setEvent(eventData);

        if (eventData?.status !== 'COMPLETED') {
          setError('Feedback is only available for completed events.');
        }
      } catch (err) {
        setError('Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    if (!event || event.status !== 'COMPLETED') return;
    const checkFeedback = async () => {
      try {
        const response = await eventFeedbackAPI.myFeedbacks();
        const feedbacks = response.data?.results || response.data || [];
        const alreadyExists = Array.isArray(feedbacks) && feedbacks.some(
          fb => String(fb.event) === String(eventId)
        );
        if (alreadyExists) {
          setAlreadySubmitted(true);
        }
      } catch {
        // ignore check errors
      }
    };
    checkFeedback();
  }, [eventId, event]);

  const handlePositiveToggle = (option) => {
    setPositiveChecks((prev) =>
      prev.includes(option) ? prev.filter((p) => p !== option) : [...prev, option]
    );
  };

  const handleProblemToggle = (option) => {
    setProblemChecks((prev) =>
      prev.includes(option) ? prev.filter((p) => p !== option) : [...prev, option]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }

    setSubmitting(true);
    try {
      await eventFeedbackAPI.create({
        eventId,
        rating,
        positiveFeedback: positiveChecks,
        problems: problemChecks,
        suggestions,
      });
      navigate(`/events/${eventId}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit feedback.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="feedback-form-page page-enter">
        <div className="loading-container">
          <div className="loading-spinner" />
          <span>Loading event...</span>
        </div>
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="feedback-form-page page-enter">
        <div className="feedback-form-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <CheckCircle size={48} color="#22c55e" style={{ marginBottom: 16 }} />
          <h2>Feedback Already Submitted</h2>
          <p style={{ color: '#666', marginTop: 8 }}>You have already submitted feedback for this event.</p>
          <button className="btn-secondary" style={{ marginTop: 24 }} onClick={() => navigate(`/events/${eventId}`)}>
            <ArrowLeft size={16} /> Back to Event
          </button>
        </div>
      </div>
    );
  }

  if (event && event.status !== 'completed') {
    return (
      <div className="feedback-form-page page-enter">
        <div className="feedback-form-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <AlertTriangle size={48} color="#e8622c" style={{ marginBottom: 16 }} />
          <h2>Event Not Completed</h2>
          <p style={{ color: '#666', marginTop: 8 }}>Feedback is only available for completed events.</p>
          <button className="btn-secondary" style={{ marginTop: 24 }} onClick={() => navigate(`/events/${eventId}`)}>
            <ArrowLeft size={16} /> Back to Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-form-page page-enter">
      <div className="feedback-form-card">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <h2><ThumbsUp size={22} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Event Feedback</h2>
        <p className="form-subtitle">
          {event?.title || 'Event'} &mdash; Share your experience
        </p>

        {error && (
          <div className="error-message">
            <XCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Overall Rating</label>
            <div className="rating-selector">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={40}
                  className={`rating-star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                  fill={star <= (hoverRating || rating) ? '#e8622c' : 'none'}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
            </div>
          </div>

          <div className="checkbox-group">
            <h4>What went well?</h4>
            {positiveOptions.map((option) => (
              <label key={option} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={positiveChecks.includes(option)}
                  onChange={() => handlePositiveToggle(option)}
                />
                {option}
              </label>
            ))}
          </div>

          <div className="checkbox-group">
            <h4>Any problems?</h4>
            {problemOptions.map((option) => (
              <label key={option} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={problemChecks.includes(option)}
                  onChange={() => handleProblemToggle(option)}
                />
                {option}
              </label>
            ))}
          </div>

          <div className="form-group">
            <label htmlFor="suggestions">Suggestions</label>
            <textarea
              id="suggestions"
              placeholder="Any suggestions for improvement..."
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {submitting ? (
              <>
                <div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2, marginBottom: 0 }} />
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} /> Submit Feedback
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
