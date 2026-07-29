import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { participantRequestAPI } from "../../services/api";
import {
  Search, Filter, Users, Handshake, AlertTriangle, CheckCircle, XCircle, ExternalLink, Clock
} from "lucide-react";
import "../events/Events.css";

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await participantRequestAPI.list();
      setRequests(response.data.results || response.data || []);
    } catch (err) {
      setError("Failed to load participant requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to close this request?")) return;
    try {
      await participantRequestAPI.update(requestId, { status: "CLOSED" });
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "CLOSED" } : r))
      );
    } catch (err) {
      alert("Failed to close request.");
    }
  };

  const getStatusConfig = (status) => {
    switch (status?.toUpperCase()) {
      case "OPEN":
        return { icon: Clock, className: "status-open", label: "Open" };
      case "FULFILLED":
        return { icon: CheckCircle, className: "status-awarded", label: "Fulfilled" };
      case "CLOSED":
        return { icon: XCircle, className: "status-closed", label: "Closed" };
      default:
        return { icon: AlertTriangle, className: "", label: status };
    }
  };

  const filtered = requests.filter((r) => {
    const matchSearch =
      !searchTerm ||
      r.event_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="page-enter" style={{ padding: '40px 0' }}>
      <div className="container">
        <div style={{ marginBottom: '30px' }}>
          <h1><Handshake size={28} /> Manage Participant Requests</h1>
          <p>View and manage all participant requests in the system</p>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px', width: '100%' }}
              className="filter-input"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="FULFILLED">Fulfilled</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {loading && <div className="loading">Loading requests...</div>}

        {error && <div className="alert alert-danger">{error} <button onClick={fetchRequests} className="reset-button" style={{ marginLeft: '10px' }}>Retry</button></div>}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
            <AlertTriangle size={48} />
            <h3>No participant requests found</h3>
            <p>No requests match your current filters.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="admin-requests-table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Event</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Organizer</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Participants</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((request) => {
                  const statusConfig = getStatusConfig(request.status);
                  const StatusIcon = statusConfig.icon;
                  const progress = request.required_participants > 0
                    ? Math.round((request.current_participants / request.required_participants) * 100)
                    : 0;
                  return (
                    <tr key={request.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>
                        <Link to={`/participant-requests/${request.id}`} style={{ color: '#e8622c', textDecoration: 'none', fontWeight: 600 }}>
                          {request.event_title || 'Unknown Event'} <ExternalLink size={14} />
                        </Link>
                      </td>
                      <td style={{ padding: '12px' }}>{request.organizer_name || 'Unknown'}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: statusConfig.className === 'status-open' ? '#fff3e0' : statusConfig.className === 'status-awarded' ? '#e8f5e9' : '#fce4ec', color: statusConfig.className === 'status-open' ? '#e65100' : statusConfig.className === 'status-awarded' ? '#2e7d32' : '#c62828' }}>
                          <StatusIcon size={14} />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Users size={14} /> {request.current_participants}/{request.required_participants} ({progress}%)
                      </td>
                      <td style={{ padding: '12px' }}>
                        {request.status !== "CLOSED" && request.status !== "FULFILLED" && (
                          <button
                            style={{ padding: '6px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                            onClick={() => handleCloseRequest(request.id)}
                          >
                            <XCircle size={14} /> Close
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
    </div>
  );
}
