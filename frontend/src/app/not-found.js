import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export const metadata = {
  title: '페이지를 찾을 수 없습니다 | MentorLink',
  description: '요청하신 페이지를 찾을 수 없습니다.',
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-[var(--color-accent)] p-4 mb-6">
        <Search className="h-12 w-12 text-[var(--color-foreground)]" aria-hidden="true" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
        404
      </h1>
      <p className="mt-2 text-lg text-[var(--color-muted-foreground)]">
        요청하신 페이지를 찾을 수 없습니다.
      </p>
      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
        주소가 잘못되었거나 페이지가 삭제·이동되었을 수 있습니다.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90"
        >
          <Home className="mr-2 h-4 w-4" />
          홈으로 돌아가기
        </Link>
        <Link
          href="/mentors"
          className="inline-flex items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-6 py-2.5 text-sm font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-accent)]"
        >
          멘토 탐색
        </Link>
      </div>
    </div>
  );
}
