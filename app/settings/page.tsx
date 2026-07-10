import type { Metadata } from "next";
import ThemeToggle from "@/components/ThemeToggle";
import PushToggle from "@/components/PushToggle";

export const metadata: Metadata = {
  title: "설정 · 수도권 청약 캘린더",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  return (
    <div>
      <h1 className="mb-5 text-xl font-bold text-slate-900 dark:text-slate-100">
        설정
      </h1>

      <Section title="알림">
        <PushToggle />
      </Section>

      <Section title="화면">
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            테마 (라이트/다크)
          </span>
          <ThemeToggle />
        </div>
      </Section>

      <Section title="정보">
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <p>
            데이터 출처: 한국부동산원 청약홈(공공데이터포털). 표시 정보는 참고용이며,
            실제 청약 시에는 반드시{" "}
            <a
              href="https://www.applyhome.co.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 dark:text-brand-400"
            >
              청약홈
            </a>{" "}
            공고 원문을 확인하세요.
          </p>
          <p className="text-xs">수도권(서울·경기·인천) 아파트·오피스텔 청약 정보</p>
        </div>
      </Section>
    </div>
  );
}
