import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const RegisterOrganizer = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirm: '',
    business_name: '',
    business_description: '',
    business_category: 'MUSIC',
    government_id: null,
  });
  const [idFileName, setIdFileName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { registerOrganizer } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      // Check file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError('File must be PDF, JPEG, or PNG');
        return;
      }
      setFormData(prev => ({
        ...prev,
        government_id: file
      }));
      setIdFileName(file.name);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!formData.business_name) {
      setError('Business name is required');
      setLoading(false);
      return;
    }

    if (!formData.government_id) {
      setError('Government ID is required');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('email', formData.email);
      if (formData.phone_number) {
        formDataToSend.append('phone_number', formData.phone_number);
      }
      formDataToSend.append('password', formData.password);
      formDataToSend.append('organization_name', formData.business_name);
      formDataToSend.append('government_id', formData.government_id);
      formDataToSend.append('address', formData.business_description || '');

      await registerOrganizer(formDataToSend);

      setSuccess('Registration successful! Your profile is pending admin approval. Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.email?.[0] || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container auth-form-large">
        <div className="auth-form">
          <h2>Register as Event Organizer</h2>
          <p className="auth-subtitle">Create and manage events on EventFinder</p>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">First Name *</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Last Name *</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone_number">Phone Number (Optional)</label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+1234567890"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <small className="help-text">Minimum 8 characters</small>
              </div>

              <div className="form-group">
                <label htmlFor="password_confirm">Confirm Password *</label>
                <input
                  type="password"
                  id="password_confirm"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <hr className="form-divider" />

            <h3>Business Information</h3>

            <div className="form-group">
              <label htmlFor="business_name">Business Name *</label>
              <input
                type="text"
                id="business_name"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                placeholder="Your Business Name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="business_category">Business Category *</label>
              <select
                id="business_category"
                name="business_category"
                value={formData.business_category}
                onChange={handleChange}
              >
                <option value="MUSIC">Music & Concerts</option>
                <option value="SPORTS">Sports</option>
                <option value="THEATER">Theater & Arts</option>
                <option value="CONFERENCE">Conference & Workshop</option>
                <option value="FESTIVAL">Festival & Celebration</option>
                <option value="MEETUP">Meetup & Networking</option>
                <option value="WEDDING">Wedding & Events</option>
                <option value="FOOD">Food & Dining</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="business_description">Business Description</label>
              <textarea
                id="business_description"
                name="business_description"
                value={formData.business_description}
                onChange={handleChange}
                placeholder="Tell us about your business..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="government_id">Government ID Document (PDF/JPG/PNG) *</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="government_id"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                />
                <label htmlFor="government_id" className="file-label">
                  {idFileName ? (
                    <span>✓ {idFileName}</span>
                  ) : (
                    <span>Choose government ID document (Max 10MB)</span>
                  )}
                </label>
              </div>
              <small className="help-text">Required for verification purposes. Admin will review within 24 hours.</small>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Sign in here</Link>
            </p>
            <p>
              Looking to attend events? <Link to="/register">Register as User</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterOrganizer;
