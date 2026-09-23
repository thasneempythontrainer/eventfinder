import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventAPI } from '../../services/api';
import { getEventImage } from '../../utils/eventImages';
import { Heart, MapPin, CalendarDays, Trash2 } from 'lucide-react';
import './Dashboard.css';
import '../events/Events.css';
import './Favorites.css';

const UserFavorites = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await eventAPI.myFavorites();
        setEvents(response.data.results || response.data);
      } catch (err) {
        setError('Failed to load favorites');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRemove = async (eventId) => {
    setRemovingId(eventId);
    try {
      await eventAPI.toggleFavorite(eventId);
      setEvents(prev => prev.filter(ev => ev.id !== eventId));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to remove from favorites');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return <div className="container"><p>Loading favorites...</p></div>;
  }

  return (
    <div className="dashboard-page favorites-page page-enter">
      <div className="dashboard-header">
        <div className="container">
          <h1>My Favorites</h1>
          <p>Events you've marked as favorites</p>
        </div>
      </div>

      {error && <div className="container alert alert-danger" style={{ marginTop: '20px' }}>{error}</div>}

      <div className="container favorites-content">
        {events.length > 0 ? (
          <>
            <p className="favorites-count">
              <strong>{events.length}</strong> saved event{events.length !== 1 ? 's' : ''}
            </p>
            <div className="events-grid stagger-children">
              {events.map(event => (
                <FavoriteCard
                  key={event.id}
                  event={event}
                  removing={removingId === event.id}
                  onRemove={() => handleRemove(event.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state-large">
            <Heart size={48} color="#ddd" style={{ marginBottom: '15px' }} />
            <p>No favorites yet</p>
            <p className="empty-hint">
              Tap the heart icon on any event to save it here for quick access.
            </p>
            <Link to="/events" className="cta-button">
              Browse Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const FavoriteCard = ({ event, removing, onRemove }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const image = getEventImage(event);

  return (
    <div className="favorite-card">
      <Link to={`/events/${event.id}`} className="favorite-card-link">
        <div className="event-image">
          <img src={image} alt={event.title} />
          {event.status === 'ONGOING' && <span className="badge badge-live">LIVE</span>}
          {event.status === 'COMPLETED' && <span className="badge badge-completed">COMPLETED</span>}
          {event.is_fully_booked && event.status === 'UPCOMING' && <span className="badge badge-soldout">FULLY BOOKED</span>}
        </div>
        <div className="event-info">
          <div className="event-category">{event.category_name || 'Event'}</div>
          <h3>{event.title}</h3>
          <div className="event-meta">
            <span className="date">
              <CalendarDays size={14} /> {formatDate(event.start_date)}
            </span>
            <span className="location">
              <MapPin size={14} /> {event.city}
            </span>
          </div>
          <div className="event-footer">
            <span className="price">₹{event.ticket_price}</span>
            {event.average_rating > 0 && (
              <span className="rating">{event.average_rating.toFixed(1)}</span>
            )}
          </div>
        </div>
      </Link>
      <button
        className="remove-favorite-btn"
        onClick={onRemove}
        disabled={removing}
        title="Remove from Favorites"
      >
        <Trash2 size={16} />
        {removing ? 'Removing...' : 'Remove'}
      </button>
    </div>
  );
};

export default UserFavorites;