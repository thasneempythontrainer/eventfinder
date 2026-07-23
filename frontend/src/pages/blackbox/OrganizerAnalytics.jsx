import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventAPI } from '../../services/api';
import { BarChart3, Star, Users, TrendingUp, Calendar, Award, Activity, DollarSign, Ticket, AlertTriangle } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, DoughnutController, BarController } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './BlackBox.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, DoughnutController, BarController, ChartDataLabels);

function RatingChart({ avgRating }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const avg = Number(avgRating) || 0;
    chartRef.current = new ChartJS(canvasRef.current.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Avg Rating', 'Remaining'],
        datasets: [{
          data: [avg, 5 - avg],
          backgroundColor: [avg >= 4 ? '#22c55e' : avg >= 3 ? '#eab308' : '#ef4444', '#e5e7eb'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          datalabels: {
            color: '#333',
            font: { weight: 'bold', size: 22 },
            formatter: () => avg.toFixed(1),
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [avgRating]);

  return <canvas ref={canvasRef} />;
}

function BookingStatusChart({ confirmed, pending, cancelled }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new ChartJS(canvasRef.current.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Confirmed', 'Pending', 'Cancelled'],
        datasets: [{
          data: [confirmed, pending, cancelled],
          backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
          borderWidth: 0,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 12 } } },
          datalabels: {
            color: '#fff',
            font: { weight: 'bold', size: 13 },
            formatter: (value, ctx) => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              if (total === 0 || value === 0) return '';
              return Math.round((value / total) * 100) + '%';
            },
          },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [confirmed, pending, cancelled]);

  return <canvas ref={canvasRef} />;
}

function SentimentChart({ positive, neutral, negative }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new ChartJS(canvasRef.current.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [{
          data: [positive, neutral, negative],
          backgroundColor: ['#22c55e', '#9ca3af', '#ef4444'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 12 } } },
          datalabels: {
            color: '#fff',
            font: { weight: 'bold', size: 13 },
            formatter: (value, ctx) => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              if (total === 0 || value === 0) return '';
              return Math.round((value / total) * 100) + '%';
            },
          },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [positive, neutral, negative]);

  return <canvas ref={canvasRef} />;
}

function CategoryChart({ categories }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || categories.length === 0) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new ChartJS(canvasRef.current.getContext('2d'), {
      type: 'bar',
      data: {
        labels: categories.map((c) => c.category || 'Other'),
        datasets: [{
          label: 'Avg Rating',
          data: categories.map((c) => c.avg_rating || 0),
          backgroundColor: categories.map((_, i) => i === 0 ? '#e8622c' : `rgba(232, 98, 44, ${0.9 - i * 0.15})`),
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: {
            anchor: 'end',
            align: 'end',
            color: '#333',
            font: { weight: 'bold', size: 12 },
            formatter: (val) => Number(val).toFixed(1),
          },
        },
        scales: { y: { beginAtZero: true, max: 5 } },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [categories]);

  return <canvas ref={canvasRef} />;
}

export default function OrganizerAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await eventAPI.organizerAnalytics();
        setAnalytics(response.data);
      } catch (err) {
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="blackbox-page page-enter">
        <div className="loading-container">
          <div className="loading-spinner" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blackbox-page page-enter">
        <div className="report-container">
          <div className="error-message" style={{ maxWidth: 900, margin: '40px auto' }}>
            <AlertTriangle size={16} /> {error}
          </div>
        </div>
      </div>
    );
  }

  const totalEvents = analytics?.total_events || 0;
  const completedEvents = analytics?.completed_events || 0;
  const upcomingEvents = analytics?.upcoming_events || 0;
  const totalBookings = analytics?.total_bookings || 0;
  const confirmedBookings = analytics?.confirmed_bookings || 0;
  const cancelledBookings = analytics?.cancelled_bookings || 0;
  const pendingBookings = analytics?.pending_bookings || 0;
  const totalRevenue = analytics?.total_revenue || 0;
  const avgRating = analytics?.overall_avg_rating || 0;
  const successRate = analytics?.success_rate || 0;
  const sentiment = analytics?.overall_sentiment || { positive: 0, neutral: 0, negative: 0 };
  const categoryPerformance = analytics?.category_performance || [];

  if (totalEvents === 0) {
    return (
      <div className="blackbox-page page-enter">
        <div className="report-container">
          <div className="blackbox-header">
            <h1>Organizer Analytics</h1>
            <p>Performance insights for your events</p>
          </div>
          <div className="empty-state" style={{ maxWidth: 900, margin: '0 auto' }}>
            <BarChart3 size={48} style={{ color: '#e8622c', marginBottom: 16 }} />
            <h3>No Events Yet</h3>
            <p>Create your first event to see analytics here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blackbox-page page-enter">
      <div className="report-container">
        <div className="blackbox-header">
          <h1>Organizer Analytics</h1>
          <p>Performance insights for your events</p>
        </div>

        <div className="analytics-grid">
          <div className="analytics-stat-card">
            <Calendar size={24} className="stat-icon" />
            <span className="stat-number">{totalEvents}</span>
            <span className="stat-label">Total Events</span>
          </div>
          <div className="analytics-stat-card">
            <Ticket size={24} className="stat-icon" />
            <span className="stat-number">{confirmedBookings}</span>
            <span className="stat-label">Confirmed Bookings</span>
          </div>
          <div className="analytics-stat-card">
            <DollarSign size={24} className="stat-icon" />
            <span className="stat-number">{'\u20B9'}{Number(totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            <span className="stat-label">Total Revenue</span>
          </div>
          <div className="analytics-stat-card">
            <Star size={24} className="stat-icon" />
            <span className="stat-number">{Number(avgRating).toFixed(1)}</span>
            <span className="stat-label">Avg Rating</span>
          </div>
          <div className="analytics-stat-card">
            <TrendingUp size={24} className="stat-icon" />
            <span className="stat-number">{successRate}%</span>
            <span className="stat-label">Success Rate</span>
          </div>
          <div className="analytics-stat-card">
            <Activity size={24} className="stat-icon" />
            <span className="stat-number">{sentiment.positive}%</span>
            <span className="stat-label">Positive Sentiment</span>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="org-charts-grid">
          <div className="org-chart-card">
            <h3><Star size={18} /> Average Rating</h3>
            <div className="org-chart-wrap" style={{ height: '200px' }}>
              <RatingChart avgRating={avgRating} />
            </div>
          </div>
          <div className="org-chart-card">
            <h3><Ticket size={18} /> Booking Status</h3>
            <div className="org-chart-wrap">
              <BookingStatusChart confirmed={confirmedBookings} pending={pendingBookings} cancelled={cancelledBookings} />
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="org-charts-grid" style={{ marginTop: 20 }}>
          <div className="org-chart-card">
            <h3><Activity size={18} /> Sentiment Overview</h3>
            <div className="org-chart-wrap">
              <SentimentChart positive={sentiment.positive} neutral={sentiment.neutral} negative={sentiment.negative} />
            </div>
          </div>
          <div className="org-chart-card">
            <h3><TrendingUp size={18} /> Success Rate</h3>
            <div className="org-chart-wrap" style={{ height: '200px' }}>
              <RatingChart avgRating={successRate / 20} />
            </div>
          </div>
        </div>

        {categoryPerformance.length > 0 && (
          <div className="org-charts-grid" style={{ marginTop: 20 }}>
            <div className="org-chart-card" style={{ gridColumn: '1 / -1' }}>
              <h3><Award size={18} /> Category Performance</h3>
              <div className="org-chart-wrap" style={{ height: '280px' }}>
                <CategoryChart categories={categoryPerformance} />
              </div>
            </div>
          </div>
        )}

        {/* Event Overview */}
        <div className="report-card" style={{ maxWidth: 900, margin: '24px auto 0' }}>
          <h3 className="section-title"><BarChart3 size={18} /> Event Overview</h3>
          <div className="revenue-summary">
            <div className="revenue-item">
              <span>Total Events:</span>
              <strong>{totalEvents}</strong>
            </div>
            <div className="revenue-item">
              <span>Completed Events:</span>
              <strong>{completedEvents}</strong>
            </div>
            <div className="revenue-item">
              <span>Upcoming Events:</span>
              <strong>{upcomingEvents}</strong>
            </div>
            <div className="revenue-item">
              <span>Total Bookings:</span>
              <strong>{totalBookings}</strong>
            </div>
            <div className="revenue-item">
              <span>Confirmed Bookings:</span>
              <strong>{confirmedBookings}</strong>
            </div>
            <div className="revenue-item highlight">
              <span>Total Revenue:</span>
              <strong>{'\u20B9'}{Number(totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>
        </div>

        {/* Category Table */}
        {categoryPerformance.length > 0 && (
          <div className="report-card" style={{ maxWidth: 900, margin: '20px auto 0' }}>
            <h3 className="section-title"><Award size={18} /> Category Breakdown</h3>
            <table className="category-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Events</th>
                  <th>Bookings</th>
                  <th>Avg Rating</th>
                </tr>
              </thead>
              <tbody>
                {categoryPerformance.map((cat, idx) => (
                  <tr key={idx} className="category-row">
                    <td style={{ fontWeight: 600 }}>{cat.category}</td>
                    <td>{cat.event_count || 0}</td>
                    <td>{cat.booking_count || 0}</td>
                    <td>{Number(cat.avg_rating || 0).toFixed(1)} <Star size={12} fill="#e8622c" color="#e8622c" style={{ verticalAlign: 'middle', marginLeft: 2 }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
