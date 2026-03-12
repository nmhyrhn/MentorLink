'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Briefcase } from 'lucide-react';
import { getMyMentorProfile, saveMentorProfile } from '@/services/mentorProfileService';

export default function MentorProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    experience: '',
    expertiseText: '',
    bio: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const profile = await getMyMentorProfile();
        if (profile) {
          setFormData({
            company: profile.company || '',
            experience: profile.experience || '',
            expertiseText: Array.isArray(profile.expertise) ? profile.expertise.join(', ') : '',
            bio: profile.bio || '',
          });
        }
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);
    try {
      const expertise = formData.expertiseText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await saveMentorProfile({
        company: formData.company,
        experience: formData.experience,
        expertise,
        bio: formData.bio,
      });
      setSuccess(true);
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
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center text-sm text-[var(--color-muted-foreground)]">
        <Link href="/dashboard" className="flex items-center hover:text-[var(--color-foreground)] transition-colors">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          대시보드로 돌아가기
        </Link>
      </nav>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent)]">
            <Briefcase className="h-6 w-6 text-[var(--color-foreground)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">
              멘토 프로필 {formData.bio ? '수정' : '등록'}
            </h1>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              전문 분야, 경력, 자기소개를 입력하면 멘토 목록에 노출됩니다.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400">
              프로필이 저장되었습니다.
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="company" className="text-sm font-medium text-[var(--color-foreground)]">
              소속 회사 / 조직
            </label>
            <input
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
              placeholder="예: (주)테크플로우"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="experience" className="text-sm font-medium text-[var(--color-foreground)]">
              경력 연차
            </label>
            <input
              id="experience"
              name="experience"
              type="text"
              value={formData.experience}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
              placeholder="예: 8년"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="expertiseText" className="text-sm font-medium text-[var(--color-foreground)]">
              전문 분야 <span className="text-red-500">*</span>
            </label>
            <input
              id="expertiseText"
              name="expertiseText"
              type="text"
              value={formData.expertiseText}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
              placeholder="쉼표로 구분 (예: React, Spring Boot, 시스템 설계)"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium text-[var(--color-foreground)]">
              자기소개 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              required
              rows={6}
              value={formData.bio}
              onChange={handleChange}
              className="flex w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
              placeholder="멘티에게 자신을 소개해 주세요. 어떤 분야를 다루고, 어떤 도움을 줄 수 있는지 작성해 주세요."
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
