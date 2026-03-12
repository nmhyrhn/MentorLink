'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

export default function ApplicationForm({ mentorId, onSubmit, isLoading = false }) {
  const [formData, setFormData] = useState({
    menteeName: '',
    menteeEmail: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, mentorId });
  };

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h3 className="text-xl font-semibold leading-none tracking-tight text-[var(--color-foreground)]">멘토링 신청서</h3>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          아래 내용을 작성하면 멘토와 연결됩니다. 멘토에게 어떤 목표를 가지고 있는지 구체적으로 알려주세요.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="menteeName" className="text-sm font-medium leading-none text-[var(--color-foreground)]">
              이름
            </label>
            <input
              id="menteeName"
              name="menteeName"
              required
              value={formData.menteeName}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm ring-offset-[var(--color-background)] placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20 focus-visible:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="홍길동"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="menteeEmail" className="text-sm font-medium leading-none text-[var(--color-foreground)]">
              이메일 주소
            </label>
            <input
              id="menteeEmail"
              name="menteeEmail"
              type="email"
              required
              value={formData.menteeEmail}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm ring-offset-[var(--color-background)] placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20 focus-visible:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="example@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium leading-none text-[var(--color-foreground)]">
            멘토링을 받고 싶은 이유
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            value={formData.message}
            onChange={handleChange}
            className="flex w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm ring-offset-[var(--color-background)] placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20 focus-visible:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="예: 백엔드 개발자로 전향하기 위한 커리어 전략이 궁금합니다."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20 disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              전송 중...
            </span>
          ) : (
            <>
              신청서 제출
              <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
