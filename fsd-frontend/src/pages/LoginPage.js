import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { showSuccess, showError } from '../utils/toast';
import { validateEmail } from '../utils/helpers';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import '../styles/Auth.css';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('user');

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(email, password);
      
      const { accessToken, refreshToken, user } = response.data;
      const role = user.role;

      // Validate role matches login type
      if (loginType === 'admin' && role !== 'ADMIN') {
        showError('This is not an admin account. Please use user login.');
        setLoading(false);
        return;
      }

      if (loginType === 'user' && role !== 'USER') {
        showError('This is not a user account. Please use admin login.');
        setLoading(false);
        return;
      }

      // Call parent handler
      if (onLogin) {
        onLogin(accessToken, refreshToken, user, role);
      }

      showSuccess('Login successful! Welcome back.');

      // Redirect based on role
      if (role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } catch (err) {
      // Handle validation errors array
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors.map(e => e.message).join('. ');
        showError(errorMessages);
      } else {
        showError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Left Illustration Side */}
        <div className="auth-illustration">
          <div className="auth-illustration-content">
            <div className="auth-illustration-icon">🔐</div>
            <h2>Secure Access</h2>
            <p>Login to your account to manage and request resources efficiently</p>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="auth-form-container">
          <div className="auth-header">
            <h1>Login to Dashboard</h1>
          </div>

          {/* Login Type Tabs */}
          <div className="login-tabs">
            <button
              type="button"
              className={`tab-btn ${loginType === 'user' ? 'active' : ''}`}
              onClick={() => { 
                setLoginType('user'); 
                setErrors({});
              }}
            >
              👤 User
            </button>
            <button
              type="button"
              className={`tab-btn ${loginType === 'admin' ? 'active' : ''}`}
              onClick={() => { 
                setLoginType('admin'); 
                setErrors({});
              }}
            >
              👑 Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                placeholder="example@email.com"
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors({ ...errors, email: '' });
                  }
                }}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">⚠️ {errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                placeholder="••••••••"
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors({ ...errors, password: '' });
                  }
                }}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-text">⚠️ {errors.password}</span>}
            </div>

            <div className="forgot-password">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'LOGIN'}
            </button>
          </form>

          <p className="auth-link">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
          <p className="auth-link">
            Need an admin account? <Link to="/admin-register">Create admin</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
