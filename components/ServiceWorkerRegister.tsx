"use client";

import { useEffect } from "react";

/** 페이지 로드 시 서비스 워커를 등록해 PWA 설치·푸시가 가능하게 한다. */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
