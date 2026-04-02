import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './AuthPages.css';

function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Supabase sends these parameters in the verification link
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type') || 'email';
        const email = searchParams.get('email'); // Added email extraction

        console.log('Token hash from URL:', tokenHash);
        console.log('Type:', type);
        console.log('Email:', email);
        console.log('API URL:', import.meta.env.VITE_API_URL);

        if (!tokenHash) {
          throw new Error('No verification token found in URL. The link may be incomplete or expired.');
        }

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(
          `${apiUrl}/auth/verify-email`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: tokenHash, type, email }), // Send email too
          }
        );

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        console.log('Verification successful!');
        setVerified(true);
        // Redirect to login after 3 seconds
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        console.error('Verification error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h2>Verifying your email...</h2>
          <p>Please wait while we confirm your email address.</p>
          <div style={{ marginTop: '30px' }}>
            <div
              style={{
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
              }}
            ></div>
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#4CAF50', marginBottom: '10px' }}>✓ Email Verified!</h2>
          <p>Your email has been verified successfully.</p>
          <p style={{ color: '#999', fontSize: '14px' }}>
            Redirecting you to login in 3 seconds...
          </p>
          <button
            onClick={() => navigate('/login')}
            className="auth-button"
            style={{ marginTop: '20px' }}
          >
            Go to Login Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 style={{ color: '#c33', textAlign: 'center' }}>Verification Failed</h2>
        <p style={{ textAlign: 'center', color: '#555' }}>{error}</p>
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#999', marginTop: '20px' }}>
          The verification link may have expired. Please sign up again.
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="auth-button"
          style={{ marginTop: '20px', width: '100%' }}
        >
          Back to Signup
        </button>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
