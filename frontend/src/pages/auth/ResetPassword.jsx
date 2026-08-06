import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import AuthLayout from './AuthLayout';
import './Auth.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uid = searchParams.get('uid') || '';
  const token = searchParams.get('token') || '';

  const [formData, setFormData] = useState({
    new_password: '',
    password_confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!uid || !token) {
      setError('This password reset link is invalid or incomplete.');
      setLoading(false);
      return;
    }

    if (formData.new_password !== formData.password_confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.new_password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      await authAPI.confirmPasswordReset({
        uid,
        token,
        new_password: formData.new_password,
      });
      setSuccess('Your password has been reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.new_password?.[0] || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-heading">
        <h2>Set a New Password</h2>
        <p>Choose a strong password for your account</p>
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
        <div className="input-group">
          <label htmlFor="new_password">New Password</label>
          <div className="input-wrap">
            <Lock size={18} className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="new_password"
              name="new_password"
              value={formData.new_password}
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
          <label htmlFor="password_confirm">Confirm New Password</label>
          <div className="input-wrap">
            <Lock size={18} className="input-icon" />
            <input
              type={showConfirm ? 'text' : 'password'}
              id="password_confirm"
              name="password_confirm"
              value={formData.password_confirm}
              onChange={handleChange}
              placeholder="Re-enter your new password"
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
            {loading ? 'Resetting...' : (
              <>
                <span>Reset Password</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="auth-divider">or</div>

      <Link to="/login" className="auth-button secondary">
        <KeyRound size={16} /> Back to Sign In
      </Link>
    </AuthLayout>
  );
};

export default ResetPassword;
