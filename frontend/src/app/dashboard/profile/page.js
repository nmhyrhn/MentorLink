'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { getMyMentorProfile, saveMentorProfile } from '@/services/mentorProfileService';
import { getCurrentUser, hasMentorRole, updateCurrentUser } from '@/services/authService';

const WEEK_DAYS = [
  { dayOfWeek: 'MONDAY', label: '월' },
  { dayOfWeek: 'TUESDAY', label: '화' },
  { dayOfWeek: 'WEDNESDAY', label: '수' },
  { dayOfWeek: 'THURSDAY', label: '목' },
  { dayOfWeek: 'FRIDAY', label: '금' },
  { dayOfWeek: 'SATURDAY', label: '토' },
  { dayOfWeek: 'SUNDAY', label: '일' },
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hour = String(Math.floor(index / 2)).padStart(2, '0');
  const minute = index % 2 === 0 ? '00' : '30';
  return `${hour}:${minute}`;
});

const emptyRuleMap = () =>
  WEEK_DAYS.reduce((acc, item) => {
    acc[item.dayOfWeek] = {
      enabled: false,
      startTime: '09:00',
      endTime: '18:00',
    };
    return acc;
  }, {});

export default function MentorProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [promotedToMentor, setPromotedToMentor] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [existingProfile, setExistingProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    field: '',
    careerYear: '',
    expertise: [],
    bio: '',
    availabilityRules: emptyRuleMap(),
    avatar: '/default-mentor.svg',
  });

  useEffect(() => {
    const load = async () => {
      const user = getCurrentUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      setCurrentUser(user);

      try {
        const profile = await getMyMentorProfile();
        if (profile) {
          const nextRuleMap = emptyRuleMap();
          (profile.availabilityRules || []).forEach((rule) => {
            nextRuleMap[rule.dayOfWeek] = {
              enabled: true,
              startTime: rule.startTime.slice(0, 5),
              endTime: rule.endTime.slice(0, 5),
            };
          });

          setExistingProfile(true);
          setFormData({
            field: profile.field || '',
            careerYear: profile.careerYear || '',
            expertise: profile.expertise || [],
            bio: profile.bio || '',
            availabilityRules: nextRuleMap,
            avatar: profile.avatar || '/default-mentor.svg',
          });
        }
      } catch (err) {
        setError(err.message || '프로필을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    const skill = newSkill.trim();
    if (!skill || formData.expertise.includes(skill)) {
      return;
    }
    setFormData((prev) => ({ ...prev, expertise: [...prev.expertise, skill] }));
    setNewSkill('');
  };

  const removeSkill = (skill) => {
    setFormData((prev) => ({ ...prev, expertise: prev.expertise.filter((item) => item !== skill) }));
  };

  const updateRule = (dayOfWeek, key, value) => {
    setFormData((prev) => ({
      ...prev,
      availabilityRules: {
        ...prev.availabilityRules,
        [dayOfWeek]: {
          ...prev.availabilityRules[dayOfWeek],
          [key]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setPromotedToMentor(false);

    const enabledRules = WEEK_DAYS
      .map((item) => ({ dayOfWeek: item.dayOfWeek, ...formData.availabilityRules[item.dayOfWeek] }))
      .filter((rule) => rule.enabled)
      .map((rule) => ({
        dayOfWeek: rule.dayOfWeek,
        startTime: rule.startTime,
        endTime: rule.endTime,
      }));

    if (enabledRules.length === 0) {
      setError('최소 1개 이상의 예약 가능 요일을 설정해 주세요.');
      return;
    }

    setSaving(true);
    try {
      const isCreatingProfile = !existingProfile;
      await saveMentorProfile(
        {
          field: formData.field,
          careerYear: formData.careerYear,
          expertise: formData.expertise,
          bio: formData.bio,
          availabilityRules: enabledRules,
        },
        existingProfile
      );
      if (currentUser && !hasMentorRole(currentUser)) {
        const nextRole = 'MENTOR';
        const nextUser = updateCurrentUser({ role: nextRole });
        setCurrentUser(nextUser || { ...currentUser, role: nextRole });
      }
      setPromotedToMentor(isCreatingProfile);
      setSuccess(true);
      setExistingProfile(true);
    } catch (err) {
      setError(err.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-muted)] border-t-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center text-sm text-[var(--color-muted-foreground)]">
        <Link href="/dashboard" className="flex items-center transition-colors hover:text-[var(--color-foreground)]">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          신청 멘토링으로 돌아가기
        </Link>
      </nav>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-accent)]">
            <Image src={formData.avatar} alt="기본 멘토 이미지" fill className="object-cover" sizes="64px" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">프로필 관리</h1>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              기본 이미지는 공통 이미지로 적용되며, 소개와 전문 분야, 예약 가능 요일을 직접 관리할 수 있습니다.
            </p>
            {currentUser && !hasMentorRole(currentUser) && (
              <p className="mt-2 text-sm font-medium text-red-600">
                프로필을 저장하면 멘토 계정으로 전환됩니다. 전향 후에는 멘티로 다시 되돌리기 어렵고,
                멘토링 신청 대신 멘토 활동만 할 수 있습니다. 예정된 세션이나 진행 중인 신청이 남아 있으면
                전환할 수 없습니다.
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          {success && (
            <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
              {promotedToMentor ? '멘토 프로필이 생성되어 멘토 계정으로 전환되었습니다.' : '프로필이 저장되었습니다.'}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="field" className="text-sm font-medium text-[var(--color-foreground)]">대표 전문 분야</label>
            <input
              id="field"
              name="field"
              type="text"
              required
              value={formData.field}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              placeholder="예: 백엔드 아키텍처"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="careerYear" className="text-sm font-medium text-[var(--color-foreground)]">경력 연차</label>
            <input
              id="careerYear"
              name="careerYear"
              type="number"
              min="0"
              required
              value={formData.careerYear}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              placeholder="예: 8"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-[var(--color-foreground)]">기술 전문 분야</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex h-10 flex-1 rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                placeholder="예: Spring Boot"
              />
              <button type="button" onClick={addSkill} className="inline-flex items-center rounded-md border border-[var(--color-border)] px-4 text-sm font-medium hover:bg-[var(--color-accent)]">
                <Plus className="mr-1 h-4 w-4" />
                추가
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.expertise.map((skill) => (
                <span key={skill} className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-3 py-1 text-sm text-[var(--color-accent-foreground)]">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="ml-2">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-[var(--color-foreground)]">예약 가능 시간</label>
            <div className="space-y-3">
              {WEEK_DAYS.map((item) => {
                const rule = formData.availabilityRules[item.dayOfWeek];
                return (
                  <div key={item.dayOfWeek} className="grid gap-3 rounded-xl border border-[var(--color-border)] p-4 md:grid-cols-[100px_1fr_1fr] md:items-center">
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-foreground)]">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => updateRule(item.dayOfWeek, 'enabled', e.target.checked)}
                        className="h-4 w-4"
                      />
                      {item.label}요일
                    </label>
                    <select
                      value={rule.startTime}
                      onChange={(e) => updateRule(item.dayOfWeek, 'startTime', e.target.value)}
                      disabled={!rule.enabled}
                      className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm disabled:opacity-50"
                    >
                      {TIME_OPTIONS.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    <select
                      value={rule.endTime}
                      onChange={(e) => updateRule(item.dayOfWeek, 'endTime', e.target.value)}
                      disabled={!rule.enabled}
                      className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm disabled:opacity-50"
                    >
                      {TIME_OPTIONS.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              정각 또는 30분 단위만 설정할 수 있으며, 체크하지 않은 요일은 예약 화면에 노출되지 않습니다.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium text-[var(--color-foreground)]">멘토 소개</label>
            <textarea
              id="bio"
              name="bio"
              required
              rows={6}
              value={formData.bio}
              onChange={handleChange}
              className="flex w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              placeholder="멘티에게 어떤 도움을 줄 수 있는지 소개해 주세요."
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                저장 중...
              </span>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                프로필 저장
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
