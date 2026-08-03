import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, Search, Ticket, Bell, ShieldCheck } from 'lucide-react';
import './Auth.css';

const FEATURES = [
  { icon: Search, text: 'Discover events happening near you' },
  { icon: Ticket, text: 'Book tickets in seconds, download instantly' },
  { icon: Bell, text: 'Get notified about updates & waitlist openings' },
  { icon: ShieldCheck, text: 'Secure payments & verified organizers' },
];

const TABS = [
  { label: 'Sign In', path: '/login' },
  { label: 'Create Account', path: '/register' },
  { label: 'Organizer', path: '/register-organizer' },
];

const AuthLayout = ({ children }) => {
  const { pathname } = useLocation();

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-brand-content">
          <div className="auth-brand-logo">
            <span className="logo-icon"><CalendarDays size={24} /></span>
            <span>Event<span>Finder</span></span>
          </div>
          <h1>Find your next <span>adventure</span>.</h1>
          <p className="auth-brand-tagline">
            Discover, book, and experience unforgettable events — concerts,
            workshops, festivals and more.
          </p>
          <ul className="auth-brand-features">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <li key={i} className="fade-in-up" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                <Icon size={20} />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <div className="auth-tabs">
            {TABS.map(tab => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`auth-tab ${pathname === tab.path ? 'active' : ''}`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
