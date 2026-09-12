import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '/api';
  }
  return import.meta.env.PROD ? 'https://vision2venture.onrender.com/api' : '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
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

// Intelligent Cold-Start Auto-Retry & Global Error Handler
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Check if error is due to Render sleeping (502, 503, 504) or initial connection blip
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error');
    const isGatewayError = error.response && [502, 503, 504].includes(error.response.status);

    if ((isNetworkError || isGatewayError) && config && (!config._retryCount || config._retryCount < 3)) {
      config._retryCount = (config._retryCount || 0) + 1;
      const delayMs = config._retryCount * 1500; // 1.5s, 3.0s, 4.5s
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return api(config);
    }

    // Handle 401 errors: Only redirect to /login if user is NOT already on a public/auth route
    if (error.response && error.response.status === 401) {
      const publicPaths = ['/login', '/register', '/forgot-password', '/terms', '/privacy-policy'];
      const currentPath = window.location.pathname;
      const isPublicPath = currentPath === '/' || publicPaths.some((p) => currentPath.startsWith(p));
      
      if (!isPublicPath) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
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
  logout: () => api.post('/auth/logout'),
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
  syncDemoIdeas: () => api.post('/startup/sync-demo-ideas'),
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
  download: (ideaId) => api.get(`/report/${ideaId}/download?t=${Date.now()}`, { responseType: 'blob' }),
};

// ============================================================
// COMPETITOR INTELLIGENCE API
// ============================================================
export const competitorAPI = {
  getStartupCompetitors: (ideaId) => api.get(`/competitors/startup/${ideaId}`),
  discover: (data) => api.post('/competitors/discover', data),
  analyze: (data) => api.post('/competitors/analyze', data),
  addManual: (data) => api.post('/competitors/manual', data),
  update: (id, data) => api.patch(`/competitors/${id}`, data),
  delete: (id) => api.delete(`/competitors/${id}`),
};

export default api;
