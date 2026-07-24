import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { eventRequestAPI, eventBidAPI } from "../../services/api";
import {
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Gavel,
  Filter,
  Building,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";
import "./Auctions.css";

export default function OrganizerOpportunities() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [demandFilter, setDemandFilter] = useState("");
  const [bidCounts, setBidCounts] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventRequestAPI.list();
      const allRequests = response.data.results || response.data || [];
      const openRequests = allRequests.filter(
        (r) => r.status === "OPEN" || r.status === "RECEIVING_BIDS"
      );
      setRequests(openRequests);

      const counts = {};
      for (const req of openRequests) {
        try {
          const bidRes = await eventBidAPI.forRequest(req.id);
          const bids = bidRes.data.results || bidRes.data || [];
          counts[req.id] = Array.isArray(bids) ? bids.length : 0;
        } catch {
          counts[req.id] = 0;
        }
      }
      setBidCounts(counts);
    } catch (err) {
      setError("Failed to load event requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getDemandBadgeClass = (demand) => {
    switch (demand?.toLowerCase()) {
      case "high":
        return "demand-high";
      case "medium":
        return "demand-medium";
      case "low":
        return "demand-low";
      default:
        return "";
    }
  };

  const categories = [
    ...new Set(requests.map((r) => r.category_name).filter(Boolean)),
  ];
  const locations = [
    ...new Set(requests.map((r) => r.preferred_location).filter(Boolean)),
  ];

  const filtered = requests.filter((r) => {
    const matchSearch =
      !searchTerm ||
      r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !categoryFilter || r.category_name === categoryFilter;
    const matchLocation = !locationFilter || r.preferred_location === locationFilter;
    const matchDemand = !demandFilter || r.demand_level === demandFilter;
    return matchSearch && matchCategory && matchLocation && matchDemand;
  });

  return (
    <div className="page-enter auctions-page">
      <div className="auctions-header">
        <h1>
          <Lightbulb size={28} />
          Open Opportunities
        </h1>
        <p>Browse high-demand event requests and submit your bids</p>
      </div>

      <div className="auctions-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={18} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">All Locations</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <select
            value={demandFilter}
            onChange={(e) => setDemandFilter(e.target.value)}
          >
            <option value="">All Demand Levels</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="auctions-loading">
          <div className="spinner" />
          <p>Loading opportunities...</p>
        </div>
      )}

      {error && (
        <div className="auctions-error">
          <AlertTriangle size={20} />
          <p>{error}</p>
          <button onClick={fetchRequests}>Retry</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="auctions-empty">
          <Lightbulb size={48} />
          <h3>No open opportunities found</h3>
          <p>Check back later for new event requests to bid on.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="auctions-grid">
          {filtered.map((request) => (
            <div key={request.id} className="auction-card">
              <div className="auction-card-header">
                <h3>{request.title}</h3>
                <span
                  className={`demand-badge ${getDemandBadgeClass(request.demand_level)}`}
                >
                  <TrendingUp size={14} />
                  {request.demand_level || "N/A"} Demand
                </span>
              </div>

              <p className="auction-card-description">
                {request.description?.length > 150
                  ? request.description.substring(0, 150) + "..."
                  : request.description}
              </p>

              <div className="auction-card-meta">
                <span className="meta-item">
                  <Users size={14} />
                  Posted by {request.user_username || "Unknown"}
                </span>
                <span className="meta-item">
                  <MapPin size={14} />
                  {request.preferred_location || "No location"}
                </span>
                <span className="meta-item">
                  <Calendar size={14} />
                  {request.preferred_date
                    ? new Date(request.preferred_date).toLocaleDateString()
                    : "TBD"}
                </span>
                <span className="meta-item">
                  <DollarSign size={14} />
                  {(request.budget_min || request.budget_max)
                    ? `$${Number(request.budget_min || 0).toLocaleString()} - $${Number(request.budget_max || 0).toLocaleString()}`
                    : "Budget TBD"}
                </span>
                <span className="meta-item">
                  <Users size={14} />
                  {request.expected_attendees
                    ? `${request.expected_attendees} attendees expected`
                    : "Attendees TBD"}
                </span>
              </div>

              <div className="auction-card-stats">
                <span className="stat">
                  <Gavel size={14} />
                  {bidCounts[request.id] || 0} bids
                </span>
                <span className="stat">
                  <Building size={14} />
                  {request.supports_count || 0} supporters
                </span>
              </div>

              <div className="auction-card-actions">
                <Link
                  to={`/event-requests/${request.id}`}
                  className="btn btn-secondary"
                >
                  View Details
                </Link>
                <Link
                  to={`/event-requests/${request.id}`}
                  className="btn btn-primary"
                >
                  <Gavel size={16} />
                  Submit Bid
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
