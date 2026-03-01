import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Check, X, Clock, Tractor, Calendar, DollarSign, User, MapPin } from 'lucide-react';

const BookingRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.uid) {
      fetchBookingRequests();
    }
  }, [user]);

  const fetchBookingRequests = async () => {
    try {
      setLoading(true);
      setError('');

      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('ownerId', '==', user.uid));
      const snapshot = await getDocs(q);

      const requestList = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      // Sort by newest
      requestList.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setRequests(requestList);
    } catch (err) {
      console.error('Failed to fetch booking requests:', err);
      setError('Failed to load booking requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await updateDoc(doc(db, 'bookings', requestId), {
        status: 'approved',
        updatedAt: new Date().toISOString()
      });
      setRequests(requests.map(r =>
        r.id === requestId ? { ...r, status: 'approved' } : r
      ));
    } catch (err) {
      console.error('Failed to approve:', err);
      setError('Failed to approve booking.');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await updateDoc(doc(db, 'bookings', requestId), {
        status: 'rejected',
        updatedAt: new Date().toISOString()
      });
      setRequests(requests.map(r =>
        r.id === requestId ? { ...r, status: 'rejected' } : r
      ));
    } catch (err) {
      console.error('Failed to reject:', err);
      setError('Failed to reject booking.');
    }
  };

  // Only OWNER role
  if (user?.role !== 'OWNER') {
    return (
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <div className="auth-container">
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <Tractor size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Access Denied</h2>
            <p style={{ color: '#6b7280' }}>Only tractor owners can view booking requests.</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredRequests = requests.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: '#fef3c7', color: '#d97706', label: '⏳ Pending' },
      approved: { bg: '#d1fae5', color: '#059669', label: '✓ Approved' },
      rejected: { bg: '#fee2e2', color: '#dc2626', label: '✕ Rejected' },
      cancelled: { bg: '#f3f4f6', color: '#6b7280', label: '✕ Cancelled' }
    };
    const s = config[status] || config.pending;
    return (
      <span style={{
        fontSize: '0.75rem', fontWeight: 600,
        background: s.bg, color: s.color,
        padding: '0.25rem 0.65rem', borderRadius: '100px'
      }}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Booking Requests</h1>
        <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>Manage booking requests from farmers</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
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
            {f === 'all' ? `All (${requests.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${requests.filter(r => r.status === f).length})`}
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
          <Clock size={48} color="#22c55e" style={{ margin: '0 auto' }} />
          <p style={{ color: '#6b7280', marginTop: '1rem' }}>Loading requests...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && filteredRequests.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb'
        }}>
          <Clock size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {filter === 'all' ? 'No booking requests yet' : `No ${filter} requests`}
          </h3>
          <p style={{ color: '#6b7280' }}>
            Farmers will send booking requests when they want to rent your tractors.
          </p>
        </div>
      )}

      {/* Requests List */}
      {!loading && filteredRequests.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredRequests.map(request => (
            <div key={request.id} style={{
              background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb',
              padding: '1.5rem', transition: 'all 0.15s',
              borderLeft: request.status === 'pending' ? '4px solid #f59e0b' : '4px solid transparent'
            }}>
              {/* Header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem'
              }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                    {request.tractorName}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <User size={14} /> Requested by: <strong>{request.farmerName}</strong>
                  </p>
                </div>
                {getStatusBadge(request.status)}
              </div>

              {/* Details */}
              <div style={{
                display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
                padding: '0.75rem 0', borderTop: '1px solid #f0f0f0',
                borderBottom: request.status === 'pending' ? '1px solid #f0f0f0' : 'none'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6b7280', fontSize: '0.9rem' }}>
                  <Calendar size={14} color="#3b82f6" /> {request.bookingDate}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6b7280', fontSize: '0.9rem' }}>
                  <Clock size={14} color="#f59e0b" /> {request.duration} hours
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6b7280', fontSize: '0.9rem' }}>
                  <DollarSign size={14} color="#22c55e" /> ₹{request.totalAmount}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6b7280', fontSize: '0.9rem' }}>
                  <MapPin size={14} color="#8b5cf6" /> {request.location}
                </span>
              </div>

              {request.notes && (
                <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.75rem', fontStyle: 'italic' }}>
                  📝 Farmer's note: "{request.notes}"
                </p>
              )}

              {/* Action Buttons - only for pending */}
              {request.status === 'pending' && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    onClick={() => handleApprove(request.id)}
                    style={{
                      background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
                      padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem',
                      fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem'
                    }}
                  >
                    <Check size={16} /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    style={{
                      background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca',
                      padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem',
                      fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem'
                    }}
                  >
                    <X size={16} /> Reject
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

export default BookingRequests;
