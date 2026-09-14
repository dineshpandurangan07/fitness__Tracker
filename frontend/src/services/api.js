import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, can clear token
      const isLoginOrRegister = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isLoginOrRegister) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  googleAuth: (googleData) => api.post('/auth/google', googleData),
  fastMailLogin: (data) => api.post('/auth/fast-mail-login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getProfile: () => api.get('/auth/profile'),
};

// User Profile Services
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  changePassword: (passwordData) => api.put('/users/change-password', passwordData),
};

// Exercise Services
export const exerciseAPI = {
  getAll: (params) => api.get('/exercises', { params }),
  getById: (id) => api.get(`/exercises/${id}`),
  create: (data) => api.post('/exercises', data),
  update: (id, data) => api.put(`/exercises/${id}`, data),
  delete: (id) => api.delete(`/exercises/${id}`),
};

// Workout Services
export const workoutAPI = {
  getAll: (params) => api.get('/workouts', { params }),
  getById: (id) => api.get(`/workouts/${id}`),
  create: (data) => api.post('/workouts', data),
  update: (id, data) => api.put(`/workouts/${id}`, data),
  delete: (id) => api.delete(`/workouts/${id}`),
  complete: (id, data) => api.post(`/workouts/${id}/complete`, data),
};

// Weight Tracker Services
export const weightAPI = {
  getAll: () => api.get('/weight'),
  add: (data) => api.post('/weight', data),
  delete: (id) => api.delete(`/weight/${id}`),
};

// Goals Services
export const goalAPI = {
  getAll: () => api.get('/goals'),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
};

// Calorie Tracker Services
export const calorieAPI = {
  getAll: (date) => api.get('/calories', { params: { date } }),
  add: (data) => api.post('/calories', data),
  delete: (id) => api.delete(`/calories/${id}`),
};

// Aggregated Stats Services
export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard'),
  getProgress: () => api.get('/stats/progress'),
};

export default api;
