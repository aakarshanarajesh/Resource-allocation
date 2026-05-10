import axios from 'axios';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (name, email, password) => api.post('/api/auth/register', { name, email, password }),
  registerAdmin: (name, email, password) =>
    api.post('/api/auth/register-admin', { name, email, password }),
  refreshToken: (refreshToken) => api.post('/api/auth/refresh-token', { refreshToken }),
  getCurrentUser: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/api/auth/reset-password/${token}`, { password }),
};

// Resource services
export const resourceService = {
  getAllResources: (page = 1, limit = 10) => 
    api.get('/api/resources', { params: { page, limit } }),
  getAvailableResources: () => api.get('/api/resources/available'),
  getResource: (id) => api.get(`/api/resources/${id}`),
  createResource: (data) => api.post('/api/resources', data),
  updateResource: (id, data) => api.put(`/api/resources/${id}`, data),
  deleteResource: (id) => api.delete(`/api/resources/${id}`),
};

// Request services
export const requestService = {
  getAllRequests: (page = 1, limit = 10, status = null) =>
    api.get('/api/requests', { params: { page, limit, status } }),
  getRequest: (id) => api.get(`/api/requests/${id}`),
  getUserRequests: () => api.get('/api/requests/my-requests'),
  createRequest: (resourceId, quantity = 1) => api.post('/api/requests', { resourceId, quantity }),
  approveRequest: (id, approvedQuantity) => api.put(`/api/requests/${id}/approve`, { approvedQuantity }),
  rejectRequest: (id) => api.put(`/api/requests/${id}/reject`),
};

// Notification services
export const notificationService = {
  getNotifications: (page = 1, limit = 10) =>
    api.get('/api/notifications', { params: { page, limit } }),
  getUnreadCount: () => api.get('/api/notifications/unread/count'),
  markAsRead: (notificationId) => api.put(`/api/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/api/notifications/mark-all/read'),
  deleteNotification: (notificationId) => api.delete(`/api/notifications/${notificationId}`),
};

// Analytics services
export const analyticsService = {
  getDashboardStats: () => api.get('/api/analytics/dashboard'),
  getRequestStats: () => api.get('/api/analytics/requests'),
  getResourceStats: () => api.get('/api/analytics/resources'),
  getUserActivity: (days = 30) => api.get('/api/analytics/activity', { params: { days } }),
  getRecentActivity: (limit = 20) => api.get('/api/analytics/logs', { params: { limit } }),
  getRequestTrends: () => api.get('/api/analytics/trends'),
};

export default api;

