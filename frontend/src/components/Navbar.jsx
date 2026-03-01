import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Tractor, Menu, X, LogOut, User, Settings, LayoutGrid, Home, BookOpen, Plus, List } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

  // Determine user role (default to FARMER if not set)
  const userRole = user?.role || 'FARMER';
  const isOwner = userRole === 'OWNER';
  const isLoggedIn = !!user;

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-wrapper">
          {/* Logo */}
          <Link to="/" className="nav-logo" onClick={closeMenus}>
            <Tractor size={28} />
            <span>AgriRent</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links-desktop">
            {/* Dashboard Link - Logged In Users First */}
            {isLoggedIn && (
              <NavLink to="/dashboard" className={({isActive}) => `nav-link ${isActive? 'active':''}`}>
                <LayoutGrid size={16} />
                Dashboard
              </NavLink>
            )}
            
            {!isLoggedIn && (
              <NavLink to="/" className={({isActive}) => `nav-link ${isActive? 'active':''}`}>
                <Home size={16} />
                Home
              </NavLink>
            )}
            {isLoggedIn && (
              <NavLink to="/tractors" className={({isActive}) => `nav-link ${isActive? 'active':''}`}>
                <Tractor size={16} />
                Browse Tractors
              </NavLink>
            )}
            
            {/* Role-based Navigation */}
            {isLoggedIn && !isOwner && (
              <NavLink to="/my-bookings" className={({isActive}) => `nav-link ${isActive? 'active':''}`}>
                <BookOpen size={16} />
                My Bookings
              </NavLink>
            )}
            {isLoggedIn && isOwner && (
              <>
                <NavLink to="/add-tractor" className={({isActive}) => `nav-link ${isActive? 'active':''}`}>
                  <Plus size={16} />
                  Add Tractor
                </NavLink>
                <NavLink to="/my-tractors" className={({isActive}) => `nav-link ${isActive? 'active':''}`}>
                  <Tractor size={16} />
                  My Tractors
                </NavLink>
                <NavLink to="/booking-requests" className={({isActive}) => `nav-link ${isActive? 'active':''}`}>
                  <List size={16} />
                  Requests
                </NavLink>
              </>
            )}

            {/* Auth Section */}
            <div className="nav-auth-section">
              {!isLoggedIn ? (
                <>
                  <Link to="/login" className="nav-link">Login</Link>
                  <Link to="/register" className="btn btn-primary">Get Started</Link>
                </>
              ) : (
                <div className="user-dropdown">
                  <button
                    className="user-menu-btn"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  >
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt={user.name} className="user-avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div className="user-avatar">{user?.name?.[0] || 'U'}</div>
                    )}
                    <span className="user-name">{user?.name || 'User'}</span>
                  </button>

                  {userDropdownOpen && (
                    <div className="dropdown-menu">
                      <Link to="/profile" className="dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                        <User size={16} /> Profile
                      </Link>
                      <Link to="/settings" className="dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                        <Settings size={16} /> Settings
                      </Link>
                      <button className="dropdown-item logout-btn" onClick={handleLogout}>
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="nav-links-mobile">
            {/* Dashboard Link - Mobile First */}
            {isLoggedIn && (
              <NavLink to="/dashboard" className={({isActive}) => `nav-link-mobile ${isActive? 'active':''}`} onClick={closeMenus}>
                <LayoutGrid size={16} />
                Dashboard
              </NavLink>
            )}
            
            <NavLink to="/" className={({isActive}) => `nav-link-mobile ${isActive? 'active':''}`} onClick={closeMenus}>
              <Home size={16} />
              Home
            </NavLink>
            {isLoggedIn && (
              <NavLink to="/tractors" className={({isActive}) => `nav-link-mobile ${isActive? 'active':''}`} onClick={closeMenus}>
                <Tractor size={16} />
                Browse Tractors
              </NavLink>
            )}
            
            {/* Role-based Mobile Navigation */}
              {isLoggedIn && !isOwner && (
              <NavLink to="/my-bookings" className={({isActive}) => `nav-link-mobile ${isActive? 'active':''}`} onClick={closeMenus}>
                <BookOpen size={16} />
                My Bookings
              </NavLink>
            )}
            {isLoggedIn && isOwner && (
              <>
                <NavLink to="/add-tractor" className={({isActive}) => `nav-link-mobile ${isActive? 'active':''}`} onClick={closeMenus}>
                  <Plus size={16} />
                  Add Tractor
                </NavLink>
                <NavLink to="/my-tractors" className={({isActive}) => `nav-link-mobile ${isActive? 'active':''}`} onClick={closeMenus}>
                  <Tractor size={16} />
                  My Tractors
                </NavLink>
                <NavLink to="/booking-requests" className={({isActive}) => `nav-link-mobile ${isActive? 'active':''}`} onClick={closeMenus}>
                  <List size={16} />
                  Booking Requests
                </NavLink>
              </>
            )}

            {/* Mobile Auth Section */}
            <div className="nav-mobile-auth">
              {!isLoggedIn ? (
                <>
                  <Link to="/login" className="nav-link-mobile" onClick={closeMenus}>Login</Link>
                  <Link to="/register" className="btn btn-primary btn-mobile" onClick={closeMenus}>Get Started</Link>
                </>
              ) : (
                <>
                  <Link to="/profile" className="nav-link-mobile" onClick={closeMenus}>Profile</Link>
                  <Link to="/settings" className="nav-link-mobile" onClick={closeMenus}>Settings</Link>
                  <button className="nav-link-mobile logout-btn" onClick={handleLogout}>Logout</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
