import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventRequestAPI, categoryAPI } from '../../services/api';
import {
  ArrowLeft, Save, MapPin, Calendar, Clock, Users, DollarSign, FileText
} from 'lucide-react';
import '../events/Events.css';
import './Auctions.css';

const CreateEventRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    preferred_location: '',
    preferred_date: '',
    preferred_time: '',
    expected_attendees: '',
    budget_min: '',
    budget_max: '',
    additional_requirements: ''
  });

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

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
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
    if (formData.budget_min && formData.budget_max) {
      if (Number(formData.budget_min) > Number(formData.budget_max)) {
        setError('Minimum budget cannot exceed maximum budget');
        return false;
      }
    }
    if (formData.expected_attendees && Number(formData.expected_attendees) <= 0) {
      setError('Expected attendees must be a positive number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
      };

      if (formData.preferred_location) payload.preferred_location = formData.preferred_location;
      if (formData.preferred_date) payload.preferred_date = formData.preferred_date;
      if (formData.preferred_time) payload.preferred_time = formData.preferred_time;
      if (formData.expected_attendees) payload.expected_attendees = Number(formData.expected_attendees);
      if (formData.budget_min) payload.budget_min = Number(formData.budget_min);
      if (formData.budget_max) payload.budget_max = Number(formData.budget_max);
      if (formData.additional_requirements) payload.additional_requirements = formData.additional_requirements;

      await eventRequestAPI.create(payload);
      navigate('/event-requests');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create event request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auctions-page page-enter">
      <div style={{ padding: '40px 20px 0', maxWidth: '700px', margin: '0 auto' }}>
        <button onClick={() => navigate('/event-requests')} className="back-link">
          <ArrowLeft size={18} /> Back to Event Requests
        </button>
      </div>

      <div style={{ padding: '0 20px 40px' }}>
        <div className="create-request-form">
          <h1>Create Event Request</h1>
          <p>Describe the event you want and let organizers submit bids</p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">
                <FileText size={14} /> Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Annual Tech Conference 2026"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                <FileText size={14} /> Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your ideal event in detail..."
                rows="4"
                disabled={loading}
              />
            </div>

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
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="preferred_location">
                <MapPin size={14} /> Preferred Location
              </label>
              <input
                type="text"
                id="preferred_location"
                name="preferred_location"
                value={formData.preferred_location}
                onChange={handleInputChange}
                placeholder="City or venue preference"
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="preferred_date">
                  <Calendar size={14} /> Preferred Date
                </label>
                <input
                  type="date"
                  id="preferred_date"
                  name="preferred_date"
                  value={formData.preferred_date}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="preferred_time">
                  <Clock size={14} /> Preferred Time
                </label>
                <input
                  type="time"
                  id="preferred_time"
                  name="preferred_time"
                  value={formData.preferred_time}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="expected_attendees">
                <Users size={14} /> Expected Attendees
              </label>
              <input
                type="number"
                id="expected_attendees"
                name="expected_attendees"
                value={formData.expected_attendees}
                onChange={handleInputChange}
                placeholder="e.g., 200"
                min="1"
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="budget_min">
                  <DollarSign size={14} /> Minimum Budget ($)
                </label>
                <input
                  type="number"
                  id="budget_min"
                  name="budget_min"
                  value={formData.budget_min}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="budget_max">
                  <DollarSign size={14} /> Maximum Budget ($)
                </label>
                <input
                  type="number"
                  id="budget_max"
                  name="budget_max"
                  value={formData.budget_max}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="additional_requirements">
                <FileText size={14} /> Additional Requirements
              </label>
              <textarea
                id="additional_requirements"
                name="additional_requirements"
                value={formData.additional_requirements}
                onChange={handleInputChange}
                placeholder="Any special requirements or preferences..."
                rows="3"
                disabled={loading}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/event-requests')}
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
                {loading ? 'Creating...' : <><Save size={16} /> Create Request</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventRequest;
