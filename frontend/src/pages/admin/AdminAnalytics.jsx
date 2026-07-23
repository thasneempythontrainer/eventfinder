import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { blackboxAPI } from '../../services/api';
import { BarChart3, Star, Users, TrendingUp, Target, AlertTriangle, Award, Activity, Calendar, Ticket, DollarSign, FileText, CheckCircle } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, DoughnutController, BarController } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import '../events/Events.css';
import '../blackbox/BlackBox.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, DoughnutController, BarController, ChartDataLabels);

function ChartDoughnut({ labels, data, colors, cutout }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new ChartJS(canvasRef.current.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: cutout || '60%',
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
  }, [labels, data, colors, cutout]);

  return <canvas ref={canvasRef} />;
}

function ChartBar({ labels, data, colors, horizontal }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new ChartJS(canvasRef.current.getContext('2d'), {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Count', data, backgroundColor: colors || '#e8622c', borderRadius: 6 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: horizontal ? 'y' : 'x',
        plugins: {
          legend: { display: false },
          datalabels: {
            anchor: 'end',
            align: 'end',
            color: '#333',
            font: { weight: 'bold', size: 12 },
          },
        },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [labels, data, colors, horizontal]);

  return <canvas ref={canvasRef} />;
}

export default function AdminAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await blackboxAPI.platformAnalytics();
        const data = response.data?.data || response.data;
        setAnalytics(data);
      } catch (err) {
        setError('Failed to load platform analytics.');
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
  const totalRevenue = analytics?.total_revenue || 0;
  const overallAvgRating = analytics?.overall_avg_rating || 0;
  const successRate = analytics?.success_rate || 0;

  const sentimentBreakdown = analytics?.overall_sentiment || { positive: 0, neutral: 0, negative: 0 };
  const sentimentPositive = sentimentBreakdown.positive || 0;
  const sentimentNeutral = sentimentBreakdown.neutral || 0;
  const sentimentNegative = sentimentBreakdown.negative || 0;

  const topSuccessFactors = analytics?.top_success_factors || [];
  const commonProblems = analytics?.common_problems || [];
  const categoryPerformance = analytics?.category_performance || [];

  const maxSuccessCount = topSuccessFactors.length > 0
    ? Math.max(...topSuccessFactors.map((f) => f.count || f.value || 0))
    : 1;

  const maxProblemCount = commonProblems.length > 0
    ? Math.max(...commonProblems.map((p) => p.count || p.value || 0))
    : 1;

  const bookingRate = totalEvents > 0 ? Math.round((confirmedBookings / totalEvents) * 100) : 0;
  const cancelRate = totalBookings > 0 ? Math.round(((analytics?.cancelled_bookings || 0) / totalBookings) * 100) : 0;
  const avgRevenuePerEvent = completedEvents > 0 ? Math.round(totalRevenue / completedEvents) : 0;
  const avgBookingsPerEvent = completedEvents > 0 ? Math.round(confirmedBookings / completedEvents) : 0;

  const cancelledBookings = analytics?.cancelled_bookings || 0;
  const pendingBookings = analytics?.pending_bookings || 0;

  const generateSummary = () => {
    const insights = [];

    if (totalEvents === 0) {
      insights.push({ type: 'info', text: 'No events have been created yet. Start by approving organizer registrations and published events.' });
      return insights;
    }

    if (overallAvgRating >= 4.0) {
      insights.push({ type: 'success', text: `Excellent platform quality! The average event rating is ${Number(overallAvgRating).toFixed(1)}/5, indicating high attendee satisfaction across events.` });
    } else if (overallAvgRating >= 3.0) {
      insights.push({ type: 'info', text: `The average event rating is ${Number(overallAvgRating).toFixed(1)}/5. There is room to improve event quality to reach 4.0+ ratings.` });
    } else if (overallAvgRating > 0) {
      insights.push({ type: 'warning', text: `The average event rating is low at ${Number(overallAvgRating).toFixed(1)}/5. Immediate attention is needed to improve event quality.` });
    }

    if (successRate >= 70) {
      insights.push({ type: 'success', text: `${successRate}% of events are performing successfully (rated 3.5+). The platform is delivering good outcomes.` });
    } else if (successRate >= 40) {
      insights.push({ type: 'info', text: `${successRate}% of events are performing successfully. Focus on supporting underperforming events to improve this metric.` });
    } else if (totalEvents > 0) {
      insights.push({ type: 'warning', text: `Only ${successRate}% of events are meeting success criteria. Review event planning processes and organizer support.` });
    }

    if (totalRevenue > 0) {
      insights.push({ type: 'info', text: `Total platform revenue is ${'\u20B9'}${Number(totalRevenue).toLocaleString('en-IN')} from ${confirmedBookings} confirmed bookings across ${completedEvents} completed events (avg ${'\u20B9'}${avgRevenuePerEvent.toLocaleString('en-IN')} per event).` });
    }

    if (cancelRate > 20) {
      insights.push({ type: 'warning', text: `${cancelRate}% of all bookings are being cancelled. Investigate common cancellation reasons and address them.` });
    } else if (cancelRate > 0) {
      insights.push({ type: 'info', text: `Booking cancellation rate is ${cancelRate}%, which is within an acceptable range.` });
    }

    if (sentimentPositive >= 60) {
      insights.push({ type: 'success', text: `Attendee sentiment is strong with ${sentimentPositive}% positive feedback. Users are enjoying the events on the platform.` });
    } else if (sentimentPositive >= 35) {
      insights.push({ type: 'info', text: `Positive sentiment stands at ${sentimentPositive}%. There is potential to improve attendee experience further.` });
    } else if (sentimentPositive > 0) {
      insights.push({ type: 'warning', text: `Positive sentiment is low at ${sentimentPositive}%. Attendee experience needs significant improvement.` });
    }

    if (topSuccessFactors.length > 0) {
      const topFactor = typeof topSuccessFactors[0] === 'object' ? topSuccessFactors[0].key : topSuccessFactors[0];
      insights.push({ type: 'success', text: `Top success factor across events: "${topFactor}". Leverage this strength in future event promotions and organizer guidelines.` });
    }

    if (commonProblems.length > 0) {
      const topProblem = typeof commonProblems[0] === 'object' ? commonProblems[0].key : commonProblems[0];
      insights.push({ type: 'warning', text: `Most reported problem: "${topProblem}". Address this issue to improve overall event quality and attendee satisfaction.` });
    }

    if (categoryPerformance.length > 0) {
      const topCat = categoryPerformance[0];
      const catName = typeof topCat === 'object' ? (topCat.category || 'Unknown') : topCat;
      const catRating = typeof topCat === 'object' ? (topCat.avg_rating || 0) : 0;
      insights.push({ type: 'info', text: `Top performing category: "${catName}" with an average rating of ${Number(catRating).toFixed(1)}/5. Consider promoting similar events.` });
    }

    if (upcomingEvents > 0) {
      insights.push({ type: 'info', text: `${upcomingEvents} upcoming event${upcomingEvents > 1 ? 's' : ''} on the horizon with ${avgBookingsPerEvent} avg bookings per event. Monitor booking trends as event dates approach.` });
    }

    return insights;
  };

  const summaryInsights = generateSummary();

  return (
    <div className="blackbox-page page-enter">
      <div className="report-container">
        <div className="blackbox-header">
          <h1>Platform Analytics</h1>
          <p>Insights across all events, bookings, and feedback</p>
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
            <span className="stat-number">{Number(overallAvgRating).toFixed(1)}</span>
            <span className="stat-label">Avg Rating</span>
          </div>
          <div className="analytics-stat-card">
            <TrendingUp size={24} className="stat-icon" />
            <span className="stat-number">{successRate}%</span>
            <span className="stat-label">Success Rate</span>
          </div>
          <div className="analytics-stat-card">
            <Activity size={24} className="stat-icon" />
            <span className="stat-number">{sentimentPositive}%</span>
            <span className="stat-label">Positive Sentiment</span>
          </div>
        </div>

        {/* Chart Row 1 */}
        <div className="org-charts-grid">
          <div className="org-chart-card">
            <h3><Calendar size={18} /> Event Status</h3>
            <div className="org-chart-wrap">
              <ChartDoughnut
                labels={['Completed', 'Upcoming', 'Other']}
                data={[completedEvents, upcomingEvents, Math.max(0, totalEvents - completedEvents - upcomingEvents)]}
                colors={['#22c55e', '#3b82f6', '#94a3b8']}
              />
            </div>
          </div>
          <div className="org-chart-card">
            <h3><Ticket size={18} /> Booking Status</h3>
            <div className="org-chart-wrap">
              <ChartDoughnut
                labels={['Confirmed', 'Pending', 'Cancelled']}
                data={[confirmedBookings, pendingBookings, cancelledBookings]}
                colors={['#22c55e', '#f59e0b', '#ef4444']}
              />
            </div>
          </div>
        </div>

        {/* Chart Row 2 */}
        <div className="org-charts-grid" style={{ marginTop: 20 }}>
          <div className="org-chart-card">
            <h3><Activity size={18} /> Sentiment Overview</h3>
            <div className="org-chart-wrap">
              <ChartDoughnut
                labels={['Positive', 'Neutral', 'Negative']}
                data={[sentimentPositive, sentimentNeutral, sentimentNegative]}
                colors={['#22c55e', '#9ca3af', '#ef4444']}
                cutout="65%"
              />
            </div>
          </div>
          <div className="org-chart-card">
            <h3><TrendingUp size={18} /> Success vs Failure</h3>
            <div className="org-chart-wrap">
              <ChartDoughnut
                labels={['Successful Events', 'Below Threshold']}
                data={[successRate, Math.max(0, 100 - successRate)]}
                colors={['#e8622c', '#e5e7eb']}
                cutout="65%"
              />
            </div>
          </div>
        </div>

        {categoryPerformance.length > 0 && (
          <div className="org-charts-grid" style={{ marginTop: 20 }}>
            <div className="org-chart-card" style={{ gridColumn: '1 / -1' }}>
              <h3><Target size={18} /> Category Performance</h3>
              <div className="org-chart-wrap" style={{ height: '300px' }}>
                <ChartBar
                  labels={categoryPerformance.map((c) => typeof c === 'string' ? c : c.category || c.name || '')}
                  data={categoryPerformance.map((c) => typeof c === 'object' ? (c.avg_rating || 0) : 0)}
                  colors={categoryPerformance.map((_, i) => i === 0 ? '#e8622c' : `rgba(232, 98, 44, ${0.9 - i * 0.15})`)}
                />
              </div>
            </div>
          </div>
        )}

        {topSuccessFactors.length > 0 && (
          <div className="org-charts-grid" style={{ marginTop: 20 }}>
            <div className="org-chart-card" style={{ gridColumn: '1 / -1' }}>
              <h3><Award size={18} /> Top Success Factors</h3>
              <div className="org-chart-wrap" style={{ height: '260px' }}>
                <ChartBar
                  horizontal
                  labels={topSuccessFactors.map((f) => typeof f === 'string' ? f : f.key || f.name || f.label || '')}
                  data={topSuccessFactors.map((f) => typeof f === 'object' ? (f.count || f.value || 0) : 0)}
                  colors="#22c55e"
                />
              </div>
            </div>
          </div>
        )}

        {commonProblems.length > 0 && (
          <div className="org-charts-grid" style={{ marginTop: 20 }}>
            <div className="org-chart-card" style={{ gridColumn: '1 / -1' }}>
              <h3><AlertTriangle size={18} /> Common Problems</h3>
              <div className="org-chart-wrap" style={{ height: '260px' }}>
                <ChartBar
                  horizontal
                  labels={commonProblems.map((p) => typeof p === 'string' ? p : p.key || p.name || p.label || '')}
                  data={commonProblems.map((p) => typeof p === 'object' ? (p.count || p.value || 0) : 0)}
                  colors="#ef4444"
                />
              </div>
            </div>
          </div>
        )}

        <div className="report-card" style={{ marginTop: 20 }}>
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

        {summaryInsights.length > 0 && (
          <div className="report-card">
            <h3 className="section-title"><FileText size={18} /> Generated Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {summaryInsights.map((insight, idx) => {
                const iconMap = { success: CheckCircle, warning: AlertTriangle, info: Activity };
                const colorMap = { success: '#22c55e', warning: '#f59e0b', info: '#3b82f6' };
                const bgMap = { success: 'rgba(34,197,94,0.08)', warning: 'rgba(245,158,11,0.08)', info: 'rgba(59,130,246,0.08)' };
                const borderMap = { success: 'rgba(34,197,94,0.2)', warning: 'rgba(245,158,11,0.2)', info: 'rgba(59,130,246,0.2)' };
                const InsightIcon = iconMap[insight.type] || Activity;
                return (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    padding: '12px 14px', borderRadius: '8px',
                    background: bgMap[insight.type], border: `1px solid ${borderMap[insight.type]}`,
                  }}>
                    <InsightIcon size={16} style={{ color: colorMap[insight.type], marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', lineHeight: '1.5', color: '#1a1a1a' }}>{insight.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {categoryPerformance.length > 0 && (
          <div className="report-card">
            <h3 className="section-title"><Target size={18} /> Category Performance</h3>
            <table className="category-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Bookings</th>
                  <th>Avg Rating</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {categoryPerformance.map((cat, idx) => {
                  const name = typeof cat === 'string' ? cat : cat.category || cat.name || '';
                  const bookings = typeof cat === 'object' ? (cat.bookings || cat.events || cat.count || 0) : 0;
                  const avg = typeof cat === 'object' ? (cat.avg_rating || cat.averageRating || 0) : 0;
                  const barWidth = 5 > 0 ? (avg / 5) * 100 : 0;
                  return (
                    <tr key={idx} className="category-row">
                      <td style={{ fontWeight: 600 }}>{name}</td>
                      <td>{bookings}</td>
                      <td>{Number(avg).toFixed(1)} <Star size={12} fill="#e8622c" color="#e8622c" style={{ verticalAlign: 'middle', marginLeft: 2 }} /></td>
                      <td style={{ width: '40%' }}>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${barWidth}%` }} />
                        </div>
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
