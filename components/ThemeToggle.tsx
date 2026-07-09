"use client";

import { useEffect, useState } from "react";

/** 라이트/다크 테마 토글. localStorage에 저장, <html>.dark 클래스로 적용. */
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("cheongyak:theme", next ? "dark" : "light");
    } catch {
      /* 무시 */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="테마 전환"
      className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
    >
      {/* 하이드레이션 불일치 방지: 마운트 전엔 빈 상태 */}
      {mounted ? (dark ? "☀️" : "🌙") : ""}
    </button>
  );
}
