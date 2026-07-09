"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Subscription } from "@/lib/types";

/** "2026-07" 라벨의 월. */
function ym(date: string): string {
  return date.slice(0, 7);
}

interface DayCell {
  day: number | null;
  dateStr: string | null;
}

/** 특정 연-월의 달력 셀(앞쪽 공백 포함)을 만든다. */
function buildMonth(year: number, month0: number): DayCell[] {
  const firstDow = new Date(Date.UTC(year, month0, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
  const cells: DayCell[] = [];
  for (let i = 0; i < firstDow; i++) cells.push({ day: null, dateStr: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month0 + 1).padStart(2, "0")}-${String(
      d
    ).padStart(2, "0")}`;
    cells.push({ day: d, dateStr });
  }
  return cells;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function CalendarView({
  subscriptions,
  today,
}: {
  subscriptions: Subscription[];
  today: string;
}) {
  // 접수 시작일이 있는 공고들의 월 목록.
  const months = useMemo(() => {
    const set = new Set<string>();
    for (const s of subscriptions) {
      if (s.receiptStart) set.add(ym(s.receiptStart));
    }
    if (set.size === 0) set.add(ym(today));
    return Array.from(set).sort();
  }, [subscriptions, today]);

  const [monthIdx, setMonthIdx] = useState(() => {
    const cur = ym(today);
    const i = months.indexOf(cur);
    return i >= 0 ? i : 0;
  });

  const activeMonth = months[Math.min(monthIdx, months.length - 1)];
  const [y, m] = activeMonth.split("-").map(Number);
  const cells = buildMonth(y, m - 1);

  // 날짜별 접수 시작 공고 매핑.
  const byDate = useMemo(() => {
    const map = new Map<string, Subscription[]>();
    for (const s of subscriptions) {
      if (!s.receiptStart) continue;
      const arr = map.get(s.receiptStart) ?? [];
      arr.push(s);
      map.set(s.receiptStart, arr);
    }
    return map;
  }, [subscriptions]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonthIdx((i) => Math.max(0, i - 1))}
          disabled={monthIdx <= 0}
          className="rounded-lg px-3 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-30"
        >
          ← 이전
        </button>
        <h3 className="text-base font-bold text-slate-900">
          {y}년 {m}월
        </h3>
        <button
          type="button"
          onClick={() =>
            setMonthIdx((i) => Math.min(months.length - 1, i + 1))
          }
          disabled={monthIdx >= months.length - 1}
          className="rounded-lg px-3 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-30"
        >
          다음 →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : ""}
          >
            {w}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          const items = cell.dateStr ? byDate.get(cell.dateStr) ?? [] : [];
          const isToday = cell.dateStr === today;
          return (
            <div
              key={idx}
              className={`min-h-[64px] rounded-lg border p-1 text-left ${
                cell.day == null
                  ? "border-transparent"
                  : isToday
                    ? "border-brand-400 bg-brand-50"
                    : "border-slate-100"
              }`}
            >
              {cell.day != null && (
                <>
                  <div
                    className={`text-xs font-medium ${
                      isToday ? "text-brand-700" : "text-slate-400"
                    }`}
                  >
                    {cell.day}
                  </div>
                  <div className="mt-0.5 space-y-0.5">
                    {items.slice(0, 2).map((s) => (
                      <Link
                        key={s.id}
                        href={`/subscription/${encodeURIComponent(s.id)}`}
                        className="block truncate rounded bg-brand-600 px-1 py-0.5 text-[10px] font-medium text-white hover:bg-brand-700"
                        title={s.name}
                      >
                        {s.name}
                      </Link>
                    ))}
                    {items.length > 2 && (
                      <div className="text-[10px] text-slate-400">
                        +{items.length - 2}건
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-slate-400">
        * 각 날짜는 <b>청약접수 시작일</b> 기준입니다.
      </p>
    </div>
  );
}
