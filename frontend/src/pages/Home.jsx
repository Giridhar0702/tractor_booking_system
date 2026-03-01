import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight, CheckCircle, Shield, Truck, Users, Clock,
  MapPin, Star, Zap, Phone, TrendingUp, Wheat, Tractor
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* ═══════════════ Hero Section ═══════════════ */}
      <section className="hero">
        <div className="hero-content">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)',
            padding: '0.4rem 1rem', borderRadius: '100px', marginBottom: '1.5rem',
            fontSize: '0.85rem', color: '#16a34a', fontWeight: 500
          }}>
            <Zap size={14} /> Trusted by 5,000+ farmers across India
          </div>

          <h1>
            Rent the Best <span style={{ color: 'var(--primary-color)' }}>Tractors</span><br />
            for Your Farm
          </h1>
          <p style={{ fontSize: '1.15rem', lineHeight: 1.7, maxWidth: '540px' }}>
            Affordable, reliable, and powerful tractors available for rent in your area.
            Connect with verified tractor owners and boost your farm productivity.
          </p>
          <div className="hero-actions">
            <Link to={user ? "/dashboard" : "/register"} className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
              {user ? 'Go to Dashboard' : 'Get Started Free'} <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
            </Link>
            {user && (
              <Link to="/tractors" className="btn btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
                Browse Tractors
              </Link>
            )}
            {!user && (
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}>
                Sign In
              </Link>
            )}
          </div>

          {/* Trust indicators */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '2rem',
            marginTop: '2.5rem', flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <CheckCircle size={16} color="#22c55e" /> No registration fees
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <CheckCircle size={16} color="#22c55e" /> Verified owners
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <CheckCircle size={16} color="#22c55e" /> Instant booking
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ Stats Bar ═══════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, #166534, #15803d)',
        padding: '3rem 0', color: '#fff'
      }}>
        <div className="container">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '2rem', textAlign: 'center'
          }}>
            {[
              { value: '5,000+', label: 'Active Farmers', icon: <Users size={24} /> },
              { value: '1,200+', label: 'Tractors Listed', icon: <Tractor size={24} /> },
              { value: '15,000+', label: 'Bookings Done', icon: <TrendingUp size={24} /> },
              { value: '50+', label: 'Districts Covered', icon: <MapPin size={24} /> }
            ].map((stat, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ opacity: 0.8 }}>{stat.icon}</div>
                <span style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{stat.value}</span>
                <span style={{ opacity: 0.8, fontSize: '0.9rem' }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ Features ═══════════════ */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Why Choose <span style={{ color: 'var(--primary-color)' }}>AgriRent</span>?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
              We make farm equipment rental simple, transparent, and accessible for everyone.
            </p>
          </div>

          <div className="features-grid">
            <FeatureCard
              icon={<Truck size={32} />}
              title="Wide Variety"
              description="Choose from 50+ HP ranges and attachments — ploughing, harvesting, leveling, and more."
            />
            <FeatureCard
              icon={<Shield size={32} />}
              title="Verified Owners"
              description="Every tractor owner is verified with Aadhaar and documents. Rent with complete confidence."
            />
            <FeatureCard
              icon={<Clock size={32} />}
              title="Instant Booking"
              description="Book a tractor in seconds. Get confirmation instantly and track your booking in real-time."
            />
            <FeatureCard
              icon={<MapPin size={32} />}
              title="Nearby Tractors"
              description="Find tractors near your farm with location-based search. Save time and transportation costs."
            />
            <FeatureCard
              icon={<Star size={32} />}
              title="Ratings & Reviews"
              description="Check ratings from other farmers before booking. Transparent feedback builds trust."
            />
            <FeatureCard
              icon={<Phone size={32} />}
              title="24/7 Support"
              description="Our support team is available round the clock. Get help anytime via chat or phone."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════ How It Works ═══════════════ */}
      <section style={{
        padding: '5rem 0',
        background: 'linear-gradient(180deg, #f0fdf4 0%, #fff 100%)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              How It Works
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              Get your tractor in 3 simple steps
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2.5rem', maxWidth: '900px', margin: '0 auto'
          }}>
            {[
              { step: '1', title: 'Create Your Account', desc: 'Sign up for free as a Farmer or Tractor Owner. It takes less than 30 seconds.', color: '#22c55e' },
              { step: '2', title: 'Search & Book', desc: 'Browse available tractors near you, compare prices, and book the one that suits your needs.', color: '#3b82f6' },
              { step: '3', title: 'Start Farming', desc: 'Your tractor arrives at your farm. Pay securely after the job is done. It\'s that simple!', color: '#f59e0b' }
            ].map((item, i) => (
              <div key={i} style={{
                textAlign: 'center', padding: '2rem', position: 'relative'
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)`,
                  border: `2px solid ${item.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.5rem', fontSize: '1.5rem', fontWeight: 800,
                  color: item.color
                }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ For Owners CTA ═══════════════ */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, #1e3a5f, #0f172a)',
            borderRadius: '24px', padding: '4rem 3rem',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem', alignItems: 'center', color: '#fff'
          }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(59, 130, 246, 0.2)',
                padding: '0.4rem 1rem', borderRadius: '100px', marginBottom: '1.5rem',
                fontSize: '0.85rem', color: '#93c5fd', fontWeight: 500
              }}>
                <Tractor size={14} /> For Tractor Owners
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.3 }}>
                Earn Money from Your Idle Tractor
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                List your tractor on AgriRent and start earning ₹2,000–₹5,000 per day.
                Join 500+ tractor owners already earning with us.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                {['Set your own prices & availability', 'Get booking requests directly', 'Secure payments guaranteed', 'Free listing, no hidden charges'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.95rem' }}>
                    <CheckCircle size={16} color="#22c55e" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn" style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: '#fff', padding: '0.85rem 2rem', borderRadius: '12px',
                fontSize: '1rem', fontWeight: 600, border: 'none',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
              }}>
                List Your Tractor <ArrowRight size={18} />
              </Link>
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '1.25rem'
            }}>
              {[
                { label: 'Average Monthly Earnings', value: '₹45,000', sub: 'per tractor' },
                { label: 'Booking Rate', value: '92%', sub: 'within 24 hours' },
                { label: 'Owner Satisfaction', value: '4.8/5', sub: 'average rating' }
              ].map((stat, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px', padding: '1.5rem'
                }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{stat.label}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stat.value}</span>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{stat.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ Testimonials ═══════════════ */}
      <section style={{
        padding: '5rem 0',
        background: '#fafafa'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              What Farmers Say
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              Real stories from farmers who use AgriRent
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              {
                name: 'Rajesh Kumar',
                location: 'Tamil Nadu',
                text: 'AgriRent saved me during the harvest season. I booked a 50HP tractor within minutes. The owner was reliable and the price was fair.',
                rating: 5
              },
              {
                name: 'Anitha Devi',
                location: 'Karnataka',
                text: 'As a small-scale farmer, buying a tractor was impossible. AgriRent lets me rent one whenever I need it. Truly a game changer!',
                rating: 5
              },
              {
                name: 'Murugan S',
                location: 'Andhra Pradesh',
                text: 'I listed my two tractors on AgriRent and now earn ₹60,000+ monthly. The best platform for tractor owners. Highly recommend!',
                rating: 5
              }
            ].map((review, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: '16px', padding: '2rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                  {Array.from({ length: review.rating }, (_, j) => (
                    <Star key={j} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p style={{ color: '#374151', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  "{review.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '0.9rem'
                  }}>
                    {review.name[0]}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{review.name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ Final CTA ═══════════════ */}
      <section style={{
        padding: '5rem 0', textAlign: 'center',
        background: 'linear-gradient(180deg, #fff, #f0fdf4)'
      }}>
        <div className="container">
          <Wheat size={48} color="#22c55e" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem' }}>
            Ready to Start Farming Smarter?
          </h2>
          <p style={{
            color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px',
            margin: '0 auto 2rem', lineHeight: 1.7
          }}>
            Join thousands of farmers and tractor owners who trust AgriRent for their equipment needs.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{
              padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '12px'
            }}>
              Create Free Account <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{
              padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '12px'
            }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="feature-card">
    <div className="feature-icon">
      {icon}
    </div>
    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{title}</h3>
    <p style={{ color: 'var(--text-muted)' }}>{description}</p>
  </div>
);

export default Home;
