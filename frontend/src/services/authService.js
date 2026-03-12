import api from './api';

/**
 * 회원 가입
 * @param {Object} data - { name, email, password, role: 'MENTOR' | 'MENTEE' }
 */
export const signUp = async (data) => {
  // 실제 백엔드 연동 시:
  // return await api.post('/auth/signup', data);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const { email, name, role } = data;
      if (!email || !name || !data.password) {
        reject(new Error('이름, 이메일, 비밀번호를 모두 입력해 주세요.'));
        return;
      }
      if (data.password.length < 6) {
        reject(new Error('비밀번호는 6자 이상이어야 합니다.'));
        return;
      }
      resolve({
        success: true,
        user: { name, email, role: role || 'MENTEE' },
      });
    }, 500);
  });
};

/**
 * 로그인
 * @param {Object} credentials - { email, password }
 */
export const login = async (credentials) => {
  // 실제 백엔드 연동 시:
  // const res = await api.post('/auth/login', credentials);
  // return res.data (token, user 등)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const { email, password } = credentials;
      if (!email || !password) {
        reject(new Error('이메일과 비밀번호를 입력해 주세요.'));
        return;
      }
      // 목업: 임의 이메일/비밀번호로 성공 처리
      resolve({
        success: true,
        user: { id: 1, name: '김앨리스', email, role: 'MENTOR' },
        token: 'mock-jwt-token',
      });
    }, 400);
  });
};

/**
 * 로그아웃 (클라이언트에서 토큰 제거 등)
 */
export const logout = async () => {
  // await api.post('/auth/logout'); 등
  return Promise.resolve();
};
