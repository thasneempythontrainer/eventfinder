import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { eventRequestAPI } from "../../services/api";
import {
  Search,
  Filter,
  TrendingUp,
  Users,
  MessageSquare,
  Gavel,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import "../events/Events.css";
import "../auctions/Auctions.css";

export default function AdminRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventRequestAPI.list();
      setRequests(response.data.results || response.data || []);
    } catch (err) {
      setError("Failed to load event requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to close this request?")) {
      return;
    }
    try {
      await eventRequestAPI.update(requestId, { status: "CLOSED" });
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "CLOSED" } : r))
      );
    } catch (err) {
      alert("Failed to close request. Please try again.");
    }
  };

  const getStatusConfig = (status) => {
    switch (status?.toUpperCase()) {
      case "OPEN":
        return { icon: CheckCircle, className: "status-open", label: "Open" };
      case "RECEIVING_BIDS":
        return {
          icon: Gavel,
          className: "status-receiving",
          label: "Receiving Bids",
        };
      case "CLOSED":
        return { icon: XCircle, className: "status-closed", label: "Closed" };
      case "AWARDED":
        return {
          icon: CheckCircle,
          className: "status-awarded",
          label: "Awarded",
        };
      default:
        return { icon: AlertTriangle, className: "", label: status };
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
    ...new Set(requests.map((r) => r.category).filter(Boolean)),
  ];

  const filtered = requests.filter((r) => {
    const matchSearch =
      !searchTerm ||
      r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    const matchCategory = !categoryFilter || r.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  return (
    <div className="page-enter auctions-page">
      <div className="auctions-header">
        <h1>
          <AlertTriangle size={28} />
          Manage Event Requests
        </h1>
        <p>View and manage all event requests in the system</p>
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="RECEIVING_BIDS">Receiving Bids</option>
            <option value="CLOSED">Closed</option>
            <option value="AWARDED">Awarded</option>
          </select>
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
        </div>
      </div>

      {loading && (
        <div className="auctions-loading">
          <div className="spinner" />
          <p>Loading requests...</p>
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
          <AlertTriangle size={48} />
          <h3>No event requests found</h3>
          <p>No requests match your current filters.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="admin-requests-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>User</th>
                <th>Status</th>
                <th>Demand</th>
                <th>Bids</th>
                <th>Supports</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((request) => {
                const statusConfig = getStatusConfig(request.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <tr key={request.id}>
                    <td className="request-title-cell">
                      <Link
                        to={`/event-requests/${request.id}`}
                        className="request-link"
                      >
                        {request.title}
                        <ExternalLink size={14} />
                      </Link>
                    </td>
                    <td>{request.user_username || "Unknown"}</td>
                    <td>
                      <span
                        className={`status-badge ${statusConfig.className}`}
                      >
                        <StatusIcon size={14} />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`demand-badge ${getDemandBadgeClass(request.demand_level)}`}
                      >
                        <TrendingUp size={14} />
                        {request.demand_level || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className="table-stat">
                        <Gavel size={14} />
                        {request.bids_count || 0}
                      </span>
                    </td>
                    <td>
                      <span className="table-stat">
                        <Users size={14} />
                        {request.supports_count || 0}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <Link
                        to={`/event-requests/${request.id}`}
                        className="btn btn-sm btn-secondary"
                      >
                        <ExternalLink size={14} />
                        View
                      </Link>
                      {request.status !== "CLOSED" &&
                        request.status !== "AWARDED" && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleCloseRequest(request.id)}
                          >
                            <XCircle size={14} />
                            Close
                          </button>
                        )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
