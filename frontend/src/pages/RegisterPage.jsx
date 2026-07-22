import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { FaCheck, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import '../styles/Auth.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Password validation rules
  const passwordChecks = useMemo(() => ({
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }), [password]);

  const passwordStrength = useMemo(() => {
    const passed = Object.values(passwordChecks).filter(Boolean).length;
    if (passed <= 1) return { label: 'Very Weak', color: '#ef4444', width: '20%' };
    if (passed === 2) return { label: 'Weak', color: '#f97316', width: '40%' };
    if (passed === 3) return { label: 'Fair', color: '#f59e0b', width: '60%' };
    if (passed === 4) return { label: 'Good', color: '#22c55e', width: '80%' };
    return { label: 'Strong', color: '#10b981', width: '100%' };
  }, [passwordChecks]);

  const allPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allPasswordValid) {
      return toast.error('Please meet all password requirements');
    }
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Registration successful! 🎉');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
      toast.success('Google Sign-In successful! 🎉');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Google Sign-In failed');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google Sign-In was cancelled or failed.');
  };

  const PasswordCheck = ({ passed, label }) => (
    <div className="pw-check-item" style={{ color: passed ? '#10b981' : '#6b7280' }}>
      {passed ? <FaCheck size={11} /> : <FaTimes size={11} />}
      <span>{label}</span>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card glass-card animate-scale-in">
        <h1 className="auth-title gradient-text">Create Account</h1>
        <p className="auth-subtitle">Start analyzing your startup ideas</p>

        <div className="google-btn-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_black"
            size="large"
            width="100%"
            text="signup_with"
            shape="rectangular"
          />
        </div>

        <div className="auth-divider">
          <span className="divider-text">— OR —</span>
          <div className="divider-line"></div>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" className="glass-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="glass-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="glass-input" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            
            {/* Password Strength Bar */}
            {password.length > 0 && (
              <div className="pw-strength-section">
                <div className="pw-strength-bar">
                  <div className="pw-strength-fill" style={{ width: passwordStrength.width, background: passwordStrength.color }}></div>
                </div>
                <span className="pw-strength-label" style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                
                <div className="pw-checks-grid">
                  <PasswordCheck passed={passwordChecks.minLength} label="At least 8 characters" />
                  <PasswordCheck passed={passwordChecks.uppercase} label="One uppercase letter" />
                  <PasswordCheck passed={passwordChecks.lowercase} label="One lowercase letter" />
                  <PasswordCheck passed={passwordChecks.number} label="One number" />
                  <PasswordCheck passed={passwordChecks.special} label="One special character" />
                </div>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" className="glass-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            {confirmPassword && password !== confirmPassword && (
              <span className="auth-error">Passwords do not match</span>
            )}
          </div>
          <button type="submit" className="btn-primary" disabled={loading || !allPasswordValid}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
