import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { TrendingUp, Clock, Check, X, AlertCircle, Zap, Tractor, Plus, BookOpen, Settings } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTractors: 0,
    totalBookings: 0,
    pendingRequests: 0,
    completedBookings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid && user?.role) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const isOwner = user.role === 'OWNER';

      if (isOwner) {
        // Owner: count their tractors
        const tractorsSnap = await getDocs(
          query(collection(db, 'tractors'), where('ownerId', '==', user.uid))
        );

        // Owner: count bookings for their tractors
        const bookingsSnap = await getDocs(
          query(collection(db, 'bookings'), where('ownerId', '==', user.uid))
        );

        const bookings = bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const pending = bookings.filter(b => b.status === 'pending').length;
        const completed = bookings.filter(b => b.status === 'approved' || b.status === 'completed').length;

        setStats({
          totalTractors: tractorsSnap.size,
          totalBookings: bookings.length,
          pendingRequests: pending,
          completedBookings: completed
        });

        // Recent bookings (last 5)
        setRecentBookings(bookings.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5));

      } else {
        // Farmer: count their bookings
        const bookingsSnap = await getDocs(
          query(collection(db, 'bookings'), where('farmerId', '==', user.uid))
        );

        const bookings = bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const pending = bookings.filter(b => b.status === 'pending').length;
        const confirmed = bookings.filter(b => b.status === 'approved' || b.status === 'completed').length;

        setStats({
          totalTractors: 0,
          totalBookings: bookings.length,
          pendingRequests: pending,
          completedBookings: confirmed
        });

        setRecentBookings(bookings.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5));
      }
    } catch (err) {
      console.error('Dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '400px', margin: '0 auto', padding: '3rem' }}>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Please log in to view your dashboard.</p>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  if (!user.role) {
    navigate('/register', { replace: true });
    return null;
  }

  const isOwner = user.role === 'OWNER';

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#d97706', text: '⏳ Pending' },
      approved: { bg: '#d1fae5', color: '#059669', text: '✓ Approved' },
      rejected: { bg: '#fee2e2', color: '#dc2626', text: '✕ Rejected' },
      completed: { bg: '#dbeafe', color: '#2563eb', text: '✓ Completed' }
    };
    const s = styles[status] || styles.pending;
    return (
      <span style={{
        fontSize: '0.75rem', fontWeight: 600,
        background: s.bg, color: s.color,
        padding: '0.2rem 0.6rem', borderRadius: '100px'
      }}>
        {s.text}
      </span>
    );
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #166534, #15803d)',
        padding: '2rem 0', color: '#fff'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Welcome back, {user.name}! 👋
          </h1>
          <p style={{ opacity: 0.85, marginTop: '0.25rem' }}>
            Your {isOwner ? 'Owner' : 'Farmer'} Dashboard
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1rem' }}>
        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem', marginBottom: '2rem'
        }}>
          {isOwner ? (
            <>
              <StatCard icon={<Tractor size={22} />} label="My Tractors" value={stats.totalTractors} color="#3b82f6" link="/my-tractors" />
              <StatCard icon={<Clock size={22} />} label="Pending Requests" value={stats.pendingRequests} color="#f59e0b" link="/booking-requests" />
              <StatCard icon={<Check size={22} />} label="Approved Bookings" value={stats.completedBookings} color="#22c55e" />
              <StatCard icon={<BookOpen size={22} />} label="Total Bookings" value={stats.totalBookings} color="#8b5cf6" />
            </>
          ) : (
            <>
              <StatCard icon={<BookOpen size={22} />} label="Total Bookings" value={stats.totalBookings} color="#3b82f6" link="/my-bookings" />
              <StatCard icon={<Clock size={22} />} label="Pending" value={stats.pendingRequests} color="#f59e0b" />
              <StatCard icon={<Check size={22} />} label="Confirmed" value={stats.completedBookings} color="#22c55e" />
            </>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Recent Bookings */}
          <div style={{
            background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f0f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                📋 Recent {isOwner ? 'Booking Requests' : 'Bookings'}
              </h2>
              <Link to={isOwner ? '/booking-requests' : '/my-bookings'} style={{
                fontSize: '0.85rem', color: '#22c55e', fontWeight: 500, textDecoration: 'none'
              }}>
                View All →
              </Link>
            </div>

            <div style={{ padding: '1rem 1.5rem' }}>
              {loading ? (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem 0' }}>Loading...</p>
              ) : recentBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                  <AlertCircle size={40} color="#d1d5db" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                    {isOwner ? 'No booking requests yet' : 'No bookings yet'}
                  </p>
                  <Link to={isOwner ? '/add-tractor' : '/tractors'} className="btn btn-primary" style={{
                    marginTop: '1rem', padding: '0.5rem 1.25rem', fontSize: '0.85rem'
                  }}>
                    {isOwner ? 'Add Tractor' : 'Browse Tractors'}
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recentBookings.map(b => (
                    <div key={b.id} style={{
                      padding: '0.75rem', borderRadius: '8px', border: '1px solid #f0f0f0',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{b.tractorName}</p>
                        <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                          {b.bookingDate} • {b.duration}hrs • ₹{b.totalAmount}
                        </p>
                      </div>
                      {getStatusBadge(b.status)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f0f0' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>⚡ Quick Actions</h2>
            </div>

            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {isOwner ? (
                <>
                  <ActionLink to="/add-tractor" icon={<Plus size={18} />} title="Add Tractor" desc="List a new tractor" />
                  <ActionLink to="/my-tractors" icon={<Tractor size={18} />} title="My Tractors" desc="Manage all listings" />
                  <ActionLink to="/booking-requests" icon={<Clock size={18} />} title="Booking Requests" desc="Review requests" />
                  <ActionLink to="/settings" icon={<Settings size={18} />} title="Settings" desc="Update profile" />
                </>
              ) : (
                <>
                  <ActionLink to="/tractors" icon={<Tractor size={18} />} title="Browse Tractors" desc="Find & book tractors" />
                  <ActionLink to="/my-bookings" icon={<BookOpen size={18} />} title="My Bookings" desc="View your bookings" />
                  <ActionLink to="/settings" icon={<Settings size={18} />} title="Settings" desc="Update profile" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, link }) => (
  <div style={{
    background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb',
    padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
    cursor: link ? 'pointer' : 'default'
  }}
    onClick={() => link && (window.location.href = link)}
  >
    <div style={{
      width: 44, height: 44, borderRadius: '10px',
      background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: color
    }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111' }}>{value}</p>
    </div>
  </div>
);

const ActionLink = ({ to, icon, title, desc }) => (
  <Link to={to} style={{
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.75rem', borderRadius: '8px', textDecoration: 'none',
    color: 'inherit', border: '1px solid #f0f0f0', transition: 'all 0.15s'
  }}
    onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
  >
    <div style={{
      width: 36, height: 36, borderRadius: '8px',
      background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#16a34a'
    }}>
      {icon}
    </div>
    <div>
      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</p>
      <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{desc}</p>
    </div>
  </Link>
);

export default Dashboard;
