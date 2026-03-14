import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, User, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SessionCard({ session, currentUserId, onComplete }) {
  const startDate = new Date(session.sessionDate);
  const endDate = new Date(session.sessionEndAt);
  const isCompleted = session.status === 'completed';
  const isMentorParticipant = currentUserId === session.mentorUserId;
  const counterpartName = isMentorParticipant ? session.menteeName : session.mentorName;
  const counterpartLabel = isMentorParticipant ? '멘티' : '멘토';

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] transition-shadow hover:shadow-sm">
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-muted)] px-5 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-background)] shadow-sm">
          <Calendar className="h-5 w-5 text-[var(--color-primary)]" />
        </div>
        <div>
          <h4 className="font-semibold text-[var(--color-foreground)]">{format(startDate, 'yyyy년 M월 d일', { locale: ko })}</h4>
          <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
            <Clock className="mr-1 h-3.5 w-3.5" />
            <span>
              {format(startDate, 'a h:mm', { locale: ko })} ~ {format(endDate, 'a h:mm', { locale: ko })}
            </span>
          </div>
        </div>
        {isCompleted && (
          <div className="ml-auto">
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              완료
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 p-5">
        <div className="flex items-start gap-4">
          <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)]">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-[var(--color-foreground)]">{counterpartName}</p>
            <p className="text-sm text-[var(--color-muted-foreground)]">{counterpartLabel}</p>
            {isMentorParticipant && session.menteeContact && (
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">연락처: {session.menteeContact}</p>
            )}
            <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">상담 시간 {session.durationMinutes}분</p>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-muted)]/50 px-5 py-3">
        {!isCompleted ? (
          <button
            type="button"
            onClick={() => onComplete?.(session.id)}
            className="inline-flex w-full items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-accent)]"
          >
            세션 완료 처리
          </button>
        ) : session.reviewSubmitted || isMentorParticipant ? (
          <div className="text-center text-sm text-[var(--color-muted-foreground)]">
            {session.reviewSubmitted ? '후기 작성 완료' : '멘티 후기 작성 대기 중'}
          </div>
        ) : (
          <Link
            href={`/sessions/${session.id}/review`}
            className="inline-flex w-full items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-accent)]"
          >
            후기 작성하기
          </Link>
        )}
      </div>
    </div>
  );
}
