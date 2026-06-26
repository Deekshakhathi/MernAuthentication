import React, { useState, useRef, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const EmailVerify = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { backendUrl, isLoggedIn, userData, getUserData } = useContext(AppContext);

  useEffect(() => {
    // If not logged in, they can't verify email
    // Or if already verified
    if (userData && userData.isAccountVerified) {
      navigate('/');
    }
  }, [isLoggedIn, userData, navigate]);

  const handleChange = (e, index) => {
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

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      return toast.error('Please enter a 6-digit OTP');
    }

    setLoading(true);
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/verify-account', { otp: otpCode });
      if (data.success) {
        toast.success(data.message || 'Email verified successfully');
        await getUserData();
        navigate('/');
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
        <h2>Email Verify OTP</h2>
        <p>Enter the 6-digit code sent to your email id.</p>

        <form onSubmit={onSubmitHandler}>
          <div className="otp-container">
            {otp.map((value, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="otp-input"
                value={value}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputRefs.current[index] = el)}
              />
            ))}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            Verify email
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailVerify;
