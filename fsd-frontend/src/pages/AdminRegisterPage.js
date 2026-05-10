import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import '../styles/Auth.css';

function AdminRegisterPage() {
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
      await authService.registerAdmin(name, email, password);
      navigate('/login');
    } catch (err) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors.map((error) => error.message).join('. ');
        setErrors({ form: errorMessages });
      } else {
        setErrors({ form: err.response?.data?.message || 'Admin registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-illustration">
          <div className="auth-illustration-content">
            <div className="auth-illustration-icon">Admin</div>
            <h2>Admin Access</h2>
            <p>Create an administrator account for managing resources and requests</p>
          </div>
        </div>

        <div className="auth-form-container">
          <div className="auth-header">
            <h1>Create Admin Account</h1>
          </div>

          {errors.form && <div className="error-message">{errors.form}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="admin-name">Full Name</label>
              <input
                id="admin-name"
                type="text"
                value={name}
                placeholder="Admin Name"
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="admin-email">Email Address</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                placeholder="admin@example.com"
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="admin-confirm-password">Confirm Password</label>
              <input
                id="admin-confirm-password"
                type="password"
                value={confirmPassword}
                placeholder="Confirm password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Creating Admin...' : 'Create Admin'}
            </button>
          </form>

          <p className="auth-link">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
          <p className="auth-link">
            Need a user account? <Link to="/register">User signup</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminRegisterPage;
