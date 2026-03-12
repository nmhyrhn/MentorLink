import Link from 'next/link';
import { ArrowRight, Zap, Target, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full flex-1 flex flex-col items-center justify-center px-4 py-24 md:py-32 lg:py-40 text-center bg-gradient-to-b from-[var(--color-accent)] via-[var(--color-background)] to-transparent">
        <div className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1 text-sm font-medium mb-8 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
          신규 멘토 신청을 받고 있어요
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--color-foreground)] max-w-4xl mb-6">
          나에게 딱 맞는 멘토와 함께
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-orange-400"> 커리어를 성장시키세요</span>
        </h1>
        
        <p className="text-lg md:text-xl text-[var(--color-muted-foreground)] max-w-2xl mb-10">
          실제 현업에서 일하고 있는 전문가 멘토와 연결되어 1:1 코칭, 이력서 첨삭, 면접 대비 등 맞춤형 멘토링을 받아보세요.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/mentors" 
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--color-primary)] px-8 text-sm font-medium text-[var(--color-primary-foreground)] shadow-md transition-all hover:opacity-90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30"
          >
            멘토 찾기
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link 
            href="/dashboard" 
            className="inline-flex h-12 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-8 text-sm font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-accent)] hover:border-[var(--color-primary)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20"
          >
            나는 멘토예요
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Target,
              title: '목표에 맞춘 멘토링',
              description: 'React, Spring Boot, 시스템 디자인 등 원하는 기술 스택과 목표에 딱 맞는 멘토를 매칭해 드려요.'
            },
            {
              icon: Zap,
              title: '빠른 매칭',
              description: '간단한 신청만으로 24시간 이내에 멘토와 연결될 수 있도록 도와줘요.'
            },
            {
              icon: Users,
              title: '1:1 멘토링 세션',
              description: '일정에 맞춰 고품질 화상 멘토링 세션을 예약하고 깊이 있는 피드백을 받아보세요.'
            }
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm hover:shadow-md hover:border-[var(--color-primary)]/20 transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent)] mb-4 text-[var(--color-primary)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-[var(--color-muted-foreground)] leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
