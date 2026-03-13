'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ArrowLeft, CheckCircle2, Calendar } from 'lucide-react';
import ReviewForm from '@/components/ReviewForm';
import { getSessions, submitSessionReview } from '@/services/applicationService';

export default function ReviewPage({ params }) {
  const unwrappedParams = use(params);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await getSessions();
        const found = data.find((item) => item.id === Number.parseInt(unwrappedParams.id, 10));
        setSession(found);
      } catch (error) {
        console.error('Session not found:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [unwrappedParams.id]);

  const handleSubmit = async (reviewData) => {
    setSubmitting(true);
    try {
      await submitSessionReview(session.id, reviewData);
      setSuccess(true);
    } catch (error) {
      alert(error.message || '후기 제출에 실패했습니다.');
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

  if (!session) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-bold">세션을 찾을 수 없습니다</h2>
        <Link href="/dashboard" className="text-[var(--color-primary)] underline hover:no-underline">
          신청 멘토링으로 돌아가기
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-[var(--color-foreground)]">후기 제출이 완료되었습니다</h2>
          <p className="mt-4 text-[var(--color-muted-foreground)]">
            남겨주신 후기는 멘토 프로필 하단에서 회원가입 여부와 관계없이 누구나 볼 수 있습니다.
          </p>
          <div className="mt-8">
            <Link
              href={`/mentors/${session.mentorId}`}
              className="inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] shadow-sm transition-colors hover:opacity-90"
            >
              멘토 프로필 보기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center text-sm text-[var(--color-muted-foreground)]">
        <Link href="/dashboard" className="flex items-center transition-colors hover:text-[var(--color-foreground)]">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          신청 멘토링으로 돌아가기
        </Link>
      </nav>

      <div className="mb-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)]/30 p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">세션 후기 작성</h1>
          <span className="inline-flex items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2.5 py-1 text-xs font-semibold text-[var(--color-foreground)] shadow-sm">
            완료
          </span>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]">
            <Calendar className="h-5 w-5 text-[var(--color-foreground)]" />
          </div>
          <div>
            <p className="font-medium text-[var(--color-foreground)]">{session.mentorName} 멘토와의 세션</p>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {format(new Date(session.sessionDate), 'yyyy년 M월 d일 a h:mm', { locale: ko })} ~{' '}
              {format(new Date(session.sessionEndAt), 'a h:mm', { locale: ko })}
            </p>
          </div>
        </div>
      </div>

      <ReviewForm onSubmit={handleSubmit} isLoading={submitting} />
    </div>
  );
}
