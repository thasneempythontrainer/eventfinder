import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2,
} from 'lucide-react';
import AuthLayout from './AuthLayout';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { registerUser } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
      };
      if (formData.phone_number) {
        payload.phone_number = formData.phone_number;
      }
      await registerUser(payload);

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.email?.[0] || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-heading">
        <h2>Create Account</h2>
        <p>Join EventFinder and discover amazing events</p>
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
              placeholder="Minimum 8 characters"
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
              placeholder="Re-enter your password"
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

export default Register;
