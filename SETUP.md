# EventFinder - Complete Setup and Run Guide

## Project Overview

EventFinder is a full-stack Django + React web application for discovering, booking, and sharing event experiences. It features:

- **Three User Types**: User, Organizer (requires government ID verification), Admin
- **Event Management**: Create, manage, and track events
- **Ticket Booking**: Users can book tickets for events with QR code generation
- **Live Chat**: Real-time WebSocket-based chat for each event
- **Experience Sharing**: Post-event photo sharing and community reviews
- **Notifications**: Email and SMS notifications for bookings and events
- **Dashboards**: Role-based dashboards for users, organizers, and admins

## Prerequisites

### System Requirements
- Python 3.8+
- Node.js 14+
- MySQL 8.0+
- Redis 6.0+
- Git

### Installation

#### Step 1: Clone Repository
```bash
cd c:\Users\USER\Desktop\eventfinder
```

#### Step 2: Backend Setup

##### Virtual Environment
```bash
cd backend
python -m venv venv
# On Windows
venv\Scripts\activate
# On Linux/Mac
source venv/bin/activate
```

##### Install Dependencies
```bash
pip install -r requirements.txt
```

##### Database Setup
```bash
# Update database credentials in config/settings.py if needed
# Default: MySQL
# User: root
# Password: toor
# Database: eventfinder_db

# Create database (if using MySQL):
# mysql -u root -p
# CREATE DATABASE eventfinder_db;
# USE eventfinder_db;

# Run migrations
python manage.py migrate
```

##### Create Superuser
```bash
python manage.py createsuperuser
```

#### Step 3: Frontend Setup

```bash
cd frontend
npm install
```

## Configuration

### Backend Configuration

#### 1. Environment Variables
Create a `.env` file in `backend/` directory:

```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=eventfinder_db
DB_USER=root
DB_PASSWORD=toor
DB_HOST=localhost
DB_PORT=3306

# Email (Gmail SMTP)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Redis
REDIS_URL=redis://127.0.0.1:6379

# JWT
JWT_ALGORITHM=HS256
```

#### 2. Running Services

**Start Redis Server** (required for WebSocket and Celery):
```bash
# Windows - If installed via chocolatey or scoop
redis-server

# Or download and extract Redis, then run:
redis-server.exe
```

**Start Django Development Server**:
```bash
cd backend
python manage.py runserver
```

**Start Celery Worker** (for async tasks):
```bash
# In a new terminal, from backend directory
celery -A config worker -l info
```

**Start Celery Beat** (for scheduled tasks - optional):
```bash
# In another new terminal, from backend directory
celery -A config beat -l info
```

### Frontend Configuration

#### 1. API Configuration
Create/update `frontend/src/config/api.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export default API_BASE_URL;
```

#### 2. WebSocket Configuration
Create `frontend/src/config/websocket.js`:

```javascript
export const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';
```

#### 3. Running Frontend Development Server
```bash
cd frontend
npm run dev
```

Frontend will be available at: http://localhost:5173

## API Documentation

### Authentication Endpoints

**Register User**
```
POST /api/auth/register/
Content-Type: application/json

{
  "username": "username",
  "email": "user@example.com",
  "password": "password123",
  "phone_number": "+1234567890",
  "first_name": "First",
  "last_name": "Last"
}
```

**Register Organizer**
```
POST /api/auth/register-organizer/
Content-Type: multipart/form-data

{
  "username": "organizer",
  "email": "organizer@example.com",
  "password": "password123",
  "phone_number": "+1234567890",
  "organization_name": "My Events Co",
  "government_id": <file>,
  "address": "123 Main St"
}
```

**Login**
```
POST /api/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "access": "jwt-token",
  "refresh": "refresh-token",
  "user": {...}
}
```

### Core Endpoints

#### Events
- `GET /api/events/` - List all events
- `POST /api/events/` - Create event (organizer only)
- `GET /api/events/{id}/` - Get event details
- `GET /api/events/upcoming/` - Get upcoming events
- `GET /api/events/trending/` - Get trending events
- `GET /api/events/nearby/?latitude=x&longitude=y` - Get nearby events

#### Bookings
- `GET /api/bookings/` - List user's bookings
- `POST /api/bookings/` - Create booking
- `GET /api/bookings/{id}/` - Get booking details
- `POST /api/bookings/{id}/cancel/` - Cancel booking
- `GET /api/bookings/{id}/tickets/` - Get booking tickets

#### Chat
- `GET /api/chat-rooms/?event_id=x` - Get or create chat room
- `POST /api/chat-rooms/{event_id}/send_message/` - Send message
- `GET /api/chat-rooms/{event_id}/messages/` - Get messages
- `GET /api/chat-rooms/{event_id}/members/` - Get room members

#### Experiences
- `GET /api/experiences/` - List experiences
- `GET /api/experiences/event_experiences/?event_id=x` - Get event experiences
- `POST /api/experiences/` - Create experience (users who attended)
- `POST /api/experiences/{id}/like/` - Like experience
- `POST /api/experiences/{id}/unlike/` - Unlike experience
- `POST /api/experiences/{id}/add_comment/` - Add comment
- `POST /api/experiences/{id}/add_image/` - Add image to experience

#### Notifications
- `GET /api/notifications/` - List notifications
- `GET /api/notifications/unread/` - Get unread notifications
- `GET /api/notifications/unread_count/` - Get unread count
- `POST /api/notifications/{id}/mark_as_read/` - Mark as read
- `POST /api/notifications/mark_all_as_read/` - Mark all as read

#### Dashboards
- `GET /api/dashboard/admin/` - Admin dashboard
- `GET /api/dashboard/organizer/` - Organizer dashboard
- `GET /api/dashboard/user/` - User dashboard

## WebSocket Usage

### Chat WebSocket

**Connect**:
```javascript
const socket = new WebSocket('ws://localhost:8000/ws/chat/event-id/');

socket.onopen = function() {
  console.log('Connected');
};
```

**Send Message**:
```javascript
socket.send(JSON.stringify({
  type: 'chat_message',
  message: 'Hello everyone!'
}));
```

**Receive Message**:
```javascript
socket.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log(data.message, 'from', data.username);
};
```

## Running the Full Application

### Terminal 1: Redis
```bash
redis-server
```

### Terminal 2: Django Server
```bash
cd backend
python manage.py runserver
```

### Terminal 3: Celery Worker
```bash
cd backend
celery -A config worker -l info
```

### Terminal 4: Frontend
```bash
cd frontend
npm run dev
```

Visit http://localhost:5173 to access the application

## Admin Panel

Access Django admin at: http://localhost:8000/admin/

Features available:
- Manage events, categories
- Approve/reject organizer registrations
- View and manage bookings
- Monitor notifications

## Database Models

### Accounts
- **User**: Custom user model with roles (USER, ORGANIZER, ADMIN)
- **OrganizerProfile**: Government ID verification and approval status

### Events
- **Event**: Event details, availability, pricing
- **Category**: Event categories
- **EventImage**: Event gallery images

### Bookings
- **Booking**: User ticket bookings
- **Ticket**: Individual tickets with QR codes

### Chat
- **ChatRoom**: Event-specific chat room
- **ChatMessage**: Individual messages
- **ChatRoomMember**: Track chat room participants

### Community
- **EventExperience**: Post-event reviews and experiences
- **ExperienceImage**: Photos for experiences
- **ExperienceLike**: Likes on experiences
- **ExperienceComment**: Comments on experiences

### Notifications
- **Notification**: Base notification model
- **EmailNotification**: Email notification details
- **SMSNotification**: SMS notification details

## Troubleshooting

### Redis Connection Error
- Ensure Redis server is running
- Check Redis configuration in settings.py
- Default: localhost:6379

### Database Connection Error
- Verify MySQL is running
- Check database credentials in settings.py
- Ensure database `eventfinder_db` exists

### WebSocket Connection Failed
- Ensure Channels is configured correctly
- Check ASGI application in settings.py
- Verify Redis is running

### Email/SMS Not Sending
- Check email credentials in .env file
- Verify Twilio credentials for SMS
- Check Celery worker is running
- Review email configuration in Django settings

### Frontend API Calls Failing
- Verify Django server is running on http://localhost:8000
- Check CORS settings in Django (currently allowing all origins)
- Verify JWT token is being sent in request headers

## Production Deployment

### Backend
1. Update SECRET_KEY in settings.py
2. Set DEBUG=False
3. Configure allowed hosts
4. Use PostgreSQL instead of MySQL (recommended)
5. Use Nginx for static files
6. Deploy with Gunicorn/uWSGI
7. Set up Redis and Celery

### Frontend
1. Build the production bundle:
```bash
npm run build
```
2. Deploy the `dist/` folder to your hosting

## Additional Notes

- Government ID files for organizers are stored in `media/government_ids/`
- Event banners and gallery images in `media/event_banners/` and `media/event_gallery/`
- QR codes generated automatically for tickets in `media/qrcodes/`
- Chat messages are stored in database via WebSocket connection
- Notifications are sent via Celery tasks asynchronously

## Support & Contributions

For issues or contributions, please contact the development team.

---

Happy event finding! 🎉
