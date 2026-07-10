"use client";

import { useMemo, useState } from "react";
import type { HouseType, Region, Subscription } from "@/lib/types";
import { getDistrict, getStatus, urgencyRank } from "@/lib/format";
import { useFavorites } from "@/context/FavoritesContext";
import SubscriptionCard from "./SubscriptionCard";
import CalendarView from "./CalendarView";
import FavoriteAlerts from "./FavoriteAlerts";
import MultiMap from "./MultiMap";

type RegionFilter = "전체" | Region;
type TypeFilter = "전체" | HouseType;
type StatusFilter = "전체" | "접수중" | "예정" | "마감";
type ViewMode = "list" | "calendar" | "map";
type Tab = "all" | "favorites";
type SortMode = "임박순" | "최신순";

const ALL = "전체";

const REGIONS: RegionFilter[] = ["전체", "서울", "경기", "인천"];
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
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800"
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
  const [district, setDistrict] = useState<string>(ALL);
  const [type, setType] = useState<TypeFilter>("전체");
  const [status, setStatus] = useState<StatusFilter>("전체");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("list");
  const [tab] = useState<Tab>(initialTab);
  const [sort, setSort] = useState<SortMode>("임박순");

  const { favorites } = useFavorites();

  // 선택된 지역에 존재하는 시/군/구 목록 (드롭다운 옵션).
  const districtOptions = useMemo(() => {
    if (region === "전체") return [];
    const set = new Set<string>();
    for (const s of subscriptions) {
      if (s.region !== region) continue;
      const d = getDistrict(s.address);
      if (d) set.add(d);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ko"));
  }, [subscriptions, region]);

  const filtered = useMemo(() => {
    const list = subscriptions.filter((s) => {
      if (tab === "favorites" && !favorites.includes(s.id)) return false;
      if (region !== "전체" && s.region !== region) return false;
      if (district !== ALL && getDistrict(s.address) !== district) return false;
      if (type !== "전체" && s.houseType !== type) return false;
      if (status !== "전체" && getStatus(s, today) !== status) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const hay = `${s.name} ${s.address}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sort === "임박순") {
      list.sort((a, b) => urgencyRank(a, today) - urgencyRank(b, today));
    } else {
      list.sort((a, b) =>
        (b.receiptStart ?? "").localeCompare(a.receiptStart ?? "")
      );
    }
    return list;
  }, [
    subscriptions,
    tab,
    favorites,
    region,
    district,
    type,
    status,
    query,
    sort,
    today,
  ]);

  return (
    <div>
      <FavoriteAlerts subscriptions={subscriptions} today={today} />

      {/* 검색 + 뷰 토글 */}
      <div className="mb-3 flex flex-wrap gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="단지명·지역 검색"
          className="min-w-0 flex-1 basis-[60%] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-brand-500/20"
        />
        <div className="flex shrink-0 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              view === "list" ? "bg-white text-brand-700 shadow-sm dark:bg-slate-700 dark:text-brand-300" : "text-slate-500"
            }`}
          >
            목록
          </button>
          <button
            type="button"
            onClick={() => setView("calendar")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              view === "calendar"
                ? "bg-white text-brand-700 shadow-sm dark:bg-slate-700 dark:text-brand-300"
                : "text-slate-500"
            }`}
          >
            캘린더
          </button>
          <button
            type="button"
            onClick={() => setView("map")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              view === "map"
                ? "bg-white text-brand-700 shadow-sm dark:bg-slate-700 dark:text-brand-300"
                : "text-slate-500"
            }`}
          >
            지도
          </button>
        </div>
      </div>

      {/* 필터 칩 */}
      <div className="mb-2 flex flex-wrap gap-1.5">
        {REGIONS.map((r) => (
          <Chip
            key={r}
            active={region === r}
            onClick={() => {
              setRegion(r);
              setDistrict(ALL); // 지역 바뀌면 시/군/구 초기화
            }}
          >
            {r}
          </Chip>
        ))}
        {/* 시/군/구 드롭다운 (지역 선택 시 노출) */}
        {region !== "전체" && districtOptions.length > 0 && (
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="rounded-full border-0 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200 outline-none focus:ring-brand-400 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700"
          >
            <option value={ALL}>시/군/구 전체</option>
            {districtOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        )}
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

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-slate-400">
          총 <b className="text-slate-700 dark:text-slate-200">{filtered.length}</b>건
        </p>
        {/* 정렬 토글 */}
        <div className="flex rounded-lg bg-slate-100 p-0.5 text-sm dark:bg-slate-800">
          {(["임박순", "최신순"] as SortMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSort(m)}
              className={`rounded-md px-2.5 py-1 font-medium transition ${
                sort === m
                  ? "bg-white text-brand-700 shadow-sm dark:bg-slate-700 dark:text-brand-300"
                  : "text-slate-500"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {view === "map" ? (
        <MultiMap subscriptions={filtered} />
      ) : view === "calendar" ? (
        <CalendarView subscriptions={filtered} today={today} />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900">
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
