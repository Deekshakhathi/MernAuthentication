import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const ResetPassword = () => {
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'new_password'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email is required");
    
    setLoading(true);
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/send-reset-otp', { email });
      if (data.success) {
        toast.success(data.message);
        setStep('otp');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return toast.error("Please enter a 6-digit OTP");
    setStep('new_password');
  };

  const submitNewPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return toast.error("New password is required");
    const otpCode = otp.join('');

    setLoading(true);
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/reset-password', { email, otp: otpCode, newPassword });
      if (data.success) {
        toast.success(data.message || "Password reset successful");
        navigate('/login');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <nav className="navbar" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <div className="logo">
          <span>///</span> auth
        </div>
      </nav>

      <div className="auth-card">
        {step === 'email' && (
          <>
            <h2>Reset password</h2>
            <p>Enter your registered email address</p>
            <form onSubmit={submitEmail}>
              <div className="form-group">
                <span role="img" aria-label="email">✉️</span>
                <input
                  className="form-input"
                  type="email"
                  placeholder="Email id"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                Submit
              </button>
            </form>
          </>
        )}

        {step === 'otp' && (
          <>
            <h2>Reset password OTP</h2>
            <p>Enter the 6-digit code sent to your email id.</p>
            <form onSubmit={submitOtp}>
              <div className="otp-container">
                {otp.map((value, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    className="otp-input"
                    value={value}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => (inputRefs.current[index] = el)}
                  />
                ))}
              </div>
              <button type="submit" className="btn-primary">
                Submit
              </button>
            </form>
          </>
        )}

        {step === 'new_password' && (
          <>
            <h2>New password</h2>
            <p>Enter the new password below</p>
            <form onSubmit={submitNewPassword}>
              <div className="form-group">
                <span role="img" aria-label="password">🔒</span>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                Submit
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
