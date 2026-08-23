import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiHome, FiGrid, FiPlusCircle, FiMessageSquare, FiUser, FiLogIn } from 'react-icons/fi';
import '../../styles/MobileBottomNav.css';

const MobileBottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <div className="mobile-nav-items">
        {/* Item 1: Home / Dashboard */}
        {user ? (
          <Link 
            to="/dashboard" 
            className={`mobile-nav-item ${currentPath === '/dashboard' ? 'active' : ''}`}
          >
            <div className="mobile-nav-icon">
              <FiGrid />
            </div>
            <span className="mobile-nav-label">Dashboard</span>
          </Link>
        ) : (
          <Link 
            to="/" 
            className={`mobile-nav-item ${currentPath === '/' ? 'active' : ''}`}
          >
            <div className="mobile-nav-icon">
              <FiHome />
            </div>
            <span className="mobile-nav-label">Home</span>
          </Link>
        )}

        {/* Item 2: New Idea (Prominent Central Action) */}
        <Link 
          to={user ? "/new-idea" : "/login"} 
          className={`mobile-nav-item central-action ${currentPath === '/new-idea' ? 'active' : ''}`}
        >
          <div className="mobile-nav-central-btn">
            <FiPlusCircle />
          </div>
          <span className="mobile-nav-label">Analyze</span>
        </Link>

        {/* Item 3: AI Assistant */}
        <Link 
          to="/assistant" 
          className={`mobile-nav-item ${currentPath === '/assistant' ? 'active' : ''}`}
        >
          <div className="mobile-nav-icon">
            <FiMessageSquare />
          </div>
          <span className="mobile-nav-label">AI Mentor</span>
        </Link>

        {/* Item 4: Profile / Login */}
        {user ? (
          <Link 
            to="/profile" 
            className={`mobile-nav-item ${currentPath === '/profile' ? 'active' : ''}`}
          >
            <div className="mobile-nav-icon">
              <FiUser />
            </div>
            <span className="mobile-nav-label">Profile</span>
          </Link>
        ) : (
          <Link 
            to="/login" 
            className={`mobile-nav-item ${currentPath === '/login' ? 'active' : ''}`}
          >
            <div className="mobile-nav-icon">
              <FiLogIn />
            </div>
            <span className="mobile-nav-label">Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
