"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, Star, Calculator, Settings } from "lucide-react";

const items = [
  { href: "/", label: "청약", Icon: Building2 },
  { href: "/favorites", label: "관심", Icon: Star },
  { href: "/calculator", label: "가점", Icon: Calculator },
  { href: "/settings", label: "설정", Icon: Settings },
];

export default function BottomNav() {
  const path = usePathname();
  const router = useRouter();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex w-full max-w-[var(--max-w)] items-stretch">
        {items.map((it) => {
          const active =
            it.href === "/" ? path === "/" : path.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={(e) => {
                // 이미 그 탭이면 새로고침 + 맨 위로 (요즘 앱 패턴)
                if (active) {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  router.refresh();
                }
              }}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition ${
                active
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              <it.Icon
                size={22}
                strokeWidth={active ? 2.4 : 1.8}
                fill={it.label === "관심" && active ? "currentColor" : "none"}
              />
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
