import { Bell, Check, Clock, CheckCircle, XCircle, Calendar, PenLine, CalendarClock, CalendarX, Sparkles, KeyRound, ShieldAlert } from 'lucide-react';

export const getNotificationIcon = (type) => {
  switch (type) {
    // Event status
    case 'EVENT_POSTPONED': return <CalendarClock size={16} color="#f39c12" />;
    case 'EVENT_CANCELLED': return <CalendarX size={16} color="#e74c3c" />;
    case 'EVENT_APPROVED': return <CheckCircle size={16} color="#2ecc71" />;
    case 'EVENT_REJECTED': return <XCircle size={16} color="#e74c3c" />;
    case 'EVENT_UPDATE': return <Calendar size={16} color="#e8622c" />;
    case 'EVENT_CHANGE_APPROVED': return <CheckCircle size={16} color="#2ecc71" />;
    case 'EVENT_CHANGE_REJECTED': return <XCircle size={16} color="#e74c3c" />;
    case 'FULLY_BOOKED':
    case 'SEATS_AVAILABLE': return <Calendar size={16} color="#2ecc71" />;

    // Organizer
    case 'ORGANIZER_APPROVAL': return <CheckCircle size={16} color="#2ecc71" />;
    case 'ORGANIZER_REJECTED': return <XCircle size={16} color="#e74c3c" />;
    case 'ORGANIZER_APPLICATION_RECEIVED': return <Clock size={16} color="#f39c12" />;

    // Bookings
    case 'BOOKING_CONFIRMATION':
    case 'BOOKING_CONFIRMED': return <Check size={16} color="#3498db" />;
    case 'BOOKING_REJECTED':
    case 'BOOKING_CANCELLED': return <XCircle size={16} color="#e74c3c" />;
    case 'BOOKING_REMINDER': return <Clock size={16} color="#3498db" />;
    case 'WAITLIST_JOINED':
    case 'WAITLIST_ASSIGNED': return <Clock size={16} color="#9b59b6" />;
    case 'PAYMENT_SUCCESS': return <CheckCircle size={16} color="#2ecc71" />;
    case 'PAYMENT_FAILED': return <XCircle size={16} color="#e74c3c" />;

    // Profile
    case 'PROFILE_EDIT_REQUEST': return <PenLine size={16} color="#f39c12" />;
    case 'PROFILE_EDIT_APPROVED': return <CheckCircle size={16} color="#2ecc71" />;
    case 'PROFILE_EDIT_REJECTED': return <XCircle size={16} color="#e74c3c" />;

    // Account
    case 'WELCOME': return <Sparkles size={16} color="#2ecc71" />;
    case 'ACCOUNT_LOGIN': return <KeyRound size={16} color="#3498db" />;
    case 'PASSWORD_RESET_REQUESTED': return <KeyRound size={16} color="#f39c12" />;
    case 'PASSWORD_CHANGED': return <KeyRound size={16} color="#2ecc71" />;
    case 'ACCOUNT_ACTIVATED': return <CheckCircle size={16} color="#2ecc71" />;
    case 'ACCOUNT_DEACTIVATED': return <ShieldAlert size={16} color="#e74c3c" />;

    default: return <Bell size={16} color="#666" />;
  }
};

export const getNotificationLink = (n, role) => {
  // Admin review queues take priority over the generic event link, otherwise
  // a change-request alert would dump the admin on the event page instead.
  if (n.notification_type === 'EVENT_CHANGE_REQUESTED' && role === 'ADMIN') {
    return '/admin/event-change-requests';
  }
  if (n.notification_type === 'PROFILE_EDIT_REQUEST' && role === 'ADMIN') {
    return '/admin/profile-edit-requests';
  }
  if (['EVENT_CHANGE_APPROVED', 'EVENT_CHANGE_REJECTED'].includes(n.notification_type)) {
    return '/organizer/events';
  }
  // Postponements and cancellations are the reason an attendee opens the
  // bell, so send them straight to the event page either way.
  if (n.notification_type === 'EVENT_POSTPONED' || n.notification_type === 'EVENT_CANCELLED') {
    return n.related_event ? `/events/${n.related_event}` : '/events';
  }
  if (n.related_event) return `/events/${n.related_event}`;
  if (n.related_booking) return '/user/bookings';
  switch (n.notification_type) {
    case 'ORGANIZER_APPROVAL':
    case 'ORGANIZER_REJECTED':
      return role === 'ADMIN' ? '/admin/approvals' : '/organizer/dashboard';
    case 'ORGANIZER_APPLICATION_RECEIVED':
      return '/organizer/dashboard';
    case 'PROFILE_EDIT_REQUEST':
      return '/admin/profile-edit-requests';
    case 'PROFILE_EDIT_APPROVED':
    case 'PROFILE_EDIT_REJECTED':
    case 'WELCOME':
    case 'ACCOUNT_ACTIVATED':
    case 'ACCOUNT_DEACTIVATED':
    case 'ACCOUNT_LOGIN':
    case 'PASSWORD_RESET_REQUESTED':
    case 'PASSWORD_CHANGED':
      return '/profile';
    case 'EVENT_APPROVED':
    case 'EVENT_REJECTED':
    case 'EVENT_UPDATE':
      return '/events';
    case 'BOOKING_CONFIRMATION':
    case 'BOOKING_CONFIRMED':
    case 'BOOKING_REMINDER':
    case 'BOOKING_CANCELLED':
      return '/user/bookings';
    case 'PARTICIPANT_REQUEST_NEW':
    case 'PARTICIPANT_RESPONSE':
      return `/participant-requests/${n.related_event}`;
    case 'FULLY_BOOKED':
    case 'SEATS_AVAILABLE':
      return n.related_event ? `/events/${n.related_event}` : '/organizer/events';
    case 'EVENT_FEEDBACK_REMINDER':
      return role === 'USER' ? '/user/experiences' : '/user/dashboard';
    default:
      return role === 'ADMIN' ? '/admin/dashboard'
        : role === 'ORGANIZER' ? '/organizer/dashboard'
        : '/user/dashboard';
  }
};

export const formatNotificationTime = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const humanizeNotificationType = (type) =>
  (type || '').split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
