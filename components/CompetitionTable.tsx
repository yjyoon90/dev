import type { CompetitionRow } from "@/lib/types";

function formatRate(rate?: string): { text: string; strong: boolean } {
  if (!rate) return { text: "-", strong: false };
  const n = Number(rate);
  if (Number.isFinite(n) && n > 0) return { text: `${rate}:1`, strong: n >= 10 };
  if (rate.includes("△") || rate.includes("미달"))
    return { text: "미달", strong: false };
  return { text: rate, strong: false };
}

export default function CompetitionTable({
  rows,
}: {
  rows: CompetitionRow[];
}) {
  // 주택형 → 순위 → 거주지 순으로 정렬.
  const sorted = [...rows].sort((a, b) => {
    if (a.houseType !== b.houseType)
      return a.houseType.localeCompare(b.houseType, "ko");
    return (a.rankCode ?? 0) - (b.rankCode ?? 0);
  });

  // 막대 시각화용 최대 경쟁률(숫자만).
  const maxRate = Math.max(
    1,
    ...sorted.map((r) => {
      const n = Number(r.rate);
      return Number.isFinite(n) && n > 0 ? n : 0;
    })
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs text-slate-400 dark:border-slate-700">
            <th className="py-2 pr-3 font-medium">주택형</th>
            <th className="py-2 pr-3 font-medium">순위</th>
            <th className="py-2 pr-3 font-medium">거주지</th>
            <th className="py-2 pr-3 text-right font-medium">접수</th>
            <th className="py-2 text-right font-medium">경쟁률</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => {
            const rate = formatRate(r.rate);
            const n = Number(r.rate);
            const pct =
              Number.isFinite(n) && n > 0
                ? Math.max(6, Math.round((n / maxRate) * 100))
                : 0;
            return (
              <tr
                key={i}
                className="border-b border-slate-100 last:border-0 dark:border-slate-800"
              >
                <td className="py-2 pr-3 font-medium text-slate-800 dark:text-slate-200">
                  {r.houseType}
                </td>
                <td className="py-2 pr-3 text-slate-600 dark:text-slate-300">
                  {r.rankCode ? `${r.rankCode}순위` : "-"}
                </td>
                <td className="py-2 pr-3 text-slate-600 dark:text-slate-300">
                  {r.resideName ?? "-"}
                </td>
                <td className="py-2 pr-3 text-right text-slate-600 dark:text-slate-300">
                  {r.reqCnt != null ? r.reqCnt.toLocaleString("ko-KR") : "-"}
                </td>
                <td className="py-2">
                  <div className="flex items-center justify-end gap-2">
                    {pct > 0 && (
                      <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 sm:block dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            rate.strong ? "bg-red-500" : "bg-brand-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                    <span
                      className={`w-14 text-right ${
                        rate.strong
                          ? "font-bold text-red-600 dark:text-red-400"
                          : "font-medium text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {rate.text}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
