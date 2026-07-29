import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { eventAPI, categoryAPI } from '../../services/api';
import './Events.css';

const EventList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '-start_date');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchEvents();
    updateSearchParams();
  }, [searchQuery, selectedCategory, selectedCity, statusFilter, sortBy, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.list();
      // DRF may return a paginated response {count, next, previous, results}
      const data = response.data.results || response.data;
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        search: searchQuery,
        category: selectedCategory,
        ordering: sortBy,
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      };

      if (selectedCity) params.city = selectedCity;
      if (statusFilter) params.status = statusFilter;

      const response = await eventAPI.list(params);
      
      setEvents(response.data.results || response.data);
      setTotalCount(response.data.count || response.data.length);
    } catch (err) {
      setError('Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedCity) params.set('city', selectedCity);
    if (statusFilter) params.set('status', statusFilter);
    if (sortBy !== '-start_date') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage);
    setSearchParams(params);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCity('');
    setStatusFilter('');
    setSortBy('-start_date');
    setCurrentPage(1);
  };

  return (
    <div className="event-list-page page-enter">
      {/* Header */}
      <div className="list-header">
        <div className="container">
          <h1>Find Events</h1>
          <p>Discover and book events near you</p>
        </div>
      </div>

      <div className="container list-content">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h3>Filters</h3>
            {(searchQuery || selectedCategory || selectedCity || statusFilter) && (
              <button onClick={clearFilters} className="clear-filters">
                Clear All
              </button>
            )}
          </div>

          {/* Search */}
          <div className="filter-group">
            <label>Search Events</label>
            <input
              type="text"
              placeholder="Event name, keywords..."
              value={searchQuery}
              onChange={handleSearch}
              className="filter-input"
            />
          </div>

          {/* Category */}
          <div className="filter-group">
            <label>Category</label>
            <select 
              value={selectedCategory} 
              onChange={handleCategoryChange}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div className="filter-group">
            <label>City</label>
            <input
              type="text"
              placeholder="Enter city..."
              value={selectedCity}
              onChange={handleCityChange}
              className="filter-input"
            />
          </div>

          {/* Status */}
          <div className="filter-group">
            <label>Status</label>
            <select 
              value={statusFilter} 
              onChange={handleStatusChange}
              className="filter-select"
            >
              <option value="">All Events</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Sort */}
          <div className="filter-group">
            <label>Sort By</label>
            <select 
              value={sortBy} 
              onChange={handleSortChange}
              className="filter-select"
            >
              <option value="-start_date">Latest First</option>
              <option value="start_date">Earliest First</option>
              <option value="-average_rating">Top Rated</option>
              <option value="-bookings_count">Most Popular</option>
              <option value="ticket_price">Price: Low to High</option>
              <option value="-ticket_price">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* Main Content */}
        <main className="events-main">
          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <div className="loading">Loading events...</div>
          ) : events.length > 0 ? (
            <>
              <div className="results-header">
                <p>Found <strong>{totalCount}</strong> events</p>
              </div>

              <div className="events-grid stagger-children">
                {events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage + i - 2;
                    return pageNum <= totalPages ? (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? 'active' : ''}
                      >
                        {pageNum}
                      </button>
                    ) : null;
                  })}

                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    Last
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-events-found">
              <p>No events found matching your criteria</p>
              <button onClick={clearFilters} className="reset-button">
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>
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

  const images = event.gallery || event.images || [];

  return (
    <Link to={`/events/${event.id}`} className="event-card">
      <div className="event-image">
        {event.banner ? (
          <img src={event.banner} alt={event.title} />
        ) : images.length > 0 ? (
          <img src={images[0].image} alt={event.title} />
        ) : (
          <div className="event-image-placeholder">No Image</div>
        )}
        {event.is_fully_booked && event.status === 'UPCOMING' && <span className="badge badge-soldout">FULLY BOOKED</span>}
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

export default EventList;
