import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ItineraryTimeline from '../components/ItineraryTimeline.jsx';
import MapWidget from '../components/MapWidget.jsx';
import './ItineraryView.css';

export default function ItineraryView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const data = location.state?.data;
  const tripId = location.state?.tripId;
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [currency, setCurrency] = useState('USD');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!data) navigate('/');
  }, [data, navigate]);

  async function handleSaveTrip() {
    if (!token) {
      alert('Please log in to save trips');
      return;
    }

    setSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const tripPayload = {
        destination: meta.destination,
        startDate: meta.startDate,
        endDate: meta.endDate,
        budgetLevel: meta.budget,
        numTravelers: meta.travelers,
        interests: '',
        itinerary: itinerary,
      };

      let response;
      if (tripId) {
        // Update existing trip
        response = await fetch(`${API_URL}/trips/${tripId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(tripPayload),
        });
      } else {
        // Create new trip
        response = await fetch(`${API_URL}/trips`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(tripPayload),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save trip');
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      alert('Failed to save trip: ' + error.message);
      setSaving(false);
    }
  }

  if (!data) return null;

  const { itinerary, meta } = data;

  function handleActivityClick(activity) {
    setActiveMarkerId(activity.id);
    setActiveTab('map');
  }

  function handleMarkerClick(marker) {
    setActiveMarkerId(marker.id);
    setActiveTab('timeline');
  }

  return (
    <div className="itinerary-view">
      <div className="iv-bg">
        <div className="iv-bg-gradient" />
        <div className="iv-bg-grid" />
      </div>

      {/* Top nav */}
      <nav className="iv-nav">
        <Link to="/" className="nav-brand-link">
          <h3 className="nav-brand">TripCraft</h3>
        </Link>
        <button className="back-btn" onClick={() => navigate(tripId ? '/dashboard' : '/')}>
          {tripId ? '← Back to Trips' : '← New Trip'}
        </button>
        <div className="nav-title">
          <span className="nav-dest">{meta.destination}</span>
          <span className="nav-dates">{formatDateRange(meta.startDate, meta.endDate)}</span>
        </div>
        <div className="nav-right">
          {/* Save Trip Button */}
          {saveSuccess && <span className="save-success">✓ Trip saved!</span>}
          <button 
            className="save-trip-btn" 
            onClick={handleSaveTrip}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Trip'}
          </button>

          {/* Currency toggle */}
          <div className="currency-toggle">
            <button
              className={`currency-btn ${currency === 'USD' ? 'active' : ''}`}
              onClick={() => setCurrency('USD')}
            >
              $ USD
            </button>
            <button
              className={`currency-btn ${currency === 'INR' ? 'active' : ''}`}
              onClick={() => setCurrency('INR')}
            >
              ₹ INR
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile tabs */}
      <div className="mobile-tabs">
        <button
          className={`mobile-tab ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          📋 Itinerary
        </button>
        <button
          className={`mobile-tab ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          🗺️ Map
        </button>
      </div>

      {/* Main layout */}
      <main className="iv-main">
        {/* Left: Timeline */}
        <section className={`iv-panel iv-left ${activeTab === 'timeline' ? 'mobile-visible' : ''}`}>
          <ItineraryTimeline
            itinerary={itinerary}
            meta={meta}
            onActivityClick={handleActivityClick}
            activeMarkerId={activeMarkerId}
            currency={currency}
          />
        </section>

        {/* Right: Map */}
        <aside className={`iv-panel iv-right ${activeTab === 'map' ? 'mobile-visible' : ''}`}>
          <div className="map-sticky">
            <div className="map-panel-header">
              <h3>Trip Map</h3>
              <span className="map-marker-count">
                {itinerary.reduce((s, d) => s + (d.activities?.length || 0), 0)} locations
              </span>
            </div>
            <MapWidget
              itinerary={itinerary}
              onMarkerClick={handleMarkerClick}
              activeMarkerId={activeMarkerId}
              currency={currency}
            />
          </div>
        </aside>
      </main>
    </div>
  );
}

function formatDateRange(start, end) {
  if (!start || !end) return '';
  const opts = { month: 'short', day: 'numeric' };
  const s = new Date(start + 'T00:00:00').toLocaleDateString('en-US', opts);
  const e = new Date(end + 'T00:00:00').toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  return `${s} – ${e}`;
}
