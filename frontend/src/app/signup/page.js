'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ShieldCheck, UserPlus } from 'lucide-react';
import { sendVerificationCode, signUp, verifyEmailCode } from '@/services/authService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
    role: 'MENTEE',
  });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'email' || name === 'verificationCode') {
      setEmailVerified(false);
    }
  };

  const validateEmail = () => {
    if (!EMAIL_REGEX.test(formData.email)) {
      setError('이메일은 example@domain.com 형식으로 입력해 주세요.');
      return false;
    }
    return true;
  };

  const handleSendCode = async () => {
    if (!formData.name.trim()) {
      setError('이름을 먼저 입력해 주세요.');
      return;
    }

    if (!validateEmail()) {
      return;
    }

    setError('');
    setInfo('');
    setSendingCode(true);

    try {
      const response = await sendVerificationCode({
        name: formData.name.trim(),
        email: formData.email.trim(),
      });
      setInfo(response.message);
    } catch (err) {
      setError(err.message || '인증번호 발송에 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!validateEmail()) {
      return;
    }

    if (!formData.verificationCode.trim()) {
      setError('인증 코드를 입력해 주세요.');
      return;
    }

    setError('');
    setInfo('');
    setVerifyingCode(true);

    try {
      const response = await verifyEmailCode({
        email: formData.email.trim(),
        code: formData.verificationCode.trim(),
      });
      setEmailVerified(true);
      setInfo(response.message);
    } catch (err) {
      setEmailVerified(false);
      setError(err.message || '인증번호 확인에 오류가 발생했습니다.');
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!validateEmail()) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (!emailVerified) {
      setError('이메일 인증을 완료해 주세요.');
      return;
    }

    setLoading(true);
    try {
      await signUp({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        verificationCode: formData.verificationCode.trim(),
      });
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
            <UserPlus className="h-6 w-6" />
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold tracking-tight text-[var(--color-foreground)]">회원가입</h1>
        <p className="mt-2 text-center text-sm text-[var(--color-muted-foreground)]">
          이름과 이메일 인증을 완료하면 멘토 또는 멘티로 가입할 수 있습니다.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          {info && (
            <div className="rounded-md bg-[var(--color-accent)] px-4 py-3 text-sm text-[var(--color-accent-foreground)]">
              {info}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-[var(--color-foreground)]">이름</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent py-2 pl-10 pr-3 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                placeholder="실명을 입력해 주세요."
              />
            </div>
          </div>

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
                  placeholder="name@example.com"
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
            <label htmlFor="verificationCode" className="text-sm font-medium text-[var(--color-foreground)]">이메일 인증 코드</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                <input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  required
                  value={formData.verificationCode}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent py-2 pl-10 pr-3 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  placeholder="6자리 인증 코드를 입력해 주세요."
                />
              </div>
              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={verifyingCode}
                className={`inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium ${
                  emailVerified
                    ? 'bg-green-100 text-green-700'
                    : 'border border-[var(--color-border)] bg-white text-[var(--color-foreground)]'
                }`}
              >
                {verifyingCode ? '검증 중' : emailVerified ? '검증 완료' : '인증 확인'}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-[var(--color-foreground)]">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent py-2 pl-10 pr-3 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                placeholder="8자 이상 입력해 주세요."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--color-foreground)]">비밀번호 확인</label>
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
                placeholder="비밀번호를 다시 입력해 주세요."
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-[var(--color-foreground)]">가입할 역할</span>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="MENTEE"
                  checked={formData.role === 'MENTEE'}
                  onChange={handleChange}
                  className="h-4 w-4 border-[var(--color-border)] text-[var(--color-primary)]"
                />
                <span className="text-sm">멘티</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="MENTOR"
                  checked={formData.role === 'MENTOR'}
                  onChange={handleChange}
                  className="h-4 w-4 border-[var(--color-border)] text-[var(--color-primary)]"
                />
                <span className="text-sm">멘토</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {loading ? '가입 처리 중...' : '회원가입'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
          이미 계정이 있나요?{' '}
          <Link href="/login" className="font-medium text-[var(--color-accent-foreground)] underline hover:no-underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
