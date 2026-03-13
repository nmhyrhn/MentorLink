import api from './api';

const mapAvailabilityRule = (rule) => ({
  dayOfWeek: rule.dayOfWeek,
  label: rule.label,
  startTime: rule.startTime,
  endTime: rule.endTime,
});

const mapProfile = (profile) => ({
  id: profile.mentorId,
  name: profile.mentorName,
  field: profile.field,
  company: profile.field,
  experience: `${profile.careerYear}년`,
  careerYear: profile.careerYear,
  expertise: profile.expertise || [],
  bio: profile.bio || '',
  avatar: profile.imageUrl || '/default-mentor.svg',
  availabilityRules: (profile.availabilityRules || []).map(mapAvailabilityRule),
});

export const getMyMentorProfile = async () => {
  try {
    const profile = await api.get('/mentors/me/profile');
    return mapProfile(profile);
  } catch (error) {
    if (error.message.includes('찾을 수 없습니다')) {
      return null;
    }
    throw error;
  }
};

export const saveMentorProfile = async (data, isUpdate = false) => {
  const payload = {
    bio: data.bio,
    field: data.field,
    careerYear: Number.parseInt(String(data.careerYear), 10) || 0,
    expertise: data.expertise,
    availabilityRules: data.availabilityRules,
  };

  const profile = isUpdate
    ? await api.put('/mentors/me/profile', payload)
    : await api.post('/mentors/profile', payload);
  return mapProfile(profile);
};
