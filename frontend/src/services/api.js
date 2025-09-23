import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// News API
export const newsAPI = {
  getNews: (params = {}) => api.get('/news/', { params }),
  getNewsById: (id) => api.get(`/news/${id}/`),
  getFeaturedNews: () => api.get('/news/featured/'),
  getLatestNews: () => api.get('/news/latest/'),
  getNewsByCategory: () => api.get('/news/by_category/'),
};

// Categories API
export const categoriesAPI = {
  getCategories: () => api.get('/categories/'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  getPreferences: () => api.get('/auth/preferences/'),
  updatePreferences: (data) => api.patch('/auth/preferences/', data),
  getStats: () => api.get('/auth/stats/'),
  changePassword: (data) => api.post('/auth/change-password/', data),
  getPreferredCategories: () => api.get('/auth/preferred-categories/'),
  updatePreferredCategories: (data) => api.post('/auth/update-categories/', data),
};

export default api;