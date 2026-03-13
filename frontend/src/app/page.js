'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Target, Users } from 'lucide-react';

const rotatingWords = ['신청', '승인', '세션', '리뷰'];

export default function Home() {
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 1800);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <section className="relative flex w-full flex-1 flex-col items-center justify-center overflow-hidden px-4 py-24 text-center md:py-32 lg:py-40">
        <div className="animate-[float_5s_ease-in-out_infinite] absolute left-[12%] top-20 hidden rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-[var(--color-muted-foreground)] shadow-sm md:block">
          Java + Spring Boot + JPA
        </div>
        <div className="animate-[float_6s_ease-in-out_infinite] absolute right-[12%] top-32 hidden rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-[var(--color-muted-foreground)] shadow-sm md:block">
          AWS EC2 + Docker + Nginx
        </div>

        <div className="mb-8 inline-flex items-center rounded-full border border-[var(--color-border)] bg-white px-4 py-1.5 text-sm font-medium text-[var(--color-foreground)] shadow-sm">
          <span className="mr-2 h-2 w-2 rounded-full bg-[var(--color-primary)]" />
          실제 서비스 워크플로우를 담은 백엔드 포트폴리오
        </div>

        <h1 className="mb-6 max-w-4xl text-4xl font-bold tracking-tight text-[var(--color-foreground)] md:text-6xl lg:text-7xl">
          백엔드 역량을 보여주는
          <span className="block text-[#b8860b]">멘토-멘티 매칭 플랫폼</span>
        </h1>

        <p className="mb-4 max-w-2xl text-lg leading-8 text-[var(--color-muted-foreground)] md:text-xl">
          MentorLink는 멘토 등록부터 멘토링 {rotatingWords[activeWordIndex]}까지 이어지는 흐름을 통해
          트랜잭션과 API 설계 역량을 보여주기 위한 프로젝트입니다.
        </p>

        <div className="mb-10 inline-flex items-center rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-foreground)]">
          현재 강조 중인 단계: {rotatingWords[activeWordIndex]}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/mentors"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--color-primary)] px-8 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-md transition-all hover:brightness-95"
          >
            멘토 둘러보기
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Target,
              title: 'Application 중심 설계',
              description: '신청 상태를 중심으로 승인, 세션 생성, 리뷰 작성까지 상태 전이를 명확하게 관리합니다.',
            },
            {
              icon: Zap,
              title: 'REST API와 트랜잭션',
              description: 'Spring Boot 기반 REST API와 승인 후 세션 자동 생성 트랜잭션을 구현해 실무형 흐름을 담았습니다.',
            },
            {
              icon: Users,
              title: '배포 가능한 구조',
              description: 'Next.js, Nginx, Spring Boot, MySQL을 Docker로 묶어 배포 직전 구조까지 확인할 수 있습니다.',
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="rounded-2xl border border-[var(--color-border)] bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-foreground)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[var(--color-foreground)]">{feature.title}</h3>
                <p className="leading-7 text-[var(--color-muted-foreground)]">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
