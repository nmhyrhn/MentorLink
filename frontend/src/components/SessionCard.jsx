import { format } from 'date-fns';
import { Calendar, User, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SessionCard({ session }) {
  const sessionDate = new Date(session.sessionDate);
  const isCompleted = session.status === 'completed';

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] transition-shadow hover:shadow-sm">
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-muted)] px-5 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-background)] shadow-sm">
          <Calendar className="h-5 w-5 text-[var(--color-primary)]" />
        </div>
        <div>
          <h4 className="font-semibold text-[var(--color-foreground)]">
            {format(sessionDate, 'MMMM d, yyyy')}
          </h4>
          <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
            <Clock className="mr-1 h-3.5 w-3.5" />
            <span>{format(sessionDate, 'h:mm a')}</span>
          </div>
        </div>
        {isCompleted && (
          <div className="ml-auto">
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              완료됨
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
            <p className="font-medium text-[var(--color-foreground)]">{session.menteeName}</p>
            <p className="text-sm text-[var(--color-muted-foreground)]">{session.menteeEmail}</p>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-muted)]/50 px-5 py-3">
        {isCompleted && !session.review ? (
          <Link
            href={`/sessions/${session.id}/review`}
            className="inline-flex w-full items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-foreground)]"
          >
            후기 작성하기
          </Link>
        ) : session.review ? (
          <div className="text-sm text-[var(--color-muted-foreground)] flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            후기 제출 완료 ({session.review.rating}/5)
          </div>
        ) : (
          <div className="text-sm text-[var(--color-muted-foreground)] flex items-center justify-center py-2">
            상태: 예약됨
          </div>
        )}
      </div>
    </div>
  );
}
