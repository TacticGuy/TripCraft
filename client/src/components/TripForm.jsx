import React, { useState } from 'react';
import './TripForm.css';

const BUDGET_OPTIONS = [
  { value: 'budget', label: 'Budget', desc: 'Under $100/day' },
  { value: 'moderate', label: 'Moderate', desc: '$100–250/day' },
  { value: 'luxury', label: 'Luxury', desc: '$250+/day' },
];

const INTEREST_OPTIONS = [
  'History & Culture', 'Food & Dining', 'Nature & Outdoors', 'Art & Museums',
  'Nightlife', 'Shopping', 'Adventure Sports', 'Architecture', 'Local Markets', 'Wellness & Spa',
];

const today = new Date().toISOString().split('T')[0];

export default function TripForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: 'moderate',
    travelers: 1,
    interests: [],
  });
  const [errors, setErrors] = useState({});

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: null }));
  }

  function toggleInterest(interest) {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));
  }

  function validate() {
    const errs = {};
    if (!form.destination.trim()) errs.destination = 'Where are you headed?';
    if (!form.startDate) errs.startDate = 'Pick a start date';
    if (!form.endDate) errs.endDate = 'Pick an end date';
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      errs.endDate = 'End must be after start';
    if (form.travelers < 1 || form.travelers > 20) errs.travelers = '1–20 travelers';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({ ...form, interests: form.interests.join(', ') });
  }

  const days = form.startDate && form.endDate
    ? Math.max(0, Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1)
    : 0;

  return (
    <form className="trip-form" onSubmit={handleSubmit} noValidate>
      {/* Destination */}
      <div className="form-section">
        <label className="form-label">
          Destination
        </label>
        <input
          className={`form-input ${errors.destination ? 'error' : ''}`}
          type="text"
          placeholder="e.g. Tokyo, Japan"
          value={form.destination}
          onChange={(e) => set('destination', e.target.value)}
          disabled={loading}
        />
        {errors.destination && <p className="form-error">{errors.destination}</p>}
      </div>

      {/* Dates */}
      <div className="form-row">
        <div className="form-section">
          <label className="form-label">
            Start Date
          </label>
          <input
            className={`form-input ${errors.startDate ? 'error' : ''}`}
            type="date"
            min={today}
            value={form.startDate}
            onChange={(e) => set('startDate', e.target.value)}
            disabled={loading}
          />
          {errors.startDate && <p className="form-error">{errors.startDate}</p>}
        </div>
        <div className="form-section">
          <label className="form-label">
            End Date
          </label>
          <input
            className={`form-input ${errors.endDate ? 'error' : ''}`}
            type="date"
            min={form.startDate || today}
            value={form.endDate}
            onChange={(e) => set('endDate', e.target.value)}
            disabled={loading}
          />
          {errors.endDate && <p className="form-error">{errors.endDate}</p>}
        </div>
      </div>

      {days > 0 && (
        <p className="days-badge">{days} day{days !== 1 ? 's' : ''} planned</p>
      )}

      {/* Budget */}
      <div className="form-section">
        <label className="form-label">
          Budget Level
        </label>
        <div className="budget-grid">
          {BUDGET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`budget-card ${form.budget === opt.value ? 'active' : ''}`}
              onClick={() => set('budget', opt.value)}
              disabled={loading}
            >
              <span className="budget-label">{opt.label}</span>
              <span className="budget-desc">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Travelers */}
      <div className="form-section">
        <label className="form-label">
          Travelers
        </label>
        <div className="counter-row">
          <button
            type="button"
            className="counter-btn"
            onClick={() => set('travelers', Math.max(1, form.travelers - 1))}
            disabled={loading || form.travelers <= 1}
          >−</button>
          <span className="counter-value">{form.travelers}</span>
          <button
            type="button"
            className="counter-btn"
            onClick={() => set('travelers', Math.min(20, form.travelers + 1))}
            disabled={loading || form.travelers >= 20}
          >+</button>
        </div>
        {errors.travelers && <p className="form-error">{errors.travelers}</p>}
      </div>

      {/* Interests */}
      <div className="form-section">
        <label className="form-label">
          Interests <span className="label-optional">(optional)</span>
        </label>
        <div className="interests-grid">
          {INTEREST_OPTIONS.map((interest) => (
            <button
              key={interest}
              type="button"
              className={`interest-chip ${form.interests.includes(interest) ? 'active' : ''}`}
              onClick={() => toggleInterest(interest)}
              disabled={loading}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Airport codes (optional) */}
      <div className="form-section collapsible">
        <details>
          <summary className="form-label collapsible-toggle">
            Flight Pricing (optional)
            <span className="toggle-arrow">›</span>
          </summary>
          <div className="form-row" style={{ marginTop: '12px' }}>
            <div className="form-section" style={{ margin: 0 }}>
              <label className="form-label-sm">Origin Airport Code</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. JFK"
                maxLength={3}
                value={form.originAirportCode}
                onChange={(e) => set('originAirportCode', e.target.value.toUpperCase())}
                disabled={loading}
              />
            </div>
            <div className="form-section" style={{ margin: 0 }}>
              <label className="form-label-sm">Destination Airport Code</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. NRT"
                maxLength={3}
                value={form.destinationAirportCode}
                onChange={(e) => set('destinationAirportCode', e.target.value.toUpperCase())}
                disabled={loading}
              />
            </div>
          </div>
        </details>
      </div>

      {/* Submit */}
      <button className="submit-btn" type="submit" disabled={loading}>
        {loading ? (
          <span className="btn-loading">
            <span className="spinner" />
            Crafting your journey...
          </span>
        ) : (
          <span>Generate Itinerary</span>
        )}
      </button>
    </form>
  );
}
