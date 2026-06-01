import axios from 'axios';

// 开发环境用本地代理，生产环境用 Render 后端地址
const baseURL = import.meta.env.VITE_API_URL || '/api/v1';
const api = axios.create({ baseURL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(r => r, error => {
  if (error.response?.status === 401 && window.location.pathname !== '/login') {
    localStorage.removeItem('token'); localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default api;
