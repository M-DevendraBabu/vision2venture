import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaLightbulb, FaUser, FaShieldAlt, FaRobot } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside className="sidebar">
      <ul className="sidebar-nav">
        <li>
          <Link to="/dashboard" className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}>
            <FaHome /> <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link to="/new-idea" className={`sidebar-link ${isActive('/new-idea') ? 'active' : ''}`}>
            <FaLightbulb /> <span>New Idea</span>
          </Link>
        </li>
        <li>
          <Link to="/assistant" className={`sidebar-link ${isActive('/assistant') ? 'active' : ''}`}>
            <FaRobot /> <span>Assistant</span>
          </Link>
        </li>
        <li>
          <Link to="/profile" className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}>
            <FaUser /> <span>Profile</span>
          </Link>
        </li>
        {user?.role === 'admin' && (
          <li>
            <Link to="/admin" className={`sidebar-link ${isActive('/admin') ? 'active' : ''}`}>
              <FaShieldAlt /> <span>Admin Panel</span>
            </Link>
          </li>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;
