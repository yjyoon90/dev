import Link from "next/link";
import type { Subscription } from "@/lib/types";
import {
  ddayColor,
  formatCount,
  formatKoreanDate,
  getDday,
  getStatus,
} from "@/lib/format";
import StatusBadge from "./StatusBadge";
import FavoriteButton from "./FavoriteButton";

export default function SubscriptionCard({
  sub,
  today,
}: {
  sub: Subscription;
  today: string;
}) {
  const status = getStatus(sub, today);
  const dday = getDday(sub, today);

  return (
    <Link
      href={`/subscription/${encodeURIComponent(sub.id)}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={status} />
            {dday && (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${ddayColor(
                  dday.tone
                )}`}
              >
                {dday.text}
              </span>
            )}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {sub.region}
            </span>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
              {sub.houseType}
            </span>
          </div>
          <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-brand-700 dark:text-slate-100 dark:group-hover:text-brand-400">
            {sub.name}
          </h3>
          <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
            {sub.address}
          </p>
        </div>
        <FavoriteButton id={sub.id} className="-mr-1 shrink-0" />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-slate-400">청약접수</dt>
          <dd className="font-medium text-slate-700 dark:text-slate-300">
            {formatKoreanDate(sub.receiptStart)}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-400">당첨발표</dt>
          <dd className="font-medium text-slate-700 dark:text-slate-300">
            {formatKoreanDate(sub.winnerDate)}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-400">공급규모</dt>
          <dd className="font-medium text-slate-700 dark:text-slate-300">
            {formatCount(sub.totalSupply)}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-400">입주예정</dt>
          <dd className="font-medium text-slate-700 dark:text-slate-300">
            {sub.moveInMonth ?? "-"}
          </dd>
        </div>
      </dl>
    </Link>
  );
}
