'use client';

import { useState } from 'react';
import { Star, Send } from 'lucide-react';

export default function ReviewForm({ onSubmit, isLoading = false }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      return;
    }
    onSubmit({ rating, comment });
  };

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h3 className="text-xl font-semibold leading-none tracking-tight text-[var(--color-foreground)]">멘토링 세션 후기 작성</h3>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          세션에서 받은 도움과 좋았던 점을 남기면 다른 사용자도 멘토를 선택하는 데 참고할 수 있습니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium leading-none text-[var(--color-foreground)]">
            전체 만족도 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    (hoverRating || rating) >= star
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-[var(--color-muted-foreground)]/30'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating === 0 && (
            <p className="text-xs text-[var(--color-muted-foreground)]">별점을 하나 이상 선택해 주세요.</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="comment" className="text-sm font-medium leading-none text-[var(--color-foreground)]">
            추가 코멘트
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm placeholder:text-[var(--color-muted-foreground)] focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20"
            placeholder="멘토링에서 가장 도움이 되었던 점을 자유롭게 작성해 주세요."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || rating === 0}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20 disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              제출 중...
            </span>
          ) : (
            <>
              후기 제출
              <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
