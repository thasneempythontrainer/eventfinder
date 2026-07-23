import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Ticket, Star, ListPlus, PlusCircle, CheckCircle,
  CalendarDays, LogOut, Home, Search, ClipboardList, KeyRound, PenLine, Menu,
  User, Users, Gavel, BarChart3, TrendingUp
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'ORGANIZER':
        return '/organizer/dashboard';
      case 'USER':
      default:
        return '/user/dashboard';
    }
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <CalendarDays size={22} /> Event<span style={{ color: '#e8622c' }}>Finder</span>
        </Link>

        {/* Desktop Menu */}
        <div className="navbar-desktop">
          <div className="navbar-links">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/events" 
              className={`nav-link ${location.pathname === '/events' ? 'active' : ''}`}
            >
              Events
            </Link>
          </div>

          {isAuthenticated ? (
            <div className="navbar-user">
              <NotificationBell />
              <div className="user-menu-trigger" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className="user-avatar">
                  {user?.first_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="user-name">{user?.first_name}</span>
              </div>

              {userMenuOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <p>{user?.email}</p>
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                      {user?.role}
                    </p>
                  </div>
                  
                  <Link 
                    to={getDashboardLink()}
                    className="dropdown-item"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>

                  <Link 
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User size={16} /> Profile
                  </Link>

                  {user?.role === 'USER' && (
                    <>
                      <Link 
                        to="/user/bookings"
                        className="dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Ticket size={16} /> My Bookings
                      </Link>
                      <Link 
                        to="/user/experiences"
                        className="dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Star size={16} /> My Experiences
                      </Link>
                      <Link 
                        to="/event-requests"
                        className="dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Gavel size={16} /> Event Requests
                      </Link>
                    </>
                  )}

                  {user?.role === 'ORGANIZER' && (
                    <>
                      <Link 
                        to="/organizer/events"
                        className="dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <ClipboardList size={16} /> My Events
                      </Link>
                      <Link 
                        to="/organizer/create-event"
                        className="dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <PlusCircle size={16} /> Create Event
                      </Link>
                      <Link 
                        to="/organizer/opportunities"
                        className="dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <TrendingUp size={16} /> Opportunities
                      </Link>
                      <Link 
                        to="/organizer/bids"
                        className="dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Gavel size={16} /> My Bids
                      </Link>
                      <Link 
                        to="/organizer/analytics"
                        className="dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <BarChart3 size={16} /> Analytics
                      </Link>
                    </>
                  )}

                  {user?.role === 'ADMIN' && (
                    <>
                      <Link 
                        to="/admin/approvals"
                        className="dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <CheckCircle size={16} /> Organizer Approvals
                      </Link>
                      <Link 
                        to="/admin/users"
                        className="dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Users size={16} /> Users & Organizers
                      </Link>
                      <Link 
                        to="/admin/events"
                        className="dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <CalendarDays size={16} /> All Events
                      </Link>
                      <Link 
                        to="/admin/requests"
                        className="dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Gavel size={16} /> Event Requests
                      </Link>
                      <Link 
                        to="/admin/analytics"
                        className="dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <BarChart3 size={16} /> Analytics
                      </Link>
                    </>
                  )}

                  <div className="dropdown-divider"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-button">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <Link 
              to="/" 
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home size={16} /> Home
            </Link>
            <Link 
              to="/events" 
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <CalendarDays size={16} /> Events
            </Link>

            {isAuthenticated ? (
              <>
                <Link 
                  to={getDashboardLink()}
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <Link 
                  to="/profile"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={16} /> Profile
                </Link>
                {user?.role === 'USER' && (
                  <>
                    <Link 
                      to="/user/bookings"
                      className="mobile-nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Ticket size={16} /> Bookings
                    </Link>
                    <Link 
                      to="/user/experiences"
                      className="mobile-nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Star size={16} /> Experiences
                    </Link>
                    <Link 
                      to="/event-requests"
                      className="mobile-nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Gavel size={16} /> Event Requests
                    </Link>
                  </>
                )}
                {user?.role === 'ORGANIZER' && (
                  <>
                    <Link 
                      to="/organizer/events"
                      className="mobile-nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ClipboardList size={16} /> My Events
                    </Link>
                    <Link 
                      to="/organizer/create-event"
                      className="mobile-nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <PlusCircle size={16} /> Create Event
                    </Link>
                    <Link 
                      to="/organizer/opportunities"
                      className="mobile-nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <TrendingUp size={16} /> Opportunities
                    </Link>
                    <Link 
                      to="/organizer/bids"
                      className="mobile-nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Gavel size={16} /> My Bids
                    </Link>
                    <Link 
                      to="/organizer/analytics"
                      className="mobile-nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BarChart3 size={16} /> Analytics
                    </Link>
                  </>
                )}
                {user?.role === 'ADMIN' && (
                  <>
                    <Link 
                      to="/admin/approvals"
                      className="mobile-nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <CheckCircle size={16} /> Approvals
                    </Link>
                    <Link 
                      to="/admin/users"
                      className="mobile-nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Users size={16} /> Users & Organizers
                    </Link>
                    <Link 
                      to="/admin/requests"
                      className="mobile-nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Gavel size={16} /> Event Requests
                    </Link>
                    <Link 
                      to="/admin/analytics"
                      className="mobile-nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BarChart3 size={16} /> Analytics
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="mobile-nav-link logout"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <KeyRound size={16} /> Login
                </Link>
                <Link 
                  to="/register"
                  className="mobile-nav-link primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <PenLine size={16} /> Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
