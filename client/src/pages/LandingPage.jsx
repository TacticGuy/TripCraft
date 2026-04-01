import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import sampleVideo from '../assets/sample_video.mp4';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'Discover Your Next Adventure';

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-content">
          <Link to="/" className="landing-nav-brand-link">
            <h1 className="landing-nav-brand">TripCraft</h1>
          </Link>
          <div className="landing-nav-links">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="landing-nav-link">Dashboard</Link>
                <button onClick={handleLogout} className="landing-nav-logout">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="landing-nav-link">Sign In</Link>
                <Link to="/signup" className="landing-nav-button">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-content">
          <div className="typing-container">
            <h1 className="typing-text">
              {displayedText}
              <span className="cursor"></span>
            </h1>
          </div>
          <p className="hero-description">
            Let AI craft your perfect itinerary. Just tell us where you want to go,
            <br />
            and we'll handle the rest with curated recommendations, maps, and budgets.
          </p>
          
          {isAuthenticated ? (
            <Link to="/plan-trip" className="cta-button-primary">
              Start Planning Now
            </Link>
          ) : (
            <div className="cta-buttons">
              <Link to="/signup" className="cta-button-primary">
                Get Started Free
              </Link>
              <Link to="/login" className="cta-button-secondary">
                Already a Member? Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Video Section */}
        <div className="video-container">
          <video
            className="feature-video"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={sampleVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-overlay" />
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="features-container">
          <div className="feature-box">
            {/*<div className="feature-icon">🗺️</div>*/}
            <h3>Interactive Maps</h3>
            <p>Explore the world like never before with our richly detailed interactive maps. 
              Pin your favorite destinations, discover hidden local gems, and visualize your entire route at a glance. 
              Whether you're navigating busy city streets or remote mountain trails, our maps keep you on track. 
              Every marker tells a story, helping you plan smarter and travel better.
            </p>
          </div>
          <div className="feature-box">
            {/*<div className="feature-icon">💰</div>*/}
            <h3>Smart Budget Planning</h3>
            <p>Say goodbye to financial surprises on your trips with our intelligent budget planner.
              Get real-time cost estimates for flights, stays, food, and activities all in one place.
              Set your spending limits and watch us optimize your itinerary to fit perfectly within your budget. 
              Travel more, worry less, and make every rupee count.
              </p>
          </div>
          <div className="feature-box">
            {/*<div className="feature-icon">🤖</div>*/}
            <h3>AI-Powered Itinerary</h3>
            <p>Experience travel planning reimagined with the power of artificial intelligence. 
              Our AI understands your interests, travel style, and pace to craft a truly personalized day-by-day itinerary. 
              No more hours of research or second-guessing your schedule. 
              From sunrise experiences to evening dining spots, every moment of your trip is thoughtfully planned just for you.</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="landing-cta-section">
        <h2>Ready to Plan Your Next Trip?</h2>
        <p>Join thousands of travelers using TripCraft</p>
        {isAuthenticated ? (
          <Link to="/plan-trip" className="cta-button-primary large">
            Plan Your Adventure
          </Link>
        ) : (
          <Link to="/signup" className="cta-button-primary large">
            Sign Up for Free
          </Link>
        )}
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; 2024 TripCraft. Craft your perfect journey.</p>
      </footer>
    </div>
  );
}
