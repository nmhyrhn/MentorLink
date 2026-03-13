'use client';

import { useEffect, useState } from 'react';
import MentorCard from '@/components/MentorCard';
import { getMentors } from '@/services/mentorService';
import { Search } from 'lucide-react';

export default function MentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const data = await getMentors();
        setMentors(data);
      } catch (error) {
        console.error('Failed to load mentors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter(
    (mentor) =>
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.expertise.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      mentor.field.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-[var(--color-foreground)] sm:text-3xl sm:tracking-tight">
            멘토 찾기
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            주니어부터 시니어까지, 다양한 직무의 멘토에게 멘토링을 신청해보세요.
          </p>
        </div>

        <div className="mt-4 flex md:ml-4 md:mt-0">
          <div className="relative w-full max-w-xs sm:w-80">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-[var(--color-muted-foreground)]" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-0 bg-[var(--color-background)] py-2 pl-10 pr-3 text-[var(--color-foreground)] ring-1 ring-inset ring-[var(--color-border)] placeholder:text-[var(--color-muted-foreground)] focus:ring-2 focus:ring-inset focus:ring-[var(--color-primary)] sm:text-sm"
              placeholder="이름 또는 전문 분야로 검색해보세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-muted)] border-t-[var(--color-primary)]"></div>
        </div>
      ) : filteredMentors.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMentors.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] p-12 text-center">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            검색 조건에 맞는 멘토를 찾지 못했습니다. 다른 키워드로 다시 검색해보세요.
          </p>
        </div>
      )}
    </div>
  );
}
