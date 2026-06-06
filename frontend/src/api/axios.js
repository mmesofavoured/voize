import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api',
});

// JWT interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('voize_access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('voize_refresh');
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api'}/auth/refresh/`,
          { refresh }
        );
        localStorage.setItem('voize_access', data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return axios(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;