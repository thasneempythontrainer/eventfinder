import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { eventBidAPI } from "../../services/api";
import {
  Gavel,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import "./Auctions.css";

export default function OrganizerBids() {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventBidAPI.myBids();
      setBids(response.data || response || []);
    } catch (err) {
      setError("Failed to load your bids. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return { icon: Clock, className: "status-pending", label: "Pending" };
      case "SELECTED":
        return {
          icon: CheckCircle,
          className: "status-selected",
          label: "Selected",
        };
      case "REJECTED":
        return {
          icon: XCircle,
          className: "status-rejected",
          label: "Rejected",
        };
      default:
        return { icon: Clock, className: "status-pending", label: status };
    }
  };

  return (
    <div className="page-enter auctions-page">
      <div className="auctions-header">
        <h1>
          <Gavel size={28} />
          My Bids
        </h1>
        <p>Track and manage your submitted bids</p>
      </div>

      {loading && (
        <div className="auctions-loading">
          <div className="spinner" />
          <p>Loading your bids...</p>
        </div>
      )}

      {error && (
        <div className="auctions-error">
          <XCircle size={20} />
          <p>{error}</p>
          <button onClick={fetchBids}>Retry</button>
        </div>
      )}

      {!loading && !error && bids.length === 0 && (
        <div className="auctions-empty">
          <Gavel size={48} />
          <h3>No bids submitted yet</h3>
          <p>Browse open opportunities and submit your first bid.</p>
          <Link to="/organizer/opportunities" className="btn btn-primary">
            View Opportunities
          </Link>
        </div>
      )}

      {!loading && !error && bids.length > 0 && (
        <div className="bids-list">
          {bids.map((bid) => {
            const statusConfig = getStatusConfig(bid.status);
            const StatusIcon = statusConfig.icon;
            return (
              <div key={bid.id} className="bid-card">
                <div className="bid-card-header">
                  <h3>{bid.request_title || bid.request?.title || "Event Request"}</h3>
                  <span className={`status-badge ${statusConfig.className}`}>
                    <StatusIcon size={14} />
                    {statusConfig.label}
                  </span>
                </div>

                <div className="bid-card-meta">
                  <span className="meta-item">
                    <Calendar size={14} />
                    Submitted{" "}
                    {bid.created_at
                      ? new Date(bid.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                  <span className="meta-item">
                    <Calendar size={14} />
                    Proposed Date:{" "}
                    {bid.proposed_date
                      ? new Date(bid.proposed_date).toLocaleDateString()
                      : "TBD"}
                  </span>
                  <span className="meta-item">
                    <MapPin size={14} />
                    {bid.venue_name || bid.venue || "Venue TBD"}
                  </span>
                  <span className="meta-item">
                    <DollarSign size={14} />
                    {bid.price
                      ? `$${Number(bid.price).toLocaleString()}`
                      : "Price TBD"}
                  </span>
                  <span className="meta-item">
                    <Users size={14} />
                    {bid.capacity
                      ? `${bid.capacity} capacity`
                      : "Capacity TBD"}
                  </span>
                </div>

                {bid.message && (
                  <p className="bid-card-message">
                    {bid.message.length > 200
                      ? bid.message.substring(0, 200) + "..."
                      : bid.message}
                  </p>
                )}

                <div className="bid-card-actions">
                  {bid.request_id && (
                    <Link
                      to={`/event-requests/${bid.request_id}`}
                      className="btn btn-secondary"
                    >
                      <ExternalLink size={14} />
                      View Request
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
