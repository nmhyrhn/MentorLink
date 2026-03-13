'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, LayoutDashboard, Calendar, Compass, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: '멘토 탐색', href: '/mentors', icon: Compass },
    { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
    { name: '세션', href: '/sessions', icon: Calendar },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex shrink-0 items-center">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-black">
                MentorLink
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:gap-6">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'flex items-center text-sm font-medium transition-colors hover:text-black',
                    isActive ? 'text-black' : 'text-gray-700'
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90"
            >
              회원가입
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-[var(--color-accent)] hover:text-black focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">메인 메뉴 열기</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-white">
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
                      ? 'bg-[var(--color-accent)] text-black border-l-4 border-[var(--color-primary)]'
                      : 'text-gray-700 hover:bg-[var(--color-accent)]/50 hover:text-black border-l-4 border-transparent'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {link.name}
                </Link>
              );
            })}
            <div className="mt-2 flex gap-2 px-4">
              <Link
                href="/login"
                className="flex-1 rounded-md border border-[var(--color-border)] py-2.5 text-center text-sm font-medium text-black"
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
          </div>
        </div>
      )}
    </nav>
  );
}
