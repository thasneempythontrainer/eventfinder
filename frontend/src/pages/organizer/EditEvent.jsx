import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventAPI, categoryAPI } from '../../services/api';
import { ClipboardList, FileText, CalendarDays, MapPin, Ticket, Image, Camera, X, Check, ArrowLeft } from 'lucide-react';
import './CreateEvent.css';

const EditEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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
    banner: null,
    booking_deadline: '',
    language: '',
    what_to_bring: '',
    parking_available: false,
    parking_details: '',
    wifi_available: false,
    wifi_details: '',
    food_available: false,
    food_details: '',
    water_refill_stations: false,
    restrooms_available: false,
    charging_stations: false,
    wheelchair_accessible: false,
    prayer_room: false,
    certificate_available: false,
    certificate_template: null,
  });
  const [existingBanner, setExistingBanner] = useState(null);
  const [imagePreview, setImagePreview] = useState([]);
  const [certificateName, setCertificateName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadEvent();
    loadCategories();
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.get(id);
      const event = response.data;

      const startDate = event.start_date || '';
      const endDate = event.end_date || '';
      const startTime = event.start_time || '';
      const endTime = event.end_time || '';

      setFormData({
        title: event.title || '',
        description: event.description || '',
        category: event.category?.id || event.category || '',
        start_date: startDate.split('T')[0],
        start_time: startTime.slice(0, 5),
        end_date: endDate.split('T')[0],
        end_time: endTime.slice(0, 5),
        venue: event.venue || '',
        city: event.city || '',
        ticket_price: event.ticket_price || '',
        total_tickets: event.total_seats || event.total_tickets || '',
        banner: null,
        booking_deadline: event.booking_deadline ? event.booking_deadline.slice(0, 16) : '',
        language: event.language || '',
        what_to_bring: event.what_to_bring || '',
        parking_available: !!event.parking_available,
        parking_details: event.parking_details || '',
        wifi_available: !!event.wifi_available,
        wifi_details: event.wifi_details || '',
        food_available: !!event.food_available,
        food_details: event.food_details || '',
        water_refill_stations: !!event.water_refill_stations,
        restrooms_available: !!event.restrooms_available,
        charging_stations: !!event.charging_stations,
        wheelchair_accessible: !!event.wheelchair_accessible,
        prayer_room: !!event.prayer_room,
        certificate_available: !!event.certificate_available,
        certificate_template: null,
      });

      if (event.banner) {
        setExistingBanner(event.banner);
        setImagePreview([event.banner]);
      }
    } catch (err) {
      setError('Failed to load event');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.list();
      setCategories(response.data.results || response.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCertificateSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('Certificate template must be less than 10MB');
      return;
    }
    setFormData(prev => ({ ...prev, certificate_template: file }));
    setCertificateName(file.name);
    e.target.value = '';
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setError('Only JPG and PNG images are allowed');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setFormData(prev => ({ ...prev, banner: file }));
    setExistingBanner(null);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview([reader.result]);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, banner: null }));
    setExistingBanner(null);
    setImagePreview([]);
  };

  const validateForm = () => {
    if (!formData.title.trim()) { setError('Event title is required'); return false; }
    if (!formData.description.trim()) { setError('Description is required'); return false; }
    if (!formData.category) { setError('Category is required'); return false; }
    if (!formData.start_date || !formData.start_time) { setError('Start date and time are required'); return false; }
    if (!formData.end_date || !formData.end_time) { setError('End date and time are required'); return false; }
    if (!formData.venue.trim()) { setError('Venue is required'); return false; }
    if (!formData.city.trim()) { setError('City is required'); return false; }
    if (!formData.ticket_price || formData.ticket_price <= 0) { setError('Ticket price must be greater than 0'); return false; }
    if (!formData.total_tickets || formData.total_tickets <= 0) { setError('Total tickets must be greater than 0'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
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
      formDataToSend.append('language', formData.language);
      formDataToSend.append('what_to_bring', formData.what_to_bring);

      if (formData.booking_deadline) {
        formDataToSend.append('booking_deadline', formData.booking_deadline);
      }

      const booleans = [
        'parking_available', 'wifi_available', 'food_available',
        'water_refill_stations', 'restrooms_available', 'charging_stations',
        'wheelchair_accessible', 'prayer_room', 'certificate_available'
      ];
      booleans.forEach(key => formDataToSend.append(key, formData[key] ? 'true' : 'false'));

      formDataToSend.append('parking_details', formData.parking_details);
      formDataToSend.append('wifi_details', formData.wifi_details);
      formDataToSend.append('food_details', formData.food_details);

      if (formData.certificate_template) {
        formDataToSend.append('certificate_template', formData.certificate_template);
      }

      if (formData.banner) {
        formDataToSend.append('banner', formData.banner);
      }

      await eventAPI.update(id, formDataToSend);
      setSuccess('Event updated successfully! Changes are pending admin re-approval.');

      setTimeout(() => {
        navigate('/organizer/events');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to update event');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="create-event-page page-enter">
        <div className="create-event-header">
          <div className="container">
            <h1><ClipboardList size={28} /> Edit Event</h1>
          </div>
        </div>
        <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p style={{ color: '#666' }}>Loading event details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-event-page page-enter">
      <div className="create-event-header">
        <div className="container">
          <h1><ClipboardList size={28} /> Edit Event</h1>
          <p>Update your event details</p>
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
                  disabled={saving}
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
                  disabled={saving}
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
                    disabled={saving}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
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
                    disabled={saving}
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
                    disabled={saving}
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
                    disabled={saving}
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
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="booking_deadline">Booking Deadline (optional)</label>
                <input
                  type="datetime-local"
                  id="booking_deadline"
                  name="booking_deadline"
                  value={formData.booking_deadline}
                  onChange={handleInputChange}
                  disabled={saving}
                />
                <small className="form-hint">Registration closes at this date/time. Leave blank for no deadline.</small>
              </div>
            </div>

            <div className="form-section">
              <h3><FileText size={18} /> Language & Requirements</h3>

              <div className="form-group">
                <label htmlFor="language">Event Language (optional)</label>
                <input
                  type="text"
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  placeholder="e.g. English, Arabic"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="what_to_bring">What to Bring (optional)</label>
                <textarea
                  id="what_to_bring"
                  name="what_to_bring"
                  value={formData.what_to_bring}
                  onChange={handleInputChange}
                  placeholder="Items participants should bring (e.g. student ID, laptop)"
                  rows="3"
                  disabled={saving}
                />
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
                  disabled={saving}
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
                  disabled={saving}
                />
              </div>
            </div>

            <div className="form-section">
              <h3><MapPin size={18} /> Amenities & Facilities</h3>
              <p className="form-hint">Tick the facilities available at this event. All optional.</p>

              <div className="amenities-grid">
                <label className="amenity-toggle">
                  <input
                    type="checkbox"
                    name="parking_available"
                    checked={formData.parking_available}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  <span>Parking Available</span>
                </label>
                <label className="amenity-toggle">
                  <input
                    type="checkbox"
                    name="wifi_available"
                    checked={formData.wifi_available}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  <span>Wi-Fi</span>
                </label>
                <label className="amenity-toggle">
                  <input
                    type="checkbox"
                    name="food_available"
                    checked={formData.food_available}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  <span>Food & Refreshments</span>
                </label>
                <label className="amenity-toggle">
                  <input
                    type="checkbox"
                    name="water_refill_stations"
                    checked={formData.water_refill_stations}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  <span>Water Refill Stations</span>
                </label>
                <label className="amenity-toggle">
                  <input
                    type="checkbox"
                    name="restrooms_available"
                    checked={formData.restrooms_available}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  <span>Restrooms</span>
                </label>
                <label className="amenity-toggle">
                  <input
                    type="checkbox"
                    name="charging_stations"
                    checked={formData.charging_stations}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  <span>Charging Stations</span>
                </label>
                <label className="amenity-toggle">
                  <input
                    type="checkbox"
                    name="wheelchair_accessible"
                    checked={formData.wheelchair_accessible}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  <span>Wheelchair Accessible</span>
                </label>
                <label className="amenity-toggle">
                  <input
                    type="checkbox"
                    name="prayer_room"
                    checked={formData.prayer_room}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  <span>Prayer Room</span>
                </label>
              </div>

              {formData.parking_available && (
                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label htmlFor="parking_details">Parking Details</label>
                  <input
                    type="text"
                    id="parking_details"
                    name="parking_details"
                    value={formData.parking_details}
                    onChange={handleInputChange}
                    placeholder="e.g. Free parking lot on site"
                    disabled={saving}
                  />
                </div>
              )}
              {formData.wifi_available && (
                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label htmlFor="wifi_details">Wi-Fi Details</label>
                  <input
                    type="text"
                    id="wifi_details"
                    name="wifi_details"
                    value={formData.wifi_details}
                    onChange={handleInputChange}
                    placeholder="e.g. Network: EventNet, Password: 1234"
                    disabled={saving}
                  />
                </div>
              )}
              {formData.food_available && (
                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label htmlFor="food_details">Food & Refreshments Details</label>
                  <input
                    type="text"
                    id="food_details"
                    name="food_details"
                    value={formData.food_details}
                    onChange={handleInputChange}
                    placeholder="e.g. Lunch and coffee breaks included"
                    disabled={saving}
                  />
                </div>
              )}
            </div>

            <div className="form-section">
              <h3><FileText size={18} /> Certificate</h3>

              <label className="amenity-toggle">
                <input
                  type="checkbox"
                  name="certificate_available"
                  checked={formData.certificate_available}
                  onChange={handleInputChange}
                  disabled={saving}
                />
                <span>Offer participation certificates to attendees</span>
              </label>

              {formData.certificate_available && (
                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label htmlFor="certificate_template">Certificate Template (optional image)</label>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      id="certificate_template"
                      accept="image/png,image/jpeg"
                      onChange={handleCertificateSelect}
                      disabled={saving}
                    />
                    <label htmlFor="certificate_template" className="file-input-label">
                      <Camera size={16} /> {certificateName || 'Choose Template (PNG/JPG, max 10MB)'}
                    </label>
                  </div>
                  <small className="form-hint">
                    If none is uploaded, a branded EventFinder certificate is generated automatically.
                  </small>
                </div>
              )}
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
                    disabled={saving}
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
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3><Image size={18} /> Event Banner</h3>

              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="banner"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageSelect}
                  disabled={saving}
                />
                <label htmlFor="banner" className="file-input-label">
                  <Camera size={16} /> {existingBanner ? 'Replace Banner (JPG/PNG, max 10MB)' : 'Choose Banner (JPG/PNG, max 10MB)'}
                </label>
              </div>

              {imagePreview.length > 0 && (
                <div className="image-preview-grid">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={preview} alt={`Banner preview`} />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={removeImage}
                        disabled={saving}
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
                disabled={saving}
              >
                <ArrowLeft size={16} /> Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : <><Check size={16} /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;
