import api from './api';

/**
 * 현재 로그인한 멘토의 프로필 조회
 */
export const getMyMentorProfile = async () => {
  // return await api.get('/me/mentor-profile');
  return new Promise((resolve) => {
    setTimeout(() => {
      const stored = typeof window !== 'undefined' && localStorage.getItem('mentorLink_myProfile');
      if (stored) {
        try {
          resolve(JSON.parse(stored));
          return;
        } catch (_) {}
      }
      resolve(null);
    }, 200);
  });
};

/**
 * 멘토 프로필 생성 또는 수정
 * @param {Object} data - { company, experience, expertise[], bio }
 */
export const saveMentorProfile = async (data) => {
  // return await api.post('/me/mentor-profile', data) or api.put('/me/mentor-profile', data);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!data.bio || !data.expertise?.length) {
        reject(new Error('자기소개와 전문 분야를 입력해 주세요.'));
        return;
      }
      const profile = {
        id: 1,
        name: '김앨리스',
        company: data.company || '',
        experience: data.experience || '',
        expertise: Array.isArray(data.expertise) ? data.expertise : (data.expertise || '').split(',').map(s => s.trim()).filter(Boolean),
        bio: data.bio,
        avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Alice',
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('mentorLink_myProfile', JSON.stringify(profile));
      }
      resolve(profile);
    }, 400);
  });
};
