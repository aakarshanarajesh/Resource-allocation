import React, { useState } from 'react';
import { authService } from '../services/api';
import { showSuccess, showError } from '../utils/toast';
import { validateEmail } from '../utils/helpers';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import '../styles/Auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) return showError('Email is required');
    if (!validateEmail(email)) return showError('Please enter a valid email');

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      showSuccess('If an account exists, a reset link was sent to the email');
      setEmail('');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to send reset email');
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
            <h1>Forgot Password</h1>
            <p>Enter your account email and we'll send a reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                placeholder="example@email.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button type="submit">Send Reset Link</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
