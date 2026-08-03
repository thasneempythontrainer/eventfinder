import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2,
  Building2, Briefcase, FileText,
} from 'lucide-react';
import AuthLayout from './AuthLayout';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
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
    <AuthLayout>
      <div className="auth-heading">
        <h2>Register as Organizer</h2>
        <p>Create and manage events on EventFinder</p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={16} /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="input-group">
            <label htmlFor="first_name">First Name *</label>
            <div className="input-wrap">
              <User size={18} className="input-icon" />
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
          </div>

          <div className="input-group">
            <label htmlFor="last_name">Last Name *</label>
            <div className="input-wrap">
              <User size={18} className="input-icon" />
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
        </div>

        <div className="input-group">
          <label htmlFor="email">Email Address *</label>
          <div className="input-wrap">
            <Mail size={18} className="input-icon" />
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
        </div>

        <div className="input-group">
          <label htmlFor="phone_number">Phone Number (Optional)</label>
          <div className="input-wrap">
            <Phone size={18} className="input-icon" />
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+1234567890"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label htmlFor="password">Password *</label>
            <div className="input-wrap">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(s => !s)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password_confirm">Confirm Password *</label>
            <div className="input-wrap">
              <Lock size={18} className="input-icon" />
              <input
                type={showConfirm ? 'text' : 'password'}
                id="password_confirm"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm(s => !s)}
                aria-label="Toggle password visibility"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <hr className="form-divider" />

        <div className="input-group">
          <label htmlFor="business_name">Business Name *</label>
          <div className="input-wrap">
            <Building2 size={18} className="input-icon" />
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
        </div>

        <div className="input-group">
          <label htmlFor="business_category">Business Category *</label>
          <div className="input-wrap">
            <Briefcase size={18} className="input-icon" />
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
        </div>

        <div className="input-group">
          <label htmlFor="business_description">Business Description</label>
          <div className="input-wrap">
            <FileText size={18} className="input-icon" />
            <textarea
              id="business_description"
              name="business_description"
              value={formData.business_description}
              onChange={handleChange}
              placeholder="Tell us about your business..."
              rows="3"
            />
          </div>
        </div>

        <div className="input-group">
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

        <div className="auth-actions">
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating Account...' : (
              <>
                <span>Create Account</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterOrganizer;
