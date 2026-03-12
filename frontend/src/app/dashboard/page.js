'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { getApplicationsForMentor, updateApplicationStatus } from '@/services/applicationService';
import { getMentors } from '@/services/mentorService';
import { Check, X, User, Mail, Calendar, MessageSquare, UserCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [applications, setApplications] = useState([]);
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Simulating logged in mentor (Alice Johnson, ID: 1)
  const LOGGED_IN_MENTOR_ID = 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mentorData, appsData] = await Promise.all([
          getMentors().then(mentors => mentors.find(m => m.id === LOGGED_IN_MENTOR_ID)),
          getApplicationsForMentor(LOGGED_IN_MENTOR_ID)
        ]);
        setMentor(mentorData);
        setApplications(appsData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const updatedApp = await updateApplicationStatus(id, status);
      setApplications(prev => prev.map(app => (app.id === id ? updatedApp : app)));
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('상태 변경에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-muted)] border-t-[var(--color-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)]">{mentor?.name?.split(' ')[0]}님, 다시 만나서 반가워요!</h1>
        <p className="mt-2 text-[var(--color-muted-foreground)]">현재 들어온 멘토링 요청과 최근 활동 내역이에요.</p>
        <Link
          href="/dashboard/profile"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          <UserCircle className="h-4 w-4" />
          멘토 프로필 등록/수정
        </Link>
      </div>

      <div className="grid gap-6">
        {applications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] p-12 text-center">
            <h3 className="text-lg font-medium text-[var(--color-foreground)]">아직 들어온 신청이 없어요</h3>
            <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">멘티가 멘토링을 신청하면 이곳에 목록으로 표시됩니다.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[var(--color-foreground)] border-b border-[var(--color-border)] pb-2 flex items-center justify-between">
              멘토링 신청 목록
              <span className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-accent-foreground)]">
                대기 중 {applications.filter(a => a.status === 'pending').length}건
              </span>
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {applications.map((app) => (
                <div key={app.id} className="flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm">
                  <div className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/50 px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[var(--color-muted-foreground)]" />
                        <span className="font-semibold text-[var(--color-foreground)]">{app.menteeName}</span>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        app.status === 'pending' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-500 dark:ring-yellow-500/20' :
                        app.status === 'approved' ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20' :
                        'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20'
                      }`}>
                        {app.status === 'pending'
                          ? '대기 중'
                          : app.status === 'approved'
                          ? '승인됨'
                          : '거절됨'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
                      <Mail className="h-3.5 w-3.5" />
                      {app.menteeEmail}
                    </div>
                  </div>

                  <div className="flex-1 p-5">
                    <div className="flex items-start gap-2 mb-2">
                      <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-muted-foreground)]" />
                      <p className="text-sm text-[var(--color-foreground)] line-clamp-4">{app.message}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
                      <Calendar className="h-3.5 w-3.5" />
                      신청일 {format(new Date(app.date), 'yyyy년 M월 d일')}
                    </div>
                  </div>

                  {app.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-px bg-[var(--color-border)]">
                      <button
                        onClick={() => handleStatusUpdate(app.id, 'rejected')}
                        className="flex items-center justify-center gap-2 bg-[var(--color-background)] py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700"
                      >
                        <X className="h-4 w-4" /> 거절
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(app.id, 'approved')}
                        className="flex items-center justify-center gap-2 bg-[var(--color-background)] py-3 text-sm font-medium text-green-600 transition-colors hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-700"
                      >
                        <Check className="h-4 w-4" /> 승인
                      </button>
                    </div>
                  )}
                  {app.status === 'approved' && (
                    <div className="bg-[var(--color-background)] py-3 text-center border-t border-[var(--color-border)] text-sm text-[var(--color-muted-foreground)]">
                      세션이 자동으로 일정에 등록되었습니다.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
