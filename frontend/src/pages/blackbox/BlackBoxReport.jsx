import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { blackboxAPI } from '../../services/api';
import { Star, Users, TrendingUp, CheckCircle, AlertTriangle, Lightbulb, ArrowLeft, Download, BarChart3, Target, Award } from 'lucide-react';
import './BlackBox.css';

export default function BlackBoxReport() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await blackboxAPI.getForEvent(eventId);
        const data = response.data?.data || response.data;
        setReport(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setReport(null);
        } else {
          setError('Failed to load report.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [eventId]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const response = await blackboxAPI.generateReport(eventId);
      const data = response.data?.data || response.data;
      setReport(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="blackbox-page page-enter">
        <div className="loading-container">
          <div className="loading-spinner" />
          <span>Loading report...</span>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="blackbox-page page-enter">
        <div className="report-container">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>
          <div className="empty-state">
            <BarChart3 size={48} style={{ color: '#e8622c', marginBottom: 16 }} />
            <h3>No Report Found</h3>
            <p>Generate a Black Box report for this event.</p>
            {error && (
              <div className="error-message" style={{ justifyContent: 'center', marginBottom: 16 }}>
                <AlertTriangle size={16} /> {error}
              </div>
            )}
            <button className="btn-primary" onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <>
                  <div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2, marginBottom: 0 }} />
                  Generating...
                </>
              ) : (
                <>
                  <BarChart3 size={16} /> Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sentimentPositive = report.sentimentBreakdown?.positive || 0;
  const sentimentNeutral = report.sentimentBreakdown?.neutral || 0;
  const sentimentNegative = report.sentimentBreakdown?.negative || 0;

  const attendanceExpected = report.expectedAttendance || 0;
  const attendanceActual = report.actualAttendance || 0;
  const attendancePercent = attendanceExpected > 0
    ? Math.round((attendanceActual / attendanceExpected) * 100)
    : 0;

  return (
    <div className="blackbox-page page-enter">
      <div className="report-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="blackbox-header">
          <h1>Black Box Report</h1>
          <p>AI-powered analytics for event performance</p>
        </div>

        <div className="report-card">
          <h2 className="report-title">{report.eventTitle || report.eventName || 'Event Report'}</h2>
          <p className="report-subtitle">
            {report.eventDate && new Date(report.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            {report.category && ` &bull; ${report.category}`}
            {report.organizer && ` &bull; ${report.organizer}`}
          </p>
        </div>

        <div className="report-card">
          <h3 className="section-title"><Users size={18} /> Attendance</h3>
          <div className="attendance-grid">
            <div className="attendance-stat">
              <span className="stat-number">{attendanceExpected}</span>
              <span className="stat-label">Expected</span>
            </div>
            <div className="attendance-stat">
              <span className="stat-number">{attendanceActual}</span>
              <span className="stat-label">Actual</span>
            </div>
            <div className="attendance-stat">
              <span className="stat-number">{attendancePercent}%</span>
              <span className="stat-label">Attendance Rate</span>
            </div>
          </div>
          <div className="progress-bar" style={{ marginTop: 12 }}>
            <div className="progress-fill" style={{ width: `${Math.min(attendancePercent, 100)}%` }} />
          </div>
        </div>

        <div className="report-card">
          <h3 className="section-title"><Star size={18} /> Rating</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#e8622c' }}>
              {(report.averageRating || 0).toFixed(1)}
            </span>
            <div style={{ display: 'flex', gap: 2 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={22}
                  fill={s <= Math.round(report.averageRating || 0) ? '#e8622c' : 'none'}
                  color={s <= Math.round(report.averageRating || 0) ? '#e8622c' : '#d1d5db'}
                />
              ))}
            </div>
            <span style={{ color: '#666', fontSize: '0.9rem' }}>
              from {report.totalRatings || report.totalReviews || 0} reviews
            </span>
          </div>
        </div>

        <div className="report-card">
          <h3 className="section-title"><TrendingUp size={18} /> Sentiment Analysis</h3>
          <div className="sentiment-section">
            <div className="sentiment-bar">
              <div className="positive" style={{ width: `${sentimentPositive}%` }} />
              <div className="neutral" style={{ width: `${sentimentNeutral}%` }} />
              <div className="negative" style={{ width: `${sentimentNegative}%` }} />
            </div>
            <div className="sentiment-legend">
              <span><span className="dot green" /> Positive {sentimentPositive}%</span>
              <span><span className="dot gray" /> Neutral {sentimentNeutral}%</span>
              <span><span className="dot red" /> Negative {sentimentNegative}%</span>
            </div>
          </div>
        </div>

        {report.successFactors && report.successFactors.length > 0 && (
          <div className="report-card">
            <h3 className="section-title"><Award size={18} /> Success Factors</h3>
            <ul className="factor-list">
              {report.successFactors.map((factor, idx) => (
                <li key={idx} className="factor-item positive">
                  <CheckCircle size={18} className="factor-icon" />
                  <span>{typeof factor === 'string' ? factor : factor.text || factor.description || ''}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {report.problems && report.problems.length > 0 && (
          <div className="report-card">
            <h3 className="section-title"><AlertTriangle size={18} /> Problems Identified</h3>
            <ul className="factor-list">
              {report.problems.map((problem, idx) => (
                <li key={idx} className="factor-item negative">
                  <AlertTriangle size={18} className="factor-icon" />
                  <span>{typeof problem === 'string' ? problem : problem.text || problem.description || ''}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {report.recommendations && report.recommendations.length > 0 && (
          <div className="report-card">
            <h3 className="section-title"><Lightbulb size={18} /> Recommendations</h3>
            <div className="recommendations-section">
              {report.recommendations.map((rec, idx) => (
                <div key={idx} className="recommendation-item">
                  <span className="rec-number">{idx + 1}</span>
                  <span className="rec-text">{typeof rec === 'string' ? rec : rec.text || rec.description || ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
