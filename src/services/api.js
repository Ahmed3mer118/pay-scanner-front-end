import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getMethods: () => api.get('/dashboard/methods'),
};

export const transfersAPI = {
  getAll: (params) => api.get('/transfers', { params }),
  getOne: (id) => api.get(`/transfers/${id}`),
  upload: (formData, onProgress) =>
    api.post('/transfers/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
      validateStatus: (status) => status >= 200 && status < 500,
      onUploadProgress: (e) => {
        if (!onProgress) return;
        if (e.total && e.loaded >= e.total) {
          onProgress(45);
        } else {
          const pct = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
          onProgress(Math.min(pct, 40));
        }
      },
    }),
  updateStatus: (id, data) => api.patch(`/transfers/${id}/status`, data),
  bulkVerify: (ids) => api.post('/transfers/bulk-verify', { ids }),
  delete: (id) => api.delete(`/transfers/${id}`),
};

export default api;
