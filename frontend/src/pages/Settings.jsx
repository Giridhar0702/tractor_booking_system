import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Edit2, User, Lock, FileText, Home, Save, X, Camera, Shield, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [editingField, setEditingField] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  // Profile state — initialized from Firebase user
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    email: '',
    role: '',
    photoURL: '',
    address: '',
    language: 'English',
  });

  const [tempValue, setTempValue] = useState('');

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || user.displayName || '',
        phone: user.phone || '',
        email: user.email || '',
        role: user.role || 'FARMER',
        photoURL: user.photoURL || '',
        address: user.address || '',
        language: user.language || 'English',
      });
    }
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleEditClick = (field) => {
    setTempValue(profile[field]);
    setEditingField(field);
    setSaveSuccess('');
  };

  const handleSave = async (field) => {
    if (!tempValue.trim() && field !== 'address') return;
    setSaving(true);
    try {
      const updates = { [field]: tempValue.trim() };
      await updateUserProfile(updates);
      setProfile(prev => ({ ...prev, ...updates }));
      setSaveSuccess(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
      setEditingField(null);
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveSuccess(''), 3000);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getRoleBadge = () => {
    if (profile.role === 'OWNER') {
      return { text: 'Tractor Owner', color: '#3b82f6', bg: '#eff6ff' };
    }
    return { text: 'Farmer', color: '#22c55e', bg: '#f0fdf4' };
  };

  const roleBadge = getRoleBadge();
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' });

  const EditableField = ({ label, field, value, icon: Icon, type = 'text', readOnly = false }) => (
    <div style={{
      padding: '1.25rem 0',
      borderBottom: '1px solid #f0f0f0',
    }}>
      {editingField === field ? (
        <div>
          <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem', fontWeight: 500 }}>{label}</p>
          <input
            type={type}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="input-field"
            autoFocus
            style={{ marginBottom: '0.75rem' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => handleSave(field)}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              disabled={saving}
            >
              <Save size={14} /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !readOnly && handleEditClick(field)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: readOnly ? 'default' : 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {Icon && <Icon size={18} color="#9ca3af" />}
            <div>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                {label}
              </p>
              <p style={{ fontSize: '1rem', fontWeight: 500, color: value ? '#222' : '#ccc' }}>
                {value || 'Not set'}
              </p>
            </div>
          </div>
          {!readOnly && <Edit2 size={16} color="#ccc" />}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', background: '#f8fafc' }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        background: '#fff',
        padding: '2rem 1.25rem',
        borderRight: '1px solid #e5e7eb',
        flexShrink: 0
      }}>
        {/* User Mini Profile */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '1rem', marginBottom: '1.5rem',
          background: '#f8fafc', borderRadius: '12px'
        }}>
          {profile.photoURL ? (
            <img src={profile.photoURL} alt={profile.name} style={{
              width: 44, height: 44, borderRadius: '50%', objectFit: 'cover'
            }} />
          ) : (
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '1.1rem'
            }}>
              {profile.name?.[0] || 'U'}
            </div>
          )}
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{profile.name}</p>
            <span style={{
              fontSize: '0.7rem', fontWeight: 600,
              color: roleBadge.color, background: roleBadge.bg,
              padding: '0.15rem 0.5rem', borderRadius: '100px'
            }}>
              {roleBadge.text}
            </span>
          </div>
        </div>

        {/* Nav Items */}
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '0.75rem' }}>
          Settings
        </p>
        {[
          { id: 'home', label: 'Overview', icon: Home },
          { id: 'personal', label: 'Personal Info', icon: User },
          { id: 'security', label: 'Security', icon: Lock },
          { id: 'privacy', label: 'Privacy & Data', icon: FileText },
        ].map((item) => (
          <div
            key={item.id}
            onClick={() => { setActiveTab(item.id); setEditingField(null); setSaveSuccess(''); }}
            style={{
              padding: '0.8rem 1rem',
              marginBottom: '0.25rem',
              cursor: 'pointer',
              background: activeTab === item.id ? '#f0fdf4' : 'transparent',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.95rem',
              color: activeTab === item.id ? '#16a34a' : '#6b7280',
              fontWeight: activeTab === item.id ? 600 : 400,
              transition: 'all 0.15s',
              borderLeft: activeTab === item.id ? '3px solid #22c55e' : '3px solid transparent',
            }}
          >
            <item.icon size={18} />
            {item.label}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2.5rem 3rem', maxWidth: '800px' }}>

        {/* Success Message */}
        {saveSuccess && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a',
            padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem',
            fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            ✓ {saveSuccess}
          </div>
        )}

        {/* ═══ Home / Overview Tab ═══ */}
        {activeTab === 'home' && (
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem' }}>
              Account Overview
            </h1>

            <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              {/* Profile Header */}
              <div style={{
                background: 'linear-gradient(135deg, #166534, #15803d)',
                padding: '2.5rem 2rem', color: '#fff',
                display: 'flex', alignItems: 'center', gap: '1.5rem'
              }}>
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt={profile.name} style={{
                    width: 90, height: 90, borderRadius: '50%', objectFit: 'cover',
                    border: '3px solid rgba(255,255,255,0.3)'
                  }} />
                ) : (
                  <div style={{
                    width: 90, height: 90, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.25rem', fontWeight: 700, border: '3px solid rgba(255,255,255,0.2)'
                  }}>
                    {profile.name?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{profile.name}</h2>
                  <p style={{ opacity: 0.8, fontSize: '0.95rem' }}>{profile.email}</p>
                  <span style={{
                    display: 'inline-block', marginTop: '0.5rem',
                    fontSize: '0.8rem', fontWeight: 600,
                    background: 'rgba(255,255,255,0.2)',
                    padding: '0.25rem 0.75rem', borderRadius: '100px'
                  }}>
                    {roleBadge.text}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.3rem' }}>Full Name</p>
                  <p style={{ fontWeight: 500, fontSize: '1rem' }}>{profile.name}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.3rem' }}>Email</p>
                  <p style={{ fontWeight: 500, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {profile.email} <span style={{ color: '#22c55e' }}>✓</span>
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.3rem' }}>Phone</p>
                  <p style={{ fontWeight: 500, fontSize: '1rem' }}>{profile.phone || 'Not set'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.3rem' }}>Member Since</p>
                  <p style={{ fontWeight: 500, fontSize: '1rem' }}>{memberSince}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.3rem' }}>Role</p>
                  <p style={{ fontWeight: 500, fontSize: '1rem' }}>{roleBadge.text}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.3rem' }}>Address</p>
                  <p style={{ fontWeight: 500, fontSize: '1rem' }}>{profile.address || 'Not set'}</p>
                </div>
              </div>

              {/* Actions */}
              <div style={{ padding: '0 2rem 2rem', display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setActiveTab('personal')}
                  className="btn btn-primary"
                  style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem' }}
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className="btn btn-secondary"
                  style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem' }}
                >
                  Security
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Personal Info Tab ═══ */}
        {activeTab === 'personal' && (
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Personal Info</h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Update your personal details here</p>

            <div style={{ background: '#fff', padding: '1.5rem 2rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <EditableField label="Full Name" field="name" value={profile.name} icon={User} />
              <EditableField label="Phone Number" field="phone" value={profile.phone} icon={Phone} type="tel" />
              <EditableField label="Email Address" field="email" value={profile.email} icon={Mail} readOnly />
              <EditableField label="Address" field="address" value={profile.address} icon={MapPin} />

              {/* Role Display */}
              <div style={{ padding: '1.25rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Shield size={18} color="#9ca3af" />
                  <div>
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.2rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                      Account Type
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        fontSize: '0.9rem', fontWeight: 600,
                        color: roleBadge.color, background: roleBadge.bg,
                        padding: '0.3rem 0.75rem', borderRadius: '8px'
                      }}>
                        {roleBadge.text}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                        (cannot be changed)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Security Tab ═══ */}
        {activeTab === 'security' && (
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Security</h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Manage your account security</p>

            <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #f0f0f0' }}>
                <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Lock size={18} /> Password
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  Your account uses Firebase authentication. Password management is handled by Firebase.
                </p>
                <button className="btn btn-primary" style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem' }}>
                  Change Password
                </button>
              </div>

              <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #f0f0f0' }}>
                <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={18} /> Login Method
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                  You're signed in with:
                </p>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '8px',
                  border: '1px solid #e5e7eb', fontSize: '0.9rem', fontWeight: 500
                }}>
                  {user.photoURL ? (
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" style={{ width: 18, height: 18 }} />
                  ) : (
                    <Mail size={16} />
                  )}
                  {user.photoURL ? 'Google Account' : 'Email & Password'}
                </div>
              </div>

              <div>
                <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#ef4444' }}>
                  Danger Zone
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  Sign out from your account on this device.
                </p>
                <button
                  onClick={handleLogout}
                  className="btn"
                  style={{
                    padding: '0.7rem 1.5rem', fontSize: '0.9rem',
                    background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca',
                    borderRadius: '8px', fontWeight: 500, cursor: 'pointer'
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Privacy Tab ═══ */}
        {activeTab === 'privacy' && (
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Privacy & Data</h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Control your data and notifications</p>

            <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #f0f0f0' }}>
                <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Notifications</h3>
                {['Booking updates', 'Payment alerts', 'Promotional emails', 'Security alerts'].map((item, i) => (
                  <label key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    cursor: 'pointer', marginBottom: '0.75rem', fontSize: '0.95rem'
                  }}>
                    <input type="checkbox" defaultChecked={i < 2} style={{ width: 18, height: 18, accentColor: '#22c55e' }} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>

              <div>
                <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#ef4444' }}>Delete Account</h3>
                <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  Permanently delete your account and all associated data. This cannot be undone.
                </p>
                <button className="btn" style={{
                  padding: '0.7rem 1.5rem', fontSize: '0.9rem',
                  background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca',
                  borderRadius: '8px', fontWeight: 500, cursor: 'pointer'
                }}>
                  Delete My Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
