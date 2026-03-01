import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Edit2, Trash2, Plus, Tractor, MapPin, Zap, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';

const MyTractors = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tractors, setTractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.uid) {
      fetchTractors();
    }
  }, [user]);

  const fetchTractors = async () => {
    try {
      setLoading(true);
      setError('');

      const tractorsRef = collection(db, 'tractors');
      const q = query(tractorsRef, where('ownerId', '==', user.uid));
      const snapshot = await getDocs(q);

      const myTractors = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      // Sort by newest first
      myTractors.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setTractors(myTractors);
    } catch (err) {
      console.error('Failed to fetch tractors:', err);
      setError('Failed to load your tractors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tractorId) => {
    if (window.confirm('Are you sure you want to delete this tractor? This cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'tractors', tractorId));
        setTractors(tractors.filter(t => t.id !== tractorId));
      } catch (err) {
        console.error('Failed to delete tractor:', err);
        setError('Failed to delete tractor.');
      }
    }
  };

  const toggleAvailability = async (tractorId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'tractors', tractorId), {
        available: !currentStatus,
        updatedAt: new Date().toISOString()
      });
      setTractors(tractors.map(t =>
        t.id === tractorId ? { ...t, available: !currentStatus } : t
      ));
    } catch (err) {
      console.error('Failed to update availability:', err);
      setError('Failed to update tractor availability.');
    }
  };

  // Check if user is owner
  if (user?.role !== 'OWNER') {
    return (
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <div className="auth-container">
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <Tractor size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Access Denied</h2>
            <p style={{ color: '#6b7280' }}>Only tractor owners can view this page.</p>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Tractors</h1>
          <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>Manage your tractor listings on AgriRent</p>
        </div>
        <Link to="/add-tractor" className="btn btn-primary" style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.7rem 1.5rem', fontSize: '0.9rem'
        }}>
          <Plus size={18} /> Add New Tractor
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Tractor size={48} color="#22c55e" style={{ margin: '0 auto' }} />
          <p style={{ color: '#6b7280', marginTop: '1rem' }}>Loading your tractors...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && tractors.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb'
        }}>
          <Tractor size={56} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No tractors yet</h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Start earning by adding your first tractor to the platform</p>
          <Link to="/add-tractor" className="btn btn-primary" style={{ padding: '0.7rem 1.5rem' }}>
            🚜 Add Your First Tractor
          </Link>
        </div>
      )}

      {/* Tractors List */}
      {!loading && tractors.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tractors.map(tractor => (
            <div key={tractor.id} style={{
              background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb',
              padding: '1.5rem', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
              transition: 'all 0.15s',
              opacity: tractor.available ? 1 : 0.7
            }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{tractor.name}</h3>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600,
                    background: tractor.available ? '#f0fdf4' : '#fef2f2',
                    color: tractor.available ? '#16a34a' : '#ef4444',
                    padding: '0.2rem 0.6rem', borderRadius: '100px',
                    border: `1px solid ${tractor.available ? '#bbf7d0' : '#fecaca'}`
                  }}>
                    {tractor.available ? 'Available' : 'Unavailable'}
                  </span>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 500,
                    background: '#f8fafc', color: '#6b7280',
                    padding: '0.2rem 0.6rem', borderRadius: '100px',
                    border: '1px solid #e5e7eb'
                  }}>
                    {tractor.category}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6b7280', fontSize: '0.9rem' }}>
                    <Zap size={14} color="#f59e0b" /> {tractor.hp} HP
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6b7280', fontSize: '0.9rem' }}>
                    <DollarSign size={14} color="#22c55e" /> ₹{tractor.pricePerHour}/hr
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6b7280', fontSize: '0.9rem' }}>
                    <MapPin size={14} color="#3b82f6" /> {tractor.location}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => toggleAvailability(tractor.id, tractor.available)}
                  title={tractor.available ? 'Mark Unavailable' : 'Mark Available'}
                  style={{
                    background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px',
                    padding: '0.5rem 0.75rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    fontSize: '0.8rem', color: tractor.available ? '#16a34a' : '#9ca3af'
                  }}
                >
                  {tractor.available ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  {tractor.available ? 'On' : 'Off'}
                </button>
                <button
                  onClick={() => handleDelete(tractor.id)}
                  style={{
                    background: 'none', border: '1px solid #fecaca', borderRadius: '8px',
                    padding: '0.5rem 0.75rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    fontSize: '0.8rem', color: '#ef4444'
                  }}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTractors;
