"use client";

import { useMemo, useState } from "react";
import type { HouseType, Region, Subscription } from "@/lib/types";
import { getStatus } from "@/lib/format";
import { useFavorites } from "@/context/FavoritesContext";
import SubscriptionCard from "./SubscriptionCard";
import CalendarView from "./CalendarView";

type RegionFilter = "전체" | Region;
type TypeFilter = "전체" | HouseType;
type StatusFilter = "전체" | "접수중" | "예정" | "마감";
type ViewMode = "list" | "calendar";
type Tab = "all" | "favorites";

const REGIONS: RegionFilter[] = ["전체", "서울", "경기"];
const TYPES: TypeFilter[] = ["전체", "APT", "무순위", "오피스텔/도시형"];
const STATUSES: StatusFilter[] = ["전체", "접수중", "예정", "마감"];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-brand-600 text-white"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

export default function HomeView({
  subscriptions,
  today,
  initialTab = "all",
}: {
  subscriptions: Subscription[];
  today: string;
  initialTab?: Tab;
}) {
  const [region, setRegion] = useState<RegionFilter>("전체");
  const [type, setType] = useState<TypeFilter>("전체");
  const [status, setStatus] = useState<StatusFilter>("전체");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("list");
  const [tab, setTab] = useState<Tab>(initialTab);

  const { favorites, ready } = useFavorites();

  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      if (tab === "favorites" && !favorites.includes(s.id)) return false;
      if (region !== "전체" && s.region !== region) return false;
      if (type !== "전체" && s.houseType !== type) return false;
      if (status !== "전체" && getStatus(s, today) !== status) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const hay = `${s.name} ${s.address}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [subscriptions, tab, favorites, region, type, status, query, today]);

  return (
    <div>
      {/* 탭 */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("all")}
          className={`border-b-2 px-1 pb-2 text-sm font-semibold transition ${
            tab === "all"
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          전체 청약
        </button>
        <button
          type="button"
          onClick={() => setTab("favorites")}
          className={`border-b-2 px-1 pb-2 text-sm font-semibold transition ${
            tab === "favorites"
              ? "border-brand-600 text-brand-700"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          ★ 관심단지{ready && favorites.length > 0 ? ` (${favorites.length})` : ""}
        </button>
      </div>

      {/* 검색 + 뷰 토글 */}
      <div className="mb-3 flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="단지명·지역 검색"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <div className="flex shrink-0 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              view === "list" ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"
            }`}
          >
            목록
          </button>
          <button
            type="button"
            onClick={() => setView("calendar")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              view === "calendar"
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-500"
            }`}
          >
            캘린더
          </button>
        </div>
      </div>

      {/* 필터 칩 */}
      <div className="mb-2 flex flex-wrap gap-1.5">
        {REGIONS.map((r) => (
          <Chip key={r} active={region === r} onClick={() => setRegion(r)}>
            {r}
          </Chip>
        ))}
      </div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {TYPES.map((t) => (
          <Chip key={t} active={type === t} onClick={() => setType(t)}>
            {t}
          </Chip>
        ))}
      </div>
      <div className="mb-5 flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
            {s}
          </Chip>
        ))}
      </div>

      <p className="mb-3 text-sm text-slate-400">
        총 <b className="text-slate-700">{filtered.length}</b>건
      </p>

      {view === "calendar" ? (
        <CalendarView subscriptions={filtered} today={today} />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
          {tab === "favorites"
            ? "관심단지가 없습니다. 카드의 ☆를 눌러 추가해보세요."
            : "조건에 맞는 청약이 없습니다."}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((s) => (
            <SubscriptionCard key={s.id} sub={s} today={today} />
          ))}
        </div>
      )}
    </div>
  );
}
