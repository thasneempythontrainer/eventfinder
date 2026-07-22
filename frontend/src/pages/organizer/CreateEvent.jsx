import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventAPI, categoryAPI } from '../../services/api';
import { ClipboardList, FileText, CalendarDays, MapPin, Ticket, Image, Camera, X, Check } from 'lucide-react';
import './CreateEvent.css';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    venue: '',
    city: '',
    ticket_price: '',
    total_tickets: '',
    images: []
  });

  const [imagePreview, setImagePreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.list();
      setCategories(response.data.results || response.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    const validFiles = files.filter(file => {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setError('Only JPG and PNG images are allowed');
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return false;
      }
      return true;
    });

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Event title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.category) {
      setError('Category is required');
      return false;
    }
    if (!formData.start_date || !formData.start_time) {
      setError('Start date and time are required');
      return false;
    }
    if (!formData.end_date || !formData.end_time) {
      setError('End date and time are required');
      return false;
    }
    if (!formData.venue.trim()) {
      setError('Venue is required');
      return false;
    }
    if (!formData.city.trim()) {
      setError('City is required');
      return false;
    }
    if (!formData.ticket_price || formData.ticket_price <= 0) {
      setError('Ticket price must be greater than 0');
      return false;
    }
    if (!formData.total_tickets || formData.total_tickets <= 0) {
      setError('Total tickets must be greater than 0');
      return false;
    }
    if (formData.images.length === 0) {
      setError('At least one event image is required for the banner');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('start_date', formData.start_date);
      formDataToSend.append('end_date', formData.end_date);
      formDataToSend.append('start_time', formData.start_time);
      formDataToSend.append('end_time', formData.end_time);
      formDataToSend.append('venue', formData.venue);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('ticket_price', formData.ticket_price);
      formDataToSend.append('total_seats', formData.total_tickets);

      // Send the first image as the banner
      if (formData.images.length > 0) {
        formDataToSend.append('banner', formData.images[0]);
      }

      await eventAPI.create(formDataToSend);
      setSuccess('Event created successfully! It is now pending admin approval and will go live once approved.');
      
      setTimeout(() => {
        navigate('/organizer/events');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create event');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-page page-enter">
      <div className="create-event-header">
        <div className="container">
          <h1><ClipboardList size={28} /> Create Event</h1>
          <p>Create a new event and start accepting bookings</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 20px' }}>
        <div className="create-event-form-wrapper">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3><FileText size={18} /> Basic Information</h3>
              
              <div className="form-group">
                <label htmlFor="title">Event Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter event title"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your event in detail"
                  rows="4"
                  disabled={loading}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3><CalendarDays size={18} /> Date & Time</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="start_date">Start Date *</label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="start_time">Start Time *</label>
                  <input
                    type="time"
                    id="start_time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="end_date">End Date *</label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="end_time">End Time *</label>
                  <input
                    type="time"
                    id="end_time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3><MapPin size={18} /> Location</h3>
              
              <div className="form-group">
                <label htmlFor="venue">Venue *</label>
                <input
                  type="text"
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  placeholder="Event venue or venue name"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-section">
              <h3><Ticket size={18} /> Tickets</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ticket_price">Ticket Price ($) *</label>
                  <input
                    type="number"
                    id="ticket_price"
                    name="ticket_price"
                    value={formData.ticket_price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="total_tickets">Total Tickets *</label>
                  <input
                    type="number"
                    id="total_tickets"
                    name="total_tickets"
                    value={formData.total_tickets}
                    onChange={handleInputChange}
                    placeholder="100"
                    min="1"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3><Image size={18} /> Event Images</h3>
              
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageSelect}
                  disabled={loading}
                />
                <label htmlFor="images" className="file-input-label">
                  <Camera size={16} /> Choose Images (JPG/PNG, max 10MB each)
                </label>
              </div>

              {imagePreview.length > 0 && (
                <div className="image-preview-grid">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={preview} alt={`Preview ${index}`} />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                        disabled={loading}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button 
                type="button"
                onClick={() => navigate('/organizer/events')}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : <><Check size={16} /> Create Event</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
