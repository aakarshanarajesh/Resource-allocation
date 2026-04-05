import React, { useState, useEffect } from 'react';
import { resourceService, requestService } from '../services/api';
import '../styles/Dashboard.css';

function UserDashboard() {
  const [resources, setResources] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResources();
    fetchRequests();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await resourceService.getAllResources();
      setResources(response.data.resources || response.data);
    } catch (err) {
      setError('Failed to fetch resources');
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await requestService.getAllRequests();
      setRequests(response.data.requests || response.data);
    } catch (err) {
      console.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResource = async (resourceId) => {
    const userId = localStorage.getItem('userId');
    try {
      await requestService.createRequest(resourceId, userId);
      alert('Request submitted successfully');
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit request');
    }
  };

  if (loading) return <div className="dashboard-container"><p>Loading...</p></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h2>Available Resources</h2>
        {error && <div className="error-message">{error}</div>}
        
        <div className="resources-grid">
          {resources.map((resource) => (
            <div key={resource._id} className="resource-card">
              <h3>{resource.name}</h3>
              <p><strong>Description:</strong> {resource.description}</p>
              <p><strong>Status:</strong> {resource.isAllocated ? 'Allocated' : 'Available'}</p>
              <button
                onClick={() => handleRequestResource(resource._id)}
                disabled={resource.isAllocated}
                className={resource.isAllocated ? 'btn-disabled' : 'btn-primary'}
              >
                {resource.isAllocated ? 'Already Allocated' : 'Request Resource'}
              </button>
            </div>
          ))}
        </div>

        <h2 style={{ marginTop: '40px' }}>My Requests</h2>
        <div className="requests-table">
          <table>
            <thead>
              <tr>
                <th>Resource</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td>{request.resourceId?.name || 'N/A'}</td>
                  <td className={`status ${request.status.toLowerCase()}`}>{request.status}</td>
                  <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
