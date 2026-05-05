import React, { useState, useEffect } from 'react';
import { resourceService, requestService } from '../services/api';
import { showSuccess, showError } from '../utils/toast';
import '../styles/Dashboard.css';

function UserDashboard() {
  const [resources, setResources] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    fetchResources();
    fetchRequests();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await resourceService.getAllResources();
      setResources(response.data.resources || response.data);
      // Initialize quantities map
      const initialQuantities = {};
      (response.data.resources || response.data).forEach(resource => {
        initialQuantities[resource._id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (err) {
      setError('Failed to fetch resources');
      showError('Failed to fetch resources');
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await requestService.getUserRequests();
      setRequests(response.data.requests || response.data);
    } catch (err) {
      console.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (resourceId, value) => {
    const qty = Math.max(1, parseInt(value) || 1);
    setQuantities(prev => ({
      ...prev,
      [resourceId]: qty
    }));
  };

  const handleRequestResource = async (resourceId) => {
    try {
      const quantity = quantities[resourceId] || 1;
      await requestService.createRequest(resourceId, quantity);
      showSuccess(`Request submitted for ${quantity} unit(s)`);
      setQuantities(prev => ({
        ...prev,
        [resourceId]: 1
      }));
      await fetchRequests();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to submit request');
    }
  };

  const getStockStatus = (availableUnits) => {
    if (availableUnits === 0) {
      return { text: 'Out of Stock', color: '#dc3545', disabled: true };
    } else if (availableUnits <= 5) {
      return { text: `${availableUnits} left`, color: '#ffc107', disabled: false };
    }
    return { text: `${availableUnits} available`, color: '#28a745', disabled: false };
  };

  if (loading) return <div className="dashboard-container"><p>Loading...</p></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h2>📦 Available Resources</h2>
        {error && <div className="error-message">{error}</div>}
        
        <div className="resources-grid">
          {resources && resources.length > 0 ? (
            resources.map((resource) => {
              const stockStatus = getStockStatus(resource.availableUnits || 0);
              return (
                <div key={resource._id} className="resource-card">
                  <div className="resource-header">
                    <h3>{resource.name}</h3>
                    <span 
                      className="stock-badge"
                      style={{ backgroundColor: stockStatus.color }}
                    >
                      {stockStatus.text}
                    </span>
                  </div>
                  
                  <p><strong>Description:</strong> {resource.description || 'N/A'}</p>
                  <p><strong>Total Units:</strong> {resource.totalUnits || 0}</p>
                  <p><strong>Available:</strong> {resource.availableUnits || 0}</p>
                  
                  {!stockStatus.disabled && (
                    <div className="quantity-selector">
                      <label htmlFor={`qty-${resource._id}`}>
                        Quantity:
                      </label>
                      <div className="qty-input-group">
                        <button
                          onClick={() => handleQuantityChange(
                            resource._id,
                            (quantities[resource._id] || 1) - 1
                          )}
                          className="qty-btn"
                        >
                          −
                        </button>
                        <input
                          id={`qty-${resource._id}`}
                          type="number"
                          min="1"
                          max={resource.availableUnits}
                          value={quantities[resource._id] || 1}
                          onChange={(e) => handleQuantityChange(resource._id, e.target.value)}
                          className="qty-input"
                        />
                        <button
                          onClick={() => handleQuantityChange(
                            resource._id,
                            (quantities[resource._id] || 1) + 1
                          )}
                          disabled={(quantities[resource._id] || 1) >= resource.availableUnits}
                          className="qty-btn"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleRequestResource(resource._id)}
                    disabled={stockStatus.disabled}
                    className={stockStatus.disabled ? 'btn-disabled' : 'btn-primary'}
                  >
                    {stockStatus.disabled ? 'Out of Stock' : 'Request Resource'}
                  </button>
                </div>
              );
            })
          ) : (
            <p className="no-data">No resources available</p>
          )}
        </div>

        <h2 style={{ marginTop: '40px' }}>📋 My Requests</h2>
        <div className="requests-table">
          {requests && requests.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Requested Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td>{request.resource?.name || 'N/A'}</td>
                    <td>{request.quantity || 1} unit(s)</td>
                    <td>
                      <span className={`status-badge ${request.status?.toLowerCase()}`}>
                        {request.status}
                      </span>
                    </td>
                    <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No requests yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
