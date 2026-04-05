import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/Auth.css';

function AdminLoginPage({ onLogin }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {

      const response = await authService.login(email, password);

      const token = response.data.token;
      const role = response.data.user.role.toLowerCase();

      // Check if user is admin
      if (role !== 'admin') {
        setError('Only admin users can login here. Please use user login.');
        setLoading(false);
        return;
      }

      // store token and user info in local storage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", response.data.user.id);

      // send to parent
      if(onLogin){
        onLogin(token, role);
      }

      // redirect to admin dashboard
      navigate("/admin");

    } catch (err) {

      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <h1>Admin Login</h1>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              value={email}
              placeholder="Enter your email"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              value={password}
              placeholder="Enter your password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="auth-link">
          User login? <Link to="/login">Click here</Link>
        </p>

      </div>

    </div>
  );
}

export default AdminLoginPage;
