import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) {
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh,
        });

        localStorage.setItem('access_token', response.data.access);
        api.defaults.headers.Authorization = `Bearer ${response.data.access}`;
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

        return api(originalRequest);
      } catch {
        // Refresh failed, redirect to login
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  registerOrganizer: (data) => {
    return api.post('/auth/register/organizer/', data);
  },
  login: (data) => api.post('/auth/login/', data),
  requestPasswordReset: (data) => api.post('/auth/password-reset/', data),
  confirmPasswordReset: (data) => api.post('/auth/password-reset/confirm/', data),
  getProfile: () => api.get('/users/me/'),
  updateProfile: (data) => api.put('/users/update_profile/', data),
  approveOrganizer: (userId) => api.post(`/users/${userId}/approve_organizer/`),
  rejectOrganizer: (userId) => api.post(`/users/${userId}/reject_organizer/`),
};

// Profile Edit Request APIs
export const profileEditAPI = {
  create: (data) => api.post('/profile-edit-requests/', data),
  myRequests: () => api.get('/profile-edit-requests/'),
  allRequests: (params = {}) => api.get('/profile-edit-requests/', { params }),
  approve: (id) => api.post(`/profile-edit-requests/${id}/approve/`),
  reject: (id, adminNotes = '') =>
    api.post(`/profile-edit-requests/${id}/reject/`, { admin_notes: adminNotes }),
};

// Admin User Management APIs
export const adminUserAPI = {
  list: (params = {}) => api.get('/users/all_users/', { params }),
  detail: (id) => api.get(`/users/${id}/user_detail/`),
  toggleActive: (id) => api.post(`/users/${id}/toggle_active/`),
};

// Event APIs
export const eventAPI = {
  list: (params = {}) => api.get('/events/', { params }),
  create: (data) => api.post('/events/', data),
  get: (id) => api.get(`/events/${id}/`),
  detail: (id) => api.get(`/events/${id}/`),
  update: (id, data) => api.patch(`/events/${id}/`, data),
  delete: (id) => api.delete(`/events/${id}/`),
  upcoming: () => api.get('/events/upcoming/'),
  ongoing: () => api.get('/events/ongoing/'),
  trending: () => api.get('/events/trending/'),
  topRated: () => api.get('/events/top_rated/'),
  nearby: (lat, lon) =>
    api.get('/events/nearby/', { params: { latitude: lat, longitude: lon } }),
  myEvents: () => api.get('/events/my_events/'),
  uploadImages: (id, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return api.post(`/events/${id}/upload_images/`, formData);
  },
  pendingApproval: () => api.get('/events/pending_approval/'),
  approveEvent: (id) => api.post(`/events/${id}/approve_event/`),
  rejectEvent: (id) => api.post(`/events/${id}/reject_event/`),
  toggleFavorite: (id) => api.post(`/events/${id}/toggle_favorite/`),
  myFavorites: () => api.get('/events/my_favorites/'),
  analytics: (id) => api.get(`/events/${id}/analytics/`),
  organizerAnalytics: () => api.get('/events/organizer_analytics/'),
  startEvent: (id) => api.post(`/events/${id}/start_event/`),
  endEvent: (id) => api.post(`/events/${id}/end_event/`),
  cancelEvent: (id) => api.post(`/events/${id}/cancel_event/`),
  postponeEvent: (id) => api.post(`/events/${id}/postpone_event/`),
  participantsPdf: (id) => api.get(`/events/${id}/participants_pdf/`, { responseType: 'blob' }),
  downloadCertificate: (id) => api.get(`/events/${id}/download_certificate/`, { responseType: 'blob' }),
};

// Booking APIs
export const bookingAPI = {
  list: (params = {}) => api.get('/bookings/', { params }),
  create: (data) => api.post('/bookings/', data),
  get: (id) => api.get(`/bookings/${id}/`),
  cancel: (id) => api.post(`/bookings/${id}/cancel/`),
  getTickets: (id) => api.get(`/bookings/${id}/tickets/`),
  downloadTickets: (id) => api.get(`/bookings/${id}/download_tickets/`, { responseType: 'blob' }),
  myBookings: () => api.get('/bookings/my_bookings/'),
  statistics: () => api.get('/bookings/statistics/'),
  createOrder: (data) => api.post('/bookings/create_order/', data),
  verifyPayment: (data) => api.post('/bookings/verify_payment/', data),
  confirm: (id) => api.post(`/bookings/${id}/confirm/`),
  reject: (id) => api.post(`/bookings/${id}/reject/`),
  eventBookings: (params = {}) => api.get('/bookings/event_bookings/', { params }),
};

// Waitlist APIs
export const waitlistAPI = {
  list: (params = {}) => api.get('/waitlist/', { params }),
  join: (eventId) => api.post('/waitlist/', { event: eventId }),
  leave: (id) => api.post(`/waitlist/${id}/leave/`),
  myWaitlist: () => api.get('/waitlist/my_waitlist/'),
};

// Chat APIs
export const chatAPI = {
  getRoom: (eventId) =>
    api.get('/chat-rooms/event_chat/', { params: { event_id: eventId } }),
  getMessages: (eventId) =>
    api.get(`/chat-rooms/${eventId}/messages/`),
  sendMessage: (eventId, data) =>
    api.post(`/chat-rooms/${eventId}/send_message/`, data),
  getMembers: (eventId) =>
    api.get(`/chat-rooms/${eventId}/members/`),
  joinRoom: (eventId) =>
    api.post(`/chat-rooms/${eventId}/join/`),
  leaveRoom: (eventId) =>
    api.post(`/chat-rooms/${eventId}/leave/`),
};

// Experience APIs
export const experienceAPI = {
  list: () => api.get('/experiences/'),
  create: (data) => api.post('/experiences/', data),
  get: (id) => api.get(`/experiences/${id}/`),
  getForEvent: (eventId) =>
    api.get('/experiences/event_experiences/', { params: { event_id: eventId } }),
  like: (id) => api.post(`/experiences/${id}/like/`),
  unlike: (id) => api.post(`/experiences/${id}/unlike/`),
  addComment: (id, data) =>
    api.post(`/experiences/${id}/add_comment/`, data),
  addImage: (id, file, caption = '') => {
    const formData = new FormData();
    formData.append('image', file);
    if (caption) formData.append('caption', caption);
    return api.post(`/experiences/${id}/add_image/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Notification APIs
export const notificationAPI = {
  list: () => api.get('/notifications/'),
  getUnread: () => api.get('/notifications/unread/'),
  getUnreadCount: () => api.get('/notifications/unread_count/'),
  markAsRead: (id) =>
    api.post(`/notifications/${id}/mark_as_read/`),
  markAllAsRead: () =>
    api.post('/notifications/mark_all_as_read/'),
  deleteOld: () =>
    api.delete('/notifications/delete_old/'),
};

// Dashboard APIs
export const dashboardAPI = {
  adminDashboard: () => api.get('/dashboard/admin/'),
  adminRevenueBreakdown: () =>
    api.get('/dashboard/admin/revenue_breakdown/'),
  adminRecentBookings: () =>
    api.get('/dashboard/admin/recent_bookings/'),
  adminPendingApprovals: () =>
    api.get('/dashboard/admin/pending_approvals/'),
  organizerDashboard: () =>
    api.get('/dashboard/organizer/'),
  organizerMyEvents: () =>
    api.get('/dashboard/organizer/my_events/'),
  organizerRecentBookings: () =>
    api.get('/dashboard/organizer/recent_bookings/'),
  userDashboard: () =>
    api.get('/dashboard/user/'),
  userUpcomingEvents: () =>
    api.get('/dashboard/user/upcoming_events/'),
  userPastEvents: () =>
    api.get('/dashboard/user/past_events/'),
  userMyBookings: () =>
    api.get('/dashboard/user/my_bookings/'),
};

// Category APIs
export const categoryAPI = {
  list: (params = {}) => api.get('/categories/', { params }),
  get: (id) => api.get(`/categories/${id}/`),
  create: (data) => api.post('/categories/', data),
  update: (id, data) => api.patch(`/categories/${id}/`, data),
  delete: (id) => api.delete(`/categories/${id}/`),
};

// Participant Request APIs
export const participantRequestAPI = {
  list: (params = {}) => api.get('/participant-requests/', { params }),
  create: (data) => api.post('/participant-requests/', data),
  get: (id) => api.get(`/participant-requests/${id}/`),
  update: (id, data) => api.patch(`/participant-requests/${id}/`, data),
  delete: (id) => api.delete(`/participant-requests/${id}/`),
};

// Participant Response APIs
export const participantResponseAPI = {
  list: (params = {}) => api.get('/participant-responses/', { params }),
  create: (data) => api.post('/participant-responses/', data),
  get: (id) => api.get(`/participant-responses/${id}/`),
  update: (id, data) => api.patch(`/participant-responses/${id}/`, data),
};

// Event Feedback APIs
export const eventFeedbackAPI = {
  list: (params = {}) => api.get('/event-feedbacks/', { params }),
  create: (data) => api.post('/event-feedbacks/', data),
  get: (id) => api.get(`/event-feedbacks/${id}/`),
  eventFeedbacks: (eventId) => api.get('/event-feedbacks/event_feedbacks/', { params: { event_id: eventId } }),
  myFeedbacks: () => api.get('/event-feedbacks/my_feedbacks/'),
  feedbackStats: (eventId) => api.get('/event-feedbacks/feedback_stats/', { params: { event_id: eventId } }),
};

// Black Box Report APIs
export const blackboxAPI = {
  list: (params = {}) => api.get('/blackbox-reports/', { params }),
  get: (id) => api.get(`/blackbox-reports/${id}/`),
  getForEvent: (eventId) => api.get(`/blackbox-reports/`, { params: { event: eventId } }),
  organizerReports: () => api.get('/blackbox-reports/organizer_reports/'),
  platformAnalytics: () => api.get('/blackbox-reports/platform_analytics/'),
  generateReport: (eventId) => api.post(`/blackbox-reports/${eventId}/generate_report/`),
};

export default api;
