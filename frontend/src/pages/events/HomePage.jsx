import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventAPI } from '../../services/api';
import { getEventImage } from '../../utils/eventImages';
import './Events.css';

const HomePage = () => {
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [topRatedEvents, setTopRatedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const [trending, topRated, upcoming] = await Promise.all([
        eventAPI.trending(),
        eventAPI.topRated(),
        eventAPI.upcoming(),
      ]);

      setTrendingEvents(trending.data.results || trending.data);
      setTopRatedEvents(topRated.data.results || topRated.data);
      setUpcomingEvents(upcoming.data.results || upcoming.data);
    } catch (err) {
      setError('Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><p>Loading events...</p></div>;
  }

  return (
    <div className="home-page page-enter">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Discover Amazing Events</h1>
          <p>Find and book the best events in your city</p>
          <Link to="/events" className="hero-button">
            Explore Events
          </Link>
        </div>
      </section>

      {/* Trending Events */}
      <section className="events-section">
        <div className="container">
          <h2>Trending Events</h2>
          <p className="section-subtitle">Events with the most bookings right now</p>
          
          {error && <div className="alert alert-danger">{error}</div>}

          {trendingEvents.length > 0 ? (
            <div className="events-grid stagger-children">
              {trendingEvents.slice(0, 6).map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="no-events">No trending events at the moment</p>
          )}

          <div className="view-all-link">
            <Link to="/events?sort=trending">View All Trending Events →</Link>
          </div>
        </div>
      </section>

      {/* Top Rated Events */}
      <section className="events-section bg-light">
        <div className="container">
          <h2>Top Rated</h2>
          <p className="section-subtitle">Highest rated events from our community</p>

          {topRatedEvents.length > 0 ? (
            <div className="events-grid stagger-children">
              {topRatedEvents.slice(0, 6).map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="no-events">No rated events yet</p>
          )}

          <div className="view-all-link">
            <Link to="/events?sort=rated">View All Top Rated Events →</Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="events-section">
        <div className="container">
          <h2>Upcoming Events</h2>
          <p className="section-subtitle">Events happening soon</p>

          {upcomingEvents.length > 0 ? (
            <div className="events-grid stagger-children">
              {upcomingEvents.slice(0, 6).map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="no-events">No upcoming events</p>
          )}

          <div className="view-all-link">
            <Link to="/events">View All Upcoming Events →</Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Want to Organize Events?</h2>
          <p>Join our community of event organizers</p>
          <Link to="/register-organizer" className="cta-button">
            Get Started as Organizer
          </Link>
        </div>
      </section>
    </div>
  );
};

const EventCard = ({ event }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const image = getEventImage(event);

  return (
    <Link to={`/events/${event.id}`} className="event-card">
      <div className="event-image">
        <img src={image} alt={event.title} />
        {event.status === 'ONGOING' && <span className="badge badge-live">LIVE</span>}
        {event.status === 'COMPLETED' && <span className="badge badge-completed">COMPLETED</span>}
      </div>
      <div className="event-info">
        <div className="event-category">{event.category_name || 'Event'}</div>
        <h3>{event.title}</h3>
        <div className="event-meta">
          <span className="date">{formatDate(event.start_date)}</span>
          <span className="location">{event.city}</span>
        </div>
        <div className="event-footer">
          <span className="price">₹{event.ticket_price}</span>
          {event.average_rating > 0 && (
            <span className="rating">{event.average_rating.toFixed(1)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default HomePage;
