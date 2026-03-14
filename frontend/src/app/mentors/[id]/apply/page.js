'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import ApplicationForm from '@/components/ApplicationForm';
import { getMentorById, getAvailableSlots } from '@/services/mentorService';
import { applyForMentoring } from '@/services/applicationService';
import { getCurrentUser, hasMentorRole } from '@/services/authService';

export default function ApplicationPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [mentor, setMentor] = useState(null);
  const [user, setUser] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    const fetchMentor = async () => {
      try {
        const [mentorData, slots] = await Promise.all([
          getMentorById(unwrappedParams.id),
          getAvailableSlots(unwrappedParams.id),
        ]);
        setMentor(mentorData);
        setAvailableSlots(slots);
      } catch (error) {
        console.error('Mentor not found:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentor();
  }, [unwrappedParams.id]);

  const handleSubmit = async (formData) => {
    if (!user) {
      alert('멘토링 신청은 로그인 후 이용할 수 있습니다.');
      router.push('/login');
      return;
    }

    setSubmitting(true);
    try {
      await applyForMentoring(formData);
      setSuccess(true);
    } catch (error) {
      alert(error.message || '멘토링 신청에 실패했습니다.');
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

  const isSelfMentor = user && mentor.userId === user.userId;
  const isMentorUser = hasMentorRole(user);

  if (isSelfMentor) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">본인에게는 멘토링을 신청할 수 없습니다</h2>
          <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
            멘토 본인은 자신의 프로필로 멘토링 신청을 진행할 수 없습니다.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/mentors/${mentor.id}`}
              className="inline-flex items-center justify-center rounded-md border border-[var(--color-border)] bg-white px-6 py-2.5 text-sm font-medium text-[var(--color-foreground)]"
            >
              멘토 프로필로 돌아가기
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)]"
            >
              신청 멘토링 보기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isMentorUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">멘토 계정은 멘토링을 신청할 수 없습니다</h2>
          <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
            단일 역할 정책에 따라 멘토 계정에서는 멘토 페이지를 통한 신청 기능이 제공되지 않습니다.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/mentors/${mentor.id}`}
              className="inline-flex items-center justify-center rounded-md border border-[var(--color-border)] bg-white px-6 py-2.5 text-sm font-medium text-[var(--color-foreground)]"
            >
              멘토 프로필로 돌아가기
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)]"
            >
              멘토링 관리 보기
            </Link>
          </div>
        </div>
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
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-[var(--color-foreground)]">멘토링 신청이 완료되었습니다</h2>
          <p className="mt-4 text-[var(--color-muted-foreground)]">
            <strong>{mentor.name}</strong> 멘토에게 신청이 전달되었습니다. 멘토가 승인하면 신청 멘토링 화면에서 세션 일정을 확인할 수 있습니다.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] shadow-sm transition-colors hover:opacity-90"
            >
              신청 멘토링 보기
            </Link>
            <Link
              href="/mentors"
              className="inline-flex items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-6 py-2.5 text-sm font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-accent)]"
            >
              다른 멘토 보기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center text-sm text-[var(--color-muted-foreground)]">
        <Link href={`/mentors/${mentor.id}`} className="flex items-center transition-colors hover:text-[var(--color-foreground)]">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          {mentor.name} 멘토 프로필로 돌아가기
        </Link>
      </nav>

      <div className="mb-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)]/30 p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">{mentor.name} 멘토에게 신청하기</h1>
        <p className="mt-2 text-[var(--color-muted-foreground)]">
          {mentor.expertise.slice(0, 3).join(', ')} 분야 멘토에게 가능한 시간 안에서 멘토링을 신청할 수 있습니다.
        </p>
        {!user && (
          <p className="mt-3 text-sm font-medium text-red-600">
            로그인하지 않은 상태입니다. 신청 시 로그인 페이지로 이동합니다.
          </p>
        )}
      </div>

      <ApplicationForm mentorId={mentor.id} onSubmit={handleSubmit} isLoading={submitting} availableSlots={availableSlots} />
    </div>
  );
}
