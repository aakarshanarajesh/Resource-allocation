import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { showSuccess, showError } from '../utils/toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import '../styles/Auth.css';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim() || password.length < 6) return showError('Password must be at least 6 characters');
    if (password !== confirm) return showError('Passwords do not match');

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      showSuccess('Password reset successful. Please login.');
      navigate('/login');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-form-container">
          <div className="auth-header">
            <h1>Reset Password</h1>
            <p>Enter a new password for your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                id="password"
                type="password"
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                placeholder="••••••••"
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            <button type="submit">Reset Password</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
