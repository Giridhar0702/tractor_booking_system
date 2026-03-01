import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tractor, Wheat } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'FARMER'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingSocialUser, setPendingSocialUser] = useState(null);

  const { user, registerWithEmail, loginWithGoogle, loginWithFacebook, setUserRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill email if redirected from login
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const prefillEmail = params.get('email');
    if (prefillEmail) setFormData(prev => ({ ...prev, email: prefillEmail }));
  }, [location.search]);

  // Redirect to dashboard if already logged in with a role
  useEffect(() => {
    if (user && user.role && !showRoleModal) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate, showRoleModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await registerWithEmail(formData.email, formData.password, formData.name, formData.role);
      navigate('/dashboard');
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError(
            <>
              An account with this email already exists.{' '}
              <Link
                to={`/login?email=${encodeURIComponent(formData.email)}`}
                style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'underline' }}
              >
                Login instead?
              </Link>
            </>
          );
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Use at least 6 characters.');
          break;
        default:
          setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      const { user: gUser, isNewUser } = await loginWithGoogle();

      if (isNewUser) {
        // New user — show role selection modal
        setPendingSocialUser(gUser);
        setShowRoleModal(true);
      } else {
        // Existing user — go straight to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-up failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignup = async () => {
    setError('');
    setLoading(true);
    try {
      const { user: fbUser, isNewUser } = await loginWithFacebook();

      if (isNewUser) {
        // New user — show role selection modal
        setPendingSocialUser(fbUser);
        setShowRoleModal(true);
      } else {
        // Existing user — go straight to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Facebook sign-up failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = async (selectedRole) => {
    setLoading(true);
    try {
      await setUserRole(selectedRole);
      setShowRoleModal(false);
      setPendingSocialUser(null);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to set role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Role Selection Modal ─────────────────────────────────
  if (showRoleModal) {
    return (
      <div className="auth-container" style={{ maxWidth: '560px' }}>
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem', color: '#fff', fontSize: '1.5rem'
          }}>
            ✓
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Welcome, {pendingSocialUser?.displayName || 'there'}!
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
            One more step — tell us how you'd like to use AgriRent
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            {/* Farmer Card */}
            <button
              onClick={() => handleRoleSelect('FARMER')}
              disabled={loading}
              style={{
                padding: '2rem 1.5rem',
                borderRadius: '16px',
                border: '2px solid #e5e7eb',
                background: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#22c55e';
                e.currentTarget.style.background = 'rgba(34, 197, 94, 0.05)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(34, 197, 94, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: '16px',
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#22c55e'
              }}>
                <Wheat size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem', color: '#111' }}>
                  I'm a Farmer
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.4 }}>
                  I want to rent tractors for my farm
                </p>
              </div>
            </button>

            {/* Tractor Owner Card */}
            <button
              onClick={() => handleRoleSelect('OWNER')}
              disabled={loading}
              style={{
                padding: '2rem 1.5rem',
                borderRadius: '16px',
                border: '2px solid #e5e7eb',
                background: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: '16px',
                background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#3b82f6'
              }}>
                <Tractor size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem', color: '#111' }}>
                  Tractor Owner
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.4 }}>
                  I have tractors to rent out
                </p>
              </div>
            </button>
          </div>

          {loading && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Setting up your account...</p>
          )}
        </div>
      </div>
    );
  }

  // ─── Registration Form ────────────────────────────────────
  return (
    <div className="auth-container card">
      <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>Create Account</h2>

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

      {/* Social Sign-Up Buttons — First */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          className="btn btn-google"
          onClick={handleGoogleSignup}
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
          Sign up with Google
        </button>
        <button
          type="button"
          className="btn btn-facebook"
          onClick={handleFacebookSignup}
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
          Sign up with Facebook
        </button>
      </div>

      {/* Divider */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        margin: '0 0 1.5rem',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color, #e5e7eb)' }} />
        <span>or register with email</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color, #e5e7eb)' }} />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            required
            className="input-field"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            required
            className="input-field"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            required
            className="input-field"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            required
            className="input-field"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label className="form-label">I am a</label>
          <select
            className="input-field"
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            disabled={loading}
          >
            <option value="FARMER">Farmer (I want to rent)</option>
            <option value="OWNER">Tractor Owner (I have tractors)</option>
          </select>
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '1rem' }}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
        <p style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 500 }}>Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
