import api from './api';

// --- MOCK DATA ---
/**
 * Applications list.
 * In a real app, this would be fetched from the backend linked to the logged-in mentor.
 */
let MOCK_APPLICATIONS = [
  {
    id: 101,
    mentorId: 1,
    menteeName: '홍길동',
    menteeEmail: 'hong@example.com',
    message: 'React 성능 개선과 모던 프론트엔드 아키텍처에 대한 조언을 받고 싶습니다.',
    status: 'pending',
    date: '2023-10-15T10:00:00Z',
  },
  {
    id: 102,
    mentorId: 1,
    menteeName: '이지은',
    menteeEmail: 'lee.jieun@example.com',
    message: 'Vue에서 Next.js App Router로 전환하는 과정에서 도움을 받고 싶어요.',
    status: 'approved',
    date: '2023-11-01T14:30:00Z',
  }
];

// Sessions created from approved applications
let MOCK_SESSIONS = [
  {
    id: 201,
    mentorId: 1,
    menteeName: '이지은',
    menteeEmail: 'lee.jieun@example.com',
    sessionDate: '2024-05-15T09:00:00Z',
    status: 'scheduled',
    review: null,
  }
];

// --- API METHODS ---

/**
 * Submit a new mentoring application.
 * @param {Object} applicationData 
 */
export const applyForMentoring = async (applicationData) => {
  // Uncomment when integrating real API:
  // return await api.post('/applications', applicationData);

  return new Promise((resolve) => {
    setTimeout(() => {
      const newApp = {
        id: Date.now(),
        ...applicationData,
        status: 'pending',
        date: new Date().toISOString(),
      };
      MOCK_APPLICATIONS.push(newApp);
      resolve({ success: true, application: newApp });
    }, 600);
  });
};

/**
 * Get applications for a specific mentor dashboard.
 * @param {number|string} mentorId 
 */
export const getApplicationsForMentor = async (mentorId) => {
  // Uncomment when integrating real API:
  // return await api.get(`/mentors/${mentorId}/applications`);

  return new Promise((resolve) => {
    setTimeout(() => {
      const apps = MOCK_APPLICATIONS.filter(app => app.mentorId === parseInt(mentorId));
      resolve(apps);
    }, 400);
  });
};

/**
 * Update the status of an application (approve/reject).
 * @param {number} applicationId 
 * @param {string} newStatus 'approved' or 'rejected'
 */
export const updateApplicationStatus = async (applicationId, newStatus) => {
  // return await api.patch(`/applications/${applicationId}`, { status: newStatus });
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const appIndex = MOCK_APPLICATIONS.findIndex(app => app.id === parseInt(applicationId));
      if (appIndex !== -1) {
        MOCK_APPLICATIONS[appIndex].status = newStatus;
        
        // If approved, create a mock session
        if (newStatus === 'approved') {
          const newSession = {
            id: Date.now(),
            mentorId: MOCK_APPLICATIONS[appIndex].mentorId,
            menteeName: MOCK_APPLICATIONS[appIndex].menteeName,
            menteeEmail: MOCK_APPLICATIONS[appIndex].menteeEmail,
            sessionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // next week
            status: 'scheduled',
            review: null,
          };
          MOCK_SESSIONS.push(newSession);
        }
        
        resolve(MOCK_APPLICATIONS[appIndex]);
      } else {
        reject(new Error('Application not found'));
      }
    }, 500);
  });
};

/**
 * Fetch scheduled or completed sessions for the mentee/mentor.
 */
export const getSessions = async () => {
  // return await api.get('/sessions');

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_SESSIONS);
    }, 300);
  });
};

/**
 * Submit a review for a completed session.
 * @param {number} sessionId 
 * @param {Object} reviewData { rating, comment }
 */
export const submitSessionReview = async (sessionId, reviewData) => {
  // return await api.post(`/sessions/${sessionId}/reviews`, reviewData);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const sessionIndex = MOCK_SESSIONS.findIndex(s => s.id === parseInt(sessionId));
      if (sessionIndex !== -1) {
        MOCK_SESSIONS[sessionIndex].status = 'completed';
        MOCK_SESSIONS[sessionIndex].review = reviewData;
        resolve({ success: true, session: MOCK_SESSIONS[sessionIndex] });
      } else {
        reject(new Error('Session not found'));
      }
    }, 600);
  });
};
