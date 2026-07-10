export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-7 w-44 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-4 w-64 rounded bg-slate-100 dark:bg-slate-800" />
      <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-900" />
      <div className="flex gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-16 rounded-full bg-slate-100 dark:bg-slate-900"
          />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-36 rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
          />
        ))}
      </div>
    </div>
  );
}
