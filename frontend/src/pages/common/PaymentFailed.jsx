import { useLocation, useNavigate, Link } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw, AlertTriangle, HelpCircle } from 'lucide-react';
import './Payment.css';

const PaymentFailed = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    error_message = 'An unexpected error occurred during payment.',
    event_id,
    event_title,
  } = location.state || {};

  return (
    <div className="payment-page page-enter">
      <div className="receipt-container">
        <div className="receipt-success-icon failed">
          <div className="success-circle failed-circle">
            <XCircle size={48} />
          </div>
          <div className="success-ripple failed-ripple" />
          <div className="success-ripple failed-ripple delay" />
        </div>

        <h1 className="receipt-title failed-title">Payment Failed</h1>
        <p className="receipt-subtitle">Something went wrong with your transaction</p>

        <div className="receipt-card failed-card">
          <div className="failed-error-box">
            <AlertTriangle size={20} />
            <p>{error_message}</p>
          </div>

          <div className="failed-info">
            <div className="failed-info-row">
              <HelpCircle size={16} />
              <div>
                <strong>What happened?</strong>
                <p>Your payment could not be processed. No money has been deducted from your account. If any amount was deducted, it will be refunded within 5-7 business days.</p>
              </div>
            </div>

            {event_title && (
              <div className="failed-info-row">
                <AlertTriangle size={16} />
                <div>
                  <strong>Event</strong>
                  <p>{event_title}</p>
                </div>
              </div>
            )}
          </div>

          <div className="receipt-divider" />

          <div className="failed-tips">
            <strong>Common reasons for payment failure:</strong>
            <ul>
              <li>Insufficient balance in your account</li>
              <li>Card expired or details entered incorrectly</li>
              <li>Bank declined the transaction</li>
              <li>Network timeout during payment</li>
              <li>Payment was cancelled by you</li>
            </ul>
          </div>
        </div>

        <div className="receipt-actions">
          {event_id ? (
            <Link to={`/events/${event_id}`} className="btn btn-primary receipt-btn">
              <RefreshCw size={16} />
              Try Again
            </Link>
          ) : (
            <button className="btn btn-primary receipt-btn" onClick={() => navigate(-1)}>
              <RefreshCw size={16} />
              Try Again
            </button>
          )}
          <Link to="/events" className="btn btn-secondary receipt-btn">
            <ArrowLeft size={16} />
            Browse Events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
