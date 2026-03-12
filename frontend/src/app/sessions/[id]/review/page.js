'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReviewForm from '@/components/ReviewForm';
import { getSessions, submitSessionReview } from '@/services/applicationService';
import { ArrowLeft, CheckCircle2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function ReviewPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await getSessions();
        const found = data.find(s => s.id === parseInt(unwrappedParams.id, 10));
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
      console.error('Failed to submit review:', error);
      alert('후기 제출에 실패했습니다. 잠시 후 다시 시도해 주세요.');
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
        <Link href="/sessions" className="text-[var(--color-primary)] underline hover:no-underline">
          전체 세션 보기
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
            후기 제출이 완료되었습니다!
          </h2>
          <p className="mt-4 text-[var(--color-muted-foreground)]">
            소중한 피드백을 남겨주셔서 감사합니다. 이 후기는 다른 사용자들이 좋은 멘토를 찾는 데 큰 도움이 됩니다.
          </p>
          <div className="mt-8">
            <Link
              href="/sessions"
              className="inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] shadow-sm transition-colors hover:opacity-90"
            >
              세션 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center text-sm text-[var(--color-muted-foreground)]">
        <Link href="/sessions" className="flex items-center hover:text-[var(--color-foreground)] transition-colors">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          세션 목록으로 돌아가기
        </Link>
      </nav>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)]/30 p-6 sm:p-8 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">세션 후기 작성</h1>
          <span className="inline-flex items-center justify-center rounded-md bg-[var(--color-background)] px-2.5 py-1 text-xs font-semibold text-[var(--color-foreground)] shadow-sm border border-[var(--color-border)]">
            완료됨
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center p-4 bg-[var(--color-background)] rounded-xl border border-[var(--color-border)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)] shrink-0">
            <Calendar className="h-5 w-5 text-[var(--color-foreground)]" />
          </div>
          <div>
            <p className="font-medium text-[var(--color-foreground)]">{session.menteeName}님과의 멘토링 세션</p>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {format(new Date(session.sessionDate), 'yyyy년 M월 d일 • a h:mm')}
            </p>
          </div>
        </div>
      </div>

      <ReviewForm sessionId={session.id} onSubmit={handleSubmit} isLoading={submitting} />
    </div>
  );
}
