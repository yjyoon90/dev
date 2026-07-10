export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 w-20 rounded bg-slate-100 dark:bg-slate-800" />
      <div className="h-40 rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />
      <div className="h-56 rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />
    </div>
  );
}
