import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Toast, useToast } from '../components/Toast';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './AuthPages.css';

function SignupPage() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle, error: authError } = useAuth();
  const { toast, showToast, setToast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await signup(email, password, fullName);
      
      // Check if email verification is required
      if (result.requiresEmailVerification) {
        setVerificationEmail(email);
        setVerificationSent(true);
        // Show toast notification
        showToast('✓ Verification email sent! Please check your inbox.', 'success', 6000);
      } else {
        // If no verification needed (shouldn't happen with new flow), go to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    try {
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

  // Show verification message after signup
  if (verificationSent) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Check Your Email</h1>
          <p className="auth-subtitle">We've sent a verification link to your email</p>

          <div className="verification-message" style={{
            backgroundColor: '#e8f5e9',
            border: '1px solid #4caf50',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 8px 0', color: '#2e7d32', fontWeight: '600' }}>
              ✓ Account Created Successfully!
            </p>
            <p style={{ margin: '0', color: '#558b2f', fontSize: '14px' }}>
              A confirmation email has been sent to <strong>{verificationEmail}</strong>
            </p>
            <p style={{ margin: '8px 0 0 0', color: '#558b2f', fontSize: '14px' }}>
              Click the link in your email to verify your account.
            </p>
          </div>

          <div style={{
            backgroundColor: '#fff3e0',
            border: '1px solid #ff9800',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '24px',
            fontSize: '14px',
            color: '#e65100'
          }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>Tips:</p>
            <ul style={{ margin: '0', paddingLeft: '20px' }}>
              <li>Check your spam/junk folder if you don't see the email</li>
              <li>The link expires in 24 hours</li>
              <li>Once verified, you can log in with your email and password</li>
            </ul>
          </div>

          <button 
            onClick={() => navigate('/login')}
            className="auth-button"
            style={{ marginBottom: '16px' }}
          >
            Go to Login
          </button>

          <button 
            onClick={() => {
              setVerificationSent(false);
              setFullName('');
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            }}
            className="auth-button"
            style={{ backgroundColor: '#f0f0f0', color: '#333' }}
          >
            Create Another Account
          </button>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join TripCraft and start planning amazing trips</p>

        {(error || authError) && <div className="error-message">{error || authError}</div>}

        <form onSubmit={handleSignup} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              disabled={loading}
            />
          </div>

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
              placeholder="Enter Password"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="divider">OR</div>

        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_OAUTH_ID}>
          <div className="google-login">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google signup failed')}
              text="signup_with"
            />
          </div>
        </GoogleOAuthProvider>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
