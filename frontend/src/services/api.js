import axios from 'axios';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0');

// In local dev, use local proxy /api; in production, automatically connect to the live Render backend API
const defaultBaseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (isLocalhost ? '/api' : 'https://mane-manege-police-api.onrender.com/api');

const api = axios.create({
  baseURL: defaultBaseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred while processing the request.';

    if (error.response?.status === 401) {
      // Token invalid or expired
      localStorage.removeItem('shms_token');
      localStorage.removeItem('shms_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=1';
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
