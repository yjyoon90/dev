import { getSubscriptions } from "@/lib/api";
import { todayKST } from "@/lib/today";
import HomeView from "@/components/HomeView";

// 데이터는 1시간마다 갱신(공공 API 캐시와 동일 주기).
export const revalidate = 3600;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { data, usingSampleData } = await getSubscriptions();
  const today = todayKST();
  const { tab } = await searchParams;
  const initialTab = tab === "favorites" ? "favorites" : "all";

  return (
    <div>
      <section className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">
          수도권 청약 일정
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          한국부동산원 청약홈 공공데이터 기반 · 오늘 {today}
        </p>
      </section>

      {usingSampleData && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <b>샘플 데이터로 표시 중입니다.</b> 실제 청약 데이터를 보려면
          공공데이터포털 인증키를 <code>APPLYHOME_SERVICE_KEY</code> 환경변수에
          설정하세요. (README 참고)
        </div>
      )}

      <HomeView
        subscriptions={data}
        today={today}
        initialTab={initialTab}
      />
    </div>
  );
}
