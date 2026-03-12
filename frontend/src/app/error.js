'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4 mb-6">
        <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)] sm:text-3xl">
        문제가 발생했습니다
      </h1>
      <p className="mt-2 text-[var(--color-muted-foreground)]">
        일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          다시 시도
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-6 py-2.5 text-sm font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-accent)]"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
