import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { experienceAPI, bookingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Star, ThumbsUp, MessageCircle, CalendarDays, MapPin,
  Image, Send, X, ChevronDown
} from 'lucide-react';
import './Experiences.css';

const UserExperiences = () => {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [attendedEvents, setAttendedEvents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [imagePreview, setImagePreview] = useState([]);
  const [formData, setFormData] = useState({
    event: '',
    title: '',
    description: '',
    rating: 5,
    images: []
  });

  useEffect(() => {
    fetchUserExperiences();
    fetchAttendedEvents();
  }, []);

  const fetchUserExperiences = async () => {
    try {
      setLoading(true);
      const response = await experienceAPI.list();
      setExperiences(response.data.results || response.data);
    } catch (err) {
      setError('Failed to load experiences');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendedEvents = async () => {
    try {
      const response = await bookingAPI.list({ status: 'CONFIRMED' });
      const pastBookings = (response.data.results || response.data).filter(b => {
        return new Date(b.event?.end_date) < new Date();
      });
      setAttendedEvents(pastBookings.map(b => b.event));
    } catch (err) {
      console.error('Failed to load attended events:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, images: files }));
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
    setImagePreview(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.event || !formData.title) {
      alert('Please select an event and enter a title');
      return;
    }
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('event', formData.event);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('rating', formData.rating);
      formData.images.forEach((image) => {
        formDataToSend.append('images', image);
      });
      await experienceAPI.create(formDataToSend);
      setFormData({ event: '', title: '', description: '', rating: 5, images: [] });
      setImagePreview([]);
      setShowForm(false);
      fetchUserExperiences();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to post experience');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (expId) => {
    try {
      await experienceAPI.like(expId);
      setExperiences(prev => prev.map(exp =>
        exp.id === expId
          ? { ...exp, likes_count: exp.likes_count + 1, is_liked_by_user: true }
          : exp
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnlike = async (expId) => {
    try {
      await experienceAPI.unlike(expId);
      setExperiences(prev => prev.map(exp =>
        exp.id === expId
          ? { ...exp, likes_count: Math.max(0, exp.likes_count - 1), is_liked_by_user: false }
          : exp
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (expId) => {
    const text = commentText[expId];
    if (!text?.trim()) return;
    try {
      await experienceAPI.addComment(expId, { comment: text });
      setCommentText(prev => ({ ...prev, [expId]: '' }));
      fetchUserExperiences();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr) => {
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

  const toggleComments = (expId) => {
    setExpandedComments(prev => ({ ...prev, [expId]: !prev[expId] }));
  };

  if (loading) {
    return <div className="experiences-page page-enter"><div className="feed-loading">Loading experiences...</div></div>;
  }

  return (
    <div className="experiences-page page-enter">
      <div className="feed-container">
        {/* Compose Bar */}
        <div className="compose-card">
          {!showForm ? (
            <button className="compose-trigger" onClick={() => setShowForm(true)}>
              <div className="compose-avatar">
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt="" />
                ) : (
                  <span>{(user?.username || 'U')[0].toUpperCase()}</span>
                )}
              </div>
              <span className="compose-placeholder">Share your experience...</span>
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="compose-form">
              <div className="compose-header">
                <h3>Share Your Experience</h3>
                <button type="button" onClick={() => { setShowForm(false); setImagePreview([]); }} className="close-btn">
                  <X size={18} />
                </button>
              </div>

              <div className="compose-body">
                <div className="field-row">
                  <label>Event *</label>
                  <div className="select-wrapper">
                    <select name="event" value={formData.event} onChange={handleChange} required>
                      <option value="">Select an event...</option>
                      {attendedEvents.map(ev => (
                        <option key={ev.id} value={ev.id}>{ev.title}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="select-icon" />
                  </div>
                </div>

                <div className="field-row">
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Give your experience a title..."
                    required
                  />
                </div>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What was the highlight? Share tips, memories, vibes..."
                  rows="4"
                />

                <div className="rating-row">
                  <span className="rating-label">Rating</span>
                  <div className="star-selector">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                        className={`star-btn ${formData.rating >= star ? 'active' : ''}`}
                      >
                        <Star size={18} fill={formData.rating >= star ? '#f39c12' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                {imagePreview.length > 0 && (
                  <div className="image-previews">
                    {imagePreview.map((src, i) => (
                      <div key={i} className="preview-thumb">
                        <img src={src} alt="" />
                        <button type="button" onClick={() => removeImage(i)} className="remove-thumb">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="compose-footer">
                  <label className="attach-btn">
                    <Image size={18} />
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} hidden />
                  </label>
                  <button type="submit" className="post-btn" disabled={submitting}>
                    <Send size={16} />
                    {submitting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Feed */}
        <div className="feed">
          {experiences.length > 0 ? (
            experiences.map(exp => (
              <article key={exp.id} className="feed-card">
                {/* Post Header */}
                <div className="post-header">
                  <div className="post-avatar">
                    {exp.user_profile_picture ? (
                      <img src={exp.user_profile_picture} alt="" />
                    ) : (
                      <span>{(exp.user_username || 'U')[0].toUpperCase()}</span>
                    )}
                  </div>
                  <div className="post-meta">
                    <span className="post-author">{exp.user_username}</span>
                    <span className="post-event-tag">
                      <CalendarDays size={12} />
                      {exp.event_title}
                    </span>
                  </div>
                  <span className="post-time">{formatDate(exp.created_at)}</span>
                </div>

                {/* Post Content */}
                <div className="post-body">
                  <h3 className="post-title">{exp.title}</h3>
                  {exp.description && <p className="post-text">{exp.description}</p>}

                  <div className="post-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < exp.rating ? '#f39c12' : 'none'}
                            color={i < exp.rating ? '#f39c12' : '#ddd'} />
                    ))}
                  </div>

                  {exp.images && exp.images.length > 0 && (
                    <div className={`post-images count-${Math.min(exp.images.length, 4)}`}>
                      {exp.images.slice(0, 4).map((img, i) => (
                        <div key={img.id} className="post-img-wrap">
                          <img src={img.image} alt="" />
                          {i === 3 && exp.images.length > 4 && (
                            <div className="img-overlay">+{exp.images.length - 4}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="post-actions">
                  <button
                    className={`action-btn ${exp.is_liked_by_user ? 'liked' : ''}`}
                    onClick={() => exp.is_liked_by_user ? handleUnlike(exp.id) : handleLike(exp.id)}
                  >
                    <ThumbsUp size={16} fill={exp.is_liked_by_user ? 'currentColor' : 'none'} />
                    {exp.likes_count > 0 && <span>{exp.likes_count}</span>}
                  </button>
                  <button className="action-btn" onClick={() => toggleComments(exp.id)}>
                    <MessageCircle size={16} />
                    {exp.comments?.length > 0 && <span>{exp.comments.length}</span>}
                  </button>
                </div>

                {/* Comments Section */}
                {expandedComments[exp.id] && (
                  <div className="comments-section">
                    {exp.comments?.map(c => (
                      <div key={c.id} className="comment-item">
                        <div className="comment-avatar">
                          {c.user_profile_picture ? (
                            <img src={c.user_profile_picture} alt="" />
                          ) : (
                            <span>{(c.user_username || 'U')[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div className="comment-body">
                          <span className="comment-author">{c.user_username}</span>
                          <span className="comment-text">{c.comment}</span>
                          <span className="comment-time">{formatDate(c.created_at)}</span>
                        </div>
                      </div>
                    ))}
                    <div className="comment-input-row">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText[exp.id] || ''}
                        onChange={(e) => setCommentText(prev => ({ ...prev, [exp.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleComment(exp.id)}
                      />
                      <button onClick={() => handleComment(exp.id)} className="send-comment-btn">
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))
          ) : (
            <div className="feed-empty">
              <p>No experiences yet</p>
              <p className="empty-sub">Attend an event and share your story!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserExperiences;
