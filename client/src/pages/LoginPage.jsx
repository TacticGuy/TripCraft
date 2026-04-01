import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Toast, useToast } from '../components/Toast';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './AuthPages.css';

function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, error: authError } = useAuth();
  const { toast, showToast, setToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailNotVerified, setEmailNotVerified] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setEmailNotVerified(false);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Check if the error is about email verification
      if (err.requiresEmailVerification) {
        setEmailNotVerified(true);
        setError(err.message);
        showToast('⚠️ Please verify your email to login', 'warning', 6000);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    try {
      // Decode the JWT to get profile info
      const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      const profile = {
        sub: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
      };

      await loginWithGoogle(credentialResponse.credential, profile);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your TripCraft account</p>

        {(error || authError) && (
          <div className={emailNotVerified ? "warning-message" : "error-message"}>
            {error || authError}
          </div>
        )}

        {emailNotVerified && (
          <div style={{
            backgroundColor: '#fff3e0',
            border: '1px solid #ff9800',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '24px',
            fontSize: '14px',
            color: '#e65100'
          }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>Email Not Verified</p>
            <p style={{ margin: '0', fontSize: '13px' }}>
              Please check your email inbox for the verification link and click it to activate your account.
            </p>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="divider">OR</div>

        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_OAUTH_ID}>
          <div className="google-login">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google login failed')}
              text="signin_with"
            />
          </div>
        </GoogleOAuthProvider>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
