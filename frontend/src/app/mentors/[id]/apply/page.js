'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ApplicationForm from '@/components/ApplicationForm';
import { getMentorById } from '@/services/mentorService';
import { applyForMentoring } from '@/services/applicationService';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ApplicationPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const data = await getMentorById(unwrappedParams.id);
        setMentor(data);
      } catch (error) {
        console.error('Mentor not found:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentor();
  }, [unwrappedParams.id]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await applyForMentoring(formData);
      setSuccess(true);
    } catch (error) {
      console.error('Failed to submit application:', error);
      alert('신청 제출에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-muted)] border-t-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-bold">멘토를 찾을 수 없습니다</h2>
        <Link href="/mentors" className="text-[var(--color-primary)] underline hover:no-underline">
          전체 멘토 목록 보기
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-[var(--color-foreground)]">
            멘토링 신청이 완료되었습니다!
          </h2>
          <p className="mt-4 text-[var(--color-muted-foreground)]">
            <strong>{mentor.name}</strong> 멘토에게 신청이 전달되었어요. 멘토가 신청을 검토하면 알려드릴게요.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] shadow-sm transition-colors hover:opacity-90"
            >
              대시보드로 이동
            </Link>
            <Link
              href="/mentors"
              className="inline-flex items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-6 py-2.5 text-sm font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-accent)]"
            >
              다른 멘토 더 보기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center text-sm text-[var(--color-muted-foreground)]">
        <Link href={`/mentors/${mentor.id}`} className="flex items-center hover:text-[var(--color-foreground)] transition-colors">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          {mentor.name}님의 프로필로 돌아가기
        </Link>
      </nav>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)]/30 p-6 sm:p-8 mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">{mentor.name}님께 멘토링 신청하기</h1>
        <p className="mt-2 text-[var(--color-muted-foreground)]">
          {mentor.expertise.slice(0, 2).join(', ')} 분야의 전문가 멘토에게 멘토링 세션을 신청하고 있어요.
        </p>
      </div>

      <ApplicationForm mentorId={mentor.id} onSubmit={handleSubmit} isLoading={submitting} />
    </div>
  );
}
