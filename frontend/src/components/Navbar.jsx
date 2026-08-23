import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import { 
  FaRocket, FaRobot, FaBars, FaTimes, FaHome, 
  FaLightbulb, FaUser, FaShieldAlt, FaSignOutAlt, FaSignInAlt, FaUserPlus 
} from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => { 
    setDrawerOpen(false); 
  }, [location.pathname]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleLogout = () => {
    logout();
    setDrawerOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <div className="logo-badge">
              <FaRocket className="logo-icon" />
            </div>
            <span className="gradient-text">Vision2Venture</span>
          </Link>

          {/* Desktop Navigation Links (>= 769px) */}
          <div className="navbar-links desktop-nav">
            {user ? (
              <>
                <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                  Dashboard
                </Link>
                <Link to="/new-idea" className={`nav-link ${isActive('/new-idea') ? 'active' : ''}`}>
                  New Idea
                </Link>
                <Link to="/assistant" className={`nav-link ${isActive('/assistant') ? 'active' : ''}`}>
                  <FaRobot /> Assistant
                </Link>
                <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
                  Profile
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                    <FaShieldAlt /> Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="nav-btn-logout">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-btn-primary">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button (<= 768px) */}
          <button 
            className="mobile-hamburger" 
            onClick={() => setDrawerOpen(true)}
            aria-label="Open Navigation Menu"
          >
            <FaBars />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Backdrop */}
      {drawerOpen && (
        <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />
      )}

      {/* Mobile Navigation Drawer */}
      <aside className={`mobile-drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <Link to="/" className="navbar-logo" onClick={() => setDrawerOpen(false)}>
            <FaRocket className="logo-icon" />
            <span className="gradient-text">Vision2Venture</span>
          </Link>
          <button 
            className="drawer-close-btn" 
            onClick={() => setDrawerOpen(false)}
            aria-label="Close Navigation Menu"
          >
            <FaTimes />
          </button>
        </div>

        <div className="drawer-body">
          {user ? (
            <>
              <div className="drawer-user-info">
                <div className="drawer-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="drawer-user-name">{user.name || 'Founder'}</div>
                  <div className="drawer-user-email">{user.email}</div>
                </div>
              </div>

              <div className="drawer-nav-list">
                <Link to="/dashboard" className={`drawer-nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                  <FaHome /> <span>Dashboard</span>
                </Link>
                <Link to="/new-idea" className={`drawer-nav-link ${isActive('/new-idea') ? 'active' : ''}`}>
                  <FaLightbulb /> <span>New Idea</span>
                </Link>
                <Link to="/assistant" className={`drawer-nav-link ${isActive('/assistant') ? 'active' : ''}`}>
                  <FaRobot /> <span>AI Assistant</span>
                </Link>
                <Link to="/profile" className={`drawer-nav-link ${isActive('/profile') ? 'active' : ''}`}>
                  <FaUser /> <span>Profile</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className={`drawer-nav-link ${isActive('/admin') ? 'active' : ''}`}>
                    <FaShieldAlt /> <span>Admin Panel</span>
                  </Link>
                )}
              </div>

              <div className="drawer-footer">
                <button onClick={handleLogout} className="drawer-logout-btn">
                  <FaSignOutAlt /> <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="drawer-nav-list">
              <Link to="/login" className="drawer-nav-link">
                <FaSignInAlt /> <span>Login</span>
              </Link>
              <Link to="/register" className="drawer-nav-link register-highlight">
                <FaUserPlus /> <span>Get Started (Register)</span>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navbar;
