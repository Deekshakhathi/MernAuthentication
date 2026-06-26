import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const Login = () => {
  const [state, setState] = useState('Sign Up'); // 'Sign Up' or 'Login'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (state === 'Sign Up') {
        const { data } = await axios.post(backendUrl + '/api/auth/register', { name, email, password });
        if (data.success) {
          setIsLoggedIn(true);
          await getUserData();
          navigate('/');
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + '/api/auth/login', { email, password });
        if (data.success) {
          setIsLoggedIn(true);
          await getUserData();
          navigate('/');
        } else {
          toast.error(data.message);
        }
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
        <h2>{state === 'Sign Up' ? 'Create Account' : 'Login'}</h2>
        <p>
          {state === 'Sign Up' ? 'Create your account' : 'Login to your account!'}
        </p>

        <form onSubmit={onSubmitHandler}>
          {state === 'Sign Up' && (
            <div className="form-group">
              <span role="img" aria-label="user">👤</span>
              <input
                className="form-input"
                type="text"
                placeholder="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

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

          <div className="form-group">
            <span role="img" aria-label="password">🔒</span>
            <input
              className="form-input"
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {state === 'Login' && (
            <div style={{ textAlign: 'left', marginBottom: '16px' }}>
              <button 
                type="button" 
                className="btn-text" 
                onClick={() => navigate('/reset-password')}
              >
                Forgot password?
              </button>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {state === 'Sign Up' ? 'Sign Up' : 'Login'}
          </button>
        </form>

        {state === 'Sign Up' ? (
          <p className="auth-link">
            Already have an account?{' '}
            <span onClick={() => setState('Login')}>Login here</span>
          </p>
        ) : (
          <p className="auth-link">
            Don't have an account?{' '}
            <span onClick={() => setState('Sign Up')}>Sign up</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
