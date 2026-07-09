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

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs text-slate-400">
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
            return (
              <tr
                key={i}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="py-2 pr-3 font-medium text-slate-800">
                  {r.houseType}
                </td>
                <td className="py-2 pr-3 text-slate-600">
                  {r.rankCode ? `${r.rankCode}순위` : "-"}
                </td>
                <td className="py-2 pr-3 text-slate-600">
                  {r.resideName ?? "-"}
                </td>
                <td className="py-2 pr-3 text-right text-slate-600">
                  {r.reqCnt != null ? r.reqCnt.toLocaleString("ko-KR") : "-"}
                </td>
                <td
                  className={`py-2 text-right ${
                    rate.strong
                      ? "font-bold text-red-600"
                      : "font-medium text-slate-700"
                  }`}
                >
                  {rate.text}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
