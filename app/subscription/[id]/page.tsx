import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubscriptionById } from "@/lib/api";
import { todayKST } from "@/lib/today";
import {
  formatCount,
  formatKoreanDate,
  getStatus,
} from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import FavoriteButton from "@/components/FavoriteButton";
import KakaoMap from "@/components/KakaoMap";

export const revalidate = 3600;

export default async function DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sub = await getSubscriptionById(decodeURIComponent(id));
  if (!sub) notFound();

  const today = todayKST();
  const status = getStatus(sub, today);

  const infoRows: { label: string; value: string }[] = [
    { label: "공급지역", value: sub.region },
    { label: "주택유형", value: `${sub.houseType}${sub.houseDetail ? ` · ${sub.houseDetail}` : ""}` },
    { label: "공급규모", value: formatCount(sub.totalSupply) },
    { label: "입주예정", value: sub.moveInMonth ?? "-" },
    { label: "시행사", value: sub.developer ?? "-" },
    { label: "문의처", value: sub.tel ?? "-" },
  ];

  return (
    <article>
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-brand-600"
      >
        ← 목록으로
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <StatusBadge status={status} />
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {sub.region}
              </span>
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                {sub.houseType}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{sub.name}</h1>
            <p className="mt-1 text-sm text-slate-500">{sub.address}</p>
          </div>
          <FavoriteButton id={sub.id} />
        </div>

        {/* 기본 정보 */}
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
          {infoRows.map((row) => (
            <div key={row.label}>
              <dt className="text-xs text-slate-400">{row.label}</dt>
              <dd className="mt-0.5 text-sm font-medium text-slate-800">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* 청약 일정 타임라인 */}
      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-base font-bold text-slate-900">청약 일정</h2>
        <ol className="relative space-y-4 border-l-2 border-slate-100 pl-5">
          {sub.schedule.map((item) => (
            <li key={item.label} className="relative">
              <span className="absolute -left-[27px] top-1 grid h-4 w-4 place-items-center rounded-full bg-brand-600 ring-4 ring-white" />
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <span className="text-sm font-semibold text-slate-800">
                  {item.label}
                </span>
                <span className="text-sm text-slate-600">
                  {formatKoreanDate(item.start)}
                  {item.end && item.end !== item.start
                    ? ` ~ ${formatKoreanDate(item.end)}`
                    : ""}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 위치 지도 */}
      {sub.address && (
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-base font-bold text-slate-900">위치</h2>
          <p className="mb-3 text-sm text-slate-500">{sub.address}</p>
          <KakaoMap address={sub.address} name={sub.name} />
        </section>
      )}

      {/* 외부 링크 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {sub.noticeUrl && (
          <a
            href={sub.noticeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            청약홈 공고 원문 보기 →
          </a>
        )}
        {sub.homepage && (
          <a
            href={sub.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            분양 홈페이지
          </a>
        )}
      </div>

      <p className="mt-5 text-xs text-slate-400">
        * 표시된 정보는 참고용입니다. 실제 청약 전 반드시 청약홈 공고 원문을
        확인하세요.
      </p>
    </article>
  );
}
