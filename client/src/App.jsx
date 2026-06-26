import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home.jsx';
import Login from './pages/login.jsx';
import EmailVerify from './pages/emailVerify.jsx';
import ResetPassword from './pages/resetPassword.jsx';

const App = () => {
  return (
    <div>
      <ToastContainer position="top-center" theme="dark" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </div>
  );
}
export default App;