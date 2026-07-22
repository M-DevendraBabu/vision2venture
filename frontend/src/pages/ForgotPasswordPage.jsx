import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/Auth.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      toast.success('Password reset link sent to your email!');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card animate-scale-in">
        <h1 className="auth-title gradient-text">Reset Password</h1>
        <p className="auth-subtitle">Enter your email to receive a reset link</p>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="glass-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        <div className="auth-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
