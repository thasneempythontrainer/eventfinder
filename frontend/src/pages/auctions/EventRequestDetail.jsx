import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventRequestAPI, eventBidAPI } from '../../services/api';
import {
  ArrowLeft, ThumbsUp, MessageSquare, MapPin, Calendar, Clock,
  Users, DollarSign, Gavel, Send, CheckCircle, XCircle, Building,
  FileText, Award, Lightbulb
} from 'lucide-react';
import './Auctions.css';

const EventRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [bids, setBids] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidLoading, setBidLoading] = useState(false);
  const [bidError, setBidError] = useState('');
  const [selectingBid, setSelectingBid] = useState(null);
  const [closingRequest, setClosingRequest] = useState(false);

  const [bidFormData, setBidFormData] = useState({
    event_plan: '',
    proposed_date: '',
    proposed_time: '',
    venue: '',
    ticket_price: '',
    capacity: '',
    budget_estimation: '',
    benefits_included: '',
    additional_ideas: ''
  });

  useEffect(() => {
    fetchRequestDetail();
  }, [id]);

  useEffect(() => {
    if (request && request.status !== 'OPEN' && request.status !== 'RECEIVING_BIDS') {
      fetchBids();
    }
  }, [id, request?.status]);

  const fetchRequestDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await eventRequestAPI.get(id);
      setRequest(response.data);
      setComments(response.data.comments || []);
    } catch (err) {
      setError('Failed to load event request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const response = await eventBidAPI.forRequest(id);
      setBids(response.data.results || response.data || []);
    } catch (err) {
      console.error('Failed to load bids:', err);
    }
  };

  const handleSupport = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setSupportLoading(true);
      await eventRequestAPI.support(id);
      setRequest(prev => ({
        ...prev,
        supports_count: prev.is_supported_by_user
          ? (prev.supports_count || 1) - 1
          : (prev.supports_count || 0) + 1,
        is_supported_by_user: !prev.is_supported_by_user
      }));
    } catch (err) {
      console.error('Failed to toggle support:', err);
    } finally {
      setSupportLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setCommentLoading(true);
      await eventRequestAPI.addComment(id, { comment: commentText });
      setCommentText('');
      fetchRequestDetail();
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleBidInputChange = (e) => {
    const { name, value } = e.target;
    setBidFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!bidFormData.event_plan.trim()) {
      setBidError('Event plan is required');
      return;
    }
    try {
      setBidLoading(true);
      setBidError('');
      const payload = { request: Number(id) };
      if (bidFormData.event_plan) payload.event_plan = bidFormData.event_plan;
      if (bidFormData.proposed_date) payload.proposed_date = bidFormData.proposed_date;
      if (bidFormData.proposed_time) payload.proposed_time = bidFormData.proposed_time;
      if (bidFormData.venue) payload.venue = bidFormData.venue;
      if (bidFormData.ticket_price) payload.ticket_price = Number(bidFormData.ticket_price);
      if (bidFormData.capacity) payload.capacity = Number(bidFormData.capacity);
      if (bidFormData.budget_estimation) payload.budget_estimation = Number(bidFormData.budget_estimation);
      if (bidFormData.benefits_included) payload.benefits_included = bidFormData.benefits_included;
      if (bidFormData.additional_ideas) payload.additional_ideas = bidFormData.additional_ideas;
      await eventBidAPI.create(payload);
      setBidFormData({
        event_plan: '', proposed_date: '', proposed_time: '', venue: '',
        ticket_price: '', capacity: '', budget_estimation: '',
        benefits_included: '', additional_ideas: ''
      });
      setShowBidForm(false);
      fetchRequestDetail();
      if (request.status === 'OPEN') {
        setRequest(prev => ({ ...prev, status: 'RECEIVING_BIDS' }));
      }
    } catch (err) {
      setBidError(err.response?.data?.detail || 'Failed to submit bid');
      console.error(err);
    } finally {
      setBidLoading(false);
    }
  };

  const handleSelectBid = async (bidId) => {
    if (!confirm('Are you sure you want to select this bid?')) return;
    try {
      setSelectingBid(bidId);
      await eventRequestAPI.selectBid(id, bidId);
      setRequest(prev => ({ ...prev, status: 'SELECTED', selected_bid: bidId }));
      fetchBids();
    } catch (err) {
      console.error('Failed to select bid:', err);
    } finally {
      setSelectingBid(null);
    }
  };

  const handleCloseRequest = async () => {
    if (!confirm('Are you sure you want to close this request?')) return;
    try {
      setClosingRequest(true);
      await eventRequestAPI.closeRequest(id);
      setRequest(prev => ({ ...prev, status: 'CLOSED' }));
    } catch (err) {
      console.error('Failed to close request:', err);
    } finally {
      setClosingRequest(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatBudget = (min, max) => {
    const minVal = min ? `$${Number(min).toLocaleString()}` : '$0';
    const maxVal = max ? `$${Number(max).toLocaleString()}` : 'Any';
    return `${minVal} - ${maxVal}`;
  };

  const isCreator = user && request && (user.id === request.user || user.id === request.user_id);
  const isOrganizer = user && user.role === 'ORGANIZER';
  const canBid = isOrganizer && request && (request.status === 'OPEN' || request.status === 'RECEIVING_BIDS');

  if (loading) {
    return (
      <div className="auctions-page page-enter" style={{ textAlign: 'center', padding: '80px 20px', color: '#666' }}>
        Loading event request...
      </div>
    );
  }

  if (!request) {
    return (
      <div className="auctions-page page-enter" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2 style={{ color: '#1a1a1a' }}>Event request not found</h2>
        <Link to="/event-requests" style={{ color: '#e8622c', textDecoration: 'none', fontWeight: 600 }}>
          Back to Event Requests
        </Link>
      </div>
    );
  }

  return (
    <div className="request-detail-page page-enter">
      <div className="detail-header">
        <div className="detail-header-top">
          <div>
            <button onClick={() => navigate('/event-requests')} className="back-link">
              <ArrowLeft size={18} /> Back to Event Requests
            </button>
            <h1>{request.title}</h1>
            <div className="detail-header-badges">
              <span className={`status-badge ${request.status}`}>{request.status?.replace('_', ' ')}</span>
              {request.demand_level && (
                <span className={`demand-badge ${request.demand_level}`}>{request.demand_level}</span>
              )}
            </div>
          </div>
          <div className="detail-header-actions">
            <button
              onClick={handleSupport}
              disabled={supportLoading}
              className={`support-btn ${request.is_supported_by_user ? 'active' : ''}`}
            >
              <ThumbsUp size={16} fill={request.is_supported_by_user ? 'currentColor' : 'none'} />
              {request.supports_count || 0}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0 20px', maxWidth: '900px', margin: '20px auto 0' }}>
          <div className="alert alert-danger">{error}</div>
        </div>
      )}

      <div className="detail-info-grid">
        <div className="detail-info-item">
          <MapPin size={20} />
          <div>
            <div className="label">Location</div>
            <div className="value">{request.preferred_location || request.location || 'TBD'}</div>
          </div>
        </div>
        <div className="detail-info-item">
          <Calendar size={20} />
          <div>
            <div className="label">Preferred Date</div>
            <div className="value">{formatDate(request.preferred_date || request.event_date)}</div>
          </div>
        </div>
        <div className="detail-info-item">
          <Clock size={20} />
          <div>
            <div className="label">Preferred Time</div>
            <div className="value">{request.preferred_time || 'TBD'}</div>
          </div>
        </div>
        <div className="detail-info-item">
          <Users size={20} />
          <div>
            <div className="label">Expected Attendees</div>
            <div className="value">{request.expected_attendees ? Number(request.expected_attendees).toLocaleString() : 'TBD'}</div>
          </div>
        </div>
        <div className="detail-info-item">
          <DollarSign size={20} />
          <div>
            <div className="label">Budget Range</div>
            <div className="value">{formatBudget(request.budget_min, request.budget_max)}</div>
          </div>
        </div>
        <div className="detail-info-item">
          <Gavel size={20} />
          <div>
            <div className="label">Bids Received</div>
            <div className="value">{bids.length || request.bids_count || 0}</div>
          </div>
        </div>
      </div>

      <div className="detail-description">
        <h2>Description</h2>
        <p>{request.description}</p>
      </div>

      {request.additional_requirements && (
        <div className="detail-description">
          <h2>Additional Requirements</h2>
          <p>{request.additional_requirements}</p>
        </div>
      )}

      <div className="detail-actions">
        {isCreator && request.status !== 'CLOSED' && request.status !== 'CONVERTED' && (
          <button
            onClick={handleCloseRequest}
            className="btn-danger"
            disabled={closingRequest}
          >
            <XCircle size={16} />
            {closingRequest ? 'Closing...' : 'Close Request'}
          </button>
        )}
      </div>

      {canBid && (
        <div className="bids-section">
          {!showBidForm ? (
            <button
              onClick={() => setShowBidForm(true)}
              className="btn-primary"
              style={{ marginBottom: '20px' }}
            >
              <Gavel size={16} /> Submit a Bid
            </button>
          ) : (
            <div className="bid-form">
              <h2>Submit Your Bid</h2>
              {bidError && <div className="alert alert-danger">{bidError}</div>}
              <form onSubmit={handleBidSubmit}>
                <div className="form-group">
                  <label htmlFor="event_plan">
                    <FileText size={14} /> Event Plan *
                  </label>
                  <textarea
                    id="event_plan"
                    name="event_plan"
                    value={bidFormData.event_plan}
                    onChange={handleBidInputChange}
                    placeholder="Describe how you would organize this event..."
                    rows="4"
                    disabled={bidLoading}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="proposed_date">
                      <Calendar size={14} /> Proposed Date
                    </label>
                    <input
                      type="date"
                      id="proposed_date"
                      name="proposed_date"
                      value={bidFormData.proposed_date}
                      onChange={handleBidInputChange}
                      disabled={bidLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="proposed_time">
                      <Clock size={14} /> Proposed Time
                    </label>
                    <input
                      type="time"
                      id="proposed_time"
                      name="proposed_time"
                      value={bidFormData.proposed_time}
                      onChange={handleBidInputChange}
                      disabled={bidLoading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="venue">
                    <Building size={14} /> Venue
                  </label>
                  <input
                    type="text"
                    id="venue"
                    name="venue"
                    value={bidFormData.venue}
                    onChange={handleBidInputChange}
                    placeholder="Proposed venue"
                    disabled={bidLoading}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ticket_price">
                      <DollarSign size={14} /> Ticket Price ($)
                    </label>
                    <input
                      type="number"
                      id="ticket_price"
                      name="ticket_price"
                      value={bidFormData.ticket_price}
                      onChange={handleBidInputChange}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      disabled={bidLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="capacity">
                      <Users size={14} /> Capacity
                    </label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      value={bidFormData.capacity}
                      onChange={handleBidInputChange}
                      placeholder="0"
                      min="1"
                      disabled={bidLoading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="budget_estimation">
                    <DollarSign size={14} /> Budget Estimation ($)
                  </label>
                  <input
                    type="number"
                    id="budget_estimation"
                    name="budget_estimation"
                    value={bidFormData.budget_estimation}
                    onChange={handleBidInputChange}
                    placeholder="Total estimated cost"
                    min="0"
                    step="0.01"
                    disabled={bidLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="benefits_included">
                    <Award size={14} /> Benefits Included
                  </label>
                  <textarea
                    id="benefits_included"
                    name="benefits_included"
                    value={bidFormData.benefits_included}
                    onChange={handleBidInputChange}
                    placeholder="What benefits are included in your proposal..."
                    rows="3"
                    disabled={bidLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="additional_ideas">
                    <Lightbulb size={14} /> Additional Ideas
                  </label>
                  <textarea
                    id="additional_ideas"
                    name="additional_ideas"
                    value={bidFormData.additional_ideas}
                    onChange={handleBidInputChange}
                    placeholder="Any creative ideas or suggestions..."
                    rows="3"
                    disabled={bidLoading}
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowBidForm(false)}
                    className="btn-secondary"
                    disabled={bidLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={bidLoading}
                  >
                    {bidLoading ? 'Submitting...' : <><Send size={16} /> Submit Bid</>}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {bids.length > 0 && (
        <div className="bids-section" style={{ marginTop: '30px' }}>
          <h2 className="section-title">
            <Gavel size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Bids ({bids.length})
          </h2>
          {bids.map(bid => (
            <div
              key={bid.id}
              className={`bid-card ${request.selected_bid === bid.id ? 'selected-bid' : ''}`}
            >
              <div className="bid-organizer">
                <div className="bid-organizer-avatar">
                  {bid.organizer_profile_picture ? (
                    <img src={bid.organizer_profile_picture} alt="" />
                  ) : (
                    (bid.organizer_name || bid.organizer_username || 'O')[0].toUpperCase()
                  )}
                </div>
                <div className="bid-organizer-info">
                  <h4>{bid.organizer_name || bid.organizer_username || 'Organizer'}</h4>
                  <p>{bid.organizer_company || ''}</p>
                </div>
                {request.selected_bid === bid.id && (
                  <span className="status-badge SELECTED" style={{ marginLeft: 'auto' }}>
                    <CheckCircle size={12} /> Selected
                  </span>
                )}
              </div>

              <div className="bid-details">
                {bid.ticket_price != null && (
                  <div className="bid-detail-item">
                    <DollarSign size={16} />
                    <div>
                      <div className="detail-label">Ticket Price</div>
                      <div className="detail-value">${Number(bid.ticket_price).toLocaleString()}</div>
                    </div>
                  </div>
                )}
                {bid.capacity != null && (
                  <div className="bid-detail-item">
                    <Users size={16} />
                    <div>
                      <div className="detail-label">Capacity</div>
                      <div className="detail-value">{Number(bid.capacity).toLocaleString()}</div>
                    </div>
                  </div>
                )}
                {bid.budget_estimation != null && (
                  <div className="bid-detail-item">
                    <DollarSign size={16} />
                    <div>
                      <div className="detail-label">Total Budget</div>
                      <div className="detail-value">${Number(bid.budget_estimation).toLocaleString()}</div>
                    </div>
                  </div>
                )}
                {bid.proposed_date && (
                  <div className="bid-detail-item">
                    <Calendar size={16} />
                    <div>
                      <div className="detail-label">Proposed Date</div>
                      <div className="detail-value">{formatDate(bid.proposed_date)}</div>
                    </div>
                  </div>
                )}
                {bid.proposed_time && (
                  <div className="bid-detail-item">
                    <Clock size={16} />
                    <div>
                      <div className="detail-label">Proposed Time</div>
                      <div className="detail-value">{bid.proposed_time}</div>
                    </div>
                  </div>
                )}
                {bid.venue && (
                  <div className="bid-detail-item">
                    <Building size={16} />
                    <div>
                      <div className="detail-label">Venue</div>
                      <div className="detail-value">{bid.venue}</div>
                    </div>
                  </div>
                )}
              </div>

              {bid.event_plan && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Event Plan
                  </div>
                  <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.5, margin: 0 }}>{bid.event_plan}</p>
                </div>
              )}

              {bid.benefits_included && (
                <div className="bid-benefits">
                  <h4>Benefits Included</h4>
                  <p>{bid.benefits_included}</p>
                </div>
              )}

              {bid.additional_ideas && (
                <div className="bid-benefits">
                  <h4>Additional Ideas</h4>
                  <p>{bid.additional_ideas}</p>
                </div>
              )}

              {isCreator && request.status === 'SELECTED' && request.selected_bid !== bid.id && (
                <div className="bid-actions">
                  <button
                    onClick={() => handleSelectBid(bid.id)}
                    className="btn-primary"
                    disabled={selectingBid === bid.id}
                  >
                    <CheckCircle size={14} />
                    {selectingBid === bid.id ? 'Selecting...' : 'Select This Bid'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="detail-section-card" style={{ marginTop: '30px' }}>
        <h2>
          <MessageSquare size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Comments ({comments.length})
        </h2>
        <div className="detail-comments">
          {comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment.id} className="comment-item">
                <div className="comment-avatar">
                  {comment.user_profile_picture ? (
                    <img src={comment.user_profile_picture} alt="" />
                  ) : (
                    (comment.user_username || comment.user_name || 'U')[0].toUpperCase()
                  )}
                </div>
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">{comment.user_username || comment.user_name || 'User'}</span>
                    <span className="comment-date">
                      {comment.created_at
                        ? new Date(comment.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })
                        : ''}
                    </span>
                  </div>
                  <p className="comment-text">{comment.comment || comment.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
        <form onSubmit={handleComment} className="comment-form">
          <input
            type="text"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={commentLoading}
          />
          <button type="submit" disabled={commentLoading || !commentText.trim()}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventRequestDetail;
