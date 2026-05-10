import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
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
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

// Resource services
export const resourceService = {
  getAllResources: (page = 1, limit = 10) => 
    api.get('/resources', { params: { page, limit } }),
  getAvailableResources: () => api.get('/resources/available'),
  getResource: (id) => api.get(`/resources/${id}`),
  createResource: (data) => api.post('/resources', data),
  updateResource: (id, data) => api.put(`/resources/${id}`, data),
  deleteResource: (id) => api.delete(`/resources/${id}`),
};

// Request services
export const requestService = {
  getAllRequests: (page = 1, limit = 10, status = null) =>
    api.get('/requests', { params: { page, limit, status } }),
  getRequest: (id) => api.get(`/requests/${id}`),
  getUserRequests: () => api.get('/requests/my-requests'),
  createRequest: (resourceId, quantity = 1) => api.post('/requests', { resourceId, quantity }),
  approveRequest: (id) => api.put(`/requests/${id}/approve`),
  rejectRequest: (id) => api.put(`/requests/${id}/reject`),
};

// Notification services
export const notificationService = {
  getNotifications: (page = 1, limit = 10) =>
    api.get('/notifications', { params: { page, limit } }),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all/read'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
};

// Analytics services
export const analyticsService = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getRequestStats: () => api.get('/analytics/requests'),
  getResourceStats: () => api.get('/analytics/resources'),
  getUserActivity: (days = 30) => api.get('/analytics/activity', { params: { days } }),
  getRecentActivity: (limit = 20) => api.get('/analytics/logs', { params: { limit } }),
  getRequestTrends: () => api.get('/analytics/trends'),
};

export default api;

