'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMentorById } from '@/services/mentorService';
import { getCurrentUser, hasMentorRole } from '@/services/authService';
import { ArrowLeft, Briefcase, CheckCircle2, Clock, Star } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function MentorDetailPage({ params }) {
  const unwrappedParams = use(params);
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
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

  const isSelfMentor = currentUser && currentUser.userId === mentor.userId;
  const canApply = !isSelfMentor && !hasMentorRole(currentUser);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-8 flex items-center text-sm text-[var(--color-muted-foreground)]">
        <Link href="/mentors" className="flex items-center transition-colors hover:text-[var(--color-foreground)]">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          멘토 목록으로 돌아가기
        </Link>
      </nav>

      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm">
        <div className="relative h-32 bg-gradient-to-r from-[var(--color-muted)] to-[var(--color-border)] sm:h-48"></div>

        <div className="relative px-6 pb-8 sm:px-10">
          <div className="-mt-16 mb-6 flex items-end justify-between sm:-mt-24">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-[var(--color-background)] bg-[var(--color-accent)] shadow-md sm:h-40 sm:w-40">
              <Image src={mentor.avatar} alt={mentor.name} fill className="object-cover" sizes="(max-width: 768px) 128px, 160px" />
            </div>

            {canApply && (
              <Link
                href={`/mentors/${mentor.id}/apply`}
                className="mb-2 hidden items-center justify-center rounded-md bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] shadow-sm transition-colors hover:opacity-90 sm:inline-flex"
              >
                멘토링 신청하기
              </Link>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)]">{mentor.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[var(--color-muted-foreground)]">
                <span className="flex items-center">
                  <Briefcase className="mr-1.5 h-4 w-4" />
                  <span className="font-medium text-[var(--color-foreground)]">{mentor.field}</span>
                  <span className="mx-1">·</span>
                  <span>{mentor.experience} 경력</span>
                </span>
                <span className="inline-flex items-center rounded-md bg-[var(--color-accent)] px-2.5 py-1 text-sm font-medium text-[var(--color-accent-foreground)]">
                  <Star className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                  {mentor.averageRating ? mentor.averageRating.toFixed(1) : '신규'} · 리뷰 {mentor.reviewCount}개
                </span>
              </div>
            </div>

            {canApply && (
              <Link
                href={`/mentors/${mentor.id}/apply`}
                className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] shadow-sm transition-colors hover:opacity-90 sm:hidden"
              >
                멘토링 신청하기
              </Link>
            )}
            {!canApply && !isSelfMentor && currentUser && (
              <p className="mt-6 text-sm font-medium text-[var(--color-primary)]">
                멘토 계정은 멘토 페이지를 통해 멘토링을 신청할 수 없습니다. 멘토링 신청은 멘티 계정에서만 가능합니다.
              </p>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">기술 전문 분야</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {mentor.expertise.map((skill) => (
                <span key={skill} className="inline-flex items-center rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-[var(--color-foreground)]">
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-green-500" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-[var(--color-border)] pt-8">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">멘토 소개</h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-[var(--color-muted-foreground)]">{mentor.bio}</p>
          </div>

          <div className="mt-8 border-t border-[var(--color-border)] pt-8">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">예약 가능 요일</h2>
            {mentor.availabilityRules.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--color-muted-foreground)]">등록된 예약 가능 시간이 없습니다.</p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {mentor.availabilityRules.map((rule) => (
                  <span key={`${rule.dayOfWeek}-${rule.startTime}`} className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm text-[var(--color-foreground)]">
                    <Clock className="mr-1.5 h-3.5 w-3.5 text-[var(--color-primary)]" />
                    {rule.label}요일 {rule.startTime.slice(0, 5)} ~ {rule.endTime.slice(0, 5)}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-[var(--color-border)] pt-8">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">리뷰</h2>
            {mentor.reviews.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--color-muted-foreground)]">아직 등록된 리뷰가 없습니다.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {mentor.reviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-[var(--color-border)] bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[var(--color-foreground)]">{review.reviewerName}</p>
                        <p className="text-xs text-[var(--color-muted-foreground)]">
                          {format(new Date(review.createdAt), 'yyyy.MM.dd', { locale: ko })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-semibold">{review.rating}</span>
                      </div>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[var(--color-muted-foreground)]">
                      {review.comment || '리뷰 코멘트가 없습니다.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
