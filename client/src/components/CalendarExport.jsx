import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { exportToCalendar } from '../services/backendClient.js';
import './CalendarExport.css';

export default function CalendarExport({ itinerary, meta }) {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar.events',
    onSuccess: async (tokenResponse) => {
      setStatus('loading');
      try {
        const res = await exportToCalendar(tokenResponse.access_token, itinerary, meta);
        setResult(res);
        setStatus('success');
      } catch (err) {
        setErrorMsg(err.response?.data?.error || err.message || 'Export failed');
        setStatus('error');
      }
    },
    onError: (err) => {
      setErrorMsg('Google sign-in was cancelled or failed.');
      setStatus('error');
    },
  });

  const isConfigured =
    import.meta.env.VITE_GOOGLE_CLIENT_ID &&
    import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_OAUTH_CLIENT_ID_HERE';

  if (!isConfigured) {
    return (
      <div className="cal-export cal-not-configured">
        <span className="cal-icon">📅</span>
        <div>
          <p className="cal-title">Calendar Export</p>
          <p className="cal-subtitle">Add <code>VITE_GOOGLE_CLIENT_ID</code> to client/.env to enable Google Calendar export.</p>
        </div>
      </div>
    );
  }

  if (status === 'success' && result) {
    return (
      <div className="cal-export cal-success">
        <span className="cal-icon">✅</span>
        <div>
          <p className="cal-title">Added to Google Calendar!</p>
          <p className="cal-subtitle">
            {result.created} event{result.created !== 1 ? 's' : ''} created
            {result.failed > 0 ? `, ${result.failed} failed` : ''}.
          </p>
        </div>
        <button className="cal-btn cal-btn-secondary" onClick={() => setStatus('idle')}>
          Export Again
        </button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="cal-export cal-error-state">
        <span className="cal-icon">⚠️</span>
        <div>
          <p className="cal-title">Export Failed</p>
          <p className="cal-subtitle">{errorMsg}</p>
        </div>
        <button className="cal-btn cal-btn-secondary" onClick={() => setStatus('idle')}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="cal-export">
      <div className="cal-info">
        <span className="cal-icon">📅</span>
        <div>
          <p className="cal-title">Export to Google Calendar</p>
          <p className="cal-subtitle">
            Add all {itinerary.reduce((s, d) => s + (d.activities?.length || 0), 0)} activities
            to your Google Calendar with one click.
          </p>
        </div>
      </div>
      <button
        className="cal-btn"
        onClick={() => login()}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? (
          <span className="btn-loading">
            <span className="cal-spinner" />
            Exporting…
          </span>
        ) : (
          <>
            <GoogleIcon />
            Sign in & Export
          </>
        )}
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
