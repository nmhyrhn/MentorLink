import api from './api';

// --- MOCK DATA (한국어) ---
// pricePerHour: 시간당 멘토링 비용 (원)
const MOCK_MENTORS = [
  {
    id: 1,
    name: '김앨리스',
    expertise: ['프론트엔드', 'React', 'Next.js'],
    bio: '8년차 시니어 프론트엔드 엔지니어입니다. 스타트업의 UI 확장과 성능 개선을 도와왔어요.',
    experience: '8년',
    company: '테크플로우',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Alice',
    pricePerHour: 28000,
  },
  {
    id: 2,
    name: '천민준',
    expertise: ['백엔드', 'Spring Boot', 'Java'],
    bio: '백엔드와 아키텍처에 관심이 많아요. 클린 코드와 설계 원칙을 나누고 싶습니다.',
    experience: '10년',
    company: '클라우드시스템즈',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Michael',
    pricePerHour: 25000,
  },
  {
    id: 3,
    name: '박서연',
    expertise: ['UI/UX', 'Figma', '제품 디자인'],
    bio: 'SaaS 플랫폼과 사용자 중심 워크플로우를 다루는 제품 디자이너입니다.',
    experience: '5년',
    company: '디자인마인즈',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sarah',
    pricePerHour: 30000,
  },
  {
    id: 4,
    name: '김대현',
    expertise: ['DevOps', 'AWS', 'Kubernetes'],
    bio: '안정적인 CI/CD 파이프라인과 확장 가능한 인프라 구축을 도와드려요.',
    experience: '7년',
    company: '인프라스케일',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=David',
    pricePerHour: 32000,
  },
];

// --- API METHODS ---

/**
 * Fetch all mentors.
 * Simulates a delay to mimic network request.
 */
export const getMentors = async () => {
  // Uncomment the following line when integrating with the real API:
  // return await api.get('/mentors');
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_MENTORS);
    }, 500);
  });
};

/**
 * Fetch a single mentor by ID.
 * @param {number|string} id 
 */
export const getMentorById = async (id) => {
  // Uncomment the following line when integrating with the real API:
  // return await api.get(`/mentors/${id}`);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const mentor = MOCK_MENTORS.find(m => m.id === parseInt(id));
      if (mentor) {
        resolve(mentor);
      } else {
        reject(new Error('Mentor not found'));
      }
    }, 300);
  });
};
