import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-5xl font-bold text-slate-200">404</p>
      <p className="mt-4 text-slate-500">해당 청약 정보를 찾을 수 없습니다.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        목록으로 돌아가기
      </Link>
    </div>
  );
}
