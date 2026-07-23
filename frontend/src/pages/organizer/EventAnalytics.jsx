import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { eventAPI } from '../../services/api';
import { BarChart3, Ticket, Users, DollarSign, Clock, TrendingUp, Banknote, CalendarDays } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, DoughnutController, BarController } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './Analytics.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, DoughnutController, BarController, ChartDataLabels);

function BookingChart({ confirmed, pending, cancelled }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Confirmed', 'Pending', 'Cancelled'],
        datasets: [{
          data: [confirmed, pending, cancelled],
          backgroundColor: ['#2ecc71', '#f39c12', '#e74c3c'],
          borderColor: ['#27ae60', '#e67e22', '#c0392b'],
          borderWidth: 2,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { size: 13, weight: '600' } },
          },
          datalabels: {
            color: '#fff',
            font: { weight: 'bold', size: 13 },
            formatter: (value, ctx) => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              if (total === 0 || value === 0) return '';
              return value;
            },
          },
        },
        cutout: '60%',
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [confirmed, pending, cancelled]);

  return <canvas ref={canvasRef} />;
}

function TicketChart({ sold, available, totalSeats }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: ['Sold', 'Available'],
        datasets: [{
          label: 'Tickets',
          data: [sold, available],
          backgroundColor: ['#e8622c', '#e0e0e0'],
          borderRadius: 6,
          barThickness: 50,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          datalabels: {
            anchor: 'end',
            align: 'end',
            color: '#333',
            font: { weight: 'bold', size: 12 },
          },
        },
        scales: {
          x: { stacked: true, max: totalSeats || 1, grid: { display: false }, ticks: { font: { size: 12 } } },
          y: { stacked: true, grid: { display: false }, ticks: { display: false } },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [sold, available, totalSeats]);

  return <canvas ref={canvasRef} />;
}

function OccupancyChart({ occupancyRate }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Occupied', 'Remaining'],
        datasets: [{
          data: [occupancyRate, 100 - occupancyRate],
          backgroundColor: ['#e8622c', '#f0f0f0'],
          borderWidth: 0,
          hoverOffset: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false }, datalabels: { display: false } },
        cutout: '75%',
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [occupancyRate]);

  return <canvas ref={canvasRef} />;
}

const EventAnalytics = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchEventData();
    }
  }, [id]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const [eventRes, analyticsRes] = await Promise.all([
        eventAPI.get(id),
        eventAPI.analytics(id),
      ]);
      setEvent(eventRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      setError('Failed to load event analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <div className="container">
            <h1><BarChart3 size={28} /> Event Analytics</h1>
          </div>
        </div>
        <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <div className="container">
            <h1><BarChart3 size={28} /> Event Analytics</h1>
          </div>
        </div>
        <div className="container" style={{ padding: '40px 20px' }}>
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    );
  }

  const bookingStats = analytics?.booking_stats || {};
  const revenueStats = analytics?.revenue_stats || {};
  const ticketStats = analytics?.ticket_stats || {};
  const occupancyRate = ticketStats.occupancy_rate || 0;
  const soldTickets = ticketStats.sold || 0;
  const totalSeats = ticketStats.total_seats || event?.total_seats || 0;
  const availableSeats = ticketStats.available_seats || event?.available_seats || 0;

  const confirmed = bookingStats.confirmed || 0;
  const pending = bookingStats.pending || 0;
  const cancelled = bookingStats.cancelled || 0;
  const totalBookings = bookingStats.total || 0;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div className="container">
          <h1><BarChart3 size={28} /> Event Analytics</h1>
          <p>{event?.title}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 20px' }}>
        {/* Key Metrics */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon"><Ticket size={24} /></div>
            <div className="metric-content">
              <p className="metric-label">Total Bookings</p>
              <p className="metric-value">{totalBookings}</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon"><Users size={24} /></div>
            <div className="metric-content">
              <p className="metric-label">Occupancy Rate</p>
              <p className="metric-value">{occupancyRate}%</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon"><DollarSign size={24} /></div>
            <div className="metric-content">
              <p className="metric-label">Total Revenue</p>
              <p className="metric-value">{'\u20B9'}{(revenueStats.total || 0).toFixed(2)}</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon"><Clock size={24} /></div>
            <div className="metric-content">
              <p className="metric-label">Available Tickets</p>
              <p className="metric-value">{availableSeats}</p>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="charts-section">
          <div className="chart-card">
            <h3><TrendingUp size={18} /> Booking Status</h3>
            <div className="chart-container">
              {totalBookings > 0 ? (
                <BookingChart confirmed={confirmed} pending={pending} cancelled={cancelled} />
              ) : (
                <div className="chart-placeholder">No bookings yet</div>
              )}
            </div>
          </div>

          <div className="chart-card">
            <h3><Ticket size={18} /> Ticket Sales</h3>
            <div className="chart-container">
              {totalSeats > 0 ? (
                <TicketChart sold={soldTickets} available={availableSeats} totalSeats={totalSeats} />
              ) : (
                <div className="chart-placeholder">No seat data</div>
              )}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="charts-section">
          <div className="chart-card">
            <h3><Users size={18} /> Occupancy</h3>
            <div className="chart-container" style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              {totalSeats > 0 ? (
                <>
                  <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                    <OccupancyChart occupancyRate={occupancyRate} />
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                    }}>
                      <span style={{ fontSize: '28px', fontWeight: '700', color: '#e8622c' }}>{occupancyRate}%</span>
                      <br />
                      <span style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', fontWeight: '600' }}>Occupied</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
                    <span style={{ color: '#666' }}><strong style={{ color: '#e8622c' }}>{soldTickets}</strong> sold</span>
                    <span style={{ color: '#666' }}><strong style={{ color: '#999' }}>{availableSeats}</strong> available</span>
                    <span style={{ color: '#666' }}><strong>{totalSeats}</strong> total</span>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', color: '#999', fontSize: '14px' }}>No seat data</div>
              )}
            </div>
          </div>

          <div className="chart-card">
            <h3><Banknote size={18} /> Revenue Breakdown</h3>
            <div className="revenue-summary">
              <div className="revenue-item">
                <span>Ticket Price</span>
                <strong>{'\u20B9'}{event?.ticket_price || 0}</strong>
              </div>
              <div className="revenue-item">
                <span>Tickets Sold</span>
                <strong>{soldTickets} / {totalSeats}</strong>
              </div>
              <div className="revenue-item">
                <span>Avg per Booking</span>
                <strong>{'\u20B9'}{(revenueStats.average_per_booking || 0).toFixed(2)}</strong>
              </div>
              <div className="revenue-item highlight">
                <span>Total Revenue</span>
                <strong>{'\u20B9'}{(revenueStats.total || 0).toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="event-details-section">
          <h3><CalendarDays size={18} /> Event Details</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className={`status-badge ${event?.status?.toLowerCase()}`}>
                {event?.status}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Start Date:</span>
              <span>
                {event?.start_date ? new Date(event.start_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">End Date:</span>
              <span>
                {event?.end_date ? new Date(event.end_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Location:</span>
              <span>{event?.city}, {event?.venue}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventAnalytics;
