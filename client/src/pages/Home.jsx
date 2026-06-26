import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const Home = () => {
  const { userData, isLoggedIn, setIsLoggedIn, setUserData, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/logout');
      if (data.success) {
        setIsLoggedIn(false);
        setUserData(false);
        navigate('/login');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="home-container">
      <nav className="navbar">
        <a href="/" className="logo">
          <span>///</span> auth
        </a>
        
        {isLoggedIn ? (
          <div className="avatar-btn">
            {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
            <div className="avatar-menu">
              <div className="avatar-menu-item" onClick={handleLogout}>
                Logout
              </div>
            </div>
          </div>
        ) : (
          <button className="btn-outline" onClick={() => navigate('/login')}>
            Login
          </button>
        )}
      </nav>

      <div className="flex-col flex-center" style={{ marginTop: '60px' }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>🤖</div>
        
        <h2 className="home-greeting">
          Hey {userData ? userData.name : 'Developer'}! 👋
        </h2>
        
        <h1 className="home-title">Welcome to our app</h1>
        
        <p className="home-subtitle">
          Let's start with a quick product tour and we will have you up and running in no time!
        </p>
        
        <button className="home-btn" onClick={() => navigate(isLoggedIn ? '/' : '/login')}>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Home;
