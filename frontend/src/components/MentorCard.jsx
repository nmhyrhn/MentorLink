import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Briefcase, Star } from 'lucide-react';

export default function MentorCard({ mentor }) {
  const expertise = Array.isArray(mentor.expertise) ? mentor.expertise : [];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] transition-all hover:border-[var(--color-muted-foreground)]/30 hover:shadow-sm">
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-full bg-[var(--color-accent)]">
              <Image
                src={mentor.avatar || '/default-mentor.svg'}
                alt={mentor.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-foreground)]">{mentor.name}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-[var(--color-muted-foreground)]">
                <span className="flex items-center">
                  <Briefcase className="mr-1.5 h-3.5 w-3.5" />
                  {mentor.field} · {mentor.experience}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 flex-1 line-clamp-3 text-sm text-[var(--color-muted-foreground)]">
          {mentor.bio || ''}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {expertise.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center rounded-md bg-[var(--color-accent)] px-2.5 py-1 text-xs font-medium text-[var(--color-accent-foreground)]"
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
          <Star className="h-4 w-4 text-amber-500" />
          <span>{mentor.averageRating ? mentor.averageRating.toFixed(1) : '신규 멘토'}</span>
          <span>· 후기 {mentor.reviewCount}개</span>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] bg-[var(--color-muted)] px-6 py-4 transition-colors group-hover:bg-[var(--color-accent)]/50">
        <Link
          href={`/mentors/${mentor.id}`}
          className="flex w-full items-center justify-between text-sm font-medium text-[var(--color-foreground)]"
        >
          멘토 프로필 보기
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
