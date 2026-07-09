import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[var(--max-w)] items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            청
          </span>
          <span className="text-base font-bold text-slate-900">
            수도권 청약 캘린더
          </span>
        </Link>
        <Link
          href="/?tab=favorites"
          className="text-sm font-medium text-slate-500 hover:text-brand-600"
        >
          ★ 관심단지
        </Link>
      </div>
    </header>
  );
}
