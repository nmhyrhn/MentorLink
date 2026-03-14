import axios from 'axios';

const TOKEN_KEY = 'mentorlink_access_token';
const USER_KEY = 'mentorlink_user';
const API_BASE_URL = typeof window === 'undefined'
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
  : '/api';

export const getAccessToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
};

export const setAccessToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const clearClientAuthState = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event('mentorlink-auth-changed'));
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then((response) => {
        const payload = response.data;
        setAccessToken(payload.accessToken);
        if (typeof window !== 'undefined' && payload.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
          window.dispatchEvent(new Event('mentorlink-auth-changed'));
        }
        return payload.accessToken;
      })
      .catch((error) => {
        clearClientAuthState();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;
    const url = originalRequest?.url || '';
    const isAuthRequest = url.includes('/auth/login')
      || url.includes('/auth/signup')
      || url.includes('/auth/refresh')
      || url.includes('/auth/email/');

    if ((status === 401 || status === 403) && originalRequest && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      try {
        const accessToken = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        const message = refreshError?.response?.data?.message || '세션이 만료되었습니다. 다시 로그인해 주세요.';
        return Promise.reject(new Error(message));
      }
    }

    const serverMessage = error?.response?.data?.message;
    const message = serverMessage || (status ? '서버 오류가 발생했습니다.' : '서버 오류가 발생했습니다.');
    return Promise.reject(new Error(message));
  }
);

export default api;
