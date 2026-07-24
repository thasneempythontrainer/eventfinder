import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Pages - Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RegisterOrganizer from './pages/auth/RegisterOrganizer';

// Pages - Public
import HomePage from './pages/events/HomePage';
import EventList from './pages/events/EventList';
import EventDetail from './pages/events/EventDetail';

// Pages - Common
import Profile from './pages/common/Profile';
import PaymentReceipt from './pages/common/PaymentReceipt';
import PaymentFailed from './pages/common/PaymentFailed';

// Auction Pages
import EventRequestsList from './pages/auctions/EventRequestsList';
import CreateEventRequest from './pages/auctions/CreateEventRequest';
import EventRequestDetail from './pages/auctions/EventRequestDetail';
import OrganizerOpportunities from './pages/auctions/OrganizerOpportunities';
import OrganizerBids from './pages/auctions/OrganizerBids';

// Black Box Pages
import EventFeedbackForm from './pages/blackbox/EventFeedbackForm';
import BlackBoxReport from './pages/blackbox/BlackBoxReport';
import OrganizerAnalytics from './pages/blackbox/OrganizerAnalytics';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import UserBookings from './pages/user/Bookings';
import UserExperiences from './pages/user/Experiences';

// Organizer Pages
import OrganizerDashboard from './pages/organizer/Dashboard';
import OrganizerEvents from './pages/organizer/Events';
import CreateEvent from './pages/organizer/CreateEvent';
import EditEvent from './pages/organizer/EditEvent';
import EventAnalytics from './pages/organizer/EventAnalytics';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageEvents from './pages/admin/ManageEvents';
import OrganizerApprovals from './pages/admin/Approvals';
import PendingApproval from './pages/admin/PendingApproval';
import UsersList from './pages/admin/UsersList';
import UserDetail from './pages/admin/UserDetail';
import AdminRequests from './pages/admin/AdminRequests';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import ManageCategories from './pages/admin/ManageCategories';

// Components
import Navbar from './components/common/Navbar';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  // Gate unapproved organizers
  if (user?.role === 'ORGANIZER' && allowedRoles?.includes('ORGANIZER')) {
    const status = user?.organizer_profile?.approval_status;
    if (status && status !== 'APPROVED') {
      return <PendingApproval />;
    }
  }

  return <Outlet />;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app">
      <Navbar />
      <main className="app-main">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventList />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
          <Route path="/register-organizer" element={isAuthenticated ? <Navigate to="/" /> : <RegisterOrganizer />} />

          {/* User Routes */}
          <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/bookings" element={<UserBookings />} />
            <Route path="/user/experiences" element={<UserExperiences />} />
            <Route path="/user/create-request" element={<CreateEventRequest />} />
          </Route>

          {/* Organizer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ORGANIZER']} />}>
            <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
            <Route path="/organizer/events" element={<OrganizerEvents />} />
            <Route path="/organizer/create-event" element={<CreateEvent />} />
            <Route path="/organizer/events/:id/edit" element={<EditEvent />} />
            <Route path="/organizer/events/:id/analytics" element={<EventAnalytics />} />
            <Route path="/organizer/opportunities" element={<OrganizerOpportunities />} />
            <Route path="/organizer/bids" element={<OrganizerBids />} />
            <Route path="/organizer/analytics" element={<OrganizerAnalytics />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/approvals" element={<OrganizerApprovals />} />
            <Route path="/admin/events" element={<ManageEvents />} />
            <Route path="/admin/users" element={<UsersList />} />
            <Route path="/admin/users/:id" element={<UserDetail />} />
            <Route path="/admin/requests" element={<AdminRequests />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/categories" element={<ManageCategories />} />
          </Route>

          {/* Profile & Payment - accessible by all authenticated roles */}
          <Route element={<ProtectedRoute allowedRoles={['USER', 'ORGANIZER', 'ADMIN']} />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/payment/success" element={<PaymentReceipt />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />
          </Route>

          {/* Auction - accessible by all authenticated roles */}
          <Route element={<ProtectedRoute allowedRoles={['USER', 'ORGANIZER', 'ADMIN']} />}>
            <Route path="/event-requests" element={<EventRequestsList />} />
            <Route path="/event-requests/:id" element={<EventRequestDetail />} />
          </Route>

          {/* Black Box - accessible by all authenticated roles */}
          <Route element={<ProtectedRoute allowedRoles={['USER', 'ORGANIZER', 'ADMIN']} />}>
            <Route path="/events/:id/feedback" element={<EventFeedbackForm />} />
            <Route path="/events/:id/blackbox" element={<BlackBoxReport />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
