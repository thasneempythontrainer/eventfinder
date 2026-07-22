# EventFinder Frontend Setup Guide

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── auth/              # Authentication pages (Login, Register)
│   │   ├── user/              # User dashboard and pages
│   │   ├── organizer/         # Organizer dashboard and pages
│   │   ├── admin/             # Admin dashboard and pages
│   │   └── events/            # Events listing and details
│   ├── components/
│   │   ├── common/            # Reusable components (Navbar, ProtectedRoute)
│   │   └── chat/              # Chat components (WebSocket based)
│   ├── context/
│   │   └── AuthContext.jsx    # Authentication state management
│   ├── services/
│   │   └── api.js             # API service with axios interceptors
│   ├── hooks/                 # Custom React hooks
│   ├── utils/                 # Utility functions
│   ├── App.jsx                # Main app with routing
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── .env.local                 # Environment variables
├── package.json
└── vite.config.js
```

## Getting Started

### Installation

```bash
cd frontend
npm install
```

### Running Development Server

```bash
npm run dev
```

The app will be available at http://localhost:5173

### Building for Production

```bash
npm run build
npm run preview
```

## Environment Variables

Create a `.env.local` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
```

## Key Features Implementation

### 1. Authentication

**Files:**
- `src/context/AuthContext.jsx` - Auth state and methods
- `src/pages/auth/Login.jsx` - Login page
- `src/pages/auth/Register.jsx` - User registration
- `src/pages/auth/RegisterOrganizer.jsx` - Organizer registration

**Flow:**
1. User/Organizer registration with form validation
2. Login with email/password
3. JWT token stored in localStorage
4. Token auto-refresh on 401 response
5. Logout clears tokens and redirects to login

### 2. Event Management

**Pages to Implement:**
- `src/pages/events/HomePage.jsx` - Featured events and trending
- `src/pages/events/EventList.jsx` - Search, filter, pagination
- `src/pages/events/EventDetail.jsx` - Full event details with booking

**Features:**
- Search events by title, location, category
- Filter by status (upcoming, ongoing, completed)
- View event details with gallery
- Book tickets
- Rate and review after event

### 3. User Dashboard

**Pages:**
- `src/pages/user/Dashboard.jsx` - Overview with stats
- `src/pages/user/Bookings.jsx` - View and manage bookings
- `src/pages/user/Experiences.jsx` - Share and view experiences

**Displays:**
- Total bookings, upcoming events, past events
- Booking history with QR code tickets
- Posted experiences and reviews

### 4. Organizer Dashboard

**Pages:**
- `src/pages/organizer/Dashboard.jsx` - Stats overview
- `src/pages/organizer/Events.jsx` - List organizer's events
- `src/pages/organizer/CreateEvent.jsx` - Create new events
- `src/pages/organizer/EventAnalytics.jsx` - Event statistics

**Features:**
- Create and manage events
- View booking analytics
- Track revenue
- Manage event details and images

### 5. Admin Dashboard

**Pages:**
- `src/pages/admin/Dashboard.jsx` - Platform overview
- `src/pages/admin/OrganizerApprovals.jsx` - Review organizer applications
- `src/pages/admin/ManageEvents.jsx` - View and manage all events

**Features:**
- Platform statistics (events, bookings, revenue)
- Approve/reject organizer registrations
- Monitor events and bookings
- View government ID documents

### 6. Real-Time Chat with WebSockets

**Components:**
- `src/components/chat/ChatRoom.jsx` - Chat interface
- `src/hooks/useWebSocket.js` - WebSocket connection hook

**Implementation:**
```javascript
// Connect to chat room
const socket = new WebSocket(`ws://localhost:8000/ws/chat/${eventId}/`);

// Send message
socket.send(JSON.stringify({
  type: 'chat_message',
  message: 'Hello everyone!'
}));

// Receive message
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};
```

### 7. Experience Sharing

**Components:**
- `src/pages/events/EventExperiences.jsx` - View event experiences
- `src/components/ExperienceCard.jsx` - Single experience display

**Features:**
- Post experience with rating and photos
- Like and comment on experiences
- Upload multiple images
- View community reviews

### 8. Notifications

**Components:**
- `src/components/common/NotificationBell.jsx` - Notification dropdown

**Integration:**
- Fetch unread notifications count
- Display notification list
- Mark as read functionality
- Auto-refresh every minute

## Styling Approach

Using CSS Modules and vanilla CSS:
- `src/pages/auth/Auth.css` - Auth pages styling
- `src/components/common/Navbar.css` - Navigation styling
- `src/index.css` - Global styles

CSS Variables for theming:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #2ecc71;
  --danger-color: #e74c3c;
  --warning-color: #f39c12;
  --dark-bg: #2c3e50;
  --light-bg: #ecf0f1;
}
```

## Component Development Checklist

### Common Components
- [ ] Navbar with user menu and logout
- [ ] ProtectedRoute for role-based access
- [ ] Loading spinner
- [ ] Modal/Dialog component
- [ ] Pagination component
- [ ] Form components (TextField, Select, etc.)
- [ ] Notification bell with dropdown
- [ ] Avatar component

### Auth Pages
- [ ] Login form with validation
- [ ] User registration form
- [ ] Organizer registration with file upload
- [ ] Password reset (optional)
- [ ] Email verification (optional)

### User Pages
- [ ] Dashboard with stats
- [ ] Bookings list with filtering
- [ ] Booking detail with tickets
- [ ] Experience creation form
- [ ] Experience listing with filters
- [ ] Profile edit

### Organizer Pages
- [ ] Dashboard with event stats
- [ ] Events list with actions
- [ ] Create event form with image upload
- [ ] Edit event
- [ ] Event analytics with charts
- [ ] Bookings management

### Admin Pages
- [ ] Dashboard with platform stats
- [ ] Organizer applications list
- [ ] Organization details with ID document
- [ ] Approve/Reject buttons
- [ ] Events management table
- [ ] Users management

### Event Pages
- [ ] Events list with search/filter
- [ ] Event detail page
- [ ] Event gallery
- [ ] Booking form
- [ ] Event experiences section
- [ ] Chat room

### Chat Component
- [ ] WebSocket connection
- [ ] Message list with auto-scroll
- [ ] Message input and send
- [ ] Typing indicator
- [ ] User presence indicator
- [ ] Message timestamps

## Dependencies

```json
{
  "dependencies": {
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "react-router-dom": "^7.18.1",
    "axios": "^1.18.1",
    "chart.js": "^4.5.1",
    "react-chartjs-2": "^5.3.1",
    "leaflet": "^1.9.4",
    "react-leaflet": "^5.0.0",
    "bootstrap": "^5.3.8"
  }
}
```

## API Integration Examples

### Fetching Events
```javascript
import { eventAPI } from '../services/api';

const [events, setEvents] = useState([]);

useEffect(() => {
  eventAPI.list({ status: 'UPCOMING' })
    .then(res => setEvents(res.data))
    .catch(err => console.error(err));
}, []);
```

### Creating Booking
```javascript
import { bookingAPI } from '../services/api';

const handleBook = async (eventId, tickets) => {
  try {
    const response = await bookingAPI.create({
      event: eventId,
      number_of_tickets: tickets,
      total_price: event.ticket_price * tickets
    });
    // Show success message and redirect
  } catch (err) {
    // Show error message
  }
};
```

### WebSocket Chat
```javascript
import { useEffect, useRef, useState } from 'react';

const ChatRoom = ({ eventId }) => {
  const socket = useRef(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.current = new WebSocket(
      `ws://localhost:8000/ws/chat/${eventId}/`
    );

    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat_message') {
        setMessages(prev => [...prev, data]);
      }
    };

    return () => socket.current?.close();
  }, [eventId]);

  const sendMessage = (message) => {
    socket.current?.send(JSON.stringify({
      type: 'chat_message',
      message
    }));
  };

  return (
    <div className="chat-room">
      {/* Messages list */}
      {/* Message input */}
    </div>
  );
};
```

## Performance Optimization

1. **Code Splitting** - Use React.lazy() for route-based splitting
2. **Image Optimization** - Compress images before upload
3. **Pagination** - Implement for large lists
4. **Memoization** - Use React.memo() for expensive components
5. **Lazy Loading** - Infinite scroll or pagination for heavy lists
6. **Caching** - Cache API responses when appropriate

## Testing

### Running Tests
```bash
npm test
```

### Test Structure
```
src/
  components/
    __tests__/
  pages/
    __tests__/
  services/
    __tests__/
```

## Deployment

### Build
```bash
npm run build
```

### Deploy to Netlify/Vercel
1. Connect GitHub repository
2. Set environment variables
3. Deploy `dist/` folder
4. Configure redirects for React Router

## Common Issues & Troubleshooting

### CORS Error
- Ensure Django CORS is configured
- Check `CORS_ALLOW_ALL_ORIGINS` or specific origins

### WebSocket Connection Failed
- Verify WebSocket server is running
- Check browser console for errors
- Ensure environment variable is correct

### API Request Fails
- Check network tab in DevTools
- Verify JWT token is valid
- Check API response status and error message

### Lost Scroll Position
- Wrap routes with `<ScrollToTop>` component
- Or use `window.scrollTo(0, 0)` on route change

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit PR

## Support

For issues or questions about the frontend, please check:
- SETUP.md in root directory
- Backend API documentation at http://localhost:8000/api/docs
- Component documentation in individual files

---

Happy coding! 🚀
