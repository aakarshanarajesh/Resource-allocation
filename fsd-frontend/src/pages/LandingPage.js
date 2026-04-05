import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Resource Allocation System</h1>
        <p style={{ textAlign: 'center', marginBottom: '30px' }}>Select your login type:</p>

        <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
          <button 
            onClick={() => navigate('/login')}
            style={{
              padding: '12px 20px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            User Login
          </button>

          <button 
            onClick={() => navigate('/admin/login')}
            style={{
              padding: '12px 20px',
              fontSize: '16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
