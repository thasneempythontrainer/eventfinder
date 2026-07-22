import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import OrganizerApprovals from './pages/admin/Approvals';
import ManageEvents from './pages/admin/ManageEvents';
import PendingApproval from './pages/admin/PendingApproval';

// Components
import Navbar from './components/common/Navbar';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
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
  
  return children;
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
          <Route
            path="/user/*"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <Routes>
                  <Route path="dashboard" element={<UserDashboard />} />
                  <Route path="bookings" element={<UserBookings />} />
                  <Route path="experiences" element={<UserExperiences />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Organizer Routes */}
          <Route
            path="/organizer/*"
            element={
              <ProtectedRoute allowedRoles={['ORGANIZER']}>
                <Routes>
                  <Route path="dashboard" element={<OrganizerDashboard />} />
                  <Route path="events" element={<OrganizerEvents />} />
                  <Route path="create-event" element={<CreateEvent />} />
                  <Route path="events/:id/edit" element={<EditEvent />} />
                  <Route path="events/:id/analytics" element={<EventAnalytics />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="approvals" element={<ManageEvents />} />
                  <Route path="events" element={<ManageEvents />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
