import { Link } from 'react-router-dom';
import './Footer.css';
import { FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer glass-card">
      <div className="footer-content">
        <div className="footer-brand">
          <h2 className="gradient-text">Vision2Venture</h2>
          <p>Transforming ideas into viable businesses through AI-powered analysis.</p>
          <div className="social-links">
            <a href="#"><FaTwitter /></a>
            <a href="https://github.com/M-DevendraBabu/vision2venture" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
            <a href="#"><FaLinkedin /></a>
          </div>
        </div>
        <div className="footer-links">
          <div className="link-group">
            <h3>Product</h3>
            <Link to="/register">Get Started</Link>
            <Link to="/assistant">AI Assistant</Link>
            <Link to="/login">Login</Link>
          </div>
          <div className="link-group">
            <h3>Resources</h3>
            <a href="https://github.com/M-DevendraBabu/vision2venture" target="_blank" rel="noopener noreferrer">GitHub</a>
            <Link to="/assistant">Help Center</Link>
          </div>
          <div className="link-group">
            <h3>Legal</h3>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Vision2Venture. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
