import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { Mail, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import AuthLayout from './AuthLayout';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.requestPasswordReset({ email });
      setSuccess(response.data.message || 'If an account exists with this email, a password reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.email?.[0] || err.response?.data?.detail || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-heading">
        <h2>Forgot Password?</h2>
        <p>Enter your email and we'll send you a reset link</p>
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
          <label htmlFor="email">Email</label>
          <div className="input-wrap">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        <div className="auth-actions">
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Sending...' : (
              <>
                <span>Send Reset Link</span>
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

export default ForgotPassword;
