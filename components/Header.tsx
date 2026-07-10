import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex w-full max-w-[var(--max-w)] items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            청
          </span>
          <span className="truncate text-base font-bold text-slate-900 dark:text-slate-100">
            수도권 청약 캘린더
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <Link
            href="/?tab=favorites"
            className="text-sm font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400"
          >
            ★ 관심단지
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
