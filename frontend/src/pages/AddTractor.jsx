import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Tractor, MapPin, Zap, DollarSign, CheckCircle } from 'lucide-react';

const AddTractor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    hp: '',
    pricePerHour: '',
    location: '',
    description: '',
    category: 'General',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!formData.name.trim()) {
      setError('Tractor name is required');
      setLoading(false);
      return;
    }

    if (!formData.hp || formData.hp <= 0) {
      setError('Valid horsepower is required');
      setLoading(false);
      return;
    }

    if (!formData.pricePerHour || formData.pricePerHour <= 0) {
      setError('Valid price per hour is required');
      setLoading(false);
      return;
    }

    if (!formData.location.trim()) {
      setError('Location is required');
      setLoading(false);
      return;
    }

    try {
      // Save tractor to Firestore
      const tractorData = {
        name: formData.name.trim(),
        hp: Number(formData.hp),
        pricePerHour: Number(formData.pricePerHour),
        location: formData.location.trim(),
        description: formData.description.trim(),
        category: formData.category,
        ownerId: user.uid,
        ownerName: user.name || 'Unknown',
        ownerEmail: user.email || '',
        available: true,
        rating: 0,
        reviews: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'tractors'), tractorData);

      setSuccess('Tractor added successfully! Redirecting...');
      setFormData({
        name: '',
        hp: '',
        pricePerHour: '',
        location: '',
        description: '',
        category: 'General',
      });

      setTimeout(() => {
        navigate('/my-tractors');
      }, 1500);

    } catch (err) {
      console.error('Failed to add tractor:', err);
      setError('Failed to add tractor. Please try again.');
    } finally {
      setLoading(false);
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
            <p style={{ color: '#6b7280' }}>Only tractor owners can add tractors to the platform.</p>
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
      <div className="auth-container" style={{ maxWidth: '640px' }}>
        <div className="card" style={{ padding: '2.5rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'linear-gradient(135deg, #22c55e20, #16a34a10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <Tractor size={28} color="#22c55e" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Add Your Tractor</h1>
            <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>List your tractor on AgriRent and start earning</p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem',
              fontSize: '0.9rem', textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              color: '#16a34a', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem',
              fontSize: '0.9rem', textAlign: 'center', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '0.5rem'
            }}>
              <CheckCircle size={16} /> {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Tractor Name */}
            <div className="form-group">
              <label htmlFor="name" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Tractor size={15} /> Tractor Name / Model
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., John Deere 5310 or Mahindra 575"
                className="input-field"
                disabled={loading}
              />
            </div>

            {/* HP and Price Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="hp" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Zap size={15} /> Horsepower (HP)
                </label>
                <input
                  type="number"
                  id="hp"
                  name="hp"
                  value={formData.hp}
                  onChange={handleChange}
                  placeholder="e.g., 50"
                  className="input-field"
                  disabled={loading}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="pricePerHour" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <DollarSign size={15} /> Price per Hour (₹)
                </label>
                <input
                  type="number"
                  id="pricePerHour"
                  name="pricePerHour"
                  value={formData.pricePerHour}
                  onChange={handleChange}
                  placeholder="e.g., 500"
                  className="input-field"
                  disabled={loading}
                  min="1"
                />
              </div>
            </div>

            {/* Location */}
            <div className="form-group">
              <label htmlFor="location" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={15} /> Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Salem, Tamil Nadu"
                className="input-field"
                disabled={loading}
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="category" className="form-label">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
                disabled={loading}
              >
                <option value="General">General Purpose</option>
                <option value="Heavy">Heavy Duty</option>
                <option value="Light">Light Duty</option>
                <option value="Specialized">Specialized</option>
              </select>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description" className="form-label">Additional Details (Optional)</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Condition, features, availability hours, etc."
                className="input-field"
                disabled={loading}
                rows="3"
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Adding Tractor...' : '🚜 Add Tractor to Platform'}
            </button>

            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', marginTop: '1rem' }}>
              💡 Be accurate with details and competitive with pricing to attract more bookings.
            </p>
          </form>
        </div>

        {/* Info Box */}
        <div style={{
          marginTop: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: '12px', padding: '1.5rem'
        }}>
          <h3 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '1rem' }}>What happens next?</h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              'Your tractor will be listed on our platform',
              'Farmers can view and book your tractor',
              'You\'ll receive booking requests to approve',
              'Earn money for every successful booking'
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', fontSize: '0.9rem' }}>
                <CheckCircle size={16} color="#22c55e" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddTractor;
