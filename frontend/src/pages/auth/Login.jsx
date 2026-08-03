import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import AuthLayout from './AuthLayout';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, error } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password);

      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'ORGANIZER') {
        navigate('/organizer/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      setFormError(error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const displayError = formError || error;

  return (
    <AuthLayout>
      <div className="auth-heading">
        <h2>Welcome back</h2>
        <p>Sign in to continue to EventFinder</p>
      </div>

      {displayError && (
        <div className="alert alert-danger">
          <AlertCircle size={16} /> {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <div className="input-wrap">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrap">
            <Lock size={18} className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
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

        <div className="auth-actions">
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Signing in...' : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="auth-divider">or</div>

      <Link to="/register" className="auth-button secondary">
        Create a new account
      </Link>
    </AuthLayout>
  );
};

export default Login;
