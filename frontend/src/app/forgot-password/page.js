'use client';

import { useState } from 'react';
import Link from 'next/link';
import { KeyRound, Lock, Mail, ShieldCheck } from 'lucide-react';
import { confirmPasswordReset, requestPasswordReset } from '@/services/authService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = () => {
    if (!EMAIL_REGEX.test(formData.email)) {
      setError('이메일은 example@domain.com 형식으로 입력해 주세요.');
      return false;
    }
    return true;
  };

  const handleSendCode = async () => {
    setError('');
    setInfo('');
    setCompleted(false);

    if (!validateEmail()) {
      return;
    }

    setSendingCode(true);
    try {
      const response = await requestPasswordReset({ email: formData.email.trim() });
      const nextInfo = response.debugCode
        ? `${response.message} 로컬 테스트용 재설정 코드: ${response.debugCode}`
        : response.message;
      setInfo(nextInfo);
    } catch (err) {
      setError(err.message || '재설정 코드 발송에 실패했습니다.');
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setCompleted(false);

    if (!validateEmail()) {
      return;
    }

    if (!formData.code.trim()) {
      setError('이메일로 받은 재설정 코드를 입력해 주세요.');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setResetting(true);
    try {
      const response = await confirmPasswordReset({
        email: formData.email.trim(),
        code: formData.code.trim(),
        newPassword: formData.newPassword,
      });
      setCompleted(true);
      setInfo(response.message);
      setFormData((prev) => ({
        ...prev,
        code: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      setError(err.message || '비밀번호 재설정에 실패했습니다.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
            <KeyRound className="h-6 w-6" />
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold tracking-tight text-[var(--color-foreground)]">비밀번호 재설정</h1>
        <p className="mt-2 text-center text-sm text-[var(--color-muted-foreground)]">
          이메일로 계정을 확인한 뒤 재설정 코드를 입력해 새 비밀번호를 설정할 수 있습니다.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          {info && (
            <div className={`rounded-md px-4 py-3 text-sm ${completed ? 'bg-green-50 text-green-700' : 'bg-[var(--color-accent)] text-[var(--color-accent-foreground)]'}`}>
              {info}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-[var(--color-foreground)]">이메일</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent py-2 pl-10 pr-3 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  placeholder="가입한 이메일을 입력해 주세요."
                />
              </div>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sendingCode}
                className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--color-border)] bg-white px-4 text-sm font-medium text-[var(--color-foreground)]"
              >
                {sendingCode ? '발송 중' : '코드 발송'}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium text-[var(--color-foreground)]">재설정 코드</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
              <input
                id="code"
                name="code"
                type="text"
                required
                value={formData.code}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent py-2 pl-10 pr-3 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                placeholder="이메일로 받은 6자리 코드를 입력해 주세요."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium text-[var(--color-foreground)]">새 비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={formData.newPassword}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent py-2 pl-10 pr-3 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                placeholder="8자 이상 입력해 주세요."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--color-foreground)]">새 비밀번호 확인</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent py-2 pl-10 pr-3 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                placeholder="새 비밀번호를 다시 입력해 주세요."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={resetting}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {resetting ? '재설정 중...' : '비밀번호 재설정'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
          로그인 화면으로 돌아가시겠어요?{' '}
          <Link href="/login" className="font-medium text-[var(--color-accent-foreground)] underline hover:no-underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
