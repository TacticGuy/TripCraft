import React, { useState } from 'react';
import { categoryIcon, categoryColor } from '../utils/mapHelpers.js';
import './ItineraryTimeline.css';

const USD_TO_INR = 83.5;

export default function ItineraryTimeline({ itinerary, meta, onActivityClick, activeMarkerId, currency }) {
  const [openDay, setOpenDay] = useState(1);

  if (!itinerary || itinerary.length === 0) return null;

  const symbol = currency === 'INR' ? '₹' : '$';
  const rate = currency === 'INR' ? USD_TO_INR : 1;

  const fmt = (usd) => {
    if (!usd && usd !== 0) return null;
    const val = Math.round(usd * rate);
    return `${symbol}${val.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US')}`;
  };

  const totalBudget = itinerary.reduce((s, d) => s + (d.daily_budget_estimate || 0), 0);

  return (
    <div className="timeline">
      {/* Trip summary bar */}
      <div className="trip-summary">
        <div className="summary-item">
          <span className="summary-label">Destination</span>
          <span className="summary-value">{meta.destination}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-label">Duration</span>
          <span className="summary-value">{meta.days} days</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-label">Budget</span>
          <span className="summary-value" style={{ textTransform: 'capitalize' }}>{meta.budget}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-label">Est. Total</span>
          <span className="summary-value gold">{fmt(totalBudget * meta.travelers)}</span>
        </div>
      </div>

      {/* Day accordion */}
      {itinerary.map((day) => (
        <div key={day.day} className={`day-card ${openDay === day.day ? 'open' : ''}`}>
          <button
            className="day-header"
            onClick={() => setOpenDay(openDay === day.day ? null : day.day)}
          >
            <div className="day-number">
              <span className="day-num-label">DAY</span>
              <span className="day-num-value">{day.day}</span>
            </div>
            <div className="day-info">
              <h3 className="day-title">{day.title}</h3>
              <p className="day-date">{formatDate(day.date)}</p>
            </div>
            <div className="day-meta">
              <span className="day-budget">{fmt(day.daily_budget_estimate)}/person</span>
              <span className="day-chevron">{openDay === day.day ? '▲' : '▼'}</span>
            </div>
          </button>

          {openDay === day.day && (
            <div className="day-body">
              {day.summary && <p className="day-summary">{day.summary}</p>}

              <div className="activities-list">
                {(day.activities || []).map((act, idx) => (
                  <div
                    key={act.id || idx}
                    className={`activity-item ${activeMarkerId === act.id ? 'highlighted' : ''}`}
                    onClick={() => onActivityClick && onActivityClick(act)}
                  >
                    <div className="activity-time">{act.time}</div>
                    <div className="activity-connector">
                      <div className="activity-dot" style={{ background: categoryColor(act.category) }} />
                      {idx < day.activities.length - 1 && <div className="connector-line" />}
                    </div>
                    <div className="activity-content">
                      <div className="activity-header">
                        <span className="activity-icon">{categoryIcon(act.category)}</span>
                        <h4 className="activity-name">{act.name}</h4>
                        <span className="activity-tag" style={{ color: categoryColor(act.category) }}>
                          {act.category}
                        </span>
                      </div>
                      <p className="activity-desc">{act.description}</p>
                      {act.tips && (
                        <div className="activity-tip">
                          {act.tips}
                        </div>
                      )}
                      <div className="activity-footer">
                        {act.duration_minutes && (
                          <span className="activity-meta-item">{formatDuration(act.duration_minutes)}</span>
                        )}
                        {act.estimated_cost?.amount > 0 && (
                          <span className="activity-meta-item">
                            {fmt(act.estimated_cost.amount)}/{act.estimated_cost.per}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Accommodation */}
              {day.accommodation && (
                <div className="accommodation-card">
                  <div className="acc-details">
                    <p className="acc-name">{day.accommodation.name}</p>
                    <p className="acc-address">{day.accommodation.address}</p>
                  </div>
                  {day.accommodation.estimated_cost_per_night && (
                    <div className="acc-cost">
                      <span className="acc-cost-value">{fmt(day.accommodation.estimated_cost_per_night)}</span>
                      <span className="acc-cost-label">/night</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatDuration(mins) {
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}
