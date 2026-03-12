'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMentorById } from '@/services/mentorService';
import { ArrowLeft, Briefcase, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function MentorDetailPage({ params }) {
  const unwrappedParams = use(params);
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const data = await getMentorById(unwrappedParams.id);
        setMentor(data);
      } catch (error) {
        console.error('Mentor not found:', error);
        setMentor(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMentor();
  }, [unwrappedParams.id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-muted)] border-t-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!mentor) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex items-center text-sm text-[var(--color-muted-foreground)]">
        <Link href="/mentors" className="flex items-center hover:text-[var(--color-foreground)] transition-colors">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          멘토 목록으로 돌아가기
        </Link>
      </nav>

      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm">
        {/* Header section */}
        <div className="relative h-32 bg-gradient-to-r from-[var(--color-muted)] to-[var(--color-border)] sm:h-48"></div>
        
        <div className="relative px-6 pb-8 sm:px-10">
          <div className="-mt-16 sm:-mt-24 mb-6 flex justify-between items-end">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-[var(--color-background)] bg-[var(--color-accent)] shadow-md sm:h-40 sm:w-40">
              <Image
                src={mentor.avatar}
                alt={mentor.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 128px, 160px"
              />
            </div>
            
            <Link
              href={`/mentors/${mentor.id}/apply`}
              className="mb-2 hidden sm:inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] shadow-sm transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20"
            >
              멘토링 신청하기
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)]">{mentor.name}</h1>
              <div className="mt-2 flex items-center text-[var(--color-muted-foreground)]">
                <Briefcase className="mr-1.5 h-4 w-4" />
                <span className="font-medium text-[var(--color-foreground)]">{mentor.company}</span>
                <span className="mx-2">&bull;</span>
                <span>{mentor.experience} 경력</span>
              </div>
            </div>
            
            {/* Mobile apply button */}
            <Link
              href={`/mentors/${mentor.id}/apply`}
              className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] shadow-sm transition-colors hover:opacity-90 sm:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20"
            >
              멘토링 신청하기
            </Link>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">기술 전문 분야</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {mentor.expertise.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-[var(--color-foreground)]"
                >
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-green-500" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-[var(--color-border)] pt-8">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">멘토 소개</h2>
            <div className="mt-4 prose prose-sm max-w-none text-[var(--color-muted-foreground)] dark:prose-invert">
              <p className="leading-relaxed whitespace-pre-line">{mentor.bio}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
