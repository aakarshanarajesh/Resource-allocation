import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Navbar from './components/Navbar';
import './styles/App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const accessToken = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role');
    const userData = localStorage.getItem('user');
    
    if (accessToken && role) {
      setIsLoggedIn(true);
      setUserRole(role);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, []);

  const handleLogin = (accessToken, refreshToken, userData, role) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('role', role);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setIsLoggedIn(true);
    setUserRole(role);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Remove old token if exists
    
    setIsLoggedIn(false);
    setUserRole(null);
    setUser(null);
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
      
      <Router>
        {isLoggedIn && <Navbar userRole={userRole} onLogout={handleLogout} />}
        <Routes>
          <Route 
            path="/login" 
            element={isLoggedIn ? <Navigate to={userRole === 'ADMIN' ? '/admin' : '/user'} /> : <LoginPage onLogin={handleLogin} />} 
          />
          <Route 
            path="/register" 
            element={isLoggedIn ? <Navigate to={userRole === 'ADMIN' ? '/admin' : '/user'} /> : <RegisterPage />} 
          />
          <Route
            path="/forgot-password"
            element={isLoggedIn ? <Navigate to={userRole === 'ADMIN' ? '/admin' : '/user'} /> : <ForgotPassword />}
          />
          <Route
            path="/reset-password/:token"
            element={isLoggedIn ? <Navigate to={userRole === 'ADMIN' ? '/admin' : '/user'} /> : <ResetPassword />}
          />
          <Route 
            path="/user" 
            element={isLoggedIn && userRole === 'USER' ? <UserDashboard user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={isLoggedIn && userRole === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/login" />} 
          />
          <Route path="/" element={<Navigate to={isLoggedIn ? (userRole === 'ADMIN' ? '/admin' : '/user') : '/login'} />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
