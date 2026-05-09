import axios from 'axios';

// Gunakan variabel lingkungan dari .env
import { API_URL } from '@/config/config';

const API_BASE_URL = API_URL;
// Base URL API
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fungsi untuk mengambil token dari localStorage
const getAccessToken = () => localStorage.getItem('administrator_access_token');
const getRefreshToken = () => localStorage.getItem('administrator_refresh_token');

// Tambahkan interceptor untuk menyisipkan token di setiap request
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor untuk response: refresh token jika expired
let isRefreshing = false;
let failedRequestsQueue = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await axios.post(`${API_BASE_URL}/auth/administrator/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = response.data.access_token;
        localStorage.setItem('administrator_access_token', newAccessToken);

        // Jalankan semua request yang tertunda
        failedRequestsQueue.forEach((cb) => cb(newAccessToken));
        failedRequestsQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token gagal, harap login ulang');
        localStorage.removeItem('administrator_access_token');
        localStorage.removeItem('administrator_refresh_token');
        window.location.href = '/login-admin';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// localStorage.setItem('administrator_access_token', response.data.access_token)
// localStorage.setItem('administrator_refresh_token', response.data.refresh_token)
export default api;
