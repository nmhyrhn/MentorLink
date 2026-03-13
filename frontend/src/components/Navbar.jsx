'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Compass, Menu, X, LogOut, Users, Settings } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { logout } from '@/services/authService';
import useAuthUser from '@/hooks/useAuthUser';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuthUser();

  const navLinks = useMemo(() => {
    const links = [
      { name: '멘토 찾기', href: '/mentors', icon: Compass },
      { name: '신청 멘토링', href: '/dashboard', icon: LayoutDashboard },
    ];
    if (user?.role === 'MENTOR') {
      links.push({ name: '프로필 관리', href: '/dashboard/profile', icon: Settings });
    }
    return links;
  }, [user]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[rgba(255,253,247,0.92)] backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex shrink-0 items-center">
            <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-85">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-sm">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-[var(--color-foreground)]">MentorLink</span>
                <span className="text-[11px] text-[var(--color-muted-foreground)]">백엔드 포트폴리오 프로젝트</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:gap-6">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'flex items-center text-sm font-medium transition-colors',
                    isActive ? 'text-[var(--color-foreground)]' : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}

            {user ? (
              <>
                <span className="text-sm font-medium text-[var(--color-muted-foreground)]">{user.name}님</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-foreground)]"
                >
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)]"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-foreground)] transition-colors hover:brightness-95"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-foreground)] focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">메인 메뉴 열기</span>
              {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-background)] md:hidden">
          <div className="space-y-1 pb-3 pt-2">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'flex items-center px-4 py-3 text-base font-medium transition-colors',
                    isActive
                      ? 'border-l-4 border-[var(--color-primary)] bg-[var(--color-accent)] text-[var(--color-foreground)]'
                      : 'border-l-4 border-transparent text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)]/60 hover:text-[var(--color-foreground)]'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {link.name}
                </Link>
              );
            })}

            <div className="mt-2 px-4">
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-[var(--color-border)] py-2.5 text-sm font-medium text-[var(--color-foreground)]"
                >
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    className="flex-1 rounded-md border border-[var(--color-border)] py-2.5 text-center text-sm font-medium text-[var(--color-foreground)]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="flex-1 rounded-md bg-[var(--color-primary)] py-2.5 text-center text-sm font-medium text-[var(--color-primary-foreground)]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
