# EventFinder - Complete Event Discovery & Booking Platform

A full-stack Django + React web application for discovering, booking, and sharing event experiences.

![Python](https://img.shields.io/badge/Python-3.8+-blue)
![Django](https://img.shields.io/badge/Django-6.0+-darkgreen)
![React](https://img.shields.io/badge/React-19+-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎯 Features

### Core Features
- **Event Discovery**: Browse upcoming, trending, and nearby events
- **Ticket Booking**: Secure booking system with QR code ticket generation
- **Three User Types**:
  - **Users**: Discover, book, and share event experiences
  - **Organizers**: Create and manage events (requires government ID verification)
  - **Admins**: Manage platform, approve organizers, view analytics
- **Real-Time Chat**: WebSocket-based live chat for each event
- **Experience Sharing**: Post-event photo galleries and community reviews
- **Notifications**: Email and SMS notifications for bookings and events
- **Role-Based Dashboards**: Customized dashboards for each user type

### Advanced Features
- **Geolocation Search**: Find events near you
- **Event Analytics**: Track bookings and revenue (organizers)
- **Platform Analytics**: Monitor key metrics (admins)
- **Rating & Reviews**: Community feedback system
- **Async Notifications**: Celery + Redis for reliable email/SMS delivery
- **JWT Authentication**: Secure API with token refresh

## 🏗️ Architecture

### Backend Stack
- **Framework**: Django 6.0 with Django REST Framework
- **Database**: MySQL 8.0
- **Real-Time**: Django Channels with Redis
- **Task Queue**: Celery + Redis
- **API Documentation**: DRF Spectacular (Swagger/OpenAPI)

### Frontend Stack
- **Framework**: React 19 with Vite
- **Routing**: React Router v7
- **HTTP Client**: Axios with interceptors
- **Charts**: Chart.js + react-chartjs-2
- **Maps**: Leaflet + react-leaflet
- **Styling**: CSS + Bootstrap 5

## 📋 Project Structure

```
eventfinder/
├── backend/
│   ├── accounts/          # User authentication & profiles
│   ├── events/            # Event management
│   ├── bookings/          # Ticket booking system
│   ├── chat/              # Real-time chat & WebSockets
│   ├── community/         # Experience sharing
│   ├── notifications_app/ # Email & SMS notifications
│   ├── dashboard/         # Analytics dashboards
│   ├── config/            # Django configuration
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React Context (Auth)
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utilities
│   ├── package.json
│   └── vite.config.js
├── SETUP.md               # Backend setup guide
├── FRONTEND_SETUP.md      # Frontend setup guide
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- MySQL 8.0+
- Redis 6.0+

### Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

Backend will run on http://localhost:8000

### Frontend Setup (3 minutes)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will run on http://localhost:5173

### Running Full Stack

**Terminal 1 - Redis**:
```bash
redis-server
```

**Terminal 2 - Django Server**:
```bash
cd backend
python manage.py runserver
```

**Terminal 3 - Celery Worker** (optional):
```bash
cd backend
celery -A config worker -l info
```

**Terminal 4 - React Development**:
```bash
cd frontend
npm run dev
```

Visit http://localhost:5173 to start using EventFinder!

## 📚 API Documentation

### Access Points
- **Swagger UI**: http://localhost:8000/api/docs
- **API Base URL**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin

### Key Endpoints

#### Authentication
```
POST   /api/auth/register/           - Register user
POST   /api/auth/register-organizer/ - Register organizer
POST   /api/auth/login/              - Login
POST   /api/auth/refresh/            - Refresh token
GET    /api/users/me/                - Get current user
```

#### Events
```
GET    /api/events/                  - List events
POST   /api/events/                  - Create event (organizer)
GET    /api/events/{id}/             - Event details
GET    /api/events/upcoming/         - Upcoming events
GET    /api/events/trending/         - Trending events
GET    /api/events/nearby/           - Nearby events
```

#### Bookings
```
POST   /api/bookings/                - Create booking
GET    /api/bookings/                - My bookings
GET    /api/bookings/{id}/           - Booking details
POST   /api/bookings/{id}/cancel/    - Cancel booking
GET    /api/bookings/{id}/tickets/   - Download tickets
```

#### Chat (WebSocket)
```
WS     ws://localhost:8000/ws/chat/{event_id}/
```

#### Experiences
```
GET    /api/experiences/             - List experiences
POST   /api/experiences/             - Create experience
POST   /api/experiences/{id}/like/   - Like experience
POST   /api/experiences/{id}/add_comment/ - Comment
```

#### Dashboards
```
GET    /api/dashboard/admin/         - Admin stats
GET    /api/dashboard/organizer/     - Organizer stats
GET    /api/dashboard/user/          - User stats
```

## 🔐 Authentication

### Login Flow
1. User enters email and password
2. Backend validates and returns JWT tokens (access + refresh)
3. Frontend stores tokens in localStorage
4. All API requests include `Authorization: Bearer {token}`
5. Tokens auto-refresh on expiry

### User Roles
- **USER**: Browse events, book tickets, share experiences
- **ORGANIZER**: Create/manage events, view analytics (needs approval)
- **ADMIN**: Manage platform, approve organizers, view all stats

## 💬 Real-Time Chat

### WebSocket Implementation
- **Technology**: Django Channels + Redis
- **Connection**: `ws://localhost:8000/ws/chat/{event_id}/`
- **Features**:
  - Live message broadcast
  - User join/leave notifications
  - Typing indicators
  - Message history persistence

### Chat Features
- Send text messages
- Upload file attachments
- See active participants
- Message timestamps
- Auto-reconnection on disconnect

## 📧 Notifications

### Types
- Booking confirmations
- Event reminders (24 hours before)
- Organizer approval/rejection
- New experience posted
- Chat notifications (optional)

### Channels
- **Email**: SMTP via Gmail
- **SMS**: Twilio integration

### Configuration
Set environment variables:
```env
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=app-password
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
```

## 📊 Database Models

### Accounts
- User (custom auth model with roles)
- OrganizerProfile (with government ID verification)

### Events
- Event
- Category
- EventImage

### Bookings
- Booking
- Ticket (with QR codes)

### Chat
- ChatRoom
- ChatMessage
- ChatRoomMember

### Community
- EventExperience
- ExperienceImage
- ExperienceLike
- ExperienceComment

### Notifications
- Notification
- EmailNotification
- SMSNotification

## 🛠️ Development Guide

### Adding New Features

1. **Backend**:
   - Add model in `app/models.py`
   - Create serializer in `app/serializers.py`
   - Create viewset in `app/views.py`
   - Register in `config/urls.py`

2. **Frontend**:
   - Add API method in `services/api.js`
   - Create page/component in `pages/` or `components/`
   - Add route in `App.jsx`
   - Style with CSS

### Code Style
- Backend: PEP 8 with 100-char line limit
- Frontend: ESLint with Prettier
- Commit messages: Conventional Commits

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Deployment

### Backend (Heroku/Railway)
```bash
# Set environment variables
# Deploy with Gunicorn
gunicorn config.wsgi --log-file -
```

### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy dist/ folder
```

## 🐛 Troubleshooting

### Database Connection Error
- Ensure MySQL is running
- Check credentials in `settings.py`
- Run migrations: `python manage.py migrate`

### WebSocket Connection Failed
- Verify Redis is running
- Check event ID in URL
- Review browser console for errors

### Email/SMS Not Sending
- Check Celery worker is running
- Verify credentials in .env
- Check Celery logs

### Frontend API Calls Failing
- Verify Django server is running
- Check CORS settings (currently allowing all)
- Ensure JWT token is valid

## 📝 Important Notes

- **Government ID Verification**: Required for organizer registration
- **Token Expiry**: Access tokens expire in 60 minutes, refresh tokens in 7 days
- **File Uploads**: Images limited to 5MB, documents to 10MB
- **QR Codes**: Automatically generated for each ticket
- **Chat History**: All messages stored in database

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details

## 👥 Team

- **Backend Development**: Django REST Framework, Channels, Celery
- **Frontend Development**: React, Vite, Axios
- **DevOps**: Docker, Redis, MySQL

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues, questions, or suggestions:
1. Check SETUP.md and FRONTEND_SETUP.md
2. Review API documentation at `/api/docs`
3. Check backend admin panel at `/admin`
4. Open an issue on GitHub

## 🎉 Getting Help

- **Backend Issues**: Check Django logs at `backend/`
- **Frontend Issues**: Check browser console (F12)
- **API Issues**: Use Swagger UI at `http://localhost:8000/api/docs`
- **Database Issues**: Use MySQL client to verify data

---

**Happy Event Finding! 🎪** 

Made with ❤️ for event enthusiasts
#   e v e n t f i n d e r  
 