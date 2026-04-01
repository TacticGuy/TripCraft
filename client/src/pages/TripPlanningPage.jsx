import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TripForm from '../components/TripForm.jsx';
import { generateItinerary } from '../services/backendClient.js';
import './TripPlanningPage.css';

export default function TripPlanningPage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(formData) {
    setLoading(true);
    setError(null);
    try {
      const data = await generateItinerary(formData, token);
      navigate('/itinerary', { state: { data } });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Something went wrong. Please try again.';
      setError(msg);
      setLoading(false);
    }
  }

  const handleLogout = () => {
    logout();
  };

  // Redirect to landing if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="trip-planning">
        <nav className="planning-nav">
          <div className="nav-content">
            <Link to="/" className="nav-brand-link">
              <h1 className="nav-brand">TripCraft</h1>
            </Link>
            <div className="nav-links">
              <Link to="/login" className="nav-link">Sign In</Link>
              <Link to="/signup" className="nav-button">Sign Up</Link>
            </div>
          </div>
        </nav>
        <div className="planning-content">
          <div className="auth-required">
            <h2>Sign in to Plan Your Trip</h2>
            <p>You need to be logged in to create a new itinerary.</p>
            <Link to="/login" className="nav-button">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trip-planning">
      {/* Top Navigation */}
      <header className="landing-nav">
        <div className="landing-nav-content">
          <Link to="/" className="landing-nav-brand-link">
            <h1 className="landing-nav-brand">TripCraft</h1>
          </Link>
          <div className="header-right">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <button onClick={handleLogout} className="landing-nav-logout">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Background */}
      <div className="planning-bg">
        <div className="bg-gradient" />
        <div className="bg-grid" />
      </div>

      <div className="planning-content">
        {/* Hero */}
        <header className="planning-hero">
          <h1 className="hero-title">
            Plan your
            <br />
            <em>next adventure</em>
          </h1>
          <p className="hero-subtitle">
            Tell us where you want to go and how long you're staying.
            <br />
            Our AI will create a perfect day-by-day itinerary for you.
          </p>
        </header>

        {/* Form card */}
        <div className="form-card">
          <div className="form-card-header">
            <h2>Plan Your Trip</h2>
            <p>Fill in the details below and let AI do the rest</p>
          </div>

          {error && (
            <div className="form-error-banner">
              <span>{error}</span>
            </div>
          )}

          <TripForm onSubmit={handleSubmit} loading={loading} />
        </div>

        {/* Features strip */}
      </div>
    </div>
  );
}
