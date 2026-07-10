import { getSubscriptions } from "@/lib/api";
import { todayKST } from "@/lib/today";
import HomeView from "@/components/HomeView";

export const revalidate = 3600;

export const metadata = {
  title: "관심단지 · 수도권 청약 캘린더",
};

export default async function FavoritesPage() {
  const { data } = await getSubscriptions();
  const today = todayKST();

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-900 dark:text-slate-100">
        ★ 관심단지
      </h1>
      <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
        카드의 ☆를 눌러 등록한 단지만 모아봅니다.
      </p>
      <HomeView subscriptions={data} today={today} initialTab="favorites" />
    </div>
  );
}
