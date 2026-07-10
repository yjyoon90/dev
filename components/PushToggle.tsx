"use client";

import { useEffect, useRef, useState } from "react";
import { useFavorites } from "@/context/FavoritesContext";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

/**
 * 앱이 닫혀 있어도 오는 웹 푸시 구독 토글.
 * NEXT_PUBLIC_VAPID_PUBLIC_KEY 가 설정돼야 노출된다.
 */
export default function PushToggle() {
  const { favorites } = useFavorites();
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const favRef = useRef(favorites);
  favRef.current = favorites;

  const [browserOk, setBrowserOk] = useState(true);

  useEffect(() => {
    const browser =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setBrowserOk(browser);
    const ok = browser && !!VAPID_PUBLIC;
    setSupported(ok);
    if (!ok) return;
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => reg?.pushManager.getSubscription())
      .then((sub) => setSubscribed(!!sub))
      .catch(() => {});
  }, []);

  // 구독 중일 때 관심단지가 바뀌면 서버에 동기화.
  useEffect(() => {
    if (!subscribed) return;
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => reg?.pushManager.getSubscription())
      .then((sub) => {
        if (!sub) return;
        fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: sub, favorites }),
        }).catch(() => {});
      });
  }, [favorites, subscribed]);

  // VAPID 키가 없으면(설정 전) 아무것도 표시하지 않음.
  if (!VAPID_PUBLIC) return null;

  // 키는 있는데 브라우저가 푸시 미지원 → 안내.
  if (!browserOk) {
    return (
      <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        📲 이 브라우저는 푸시 알림을 지원하지 않아요. <b>크롬</b>으로 열거나,
        크롬에서 <b>홈 화면에 추가(앱 설치)</b> 후 사용해주세요.
        <br />
        <span className="text-xs">
          (네이버·카톡 등 인앱 브라우저는 푸시 미지원)
        </span>
      </div>
    );
  }

  if (!supported) return null;

  const enable = async () => {
    setBusy(true);
    setMsg("");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setMsg("알림 권한이 거부되었습니다.");
        setBusy(false);
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          VAPID_PUBLIC as string
        ) as BufferSource,
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub, favorites: favRef.current }),
      });
      if (!res.ok) throw new Error("서버 등록 실패");
      setSubscribed(true);
      setMsg("관심단지 접수 임박 시 알림을 보내드려요.");
    } catch {
      setMsg("알림 설정에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
      setMsg("");
    } catch {
      /* 무시 */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-sm">
        <p className="font-semibold text-slate-800 dark:text-slate-200">
          📲 앱을 꺼놔도 청약 알림 받기
        </p>
        <p className="text-xs text-slate-400">
          {msg || "관심단지 접수 시작·마감을 푸시로 알려드려요."}
        </p>
      </div>
      <button
        type="button"
        onClick={subscribed ? disable : enable}
        disabled={busy}
        className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50 ${
          subscribed
            ? "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            : "bg-brand-600 text-white hover:bg-brand-700"
        }`}
      >
        {busy ? "처리 중…" : subscribed ? "끄기" : "켜기"}
      </button>
    </div>
  );
}
