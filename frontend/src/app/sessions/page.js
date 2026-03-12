'use client';

import { useEffect, useState } from 'react';
import { getSessions } from '@/services/applicationService';
import SessionCard from '@/components/SessionCard';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await getSessions();
        setSessions(data);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-muted)] border-t-[var(--color-primary)]"></div>
      </div>
    );
  }

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');
  const pastSessions = sessions.filter(s => s.status === 'completed');

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-[var(--color-border)] pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)]">내 멘토링 세션</h1>
        <p className="mt-2 text-[var(--color-muted-foreground)]">다가오는 세션과 지난 멘토링 세션들을 한눈에 관리하세요.</p>
      </div>

      <div className="space-y-12">
        {/* Upcoming Sessions */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--color-foreground)]">예정된 세션</h2>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400">
              예약됨 {upcomingSessions.length}건
            </span>
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] p-12 text-center">
              <p className="text-sm text-[var(--color-muted-foreground)]">예정된 멘토링 세션이 아직 없습니다.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingSessions.map(session => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </section>

        {/* Past Sessions */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--color-foreground)]">지난 세션</h2>
            <span className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-muted-foreground)]">
              완료됨 {pastSessions.length}건
            </span>
          </div>

          {pastSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]/30 p-12 text-center">
              <p className="text-sm text-[var(--color-muted-foreground)]">아직 완료된 멘토링 세션이 없습니다.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 opacity-90 transition-opacity hover:opacity-100">
              {pastSessions.map(session => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
