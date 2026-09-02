import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import '../styles/Auth.css';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Request Email OTP, 2: Enter OTP & New Password
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      toast.success(res.data?.message || `Verification code sent to ${email}! Check your inbox.`);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send verification code. Please verify your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otpCode.trim()) {
      toast.error('Please enter the 6-digit verification code sent to your email');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email,
        otp_code: otpCode.trim(),
        new_password: newPassword
      });
      toast.success(res.data?.message || 'Password verified and reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Verification failed. Please check the code and password requirements.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card animate-scale-in">
        <h1 className="auth-title gradient-text">Secure Password Reset</h1>
        <p className="auth-subtitle">
          {step === 1 ? 'Enter your registered email to receive a confidential 6-digit verification code' : `Enter the verification code sent to ${email}`}
        </p>

        {step === 1 ? (
          /* Step 1: Request Email OTP */
          <form className="auth-form" onSubmit={handleRequestOTP}>
            <div className="form-group">
              <label>Registered Account Email</label>
              <input 
                type="email" 
                className="glass-input" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="user@example.com"
                required 
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending Verification Code...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          /* Step 2: Enter Email OTP & Reset Password */
          <form className="auth-form" onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>6-Digit Email Verification Code</label>
              <input 
                type="text" 
                className="glass-input text-center font-bold" 
                style={{ letterSpacing: '4px', fontSize: '1.1rem' }}
                value={otpCode} 
                onChange={(e) => setOtpCode(e.target.value)} 
                placeholder="123456"
                maxLength={6}
                required 
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                className="glass-input" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="At least 8 chars, 1 upper, 1 digit, 1 special char"
                required 
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                className="glass-input" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Re-enter your new password"
                required 
              />
            </div>

            <div className="flex gap-sm">
              <button 
                type="button" 
                onClick={() => { setStep(1); setOtpCode(''); }} 
                className="btn text-xs" 
                style={{ background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '10px', width: '35%' }}
              >
                Change Email
              </button>
              <button type="submit" className="btn-primary" style={{ width: '65%' }} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Code & Reset'}
              </button>
            </div>
          </form>
        )}
        
        <div className="auth-links mt-md">
          <Link to="/login">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
