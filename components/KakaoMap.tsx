"use client";

import { useEffect, useRef, useState } from "react";

// 클라이언트에서 접근하려면 NEXT_PUBLIC_ 접두사 필요. 빌드 시 인라인됨.
const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    kakao: any;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** 청약홈 주소에서 지오코딩이 되도록 뒷부분(외 N개동, 괄호, 일원 등)을 정리. */
function cleanAddress(a: string): string {
  return a
    .split("외")[0]
    .split("(")[0]
    .replace(/일원|일대|블록|블럭|BL|지구/gi, "")
    .trim();
}

/**
 * 상세페이지 지도.
 * - NEXT_PUBLIC_KAKAO_MAP_KEY 가 없으면 → 카카오맵 검색 링크로 폴백
 * - 있으면 → 카카오 지도 SDK 로드 후 주소 지오코딩하여 마커 표시
 */
export default function KakaoMap({
  address,
  name,
}: {
  address: string;
  name: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!KAKAO_KEY || !address) {
      setFailed(true);
      return;
    }
    let cancelled = false;

    const init = () => {
      window.kakao.maps.load(() => {
        const container = ref.current;
        if (cancelled || !container) return;
        const geocoder = new window.kakao.maps.services.Geocoder();

        const search = (query: string, fallback?: string) => {
          geocoder.addressSearch(query, (res: any[], status: string) => {
            if (cancelled) return;
            if (status === window.kakao.maps.services.Status.OK && res[0]) {
              const coords = new window.kakao.maps.LatLng(res[0].y, res[0].x);
              const map = new window.kakao.maps.Map(container, {
                center: coords,
                level: 4,
              });
              new window.kakao.maps.Marker({ position: coords, map });
            } else if (fallback) {
              search(fallback); // 정리한 주소 실패 시 원본으로 재시도
            } else {
              setFailed(true);
            }
          });
        };
        search(cleanAddress(address), address);
      });
    };

    if (window.kakao?.maps) {
      init();
      return () => {
        cancelled = true;
      };
    }

    const id = "kakao-map-sdk";
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.async = true;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&libraries=services&autoload=false`;
      document.head.appendChild(script);
    }
    script.addEventListener("load", init);
    script.addEventListener("error", () => setFailed(true));

    return () => {
      cancelled = true;
      script?.removeEventListener("load", init);
    };
  }, [address]);

  const searchUrl = `https://map.kakao.com/?q=${encodeURIComponent(address)}`;

  // 키가 없거나 지오코딩 실패 → 카카오맵 검색 링크(키 없이도 동작)
  if (failed || !KAKAO_KEY) {
    return (
      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm font-medium text-brand-700 hover:bg-slate-100"
      >
        📍 카카오맵에서 «{name}» 위치 보기 →
      </a>
    );
  }

  return (
    <div
      ref={ref}
      className="h-64 w-full overflow-hidden rounded-xl border border-slate-200"
    />
  );
}
