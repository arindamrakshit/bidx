import axios from 'axios';

// When running in production (e.g. Vercel), fall back to public live backend tunnel if VITE_API_URL is unset
const DEFAULT_URL = (typeof window !== 'undefined' && window.location.hostname !== 'localhost')
  ? 'https://late-sloths-unite.loca.lt/api'
  : 'http://localhost:8080/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bidx_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('bidx_token');
        localStorage.removeItem('bidx_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
