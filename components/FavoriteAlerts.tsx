"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Subscription } from "@/lib/types";
import { getDday, getStatus, urgencyRank } from "@/lib/format";
import { useFavorites } from "@/context/FavoritesContext";

/**
 * 관심단지 중 접수중이거나 마감이 임박(D-7 이내)한 건을 상단에 알려준다.
 * 브라우저 알림 권한을 받으면, 앱을 열 때 로컬 알림도 1회 띄운다.
 * (앱이 닫혀 있을 때의 예약 푸시는 백엔드가 필요 — 추후 과제)
 */
export default function FavoriteAlerts({
  subscriptions,
  today,
}: {
  subscriptions: Subscription[];
  today: string;
}) {
  const { favorites, ready } = useFavorites();
  const [notify, setNotify] = useState<"unsupported" | NotificationPermission>(
    "default"
  );

  const imminent = useMemo(() => {
    if (!ready || favorites.length === 0) return [];
    return subscriptions
      .filter((s) => favorites.includes(s.id))
      .filter((s) => getDday(s, today) !== null) // 접수중 or 예정(D-7 이내는 tone으로 구분)
      .filter((s) => {
        const st = getStatus(s, today);
        if (st === "접수중") return true;
        const dday = getDday(s, today);
        return dday?.tone === "soon"; // 예정 & 7일 이내
      })
      .sort((a, b) => urgencyRank(a, today) - urgencyRank(b, today));
  }, [subscriptions, favorites, ready, today]);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotify("unsupported");
      return;
    }
    setNotify(Notification.permission);
  }, []);

  // 권한이 있으면 임박 관심단지를 세션당 1회 로컬 알림.
  useEffect(() => {
    if (notify !== "granted" || imminent.length === 0) return;
    const key = "cheongyak:notified";
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    const top = imminent[0];
    const dday = getDday(top, today);
    new Notification("청약 임박 알림", {
      body: `관심단지 «${top.name}» ${dday?.text ?? ""}${
        imminent.length > 1 ? ` 외 ${imminent.length - 1}건` : ""
      }`,
    });
  }, [notify, imminent, today]);

  if (!ready || imminent.length === 0) return null;

  const requestPermission = async () => {
    if (notify === "unsupported") return;
    const p = await Notification.requestPermission();
    setNotify(p);
  };

  return (
    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-red-700 dark:text-red-300">
          🔔 관심단지 청약 임박 {imminent.length}건
        </p>
        {notify === "default" && (
          <button
            type="button"
            onClick={requestPermission}
            className="shrink-0 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
          >
            브라우저 알림 켜기
          </button>
        )}
      </div>
      <ul className="space-y-1.5">
        {imminent.slice(0, 5).map((s) => {
          const dday = getDday(s, today);
          return (
            <li key={s.id}>
              <Link
                href={`/subscription/${encodeURIComponent(s.id)}`}
                className="flex items-center justify-between gap-2 text-sm text-slate-700 hover:text-red-700 dark:text-slate-300 dark:hover:text-red-400"
              >
                <span className="truncate font-medium">{s.name}</span>
                <span className="shrink-0 font-bold text-red-600 dark:text-red-400">
                  {dday?.text}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
