'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, Check, Mail, MessageSquare, User, X } from 'lucide-react';
import {
  completeSession,
  getApplicationsForMentor,
  getMySentApplications,
  getSessions,
  updateApplicationStatus,
} from '@/services/applicationService';
import { getCurrentUser, hasMentorRole } from '@/services/authService';
import SessionCard from '@/components/SessionCard';

const formatRange = (startAt, endAt) => {
  if (!startAt) {
    return '-';
  }
  const start = new Date(startAt);
  if (!endAt) {
    return format(start, 'yyyy.MM.dd a h:mm', { locale: ko });
  }
  return `${format(start, 'yyyy.MM.dd a h:mm', { locale: ko })} ~ ${format(new Date(endAt), 'a h:mm', { locale: ko })}`;
};

const statusLabel = {
  pending: '대기 중',
  approved: '승인됨',
  rejected: '거절됨',
  completed: '완료',
  cancelled: '자동 취소',
};

const COMPLETED_SESSIONS_PER_PAGE = 10;

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [sentApplications, setSentApplications] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [completedPage, setCompletedPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.replace('/login');
      return;
    }

    setUser(currentUser);

    const fetchData = async () => {
      try {
        const [sessionData, sentData] = await Promise.all([
          getSessions(),
          hasMentorRole(currentUser) ? Promise.resolve([]) : getMySentApplications(),
        ]);
        setSessions(sessionData);
        setSentApplications(sentData);

        if (hasMentorRole(currentUser)) {
          const appsData = await getApplicationsForMentor();
          setApplications(appsData);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateApplicationStatus(id, status);
      if (status === 'approved') {
        setApplications((prev) => prev.filter((app) => app.id !== id));
        const sessionsData = await getSessions();
        setSessions(sessionsData);
      } else {
        setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, status: 'rejected' } : app)));
      }
    } catch (error) {
      alert(error.message || '상태 변경에 실패했습니다.');
    }
  };

  const handleCompleteSession = async (sessionId) => {
    try {
      const updated = await completeSession(sessionId);
      setSessions((prev) => prev.map((session) => (session.id === sessionId ? updated : session)));
    } catch (error) {
      alert(error.message || '세션 완료 처리에 실패했습니다.');
    }
  };

  const upcomingSessions = sessions.filter((session) => session.status === 'scheduled');
  const completedSessions = sessions.filter((session) => session.status === 'completed');
  const visibleSentApplications = sentApplications.filter((application) => application.status !== 'completed');
  const completedPageCount = Math.max(1, Math.ceil(completedSessions.length / COMPLETED_SESSIONS_PER_PAGE));
  const paginatedCompletedSessions = completedSessions.slice(
    (completedPage - 1) * COMPLETED_SESSIONS_PER_PAGE,
    completedPage * COMPLETED_SESSIONS_PER_PAGE
  );

  useEffect(() => {
    setCompletedPage((prev) => Math.min(prev, completedPageCount));
  }, [completedPageCount]);

  if (loading || !user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-muted)] border-t-[var(--color-primary)]"></div>
      </div>
    );
  }

  const mentorMode = hasMentorRole(user);

  const SectionHeader = ({ title, count }) => (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-[var(--color-foreground)]">{title}</h2>
      <span className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-accent-foreground)]">
        {count}건
      </span>
    </div>
  );

  const EmptyState = ({ message }) => (
    <div className="rounded-xl border border-dashed border-[var(--color-border)] p-12 text-center text-sm text-[var(--color-muted-foreground)]">
      {message}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)]">
          {mentorMode ? '신청 멘토링 관리' : '신청 멘토링'}
        </h1>
        <p className="mt-2 text-[var(--color-muted-foreground)]">
          {mentorMode
            ? `${user.name}님에게 들어온 신청과 예정된 세션을 한 화면에서 관리할 수 있습니다. 멘토 계정에서는 멘토링 신청 기능이 노출되지 않습니다.`
            : `${user.name}님의 멘토링 신청 현황과 예정된 세션을 확인할 수 있습니다.`}
        </p>
      </div>

      <div className="space-y-12">
        {!mentorMode && (
          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)]/50 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-foreground)]">멘토로 전향하기</h2>
                <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                  멘티 계정 그대로 멘토 프로필을 만들면 바로 멘토링을 받을 수 있습니다.
                </p>
              </div>
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-foreground)] transition-colors hover:brightness-95"
              >
                멘토 프로필 만들기
              </Link>
            </div>
          </section>
        )}

        {mentorMode && (
          <section>
            {(() => {
              const pendingApplications = applications.filter((app) => app.status === 'pending');
              return (
                <>
                  <SectionHeader title="들어온 신청" count={pendingApplications.length} />
                  {pendingApplications.length === 0 ? (
                    <EmptyState message="아직 대기 중인 신청이 없습니다." />
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {pendingApplications.map((app) => (
                  <div key={app.id} className="flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-sm">
                    <div className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/50 px-5 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-[var(--color-muted-foreground)]" />
                          <span className="font-semibold text-[var(--color-foreground)]">{app.menteeName}</span>
                        </div>
                        <span className="rounded-full bg-[var(--color-accent)] px-2 py-1 text-xs font-medium text-[var(--color-accent-foreground)]">
                          {statusLabel[app.status] || app.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3 p-5 text-sm">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-muted-foreground)]" />
                        <p className="text-[var(--color-foreground)]">{app.message}</p>
                      </div>
                      <div className="flex items-center gap-2 text-[var(--color-muted-foreground)]">
                        <Calendar className="h-4 w-4" />
                        신청일 {format(new Date(app.date), 'yyyy.MM.dd a h:mm', { locale: ko })}
                      </div>
                      <div className="flex items-center gap-2 text-[var(--color-muted-foreground)]">
                        <Calendar className="h-4 w-4" />
                        희망 시간 {formatRange(app.preferredAt, app.preferredEndAt)}
                      </div>
                      <div className="flex items-center gap-2 text-[var(--color-muted-foreground)]">
                        <Mail className="h-4 w-4" />
                        {app.contact}
                      </div>
                      {app.rejectedReason && (
                        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{app.rejectedReason}</p>
                      )}
                    </div>

                    {app.status === 'pending' && (
                      <div className="grid grid-cols-2 gap-px bg-[var(--color-border)]">
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'rejected')}
                          className="flex items-center justify-center gap-2 bg-[var(--color-background)] py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                          거절
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'approved')}
                          className="flex items-center justify-center gap-2 bg-[var(--color-background)] py-3 text-sm font-medium text-green-700 transition-colors hover:bg-green-50"
                        >
                          <Check className="h-4 w-4" />
                          승인
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
                  )}
                </>
              );
            })()}
          </section>
        )}

        <section>
          <SectionHeader title="예정된 세션" count={upcomingSessions.length} />
          {upcomingSessions.length === 0 ? (
            <EmptyState message="예정된 세션이 없습니다." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingSessions.map((session) => (
                <SessionCard key={session.id} session={session} currentUserId={user.userId} onComplete={handleCompleteSession} />
              ))}
            </div>
          )}
        </section>

        {!mentorMode && (
          <section>
            <SectionHeader title="신청한 멘토링" count={visibleSentApplications.length} />
            {visibleSentApplications.length === 0 ? (
              <EmptyState message="아직 신청한 멘토링이 없습니다." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleSentApplications.map((app) => (
                  <div key={app.id} className="rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[var(--color-foreground)]">{app.mentorName}</h3>
                      <span className="rounded-full bg-[var(--color-accent)] px-2 py-1 text-xs font-medium text-[var(--color-accent-foreground)]">
                        {statusLabel[app.status] || app.status}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm text-[var(--color-muted-foreground)]">{app.message}</p>
                    <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">희망 시간: {formatRange(app.preferredAt, app.preferredEndAt)}</p>
                    {app.sessionDate && (
                      <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">확정 세션: {formatRange(app.sessionDate, app.sessionEndAt)}</p>
                    )}
                    <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">연락처: {app.contact}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section>
          <SectionHeader title="완료된 세션" count={completedSessions.length} />
          {completedSessions.length === 0 ? (
            <EmptyState message="완료된 세션이 없습니다." />
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedCompletedSessions.map((session) => (
                  <SessionCard key={session.id} session={session} currentUserId={user.userId} onComplete={handleCompleteSession} />
                ))}
              </div>

              {completedPageCount > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCompletedPage((prev) => Math.max(prev - 1, 1))}
                    disabled={completedPage === 1}
                    className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-foreground)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    이전
                  </button>
                  {Array.from({ length: completedPageCount }, (_, index) => index + 1).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setCompletedPage(pageNumber)}
                      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        completedPage === pageNumber
                          ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                          : 'border border-[var(--color-border)] text-[var(--color-foreground)]'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCompletedPage((prev) => Math.min(prev + 1, completedPageCount))}
                    disabled={completedPage === completedPageCount}
                    className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-foreground)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    다음
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
