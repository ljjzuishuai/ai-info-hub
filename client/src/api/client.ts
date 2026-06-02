import axios from 'axios';

// API 地址直接写死，不再依赖环境变量
const baseURL = import.meta.env.DEV ? '/api/v1' : 'https://ai-info-hub-3.onrender.com/api/v1';
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
