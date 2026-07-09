/** 한국 표준시(KST) 기준 오늘 날짜를 YYYY-MM-DD로 반환. */
export function todayKST(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}
