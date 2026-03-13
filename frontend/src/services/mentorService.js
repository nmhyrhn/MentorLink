import api from './api';

const mapReview = (review) => ({
  id: review.reviewId,
  sessionId: review.sessionId,
  reviewerName: review.reviewerName,
  rating: review.rating,
  comment: review.comment,
  createdAt: review.createdAt,
});

const mapAvailabilityRule = (rule) => ({
  dayOfWeek: rule.dayOfWeek,
  label: rule.label,
  startTime: rule.startTime,
  endTime: rule.endTime,
});

const mapMentor = (mentor) => ({
  id: mentor.mentorId,
  userId: mentor.userId,
  name: mentor.mentorName,
  expertise: mentor.expertise || [],
  bio: mentor.bio || '',
  experience: `${mentor.careerYear}년`,
  careerYear: mentor.careerYear,
  company: mentor.field,
  field: mentor.field,
  avatar: mentor.imageUrl || '/default-mentor.svg',
  availabilityRules: (mentor.availabilityRules || []).map(mapAvailabilityRule),
  averageRating: mentor.averageRating,
  reviewCount: mentor.reviewCount || 0,
  reviews: (mentor.reviews || []).map(mapReview),
});

const mapAvailableSlot = (slot) => ({
  startAt: slot.startAt,
  endAt: slot.endAt,
  maxDurationMinutes: slot.maxDurationMinutes,
  durationOptions: slot.durationOptions || [],
});

export const getMentors = async () => {
  const mentors = await api.get('/mentors');
  return mentors.map(mapMentor);
};

export const getMentorById = async (id) => {
  const mentor = await api.get(`/mentors/${id}`);
  return mapMentor(mentor);
};

export const getAvailableSlots = async (id) => {
  const slots = await api.get(`/mentors/${id}/available-slots`);
  return slots.map(mapAvailableSlot);
};
