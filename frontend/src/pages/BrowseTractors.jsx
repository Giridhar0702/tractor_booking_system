import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, addDoc, where } from 'firebase/firestore';
import { Search, MapPin, Zap, DollarSign, Tractor, X, Calendar, Clock, FileText } from 'lucide-react';

const BrowseTractors = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tractors, setTractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Booking modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTractor, setSelectedTractor] = useState(null);
  const [booking, setBooking] = useState({ date: '', duration: '', notes: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [availabilityError, setAvailabilityError] = useState('');

  useEffect(() => {
    fetchTractors();
  }, []);

  const fetchTractors = async () => {
    try {
      setLoading(true);
      setError('');

      const tractorsRef = collection(db, 'tractors');
      const q = query(tractorsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const tractorList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setTractors(tractorList);
    } catch (err) {
      console.error('Failed to fetch tractors:', err);
      setError('Failed to load tractors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort
  const filteredTractors = tractors.filter(tractor => {
    const matchesSearch =
      tractor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tractor.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tractor.ownerName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tractor.category === selectedCategory;
    const isAvailable = tractor.available !== false;
    return matchesSearch && matchesCategory && isAvailable;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return (a.pricePerHour || 0) - (b.pricePerHour || 0);
      case 'price-high': return (b.pricePerHour || 0) - (a.pricePerHour || 0);
      case 'hp-high': return (b.hp || 0) - (a.hp || 0);
      case 'newest': return (b.createdAt || '').localeCompare(a.createdAt || '');
      default: return 0;
    }
  });

  const openBookingModal = (tractor) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'OWNER') {
      alert('Owners cannot book tractors. Switch to a Farmer account.');
      return;
    }
    setSelectedTractor(tractor);
    setBooking({ date: '', duration: '', notes: '' });
    setBookingSuccess('');
    setAvailabilityError('');
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async () => {
    if (!booking.date) return alert('Please select a date');
    if (!booking.duration || booking.duration <= 0) return alert('Please enter duration');

    setBookingLoading(true);
    try {
      // Prevent double-booking for the same tractor & date
      const bookingsRef = collection(db, 'bookings');
      const availabilityQuery = query(
        bookingsRef,
        where('tractorId', '==', selectedTractor.id),
        where('bookingDate', '==', booking.date),
        where('status', 'in', ['pending', 'approved'])
      );
      const existingForDate = await getDocs(availabilityQuery);

      if (!existingForDate.empty) {
        setAvailabilityError('This tractor is already booked for that date. Please choose another date.');
        setBookingLoading(false);
        return;
      }

      const totalAmount = Number(booking.duration) * Number(selectedTractor.pricePerHour);

      await addDoc(collection(db, 'bookings'), {
        tractorId: selectedTractor.id,
        tractorName: selectedTractor.name,
        ownerId: selectedTractor.ownerId,
        ownerName: selectedTractor.ownerName,
        farmerId: user.uid,
        farmerName: user.name || 'Unknown',
        farmerEmail: user.email || '',
        bookingDate: booking.date,
        duration: Number(booking.duration),
        totalAmount: totalAmount,
        location: selectedTractor.location,
        notes: booking.notes.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setBookingSuccess(`Booking request sent! Total: ₹${totalAmount}`);
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingSuccess('');
      }, 2000);
    } catch (err) {
      console.error('Booking failed:', err);
      alert('Failed to create booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div>
      {/* Search Header */}
      <div style={{
        background: 'linear-gradient(135deg, #166534, #15803d)',
        padding: '2.5rem 0', color: '#fff'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Find & Rent Tractors
          </h1>
          <p style={{ opacity: 0.85, marginBottom: '1.5rem' }}>
            Discover the perfect tractor for your farming needs
          </p>

          <div style={{
            maxWidth: '600px', margin: '0 auto',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(255,255,255,0.15)', borderRadius: '12px',
            padding: '0.5rem 1rem', border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Search size={20} color="rgba(255,255,255,0.6)" />
            <input
              type="text"
              placeholder="Search by tractor name, location, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1, border: 'none', outline: 'none',
                background: 'transparent', color: '#fff',
                fontSize: '1rem', padding: '0.5rem'
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem'
              }}>
                <X size={18} color="rgba(255,255,255,0.6)" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1rem' }}>
        {/* Filter Bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['all', 'General', 'Heavy', 'Light', 'Specialized'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '100px', fontSize: '0.85rem',
                  fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                  border: selectedCategory === cat ? '1px solid #22c55e' : '1px solid #e5e7eb',
                  background: selectedCategory === cat ? '#f0fdf4' : '#fff',
                  color: selectedCategory === cat ? '#16a34a' : '#6b7280'
                }}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem',
                border: '1px solid #e5e7eb', background: '#fff', color: '#374151', cursor: 'pointer'
              }}
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="hp-high">Highest Power (HP)</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Found <strong style={{ color: '#222' }}>{filteredTractors.length}</strong> tractor{filteredTractors.length !== 1 ? 's' : ''}
            {searchQuery && <> for "<strong>{searchQuery}</strong>"</>}
          </p>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center'
          }}>
            {error}
            <button onClick={fetchTractors} className="btn btn-primary" style={{ marginLeft: '1rem', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Retry</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Tractor size={48} color="#22c55e" style={{ margin: '0 auto' }} />
            <p style={{ color: '#6b7280', marginTop: '1rem' }}>Loading available tractors...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredTractors.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb'
          }}>
            <Tractor size={56} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {searchQuery || selectedCategory !== 'all' ? 'No tractors match your search' : 'No tractors listed yet'}
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Be the first tractor owner to list on AgriRent!'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="btn btn-secondary" style={{ padding: '0.6rem 1.5rem' }}>
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Tractors Grid */}
        {!loading && filteredTractors.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredTractors.map(tractor => (
              <div key={tractor.id} style={{
                background: '#fff', borderRadius: '16px',
                border: '1px solid #e5e7eb', overflow: 'hidden',
                transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}
              >
                {/* Card Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                  padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>{tractor.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>by {tractor.ownerName}</p>
                  </div>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 600,
                    background: '#fff', color: '#16a34a',
                    padding: '0.3rem 0.75rem', borderRadius: '100px', border: '1px solid #bbf7d0'
                  }}>
                    {tractor.category}
                  </span>
                </div>

                {/* Specs */}
                <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={16} color="#f59e0b" />
                    <div>
                      <p style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Power</p>
                      <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{tractor.hp} HP</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <DollarSign size={16} color="#22c55e" />
                    <div>
                      <p style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Rate</p>
                      <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>₹{tractor.pricePerHour}/hr</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} color="#3b82f6" />
                    <div>
                      <p style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Location</p>
                      <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{tractor.location}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {tractor.description && (
                  <div style={{ padding: '0 1.5rem 1rem' }}>
                    <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.5 }}>
                      {tractor.description.length > 100 ? tractor.description.substring(0, 100) + '...' : tractor.description}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div style={{
                  padding: '1rem 1.5rem', borderTop: '1px solid #f0f0f0',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: '0.8rem', fontWeight: 500, color: '#16a34a',
                    display: 'flex', alignItems: 'center', gap: '0.4rem'
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                    Available
                  </span>

                  <button
                    onClick={() => openBookingModal(tractor)}
                    className="btn btn-primary"
                    style={{
                      padding: '0.5rem 1.25rem', fontSize: '0.85rem', borderRadius: '8px',
                      opacity: tractor.ownerId === user?.uid ? 0.5 : 1,
                      pointerEvents: tractor.ownerId === user?.uid ? 'none' : 'auto'
                    }}
                    disabled={tractor.ownerId === user?.uid}
                  >
                    {tractor.ownerId === user?.uid ? 'Your Tractor' : 'Book Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ Booking Modal ═══ */}
      {showBookingModal && selectedTractor && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}
          onClick={() => setShowBookingModal(false)}
        >
          <div style={{
            background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%',
            padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Book Tractor</h2>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{selectedTractor.name}</p>
              </div>
              <button onClick={() => setShowBookingModal(false)} style={{
                background: '#f3f4f6', border: 'none', borderRadius: '50%',
                width: 36, height: 36, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <X size={18} />
              </button>
            </div>

            {/* Success */}
            {bookingSuccess && (
              <div style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a',
                padding: '1rem', borderRadius: '8px', textAlign: 'center',
                fontSize: '1rem', fontWeight: 600
              }}>
                ✓ {bookingSuccess}
              </div>
            )}

            {!bookingSuccess && (
              <>
                {/* Tractor Summary */}
                <div style={{
                  background: '#f8fafc', borderRadius: '10px', padding: '1rem',
                  marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between'
                }}>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Rate</p>
                    <p style={{ fontWeight: 700, color: '#22c55e' }}>₹{selectedTractor.pricePerHour}/hr</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Power</p>
                    <p style={{ fontWeight: 700 }}>{selectedTractor.hp} HP</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Location</p>
                    <p style={{ fontWeight: 700 }}>{selectedTractor.location}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    <Calendar size={15} /> Booking Date
                  </label>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.3rem' }}>
                    We automatically block dates that already have a confirmed or pending booking.
                  </p>
                  <input
                    type="date"
                    value={booking.date}
                    onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {availabilityError && (
                    <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                      {availabilityError}
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    <Clock size={15} /> Duration (Hours)
                  </label>
                  <input
                    type="number"
                    value={booking.duration}
                    onChange={(e) => setBooking({ ...booking, duration: e.target.value })}
                    placeholder="e.g., 6"
                    className="input-field"
                    min="1"
                    max="24"
                  />
                </div>

                {/* Notes */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    <FileText size={15} /> Notes (Optional)
                  </label>
                  <textarea
                    value={booking.notes}
                    onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                    placeholder="Any specific requirements..."
                    className="input-field"
                    rows="2"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* Total */}
                {booking.duration > 0 && (
                  <div style={{
                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                    borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: 600 }}>Estimated Total</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>
                      ₹{(Number(booking.duration) * Number(selectedTractor.pricePerHour)).toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleBookingSubmit}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Sending Request...' : '📩 Send Booking Request'}
                </button>
                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.75rem' }}>
                  The owner will review and approve/reject your request
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseTractors;
