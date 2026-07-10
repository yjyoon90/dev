import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FavoritesProvider } from "@/context/FavoritesContext";
import Header from "@/components/Header";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "수도권 청약 캘린더",
  description:
    "서울·경기·인천 수도권의 아파트·오피스텔 청약 일정과 상세정보를 한눈에. 한국부동산원 청약홈 공공데이터 기반.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 첫 페인트 전에 테마 적용해 깜빡임 방지 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('cheongyak:theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <FavoritesProvider>
          <ServiceWorkerRegister />
          <Header />
          <main className="mx-auto w-full max-w-[var(--max-w)] px-4 pb-16 pt-6">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">
            데이터 출처: 한국부동산원 청약홈(공공데이터포털). 실제 청약 시에는
            반드시 청약홈 공고 원문을 확인하세요.
          </footer>
        </FavoritesProvider>
      </body>
    </html>
  );
}
