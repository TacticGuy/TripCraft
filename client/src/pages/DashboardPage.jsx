import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

function DashboardPage() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchTrips = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/trips`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch trips');

        const data = await response.json();
        setTrips(data.trips || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateTrip = () => {
    navigate('/');
  };

  const handleViewTrip = async (tripId) => {
    try {
      const response = await fetch(`${API_URL}/trips/${tripId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch trip');

      const data = await response.json();
      const trip = data.trip;

      // Format the itinerary data to match what ItineraryView expects
      const formattedData = {
        meta: {
          destination: trip.destination,
          startDate: trip.start_date,
          endDate: trip.end_date,
          budget: trip.budget_level,
          travelers: trip.num_travelers,
          generatedAt: trip.created_at,
        },
        itinerary: trip.itinerary || [],
      };

      navigate('/itinerary', { state: { data: formattedData, tripId: trip.id } });
    } catch (error) {
      alert('Failed to load trip: ' + error.message);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;

    try {
      const response = await fetch(`${API_URL}/trips/${tripId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete trip');

      setTrips(trips.filter(t => t.id !== tripId));
    } catch (err) {
      alert('Failed to delete trip: ' + err.message);
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="landing-nav">
        <div className="landing-nav-content">
          <Link to="/" className="landing-nav-brand-link">
            <h1 className="landing-nav-brand">TripCraft</h1>
          </Link>
          <div className="header-right">
            <span className="user-greeting">Welcome, {user?.name}</span>
            <button onClick={handleLogout} className="landing-nav-logout">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-top">
            <h2>Your Trips</h2>
            <button onClick={handleCreateTrip} className="create-trip-btn">
              Plan New Trip
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Loading your trips...</div>
          ) : trips.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🌍</div>
              <h3>No trips yet</h3>
              <p>Start planning your next adventure</p>
              <button onClick={handleCreateTrip} className="empty-cta-btn">
                Create Your First Trip
              </button>
            </div>
          ) : (
            <div className="trips-grid">
              {trips.map((trip) => {
                const startDate = new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const endDate = new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const days = Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / (1000 * 60 * 60 * 24)) + 1;
                
                return (
                  <div key={trip.id} className="trip-card">
                    <h3>{trip.destination}</h3>
                    <p className="trip-dates">{startDate} – {endDate}</p>
                    <p className="trip-meta">{days} days · {trip.budget_level}</p>
                    <div className="trip-actions">
                      <button onClick={() => handleViewTrip(trip.id)} className="view-btn">
                        View Itinerary
                      </button>
                      <button onClick={() => handleDeleteTrip(trip.id)} className="delete-btn">
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
