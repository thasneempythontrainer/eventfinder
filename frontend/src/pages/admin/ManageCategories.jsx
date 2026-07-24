import { useState, useEffect, useRef, useCallback } from 'react';
import { categoryAPI } from '../../services/api';
import {
  PlusCircle, Pencil, Trash2, Save, X, XCircle, CheckCircle,
  Loader2, AlertTriangle,
  Music, Trophy, Monitor, UtensilsCrossed, Palette,
  Briefcase, Dumbbell, GraduationCap, Film, FlaskConical,
  Dog, Plane, Ticket, ShoppingBag, Landmark,
  Tag, Heart, Users, Globe, Mic, Camera, BookOpen, Gamepad2,
  MapPin, Star, Zap, TreePine, Coffee, Calendar, Theater,
} from 'lucide-react';
import '../user/Dashboard.css';

const ICON_MAP = {
  music_note: Music, music: Music,
  sports_soccer: Trophy, sports: Trophy,
  computer: Monitor, technology: Monitor,
  restaurant: UtensilsCrossed, food: UtensilsCrossed,
  palette: Palette, art: Palette,
  business_center: Briefcase, business: Briefcase,
  fitness_center: Dumbbell, fitness: Dumbbell,
  school: GraduationCap, education: GraduationCap,
  movie: Film, film: Film,
  science: FlaskConical, pets: Dog,
  flight: Plane, travel: Plane,
  local_activity: Ticket, activity: Ticket,
  store: ShoppingBag, shopping: ShoppingBag,
  church: Landmark, heart: Heart,
  community: Users, globe: Globe,
  music_mic: Mic, camera: Camera,
  book: BookOpen, gaming: Gamepad2,
  map: MapPin, star: Star,
  energy: Zap, nature: TreePine,
  coffee: Coffee, calendar: Calendar,
  theater: Theater,
};

const ICON_OPTIONS = [
  { key: 'music', label: 'Music' },
  { key: 'sports', label: 'Sports' },
  { key: 'technology', label: 'Technology' },
  { key: 'food', label: 'Food & Drink' },
  { key: 'art', label: 'Art & Culture' },
  { key: 'business', label: 'Business' },
  { key: 'fitness', label: 'Fitness' },
  { key: 'education', label: 'Education' },
  { key: 'film', label: 'Film & Movie' },
  { key: 'science', label: 'Science' },
  { key: 'pets', label: 'Pets' },
  { key: 'travel', label: 'Travel' },
  { key: 'activity', label: 'Activity' },
  { key: 'shopping', label: 'Shopping' },
  { key: 'community', label: 'Community' },
  { key: 'globe', label: 'Global' },
  { key: 'camera', label: 'Photography' },
  { key: 'book', label: 'Literature' },
  { key: 'gaming', label: 'Gaming' },
  { key: 'map', label: 'Location' },
  { key: 'star', label: 'Featured' },
  { key: 'energy', label: 'Energy' },
  { key: 'nature', label: 'Nature' },
  { key: 'coffee', label: 'Social' },
  { key: 'calendar', label: 'Events' },
  { key: 'theater', label: 'Theater' },
];

const getIconComponent = (iconKey) => {
  if (!iconKey) return null;
  return ICON_MAP[iconKey] || null;
};

const EMPTY_FORM = { name: '', description: '', icon: '' };

const Toast = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const bg = type === 'success' ? '#d4edda' : '#f8d7da';
  const color = type === 'success' ? '#155724' : '#721c24';
  const Icon = type === 'success' ? CheckCircle : XCircle;

  return (
    <div style={{
      padding: '12px 16px', background: bg, color,
      borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px',
      animation: 'toastIn 0.3s ease-out', fontSize: '14px', fontWeight: '500',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      <Icon size={18} />
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color, padding: '4px', display: 'flex', borderRadius: '4px',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

const Spinner = ({ size = 18 }) => (
  <Loader2 size={size} style={{ animation: 'spin 0.8s linear infinite' }} />
);

const SkeletonRow = () => (
  <tr style={{ borderBottom: '1px solid #eee' }}>
    {[160, 48, 180, 50, 90, 120].map((w, i) => (
      <td key={i} style={{ padding: '12px' }}>
        <div style={{
          height: i === 1 ? '40px' : '16px', width: `${w}px`,
          borderRadius: i === 1 ? '10px' : '4px',
          background: '#eee', animation: 'shimmer 1.5s infinite',
        }} />
      </td>
    ))}
  </tr>
);

const btnBase = {
  border: 'none', borderRadius: '6px', cursor: 'pointer',
  fontWeight: '600', fontSize: '14px', display: 'inline-flex',
  alignItems: 'center', justifyContent: 'center', gap: '6px',
  transition: 'all 0.2s ease', WebkitTapHighlightColor: 'transparent',
  minWidth: '44px', minHeight: '44px',
};

const inputStyle = (hasError) => ({
  width: '100%', padding: '10px 12px',
  border: `1.5px solid ${hasError ? '#e74c3c' : '#ddd'}`,
  borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  outline: 'none',
});

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [flashRow, setFlashRow] = useState(null);

  const formRef = useRef(null);
  const nameInputRef = useRef(null);

  const scrollToForm = useCallback(() => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nameInputRef.current?.focus();
    }, 80);
  }, []);

  useEffect(() => {
    if (showForm) scrollToForm();
  }, [showForm, scrollToForm]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && showForm) closeForm();
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && showForm) {
        e.preventDefault();
        document.getElementById('cat-form')?.requestSubmit();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showForm]);

  useEffect(() => { fetchCategories(); }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const flashCategory = useCallback((id) => {
    setFlashRow(id);
    setTimeout(() => setFlashRow(null), 2500);
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await categoryAPI.list();
      setCategories(res.data.results || res.data);
    } catch (err) {
      setError('Failed to load categories. Check your connection and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '' });
    setFormErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    else if (form.name.trim().length > 100) errs.name = 'Max 100 characters';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      icon: form.icon,
    };

    const isEdit = !!editingId;
    setActionLoading('form');
    try {
      if (isEdit) {
        const res = await categoryAPI.update(editingId, payload);
        setCategories(prev => prev.map(c => c.id === editingId ? res.data : c));
        flashCategory(editingId);
        showToast(`"${res.data.name}" updated`);
      } else {
        const res = await categoryAPI.create(payload);
        setCategories(prev => [...prev, res.data]);
        flashCategory(res.data.id);
        showToast(`"${res.data.name}" created`);
      }
      closeForm();
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const errs = {};
        if (data.name) errs.name = Array.isArray(data.name) ? data.name[0] : data.name;
        if (data.non_field_errors) errs.name = data.non_field_errors[0];
        if (Object.keys(errs).length) setFormErrors(errs);
        else showToast('Validation error. Check your input.', 'error');
      } else {
        showToast(isEdit ? 'Failed to update category' : 'Failed to create category', 'error');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    setActionLoading(`del-${cat.id}`);
    try {
      await categoryAPI.delete(cat.id);
      setCategories(prev => prev.filter(c => c.id !== cat.id));
      showToast(`"${cat.name}" deleted`);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to delete category';
      showToast(msg, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page page-enter">
        <div className="dashboard-header">
          <div className="container">
            <h1>Manage Categories</h1>
            <p>Add, edit, or remove event categories</p>
          </div>
        </div>
        <div className="container" style={{ padding: '40px 20px' }}>
          <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                  {['Category', 'Icon', 'Description', 'Events', 'Created', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px', textAlign: h === 'Events' || h === 'Icon' ? 'center' : 'left', fontWeight: '600', fontSize: '13px', color: '#666' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page page-enter">
      <style>{`
        @keyframes formSlideIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.99); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes rowFlash {
          0%   { background: #fff5f0; }
          100% { background: transparent; }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%   { opacity: 1; }
          50%  { opacity: 0.4; }
          100% { opacity: 1; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cat-action-btn {
          padding: 7px 14px; border: none; border-radius: 6px;
          cursor: pointer; font-size: 13px; font-weight: '600';
          display: inline-flex; align-items: center; gap: 5px;
          transition: all 0.2s ease; -webkit-tap-highlight-color: transparent;
          min-height: 36px;
        }
        .cat-action-btn:active { transform: scale(0.96); }
        .cat-action-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .cat-edit-btn { background: #f0f4ff; color: #084298; }
        .cat-edit-btn:hover:not(:disabled) { background: #dbe6ff; }
        .cat-del-btn { background: #f8d7da; color: #721c24; }
        .cat-del-btn:hover:not(:disabled) { background: #f1b0b7; }
        .cat-form-input:focus {
          border-color: #e8622c !important;
          box-shadow: 0 0 0 3px rgba(232, 98, 44, 0.15);
        }
        .cat-icon-tile {
          display: flex; flex-direction: column; align-items: center;
          gap: 4px; padding: 10px 4px; border: 2px solid #dee2e6;
          border-radius: 8px; cursor: pointer; transition: all 0.15s ease;
          background: white; -webkit-tap-highlight-color: transparent;
        }
        .cat-icon-tile:hover { border-color: #ccc; background: #fafafa; }
        .cat-icon-tile:active { transform: scale(0.95); }
        .cat-icon-tile.selected {
          border-color: #e8622c; background: #fff5f0;
          box-shadow: 0 0 0 1px #e8622c;
        }
        .cat-cancel-btn {
          padding: 10px 20px; background: #f0f0f0; color: #555;
          border: none; border-radius: 6px; cursor: pointer;
          font-weight: 600; font-size: 14px; transition: all 0.2s;
          min-height: 44px; -webkit-tap-highlight-color: transparent;
        }
        .cat-cancel-btn:hover { background: #e2e2e2; color: #333; }
        .cat-cancel-btn:active { transform: scale(0.97); }
        .cat-submit-btn {
          padding: 10px 20px; background: #e8622c; color: white;
          border: none; border-radius: 6px; cursor: pointer;
          font-weight: 600; font-size: 14px; transition: all 0.2s;
          display: inline-flex; align-items: center; gap: 6px;
          min-height: 44px; -webkit-tap-highlight-color: transparent;
        }
        .cat-submit-btn:hover:not(:disabled) { background: #d4561e; }
        .cat-submit-btn:active:not(:disabled) { transform: scale(0.97); }
        .cat-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .cat-add-btn {
          padding: 10px 20px; background: #2ecc71; color: white;
          border: none; border-radius: 8px; cursor: pointer;
          font-weight: 600; font-size: 14px; display: inline-flex;
          align-items: center; gap: 8px; transition: all 0.2s;
          min-height: 44px; -webkit-tap-highlight-color: transparent;
        }
        .cat-add-btn:hover { background: #27ae60; }
        .cat-add-btn:active { transform: scale(0.97); }
        .cat-close-btn {
          background: none; border: none; cursor: pointer; color: #999;
          padding: 8px; border-radius: 6px; transition: all 0.2s;
          display: flex; min-width: 44px; min-height: 44px;
          align-items: center; justify-content: center;
        }
        .cat-close-btn:hover { background: #f0f0f0; color: #333; }
        .cat-table-row { transition: background 0.3s ease; }
        .cat-table-row:hover { background: #fafbfc; }
        .cat-dismiss-btn {
          background: none; border: none; cursor: pointer; padding: 4px;
          display: flex; border-radius: 4px; transition: background 0.15s;
        }
        .cat-dismiss-btn:hover { background: rgba(0,0,0,0.05); }
      `}</style>

      <div className="dashboard-header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1>Manage Categories</h1>
            <p>Add, edit, or remove event categories</p>
          </div>
          <button className="cat-add-btn" onClick={openCreate} disabled={showForm}>
            <PlusCircle size={18} /> Add Category
          </button>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 20px' }}>
        {/* Toast */}
        <div style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 9999, maxWidth: '380px', width: '100%' }}>
          {toast && (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onDismiss={() => setToast(null)}
            />
          )}
        </div>

        {/* Global error */}
        {error && (
          <div style={{
            padding: '14px 16px', background: '#f8d7da', color: '#721c24',
            borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px',
            marginBottom: '20px', animation: 'fadeSlideUp 0.3s ease-out',
            fontSize: '14px',
          }}>
            <AlertTriangle size={18} />
            <span style={{ flex: 1 }}>{error}</span>
            <button className="cat-dismiss-btn" onClick={() => setError('')} style={{ color: '#721c24' }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div
            ref={formRef}
            style={{
              background: 'white', borderRadius: '10px', padding: '24px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)', marginBottom: '24px',
              borderLeft: '4px solid #e8622c',
              animation: 'formSlideIn 0.3s ease-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>
                {editingId ? 'Edit Category' : 'New Category'}
              </h3>
              <button className="cat-close-btn" onClick={closeForm} aria-label="Close form">
                <X size={20} />
              </button>
            </div>

            <form id="cat-form" onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '14px', color: '#333' }}>
                    Name <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    className="cat-form-input"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Music, Sports, Technology"
                    maxLength={100}
                    disabled={actionLoading === 'form'}
                    style={inputStyle(formErrors.name)}
                    onFocus={e => {
                      if (!formErrors.name) e.target.style.borderColor = '#e8622c';
                    }}
                    onBlur={e => {
                      if (!formErrors.name) e.target.style.borderColor = '#ddd';
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    {formErrors.name
                      ? <p style={{ color: '#e74c3c', fontSize: '12px', margin: 0 }}>{formErrors.name}</p>
                      : <span />
                    }
                    <span style={{ fontSize: '11px', color: '#aaa' }}>{form.name.length}/100</span>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '14px', color: '#333' }}>
                    Description
                  </label>
                  <input
                    type="text"
                    className="cat-form-input"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Brief description of this category"
                    disabled={actionLoading === 'form'}
                    style={inputStyle(false)}
                    onFocus={e => e.target.style.borderColor = '#e8622c'}
                    onBlur={e => e.target.style.borderColor = '#ddd'}
                  />
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#333' }}>
                  Icon
                  {form.icon && (
                    <span style={{ fontWeight: '400', color: '#e8622c', marginLeft: '10px', fontSize: '13px' }}>
                      {(() => {
                        const C = ICON_MAP[form.icon];
                        return C ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><C size={14} /> {form.icon}</span> : form.icon;
                      })()}
                    </span>
                  )}
                </label>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                  gap: '8px', padding: '16px', background: '#f8f9fa', borderRadius: '8px',
                  border: `1px solid ${formErrors.icon ? '#e74c3c' : '#e9ecef'}`,
                  maxHeight: '280px', overflowY: 'auto',
                }}>
                  {ICON_OPTIONS.map(({ key, label }) => {
                    const IconComp = ICON_MAP[key];
                    const isSelected = form.icon === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`cat-icon-tile ${isSelected ? 'selected' : ''}`}
                        onClick={() => setForm(f => ({ ...f, icon: isSelected ? '' : key }))}
                        aria-pressed={isSelected}
                        aria-label={`${label} icon`}
                        disabled={actionLoading === 'form'}
                      >
                        {IconComp && <IconComp size={22} color={isSelected ? '#e8622c' : '#555'} />}
                        <span style={{
                          fontSize: '10px', fontWeight: isSelected ? '700' : '500',
                          color: isSelected ? '#e8622c' : '#666',
                          textAlign: 'center', lineHeight: '1.2',
                        }}>
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {formErrors.icon && <p style={{ color: '#e74c3c', fontSize: '12px', margin: '4px 0 0' }}>{formErrors.icon}</p>}
              </div>

              <div style={{
                display: 'flex', gap: '10px', marginTop: '20px',
                justifyContent: 'flex-end', flexWrap: 'wrap',
              }}>
                <button type="button" className="cat-cancel-btn" onClick={closeForm} disabled={actionLoading === 'form'}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cat-submit-btn"
                  disabled={actionLoading === 'form'}
                >
                  {actionLoading === 'form' ? (
                    <><Spinner size={16} /> {editingId ? 'Updating...' : 'Creating...'}</>
                  ) : (
                    <><Save size={16} /> {editingId ? 'Update' : 'Create'}</>
                  )}
                </button>
              </div>

              <p style={{ fontSize: '11px', color: '#bbb', marginTop: '12px', textAlign: 'right' }}>
                Tip: Ctrl+Enter to submit &middot; Esc to close
              </p>
            </form>
          </div>
        )}

        {/* Table */}
        {categories.length > 0 ? (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{
              width: '100%', borderCollapse: 'collapse', background: 'white',
              borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              minWidth: '640px',
            }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                  {['Category', 'Icon', 'Description', 'Events', 'Created', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '12px 14px', fontWeight: '600', fontSize: '13px', color: '#555',
                      textAlign: h === 'Events' || h === 'Icon' ? 'center' : 'left',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => {
                  const IconComp = getIconComponent(cat.icon);
                  const isDeleting = actionLoading === `del-${cat.id}`;
                  return (
                    <tr
                      key={cat.id}
                      className="cat-table-row"
                      style={{
                        borderBottom: '1px solid #f0f0f0',
                        animation: flashRow === cat.id ? 'rowFlash 2.5s ease-out' : 'none',
                        opacity: isDeleting ? 0.4 : 1,
                        transition: 'opacity 0.3s',
                      }}
                    >
                      <td style={{ padding: '14px', fontWeight: '600', fontSize: '14px' }}>
                        {cat.name}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'center' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '10px',
                          background: IconComp ? '#fff5f0' : '#f0f0f0',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'transform 0.2s',
                        }}>
                          {IconComp ? <IconComp size={20} color="#e8622c" /> : <Tag size={20} color="#ccc" />}
                        </div>
                      </td>
                      <td style={{ padding: '14px', fontSize: '13px', color: '#666', maxWidth: '280px' }}>
                        <span style={{
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {cat.description || <span style={{ color: '#ccc' }}>No description</span>}
                        </span>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 12px', borderRadius: '12px', fontSize: '12px',
                          fontWeight: '600', background: cat.event_count > 0 ? '#d4edda' : '#f0f0f0',
                          color: cat.event_count > 0 ? '#155724' : '#aaa',
                          display: 'inline-block',
                        }}>
                          {cat.event_count || 0}
                        </span>
                      </td>
                      <td style={{ padding: '14px', fontSize: '13px', color: '#888' }}>
                        {new Date(cat.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            className="cat-action-btn cat-edit-btn"
                            onClick={() => openEdit(cat)}
                            disabled={isDeleting || !!actionLoading}
                            aria-label={`Edit ${cat.name}`}
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            className="cat-action-btn cat-del-btn"
                            onClick={() => handleDelete(cat)}
                            disabled={isDeleting || !!actionLoading}
                            aria-label={`Delete ${cat.name}`}
                          >
                            {isDeleting ? <Spinner size={14} /> : <Trash2 size={14} />} Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '60px 20px', background: 'white',
            borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            animation: 'fadeSlideUp 0.4s ease-out',
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', background: '#f0f4ff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '20px',
            }}>
              <Tag size={36} color="#084298" />
            </div>
            <p style={{ fontSize: '18px', color: '#333', fontWeight: '600', margin: '0 0 8px' }}>No categories yet</p>
            <p style={{ color: '#999', marginBottom: '24px', fontSize: '14px' }}>
              Create your first category so organizers can classify their events.
            </p>
            <button className="cat-add-btn" onClick={openCreate}>
              <PlusCircle size={18} /> Create First Category
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCategories;
