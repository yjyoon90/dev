import type { ScheduleItem, Subscription } from "./types";

/** 정규화된 공고에서 상세 화면용 일정 리스트(순서 고정)를 만든다. */
export function buildSchedule(
  sub: Omit<Subscription, "schedule">
): ScheduleItem[] {
  const items: ScheduleItem[] = [
    { label: "모집공고", start: sub.noticeDate },
    { label: "청약접수", start: sub.receiptStart, end: sub.receiptEnd },
    { label: "당첨자 발표", start: sub.winnerDate },
    { label: "계약", start: sub.contractStart, end: sub.contractEnd },
  ];
  return items.filter((it) => it.start);
}
