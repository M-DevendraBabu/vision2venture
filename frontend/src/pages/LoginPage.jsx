import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { FaGoogle } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import '../styles/Auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      try {
        // Get user info from Google using the access token
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await res.json();
        // Use the email to create/login the user via our backend
        await googleLogin(tokenResponse.access_token, userInfo);
        toast.success('Google Sign-In successful! 🎉');
        navigate('/dashboard');
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Google Sign-In failed');
      }
    },
    onError: () => {
      toast.error('Google Sign-In was cancelled or failed. Please try again.');
    },
  });

  return (
    <div className="auth-page">
      <div className="auth-card glass-card animate-scale-in">
        <h1 className="auth-title gradient-text">Welcome Back</h1>
        <p className="auth-subtitle">Login to continue your analysis</p>

        <div className="google-btn-wrapper">
          <button className="custom-google-btn" onClick={() => handleGoogleLogin()}>
            <FaGoogle className="google-icon" />
            <span>Sign in with Google</span>
          </button>
        </div>

        <div className="auth-divider">
          <span className="divider-text">— OR —</span>
          <div className="divider-line"></div>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              className="glass-input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="glass-input" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-links">
          <Link to="/forgot-password">Forgot your password?</Link>
          <p>Don't have an account? <Link to="/register">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
