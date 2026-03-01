import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, Badge } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container py-8">
        <div className="card text-center">
          <h2>Please log in to view your profile</h2>
          <Link to="/login" className="btn btn-primary mt-4">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1 className="page-title">My Profile</h1>

        <div className="profile-card">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="profile-basic-info">
              <h2 className="profile-name">{user?.name || 'User'}</h2>
              <p className="profile-role">
                <Badge size={16} />
                {user?.role === 'OWNER' ? 'Tractor Owner' : 'Farmer'}
              </p>
            </div>
            <Link to="/settings" className="btn btn-primary">
              Edit Profile
            </Link>
          </div>

          {/* Profile Information Grid */}
          <div className="profile-info-grid">
            {/* Contact Information */}
            <div className="profile-section">
              <h3 className="profile-section-title">
                <Mail size={20} />
                Contact Information
              </h3>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{user?.email || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{user?.phone || 'Not provided'}</span>
              </div>
            </div>

            {/* Address Information */}
            <div className="profile-section">
              <h3 className="profile-section-title">
                <MapPin size={20} />
                Address
              </h3>
              <div className="info-item">
                <span className="info-label">City</span>
                <span className="info-value">{user?.city || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">State</span>
                <span className="info-value">{user?.state || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Zip Code</span>
                <span className="info-value">{user?.zipCode || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Address</span>
                <span className="info-value">{user?.address || 'Not provided'}</span>
              </div>
            </div>

            {/* Account Information */}
            <div className="profile-section">
              <h3 className="profile-section-title">
                <Calendar size={20} />
                Account Information
              </h3>
              <div className="info-item">
                <span className="info-label">Member Since</span>
                <span className="info-value">
                  {user?.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : 'N/A'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Account Type</span>
                <span className="info-value">{user?.role === 'OWNER' ? 'Tractor Owner' : 'Farmer'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Account Status</span>
                <span className="info-value status-active">Active</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            <Link to="/settings" className="btn btn-primary">
              Edit Profile Information
            </Link>
            <a href="mailto:support@agrirent.com" className="btn btn-secondary">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
