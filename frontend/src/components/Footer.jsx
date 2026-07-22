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
            <a href="#"><FaGithub /></a>
            <a href="#"><FaLinkedin /></a>
          </div>
        </div>
        <div className="footer-links">
          <div className="link-group">
            <h3>Product</h3>
            <a href="#">Features</a>
            <a href="#">Pricing</a>
            <a href="#">Showcase</a>
          </div>
          <div className="link-group">
            <h3>Resources</h3>
            <a href="#">Documentation</a>
            <a href="#">Blog</a>
            <a href="#">Community</a>
          </div>
          <div className="link-group">
            <h3>Legal</h3>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
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
