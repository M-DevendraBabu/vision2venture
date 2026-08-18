import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://vision2venture.onrender.com/api' : '/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
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

// Handle 401 errors globally (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================
// AUTH API
// ============================================================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (accessToken, userInfo) => api.post('/auth/google', { access_token: accessToken, name: userInfo.name, email: userInfo.email }),
  getProfile: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post(`/auth/forgot-password?email=${email}`),
  resetPassword: (token, newPassword) =>
    api.post(`/auth/reset-password?token=${token}&new_password=${newPassword}`),
};

// ============================================================
// STARTUP IDEAS API
// ============================================================
export const startupAPI = {
  create: (data) => api.post('/startup/create', data),
  list: () => api.get('/startup/list'),
  getById: (id) => api.get(`/startup/${id}`),
  delete: (id) => api.delete(`/startup/${id}`),
};

// ============================================================
// ANALYSIS API
// ============================================================
export const analysisAPI = {
  run: (ideaId) => api.post(`/analysis/${ideaId}/run`),
  getStatus: (ideaId) => api.get(`/analysis/${ideaId}/status`),
  getOverview: (ideaId) => api.get(`/analysis/${ideaId}/overview`),
  getMarket: (ideaId) => api.get(`/analysis/${ideaId}/market`),
  getCompetitors: (ideaId) => api.get(`/analysis/${ideaId}/competitors`),
  getTechnology: (ideaId) => api.get(`/analysis/${ideaId}/technology`),
  getBusiness: (ideaId) => api.get(`/analysis/${ideaId}/business`),
  getFinancial: (ideaId) => api.get(`/analysis/${ideaId}/financial`),
  getRisk: (ideaId) => api.get(`/analysis/${ideaId}/risk`),
  getRoadmap: (ideaId) => api.get(`/analysis/${ideaId}/roadmap`),
};

// ============================================================
// REPORT API
// ============================================================
export const reportAPI = {
  generate: (ideaId) => api.post(`/report/${ideaId}/generate`),
  download: (ideaId) => api.get(`/report/${ideaId}/download`, { responseType: 'blob' }),
};

export default api;
