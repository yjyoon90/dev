"use client";

import { useEffect, useRef, useState } from "react";
import type { Subscription } from "@/lib/types";

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
const MAX_MARKERS = 40; // 지오코딩 부하 방지

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    kakao: any;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function cleanAddress(a: string): string {
  return a
    .split("외")[0]
    .split("(")[0]
    .replace(/일원|일대|블록|블럭|BL|지구|번지/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function loadSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps) return resolve();
    const id = "kakao-map-sdk";
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.async = true;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&libraries=services&autoload=false`;
      document.head.appendChild(script);
    }
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject());
  });
}

/**
 * 필터된 청약 단지들을 카카오 지도에 마커로 한눈에 표시한다.
 * NEXT_PUBLIC_KAKAO_MAP_KEY 가 없으면 안내 메시지.
 */
export default function MultiMap({
  subscriptions,
}: {
  subscriptions: Subscription[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!KAKAO_KEY || !ref.current) return;
    let cancelled = false;
    setLoading(true);
    const targets = subscriptions.slice(0, MAX_MARKERS);

    loadSdk()
      .then(() => {
        window.kakao.maps.load(() => {
          const container = ref.current;
          if (cancelled || !container) return;
          const map = new window.kakao.maps.Map(container, {
            center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울시청
            level: 9,
          });
          // 뷰 전환 직후엔 컨테이너 크기 계산이 안 돼 지도가 빈 화면으로 뜰 수 있음 → relayout 필요
          setTimeout(() => {
            if (cancelled) return;
            map.relayout();
            map.setCenter(new window.kakao.maps.LatLng(37.5665, 126.978));
            setLoading(false);
          }, 250);
          const geocoder = new window.kakao.maps.services.Geocoder();
          const bounds = new window.kakao.maps.LatLngBounds();
          const infow = new window.kakao.maps.InfoWindow({ removable: true });
          let placed = 0;

          targets.forEach((s) => {
            geocoder.addressSearch(
              cleanAddress(s.address),
              (res: any[], status: string) => {
                if (cancelled) return;
                if (status !== window.kakao.maps.services.Status.OK || !res[0])
                  return;
                const pos = new window.kakao.maps.LatLng(res[0].y, res[0].x);
                const marker = new window.kakao.maps.Marker({
                  position: pos,
                  map,
                });
                bounds.extend(pos);
                placed += 1;
                setCount(placed);
                map.setBounds(bounds);
                window.kakao.maps.event.addListener(marker, "click", () => {
                  infow.setContent(
                    `<div style="padding:6px 10px;font-size:12px;max-width:180px">` +
                      `<b>${s.name}</b><br/>` +
                      `<a href="/subscription/${encodeURIComponent(
                        s.id
                      )}" style="color:#6366F1">상세 보기 →</a></div>`
                  );
                  infow.open(map, marker);
                });
              }
            );
          });
        });
      })
      .catch(() => setCount(0));

    return () => {
      cancelled = true;
    };
  }, [subscriptions]);

  if (!KAKAO_KEY) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900">
        지도를 보려면 카카오 지도 키(NEXT_PUBLIC_KAKAO_MAP_KEY)가 필요합니다.
        <br />
        (설정 후 재배포하면 단지들이 지도에 표시됩니다)
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-[70vh] min-h-[360px] w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
        <div ref={ref} className="h-full w-full" />
        {loading && (
          <div className="absolute inset-0 grid place-items-center bg-slate-50 text-sm text-slate-400 dark:bg-slate-900">
            지도 불러오는 중…
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-400">
        지도에 {count ?? 0}개 단지 표시 · 마커를 누르면 상세로 이동
        {subscriptions.length > MAX_MARKERS
          ? ` (많아서 상위 ${MAX_MARKERS}개만)`
          : ""}
      </p>
    </div>
  );
}
