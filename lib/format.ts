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

/** 오늘(YYYY-MM-DD) 기준 대상 날짜까지 남은 일수. 과거면 음수. */
export function daysUntil(dateStr: string | undefined, today: string): number | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  if (!y || !ty) return null;
  const target = Date.UTC(y, m - 1, d);
  const base = Date.UTC(ty, tm - 1, td);
  return Math.round((target - base) / 86_400_000);
}

export type DdayTone = "urgent" | "soon" | "muted";

/** 상태·남은일수로 D-day 배지 정보를 만든다. 마감 건은 null. */
export function getDday(
  sub: Pick<Subscription, "receiptStart" | "receiptEnd">,
  today: string
): { text: string; tone: DdayTone } | null {
  const status = getStatus(sub, today);
  if (status === "접수중") {
    const n = daysUntil(sub.receiptEnd, today);
    if (n == null) return { text: "접수중", tone: "urgent" };
    if (n <= 0) return { text: "오늘마감", tone: "urgent" };
    return { text: `마감 D-${n}`, tone: "urgent" };
  }
  if (status === "예정") {
    const n = daysUntil(sub.receiptStart, today);
    if (n == null || n <= 0) return null;
    return { text: `D-${n}`, tone: n <= 7 ? "soon" : "muted" };
  }
  return null; // 마감
}

/** D-day 배지 색상(tailwind). */
export function ddayColor(tone: DdayTone): string {
  switch (tone) {
    case "urgent":
      return "bg-red-100 text-red-700 ring-red-600/20";
    case "soon":
      return "bg-orange-100 text-orange-700 ring-orange-600/20";
    case "muted":
      return "bg-slate-100 text-slate-500 ring-slate-500/20";
  }
}

/** 임박순 정렬 키(작을수록 먼저): 접수중 → 예정 → 마감, 각 그룹 내 임박순. */
export function urgencyRank(
  sub: Pick<Subscription, "receiptStart" | "receiptEnd">,
  today: string
): number {
  const status = getStatus(sub, today);
  if (status === "접수중") {
    return 0 + (daysUntil(sub.receiptEnd, today) ?? 0);
  }
  if (status === "예정") {
    return 100_000 + (daysUntil(sub.receiptStart, today) ?? 9_999);
  }
  // 마감: 최근 마감이 위로 (receiptEnd가 오늘에 가까울수록 먼저)
  return 1_000_000 - (daysUntil(sub.receiptEnd, today) ?? -99_999);
}

/** 공급주소에서 시/군/구 추출 (예: "경기도 고양시 덕양구 …" → "고양시"). */
export function getDistrict(address?: string): string | null {
  if (!address) return null;
  const tokens = address.trim().split(/\s+/);
  if (tokens.length < 2) return null;
  // tokens[0] = 시/도(서울특별시·경기도), tokens[1] = 구/시/군
  const t = tokens[1];
  return /(구|시|군)$/.test(t) ? t : null;
}
