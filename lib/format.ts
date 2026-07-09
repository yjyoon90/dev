import type { Subscription, SubscriptionStatus } from "./types";

/** "20260115" 또는 "2026-01-15" → "2026-01-15" (Date 파싱 없이 문자열만 정규화). */
export function normalizeDate(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const digits = raw.replace(/[^0-9]/g, "");
  if (digits.length !== 8) return raw.includes("-") ? raw : undefined;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

/** "2026-01-15" → "1월 15일 (목)" 형태의 한국어 짧은 표기. */
export function formatKoreanDate(date?: string): string {
  if (!date) return "-";
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return date;
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const dow = days[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${m}월 ${d}일 (${dow})`;
}

/** 접수 시작/종료일과 기준일(오늘)을 비교해 진행 상태를 계산. */
export function getStatus(
  sub: Pick<Subscription, "receiptStart" | "receiptEnd">,
  today: string
): SubscriptionStatus {
  const { receiptStart, receiptEnd } = sub;
  if (receiptStart && today < receiptStart) return "예정";
  if (receiptEnd && today > receiptEnd) return "마감";
  if (receiptStart && receiptEnd) return "접수중";
  // 접수일 정보가 부족하면 마감일 유무로 최선의 추정.
  if (receiptEnd) return today > receiptEnd ? "마감" : "접수중";
  return "예정";
}

/** 상태별 배지 색상(tailwind 클래스). */
export function statusColor(status: SubscriptionStatus): string {
  switch (status) {
    case "접수중":
      return "bg-green-100 text-green-700 ring-green-600/20";
    case "예정":
      return "bg-amber-100 text-amber-700 ring-amber-600/20";
    case "마감":
      return "bg-gray-100 text-gray-500 ring-gray-500/20";
  }
}

/** 세대수 천단위 콤마. */
export function formatCount(n?: number): string {
  if (n == null) return "-";
  return n.toLocaleString("ko-KR") + "세대";
}
