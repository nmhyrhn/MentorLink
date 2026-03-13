import api from './api';

const statusMap = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  SCHEDULED: 'scheduled',
  FINISHED: 'completed',
};

const mapApplication = (application) => ({
  id: application.applicationId,
  mentorId: application.mentorId,
  mentorName: application.mentorName,
  menteeId: application.menteeUserId,
  menteeName: application.menteeName,
  menteeEmail: application.menteeEmail,
  message: application.message,
  contact: application.contact,
  status: statusMap[application.status] || application.status?.toLowerCase(),
  date: application.createdAt,
  preferredAt: application.preferredAt,
  preferredEndAt: application.preferredEndAt,
  durationMinutes: application.durationMinutes,
  sessionDate: application.scheduledAt,
  sessionEndAt: application.scheduledEndAt,
  rejectedReason: application.rejectedReason,
});

const mapSession = (session) => ({
  id: session.sessionId,
  applicationId: session.applicationId,
  mentorId: session.mentorId,
  mentorName: session.mentorName,
  menteeId: session.menteeUserId,
  menteeName: session.menteeName,
  menteeContact: session.menteeContact,
  sessionDate: session.scheduledAt,
  sessionEndAt: session.endAt,
  durationMinutes: session.durationMinutes,
  status: statusMap[session.status] || session.status?.toLowerCase(),
  reviewSubmitted: session.reviewSubmitted,
});

export const applyForMentoring = async (applicationData) => {
  const application = await api.post('/applications', {
    mentorId: applicationData.mentorId,
    message: applicationData.message,
    preferredAt: applicationData.preferredAt,
    preferredEndAt: applicationData.preferredEndAt,
    durationMinutes: applicationData.durationMinutes,
    contact: applicationData.contact,
  });
  return { success: true, application: mapApplication(application) };
};

export const getApplicationsForMentor = async () => {
  const applications = await api.get('/applications/me/received');
  return applications.map(mapApplication);
};

export const getMySentApplications = async () => {
  const applications = await api.get('/applications/me/sent');
  return applications.map(mapApplication);
};

export const updateApplicationStatus = async (applicationId, newStatus, scheduledAt) => {
  if (newStatus === 'approved') {
    const application = await api.patch(`/applications/${applicationId}/approve`, {
      scheduledAt: scheduledAt || null,
    });
    return mapApplication(application);
  }

  const application = await api.patch(`/applications/${applicationId}/reject`, {
    reason: '멘토 일정 조율이 어려워 이번 신청은 거절되었습니다.',
  });
  return mapApplication(application);
};

export const getSessions = async () => {
  const sessions = await api.get('/sessions/me');
  return sessions.map(mapSession);
};

export const completeSession = async (sessionId) => {
  const session = await api.patch(`/sessions/${sessionId}/complete`);
  return mapSession(session);
};

export const submitSessionReview = async (sessionId, reviewData) => {
  const review = await api.post('/reviews', {
    sessionId,
    rating: reviewData.rating,
    comment: reviewData.comment,
  });
  return { success: true, review };
};
