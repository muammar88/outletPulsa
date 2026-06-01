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
  withCredentials: true,
});

import { clearAuthCookies } from '@/utils/cookies';

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor untuk response: refresh token jika expired
let isRefreshing = false;
let failedRequestsQueue: Array<() => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          failedRequestsQueue.push(() => {
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(`${API_BASE_URL}/administrator/auth/refresh`, {}, { withCredentials: true });
        failedRequestsQueue.forEach((cb) => cb());
        failedRequestsQueue = [];

        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token gagal, harap login ulang');
        clearAuthCookies();
        window.location.href = '/login-backbone';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
