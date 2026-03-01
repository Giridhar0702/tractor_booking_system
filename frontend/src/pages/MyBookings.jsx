import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Clock, Check, X, Tractor, Calendar, MapPin, DollarSign } from 'lucide-react';

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user?.uid) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');

      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('farmerId', '==', user.uid));
      const snapshot = await getDocs(q);

      const bookingList = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      // Sort by newest
      bookingList.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setBookings(bookingList);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      });
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
    } catch (err) {
      console.error('Failed to cancel:', err);
      setError('Failed to cancel booking.');
    }
  };

  // Only FARMER role
  if (user?.role === 'OWNER') {
    return (
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <div className="auth-container">
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <Tractor size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Access Denied</h2>
            <p style={{ color: '#6b7280' }}>This page is for farmers to view their bookings.</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: '#fef3c7', color: '#d97706', icon: <Clock size={13} />, label: 'Pending' },
      approved: { bg: '#d1fae5', color: '#059669', icon: <Check size={13} />, label: 'Approved' },
      rejected: { bg: '#fee2e2', color: '#dc2626', icon: <X size={13} />, label: 'Rejected' },
      cancelled: { bg: '#f3f4f6', color: '#6b7280', icon: <X size={13} />, label: 'Cancelled' },
      completed: { bg: '#dbeafe', color: '#2563eb', icon: <Check size={13} />, label: 'Completed' }
    };
    const s = config[status] || config.pending;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        fontSize: '0.75rem', fontWeight: 600,
        background: s.bg, color: s.color,
        padding: '0.25rem 0.65rem', borderRadius: '100px'
      }}>
        {s.icon} {s.label}
      </span>
    );
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Bookings</h1>
        <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>View and manage your tractor bookings</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'pending', 'approved', 'rejected', 'cancelled'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.5rem 1rem', borderRadius: '100px', fontSize: '0.85rem',
              fontWeight: 500, cursor: 'pointer',
              border: filter === f ? '1px solid #22c55e' : '1px solid #e5e7eb',
              background: filter === f ? '#f0fdf4' : '#fff',
              color: filter === f ? '#16a34a' : '#6b7280'
            }}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem'
        }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Tractor size={48} color="#22c55e" style={{ margin: '0 auto' }} />
          <p style={{ color: '#6b7280', marginTop: '1rem' }}>Loading bookings...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && filteredBookings.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb'
        }}>
          <Calendar size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            {filter === 'all' ? 'Browse tractors and make your first booking!' : 'Try a different filter'}
          </p>
          {filter === 'all' && (
            <Link to="/tractors" className="btn btn-primary" style={{ padding: '0.7rem 1.5rem' }}>
              🚜 Browse Tractors
            </Link>
          )}
        </div>
      )}

      {/* Bookings List */}
      {!loading && filteredBookings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredBookings.map(b => (
            <div key={b.id} style={{
              background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb',
              padding: '1.25rem 1.5rem'
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem'
              }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.2rem' }}>{b.tractorName}</h3>
                  <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Owner: {b.ownerName}</p>
                </div>
                {getStatusBadge(b.status)}
              </div>

              <div style={{
                display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
                padding: '0.75rem 0', borderTop: '1px solid #f0f0f0'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6b7280', fontSize: '0.9rem' }}>
                  <Calendar size={14} color="#3b82f6" /> {b.bookingDate}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6b7280', fontSize: '0.9rem' }}>
                  <Clock size={14} color="#f59e0b" /> {b.duration} hours
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6b7280', fontSize: '0.9rem' }}>
                  <DollarSign size={14} color="#22c55e" /> ₹{b.totalAmount}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6b7280', fontSize: '0.9rem' }}>
                  <MapPin size={14} color="#8b5cf6" /> {b.location}
                </span>
              </div>

              {b.notes && (
                <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
                  Note: {b.notes}
                </p>
              )}

              {b.status === 'pending' && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f0f0f0' }}>
                  <button
                    onClick={() => handleCancel(b.id)}
                    style={{
                      background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca',
                      padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem',
                      fontWeight: 500, cursor: 'pointer'
                    }}
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
