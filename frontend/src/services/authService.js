import api, { clearClientAuthState, setAccessToken } from './api';

const USER_KEY = 'mentorlink_user';

const saveAuth = (payload) => {
  setAccessToken(payload.accessToken);
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    window.dispatchEvent(new Event('mentorlink-auth-changed'));
  }
  return payload;
};

export const getCurrentUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const sendVerificationCode = async (data) => api.post('/auth/email/send-code', data);

export const verifyEmailCode = async (data) => api.post('/auth/email/verify', data);

export const signUp = async (data) => {
  const payload = await api.post('/auth/signup', data);
  return saveAuth(payload);
};

export const login = async (credentials) => {
  const payload = await api.post('/auth/login', credentials);
  return saveAuth(payload);
};

export const logout = async () => {
  try {
    await api.post('/auth/logout', {});
  } finally {
    clearClientAuthState();
  }
};
