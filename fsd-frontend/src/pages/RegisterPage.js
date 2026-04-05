import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import '../styles/Auth.css';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await authService.register(name, email, password);
      navigate('/login');
    } catch (err) {
      // Handle validation errors array
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors.map(e => e.message).join('. ');
        setErrors({ form: errorMessages });
      } else {
        setErrors({ form: err.response?.data?.message || 'Registration failed. Please try again.' });
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
            <div className="auth-illustration-icon">✨</div>
            <h2>Join Us</h2>
            <p>Create an account to get started with managing your resources</p>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="auth-form-container">
          <div className="auth-header">
            <h1>Create Account</h1>
          </div>

          {errors.form && <div className="error-message">{errors.form}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                placeholder="John Doe"
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors({ ...errors, name: '' });
                  }
                }}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">⚠️ {errors.name}</span>}
            </div>

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
              <small style={{ color: '#999', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Must be at least 6 characters with uppercase and number
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                placeholder="••••••••"
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: '' });
                  }
                }}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-text">⚠️ {errors.confirmPassword}</span>}
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'REGISTER'}
            </button>
          </form>

          <p className="auth-link">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
