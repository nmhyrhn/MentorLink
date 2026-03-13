'use client';

import { useEffect, useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const toLocalDateTimeString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export default function ApplicationForm({ mentorId, onSubmit, isLoading = false, availableSlots = [] }) {
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);

  const groupedSlots = useMemo(() => {
    return availableSlots.reduce((acc, slot) => {
      const dateKey = format(new Date(slot.startAt), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(slot);
      return acc;
    }, {});
  }, [availableSlots]);

  const dateOptions = useMemo(
    () => Object.keys(groupedSlots).sort((left, right) => new Date(left) - new Date(right)),
    [groupedSlots]
  );

  const timeOptions = useMemo(
    () => (selectedDate ? groupedSlots[selectedDate] || [] : []),
    [groupedSlots, selectedDate]
  );

  const selectedSlotData = useMemo(
    () => timeOptions.find((slot) => slot.startAt === selectedTime) || null,
    [selectedTime, timeOptions]
  );

  useEffect(() => {
    if (!dateOptions.length) {
      setSelectedDate('');
      setSelectedTime('');
      return;
    }

    if (!selectedDate || !groupedSlots[selectedDate]) {
      setSelectedDate(dateOptions[0]);
      setSelectedTime(groupedSlots[dateOptions[0]][0]?.startAt || '');
    }
  }, [dateOptions, groupedSlots, selectedDate]);

  useEffect(() => {
    if (!timeOptions.length) {
      setSelectedTime('');
      return;
    }

    if (!selectedTime || !timeOptions.some((slot) => slot.startAt === selectedTime)) {
      setSelectedTime(timeOptions[0].startAt);
    }
  }, [timeOptions, selectedTime]);

  useEffect(() => {
    if (!selectedSlotData) {
      return;
    }

    if (!selectedSlotData.durationOptions.includes(durationMinutes)) {
      setDurationMinutes(selectedSlotData.durationOptions[0]);
    }
  }, [durationMinutes, selectedSlotData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSlotData) {
      return;
    }

    onSubmit({
      mentorId,
      message,
      contact,
      preferredAt: selectedSlotData.startAt,
      preferredEndAt: toLocalDateTimeString(
        new Date(new Date(selectedSlotData.startAt).getTime() + durationMinutes * 60 * 1000)
      ),
      durationMinutes,
    });
  };

  const endPreview = selectedSlotData
    ? new Date(new Date(selectedSlotData.startAt).getTime() + durationMinutes * 60 * 1000)
    : null;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h3 className="text-xl font-semibold tracking-tight text-[var(--color-foreground)]">멘토링 신청</h3>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          가능한 날짜와 시간을 골라 상담 시간을 선택한 뒤 신청해 주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-foreground)]">예약 일정</label>
          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={!dateOptions.length}
              className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-50"
            >
              {!dateOptions.length ? (
                <option value="">예약 가능한 날짜가 없습니다</option>
              ) : (
                dateOptions.map((dateKey) => (
                  <option key={dateKey} value={dateKey}>
                    {format(new Date(dateKey), 'M월 d일 (E)', { locale: ko })}
                  </option>
                ))
              )}
            </select>

            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              disabled={!timeOptions.length}
              className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-50"
            >
              {!timeOptions.length ? (
                <option value="">예약 가능한 시간이 없습니다</option>
              ) : (
                timeOptions.map((slot) => (
                  <option key={slot.startAt} value={slot.startAt}>
                    {format(new Date(slot.startAt), 'a h:mm', { locale: ko })}
                  </option>
                ))
              )}
            </select>

            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              disabled={!selectedSlotData}
              className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-50"
            >
              {(selectedSlotData?.durationOptions || []).map((option) => (
                <option key={option} value={option}>
                  {option}분
                </option>
              ))}
            </select>
          </div>
          {selectedSlotData && endPreview && (
            <p className="text-xs text-[var(--color-muted-foreground)]">
              확정 예정 시간: {format(new Date(selectedSlotData.startAt), 'M월 d일 a h:mm', { locale: ko })} ~{' '}
              {format(endPreview, 'a h:mm', { locale: ko })}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="contact" className="text-sm font-medium text-[var(--color-foreground)]">
            연락받을 이메일 또는 연락처
          </label>
          <input
            id="contact"
            name="contact"
            required
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm placeholder:text-[var(--color-muted-foreground)] focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20"
            placeholder="example@email.com 또는 010-0000-0000"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium text-[var(--color-foreground)]">
            신청 메시지
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm placeholder:text-[var(--color-muted-foreground)] focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20"
            placeholder="받고 싶은 멘토링 내용과 현재 고민을 적어 주세요."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !selectedSlotData}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              제출 중...
            </span>
          ) : (
            <>
              신청하기
              <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
