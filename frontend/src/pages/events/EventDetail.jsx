import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI, bookingAPI, experienceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Chat from '../../components/chat/Chat';
import {
  CalendarDays, MapPin, DollarSign, FileText, Star, AlertTriangle,
  Ticket, ThumbsUp, Heart, Ban, Minus, Plus, MessageCircle, Send, Image, X
} from 'lucide-react';
import './Events.css';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [expandedComments, setExpandedComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [expFormData, setExpFormData] = useState({ title: '', description: '', rating: 5, images: [] });
  const [expImagePreview, setExpImagePreview] = useState([]);
  const [expSubmitting, setExpSubmitting] = useState(false);
  const [showExpForm, setShowExpForm] = useState(false);

  useEffect(() => {
    fetchEventDetail();
    if (id) {
      fetchEventExperiences();
    }
  }, [id]);

  const fetchEventDetail = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.detail(id);
      setEvent(response.data);
    } catch (err) {
      setError('Failed to load event details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventExperiences = async () => {
    try {
      const response = await experienceAPI.getForEvent(id);
      setExperiences(response.data.results || response.data);
    } catch (err) {
      console.error('Failed to load experiences:', err);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'USER') {
      setError('Only regular users can book events');
      return;
    }

    const totalAmount = event.ticket_price * tickets;

    if (totalAmount === 0) {
      setBookingLoading(true);
      try {
        const response = await bookingAPI.create({
          event: event.id,
          number_of_tickets: tickets,
          total_price: 0,
        });
        navigate('/payment/success', {
          state: {
            booking_reference: response.data.booking_reference,
            razorpay_payment_id: 'FREE_EVENT',
            razorpay_order_id: 'FREE_EVENT',
          },
        });
      } catch (err) {
        setError(err.response?.data?.detail || 'Booking failed');
      } finally {
        setBookingLoading(false);
      }
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      const orderResponse = await bookingAPI.createOrder({
        event: event.id,
        number_of_tickets: tickets,
      });

      const orderData = orderResponse.data;

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway. Please try again.');
        setBookingLoading(false);
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'EventFinder',
        description: `Booking for ${orderData.event_title}`,
        order_id: orderData.order_id,
        prefill: {
          name: orderData.user_name,
          email: orderData.user_email,
          contact: orderData.user_phone || '',
        },
        theme: {
          color: '#e8622c',
        },
        handler: async function (response) {
          try {
            const verifyResponse = await bookingAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking_reference: orderData.booking_reference,
            });

            navigate('/payment/success', {
              state: {
                booking_reference: verifyResponse.data.booking_reference,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
              },
            });
          } catch (err) {
            navigate('/payment/failed', {
              state: {
                error_message: err.response?.data?.detail || 'Payment verification failed. Please contact support.',
                event_id: event.id,
                event_title: event.title,
              },
            });
          } finally {
            setBookingLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setBookingLoading(false);
            navigate('/payment/failed', {
              state: {
                error_message: 'Payment was cancelled by you.',
                event_id: event.id,
                event_title: event.title,
              },
            });
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        navigate('/payment/failed', {
          state: {
            error_message: response.error?.description || 'Payment failed. Please try again.',
            event_id: event.id,
            event_title: event.title,
          },
        });
        setBookingLoading(false);
      });
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create payment order');
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><p>Loading event details...</p></div>;
  }

  if (!event) {
    return (
      <div className="container">
        <p>Event not found</p>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleLikeExperience = async (expId) => {
    try {
      const exp = experiences.find(e => e.id === expId);
      if (exp?.is_liked_by_user) {
        await experienceAPI.unlike(expId);
        setExperiences(prev => prev.map(e =>
          e.id === expId ? { ...e, likes_count: Math.max(0, e.likes_count - 1), is_liked_by_user: false } : e
        ));
      } else {
        await experienceAPI.like(expId);
        setExperiences(prev => prev.map(e =>
          e.id === expId ? { ...e, likes_count: e.likes_count + 1, is_liked_by_user: true } : e
        ));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentExperience = async (expId) => {
    const text = commentText[expId];
    if (!text?.trim()) return;
    try {
      await experienceAPI.addComment(expId, { comment: text });
      setCommentText(prev => ({ ...prev, [expId]: '' }));
      fetchEventExperiences();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComments = (expId) => {
    setExpandedComments(prev => ({ ...prev, [expId]: !prev[expId] }));
  };

  const handleExpImageChange = (e) => {
    const files = Array.from(e.target.files);
    setExpFormData(prev => ({ ...prev, images: files }));
    setExpImagePreview(files.map(f => URL.createObjectURL(f)));
  };

  const removeExpImage = (index) => {
    setExpFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    setExpImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleExpSubmit = async (e) => {
    e.preventDefault();
    if (!expFormData.title.trim()) return;
    setExpSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('event', id);
      fd.append('title', expFormData.title);
      fd.append('description', expFormData.description);
      fd.append('rating', expFormData.rating);
      expFormData.images.forEach(img => fd.append('images', img));
      await experienceAPI.create(fd);
      setExpFormData({ title: '', description: '', rating: 5, images: [] });
      setExpImagePreview([]);
      setShowExpForm(false);
      fetchEventExperiences();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to post experience');
    } finally {
      setExpSubmitting(false);
    }
  };

  const availableSeats = event.available_seats || 0;
  const maxTickets = Math.min(10, availableSeats);

  return (
    <div className="event-detail-page page-enter">
      {/* Hero Section with Image */}
      <div className="event-detail-hero">
        {event.banner ? (
          <img src={event.banner} alt={event.title} className="hero-image" />
        ) : (event.gallery || event.images || []).length > 0 ? (
          <img src={(event.gallery || event.images)[0].image} alt={event.title} className="hero-image" />
        ) : (
          <div className="hero-image-placeholder">No Image</div>
        )}
        <div className="hero-overlay">
          <div className="container">
            <h1>{event.title}</h1>
            <div className="event-status">
              <span className={`status ${event.status.toLowerCase()}`}>{event.status}</span>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="container alert alert-danger" style={{ marginTop: '20px' }}>{error}</div>}

      <div className="container event-detail-content">
        <div className="event-detail-main">
          {/* Tabs */}
          <div className="tabs">
            <button 
              className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button 
              className={`tab-button ${activeTab === 'gallery' ? 'active' : ''}`}
              onClick={() => setActiveTab('gallery')}
            >
              Gallery ({(event.gallery || event.images || []).length})
            </button>
            <button 
              className={`tab-button ${activeTab === 'experiences' ? 'active' : ''}`}
              onClick={() => setActiveTab('experiences')}
            >
              Experiences ({experiences.length})
            </button>
            <button 
              className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
          </div>

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="tab-content">
              <div className="event-details">
                <h2>Event Details</h2>

                <div className="detail-section">
                  <h3><CalendarDays size={18} /> Date & Time</h3>
                  <p><strong>Start:</strong> {formatDate(event.start_date)}</p>
                  <p><strong>End:</strong> {formatDate(event.end_date)}</p>
                  <p><strong>Duration:</strong> {Math.ceil((new Date(event.end_date) - new Date(event.start_date)) / (1000 * 60 * 60))} hours</p>
                </div>

                <div className="detail-section">
                  <h3><MapPin size={18} /> Location</h3>
                  <p><strong>City:</strong> {event.city}</p>
                  <p><strong>Address:</strong> {event.venue || 'TBD'}</p>
                </div>

                <div className="detail-section">
                  <h3><DollarSign size={18} /> Pricing</h3>
                  <p><strong>Ticket Price:</strong> ₹{event.ticket_price}</p>
                  <p><strong>Available Seats:</strong> {availableSeats}</p>
                  {availableSeats === 0 && (
                    <p style={{ color: '#e74c3c' }}><AlertTriangle size={14} /> Event is SOLD OUT</p>
                  )}
                </div>

                <div className="detail-section">
                  <h3><FileText size={18} /> Description</h3>
                  <p>{event.description}</p>
                </div>

                {event.category_name && (
                  <div className="detail-section">
                    <h3>Category</h3>
                    <p>{event.category_name}</p>
                  </div>
                )}

                {event.average_rating && (
                  <div className="detail-section">
                    <h3><Star size={18} /> Rating</h3>
                    <p>
                      {event.average_rating.toFixed(1)} out of 5
                      <span style={{ marginLeft: '10px' }}>({event.experiences_count || 0} reviews)</span>
                    </p>
                  </div>
                )}

                <div className="detail-section">
                  <h3>Organizer</h3>
                  <p>
                    <strong>{event.organizer_first_name} {event.organizer_last_name}</strong>
                    {event.organizer_name && (
                      <span style={{ marginLeft: '8px', color: '#666', fontSize: '14px' }}>
                        ({event.organizer_name})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="tab-content">
              <h2>Event Gallery</h2>
              {(event.gallery || event.images || []).length > 0 ? (
                <div className="event-gallery">
                  {(event.gallery || event.images || []).map(image => (
                    <div key={image.id} className="gallery-item">
                      <img src={image.image} alt="Event" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-content">No images available for this event</p>
              )}
            </div>
          )}

          {/* Experiences Tab */}
          {activeTab === 'experiences' && (
            <div className="tab-content">
              <div className="exp-feed-container">
                <div className="exp-feed-header">
                  <h3>Event Experiences</h3>
                  <span className="exp-count">{experiences.length}</span>
                </div>

                <div className="exp-feed-body">
                  {experiences.length > 0 ? (
                    experiences.map(exp => (
                      <article key={exp.id} className="exp-feed-item">
                        <div className="exp-item-left">
                          <div className="exp-avatar">
                            {exp.user_profile_picture ? (
                              <img src={exp.user_profile_picture} alt="" />
                            ) : (
                              <span>{(exp.user_username || 'U')[0].toUpperCase()}</span>
                            )}
                          </div>
                        </div>
                        <div className="exp-item-right">
                          <div className="exp-item-header">
                            <strong className="exp-author">{exp.user_username}</strong>
                            <span className="exp-time">{formatRelativeDate(exp.created_at)}</span>
                          </div>
                          <h4 className="exp-item-title">{exp.title}</h4>
                          {exp.description && <p className="exp-item-text">{exp.description}</p>}
                          <div className="exp-item-rating">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={13} fill={i < exp.rating ? '#f39c12' : 'none'}
                                    color={i < exp.rating ? '#f39c12' : '#ccc'} />
                            ))}
                          </div>
                          {exp.images && exp.images.length > 0 && (
                            <div className={`exp-item-images count-${Math.min(exp.images.length, 3)}`}>
                              {exp.images.slice(0, 3).map((img, i) => (
                                <div key={img.id} className="exp-img-cell">
                                  <img src={img.image} alt="" />
                                  {i === 2 && exp.images.length > 3 && (
                                    <div className="exp-img-more">+{exp.images.length - 3}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="exp-item-actions">
                            <button
                              className={`exp-act-btn ${exp.is_liked_by_user ? 'liked' : ''}`}
                              onClick={() => handleLikeExperience(exp.id)}
                            >
                              <ThumbsUp size={14} fill={exp.is_liked_by_user ? 'currentColor' : 'none'} />
                              {exp.likes_count > 0 && <span>{exp.likes_count}</span>}
                            </button>
                            <button className="exp-act-btn" onClick={() => toggleComments(exp.id)}>
                              <MessageCircle size={14} />
                              {exp.comments?.length > 0 && <span>{exp.comments.length}</span>}
                            </button>
                          </div>
                          {expandedComments[exp.id] && (
                            <div className="exp-comments">
                              {exp.comments?.map(c => (
                                <div key={c.id} className="exp-comment-row">
                                  <div className="exp-comment-avatar">
                                    {c.user_profile_picture ? (
                                      <img src={c.user_profile_picture} alt="" />
                                    ) : (
                                      <span>{(c.user_username || 'U')[0].toUpperCase()}</span>
                                    )}
                                  </div>
                                  <div className="exp-comment-body">
                                    <span className="exp-comment-name">{c.user_username}</span>
                                    <span className="exp-comment-text">{c.comment}</span>
                                  </div>
                                </div>
                              ))}
                              <div className="exp-comment-input">
                                <input
                                  type="text"
                                  placeholder="Write a comment..."
                                  value={commentText[exp.id] || ''}
                                  onChange={(e) => setCommentText(prev => ({ ...prev, [exp.id]: e.target.value }))}
                                  onKeyDown={(e) => e.key === 'Enter' && handleCommentExperience(exp.id)}
                                />
                                <button onClick={() => handleCommentExperience(exp.id)} className="exp-comment-send">
                                  <Send size={13} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="exp-feed-empty">
                      <p>No experiences yet</p>
                      <p className="exp-empty-sub">Be the first to share your experience!</p>
                    </div>
                  )}
                </div>

                {/* Compose Footer */}
                <div className="exp-feed-input">
                  {showExpForm ? (
                    <form onSubmit={handleExpSubmit} className="exp-compose-form">
                      <div className="exp-compose-top">
                        <input
                          type="text"
                          placeholder="Experience title *"
                          value={expFormData.title}
                          onChange={(e) => setExpFormData(prev => ({ ...prev, title: e.target.value }))}
                          required
                          className="exp-compose-title"
                        />
                        <button type="button" onClick={() => { setShowExpForm(false); setExpImagePreview([]); }} className="exp-compose-close">
                          <X size={16} />
                        </button>
                      </div>
                      <textarea
                        placeholder="Share your thoughts, tips, memories..."
                        value={expFormData.description}
                        onChange={(e) => setExpFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows="3"
                        className="exp-compose-desc"
                      />
                      <div className="exp-compose-rating">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button key={s} type="button"
                            onClick={() => setExpFormData(prev => ({ ...prev, rating: s }))}
                            className={`exp-star-btn ${expFormData.rating >= s ? 'active' : ''}`}>
                            <Star size={15} fill={expFormData.rating >= s ? '#f39c12' : 'none'} />
                          </button>
                        ))}
                      </div>
                      {expImagePreview.length > 0 && (
                        <div className="exp-compose-previews">
                          {expImagePreview.map((src, i) => (
                            <div key={i} className="exp-compose-thumb">
                              <img src={src} alt="" />
                              <button type="button" onClick={() => removeExpImage(i)}><X size={10} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="exp-compose-footer">
                        <label className="exp-compose-attach">
                          <Image size={16} />
                          <input type="file" multiple accept="image/*" onChange={handleExpImageChange} hidden />
                        </label>
                        <button type="submit" className="exp-compose-post" disabled={expSubmitting || !expFormData.title.trim()}>
                          {expSubmitting ? 'Posting...' : 'Post Experience'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button className="exp-compose-trigger" onClick={() => setShowExpForm(true)}>
                      Share your experience...
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="tab-content">
              <Chat eventId={id} />
            </div>
          )}
        </div>

        {/* Sidebar - Booking Card */}
        <aside className="event-detail-sidebar">
          <div className="booking-card">
            <div className="booking-price">
              <span className="price-label">Price per ticket</span>
              <span className="price-value">₹{event.ticket_price}</span>
            </div>

            {(event.status === 'COMPLETED' || event.status === 'CANCELLED' || event.status === 'PENDING') ? (
              <div className="event-ended-notice">
                <Ban size={20} />
                {event.status === 'PENDING' ? (
                  <>
                    <p><strong>Awaiting Approval</strong></p>
                    <p className="ended-sub">This event is pending admin approval and not yet available for booking.</p>
                  </>
                ) : (
                  <>
                    <p><strong>Event {event.status === 'COMPLETED' ? 'Completed' : 'Cancelled'}</strong></p>
                    <p className="ended-sub">Ticket purchasing is no longer available for this event.</p>
                  </>
                )}
              </div>
            ) : availableSeats > 0 ? (
              <>
                <div className="booking-info">
                  <p className="seats-info">{availableSeats} seats available</p>
                </div>

                <div className="ticket-selector">
                  <label htmlFor="tickets">Number of Tickets</label>
                  <div className="ticket-counter">
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setTickets(Math.max(1, tickets - 1))}
                      disabled={tickets <= 1 || maxTickets === 0}
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      id="tickets"
                      value={tickets}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1 && val <= maxTickets) setTickets(val);
                      }}
                      min={1}
                      max={maxTickets}
                      className="counter-input"
                      disabled={maxTickets === 0}
                    />
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => setTickets(Math.min(maxTickets, tickets + 1))}
                      disabled={tickets >= maxTickets || maxTickets === 0}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="booking-total">
                  <span>Total:</span>
                  <span className="total-price">₹{(event.ticket_price * tickets).toFixed(2)}</span>
                </div>

                <button
                  className="booking-button"
                  onClick={handleBooking}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Processing...' : isAuthenticated ? (event.ticket_price > 0 ? 'Pay Now' : 'Book Now') : 'Login to Book'}
                </button>
              </>
            ) : (
              <div className="sold-out">
                <p><Ban size={16} /> This event is SOLD OUT</p>
              </div>
            )}

            {isAuthenticated && user?.role === 'USER' && (
              <button className="share-button">
                <Heart size={16} /> Add to Favorites
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EventDetail;
