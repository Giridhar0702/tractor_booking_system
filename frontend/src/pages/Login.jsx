import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loginWithEmail, loginWithGoogle, loginWithFacebook } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill email if redirected from register
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const prefillEmail = params.get('email');
    if (prefillEmail) setEmail(prefillEmail);
  }, [location.search]);

  // Redirect to dashboard if already logged in with a role
  useEffect(() => {
    if (user && user.role) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginWithEmail(email, password);
      navigate('/dashboard');
    } catch (err) {
      switch (err.code) {
        case 'auth/user-not-found':
          navigate(`/register?email=${encodeURIComponent(email)}`);
          return;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/invalid-credential':
          setError(
            <>
              Invalid email or password.{' '}
              <Link
                to={`/register?email=${encodeURIComponent(email)}`}
                style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'underline' }}
              >
                Create a new account?
              </Link>
            </>
          );
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        default:
          setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { isNewUser } = await loginWithGoogle();

      if (isNewUser) {
        // New user — redirect to register for role selection
        navigate('/register');
      } else {
        // Existing user — go straight to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { isNewUser } = await loginWithFacebook();

      if (isNewUser) {
        navigate('/register');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Facebook sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container card">
      <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>Welcome Back</h2>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.875rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            required
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            required
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '1rem' }}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
        <p style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: 500 }}>Register</Link>
        </p>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          margin: '1.5rem 0',
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color, #e5e7eb)' }} />
          <span>or continue with</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color, #e5e7eb)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          <button
            type="button"
            className="btn btn-google"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              background: '#fff',
              color: '#444',
              border: '1px solid #ddd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              fontWeight: 500,
              width: '100%',
              padding: '0.75rem 0',
              fontSize: '1rem',
              borderRadius: '6px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: 22, height: 22 }} />
            Sign in with Google
          </button>
          <button
            type="button"
            className="btn btn-facebook"
            onClick={handleFacebookLogin}
            disabled={loading}
            style={{
              background: '#1877f3',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              fontWeight: 500,
              width: '100%',
              padding: '0.75rem 0',
              fontSize: '1rem',
              borderRadius: '6px',
              border: 'none',
              boxShadow: '0 1px 4px rgba(24,119,243,0.08)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" style={{ width: 22, height: 22, background: '#fff', borderRadius: '50%' }} />
            Sign in with Facebook
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;

