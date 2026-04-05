import React, { useState, useEffect } from 'react';
import { resourceService, requestService, analyticsService } from '../services/api';
import { showSuccess, showError } from '../utils/toast';
import { formatDate, getStatusText, getStatusColor } from '../utils/helpers';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import '../styles/Dashboard.css';

function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [resources, setResources] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [newResource, setNewResource] = useState({ name: '', description: '' });
  const [requestFilter, setRequestFilter] = useState('all');

  useEffect(() => {
    fetchAllData();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch requests whenever the filter changes
    fetchRequests();
  }, [requestFilter]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchResources(),
        fetchRequests(),
        fetchStats(),
      ]);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await resourceService.getAllResources(1, 100);
      setResources(response.data.resources);
    } catch (err) {
      setError('Failed to fetch resources');
    }
  };

  const fetchRequests = async () => {
    try {
      const filter = requestFilter === 'all' ? null : requestFilter.toUpperCase();
      const response = await requestService.getAllRequests(1, 50, filter);
      setRequests(response.data.requests);
    } catch (err) {
      setError('Failed to fetch requests');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await analyticsService.getDashboardStats();
      setStats(response.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      await resourceService.createResource(newResource);
      showSuccess('Resource created successfully');
      setNewResource({ name: '', description: '' });
      setShowResourceForm(false);
      await fetchResources();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create resource');
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await requestService.approveRequest(requestId);
      showSuccess('Request approved successfully');
      await fetchRequests();
      await fetchStats();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await requestService.rejectRequest(requestId);
      showSuccess('Request rejected successfully');
      await fetchRequests();
      await fetchStats();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleDeleteResource = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourceService.deleteResource(id);
        showSuccess('Resource deleted successfully');
        await fetchResources();
      } catch (err) {
        showError(err.response?.data?.message || 'Failed to delete resource');
      }
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="dashboard-container">
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${tab === 'overview' ? 'active' : ''}`}
          onClick={() => setTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${tab === 'resources' ? 'active' : ''}`}
          onClick={() => setTab('resources')}
        >
          📦 Resources
        </button>
        <button 
          className={`tab-btn ${tab === 'requests' ? 'active' : ''}`}
          onClick={() => setTab('requests')}
        >
          📋 Requests
        </button>
      </div>

      <div className="dashboard-content">
        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="overview-section">
            <h2>Dashboard Overview</h2>
            
            {stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>👥 Total Users</h3>
                  <p className="stat-number">{stats.users.total}</p>
                  <small>{stats.users.admins} Admins</small>
                </div>
                <div className="stat-card">
                  <h3>📦 Total Resources</h3>
                  <p className="stat-number">{stats.resources.total}</p>
                  <small>{stats.resources.allocated} Allocated | {stats.resources.available} Available</small>
                </div>
                <div className="stat-card">
                  <h3>📋 Total Requests</h3>
                  <p className="stat-number">{stats.requests.total}</p>
                  <small>{stats.requests.pending} Pending</small>
                </div>
                <div className="stat-card">
                  <h3>✅ Approved Requests</h3>
                  <p className="stat-number">{stats.requests.approved}</p>
                  <small>{stats.requests.rejected} Rejected</small>
                </div>
              </div>
            )}

            <div className="analytics-section">
              <h3>Resource Allocation Status</h3>
              {stats && (
                <div className="utilization-chart">
                  <div className="chart-item">
                    <div className="chart-label">Allocated</div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill allocated" 
                        style={{ 
                          width: stats.resources.total > 0 
                            ? `${(stats.resources.allocated / stats.resources.total) * 100}%` 
                            : '0%' 
                        }}
                      ></div>
                    </div>
                    <div className="chart-value">{stats.resources.allocated}/{stats.resources.total}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="analytics-section">
              <h3>Request Status Distribution</h3>
              {stats && (
                <div className="request-stats">
                  <div className="stat-item">
                    <span className="status-label pending">Pending</span>
                    <span className="status-count">{stats.requests.pending}</span>
                  </div>
                  <div className="stat-item">
                    <span className="status-label approved">Approved</span>
                    <span className="status-count">{stats.requests.approved}</span>
                  </div>
                  <div className="stat-item">
                    <span className="status-label rejected">Rejected</span>
                    <span className="status-count">{stats.requests.rejected}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {tab === 'resources' && (
          <div className="resources-section">
            <div className="section-header">
              <h2>Resources Management</h2>
              <button 
                className="btn-primary" 
                onClick={() => setShowResourceForm(!showResourceForm)}
              >
                {showResourceForm ? '✕ Cancel' : '+ Add Resource'}
              </button>
            </div>

            {showResourceForm && (
              <form onSubmit={handleAddResource} className="resource-form">
                <div className="form-group">
                  <label>Resource Name *</label>
                  <input
                    type="text"
                    value={newResource.name}
                    onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                    required
                    placeholder="e.g., Laptop, Projector"
                    minLength={3}
                  />
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={newResource.description}
                    onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                    required
                    placeholder="Describe the resource..."
                    minLength={5}
                    rows={4}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-success">Create Resource</button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowResourceForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {error && <div className="error-message">⚠️ {error}</div>}

            {resources.length === 0 ? (
              <EmptyState 
                icon="📭" 
                title="No Resources"
                message="Create your first resource to get started"
              />
            ) : (
              <div className="resources-grid">
                {resources.map((resource) => (
                  <div key={resource._id} className="resource-card">
                    <div className="resource-header">
                      <h3>{resource.name}</h3>
                      <span className={`badge ${resource.isAllocated ? 'allocated' : 'available'}`}>
                        {resource.isAllocated ? '✓ Allocated' : '○ Available'}
                      </span>
                    </div>
                    <p className="resource-description">{resource.description}</p>
                    {resource.allocatedTo && (
                      <p className="resource-allocated-to">
                        <strong>Allocated to:</strong> {resource.allocatedTo.name}
                      </p>
                    )}
                    <button 
                      className="btn-danger btn-small" 
                      onClick={() => handleDeleteResource(resource._id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {tab === 'requests' && (
          <div className="requests-section">
            <div className="section-header">
              <h2>Requests Management</h2>
              <select 
                className="filter-select"
                value={requestFilter}
                onChange={(e) => {
                  setRequestFilter(e.target.value);
                }}
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {error && <div className="error-message">⚠️ {error}</div>}

            {requests.length === 0 ? (
              <EmptyState 
                icon="📭" 
                title="No Requests"
                message="There are no requests to display"
              />
            ) : (
              <div className="requests-table-wrapper">
                <table className="requests-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Resource</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request._id}>
                        <td>{request.user?.name || 'N/A'}</td>
                        <td>{request.resource?.name || 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </span>
                        </td>
                        <td>{formatDate(request.createdAt)}</td>
                        <td>
                          {request.status === 'PENDING' && (
                            <div className="action-buttons">
                              <button 
                                className="btn-success btn-small"
                                onClick={() => handleApproveRequest(request._id)}
                                title="Approve this request"
                              >
                                ✓ Approve
                              </button>
                              <button 
                                className="btn-danger btn-small"
                                onClick={() => handleRejectRequest(request._id)}
                                title="Reject this request"
                              >
                                ✕ Reject
                              </button>
                            </div>
                          )}
                          {request.status !== 'PENDING' && (
                            <span className="status-final">Already {getStatusText(request.status)}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
