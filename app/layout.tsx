import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FavoritesProvider } from "@/context/FavoritesContext";
import Header from "@/components/Header";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import BottomNav from "@/components/BottomNav";
import { Analytics } from "@vercel/analytics/next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://dev-ruby-two.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "수도권 청약 캘린더",
  description:
    "서울·경기·인천 수도권의 아파트·오피스텔 청약 일정과 상세정보를 한눈에. 한국부동산원 청약홈 공공데이터 기반.",
  manifest: "/manifest.webmanifest",
  applicationName: "수도권 청약 캘린더",
  appleWebApp: { capable: true, title: "청약캘린더", statusBarStyle: "default" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "수도권 청약 캘린더",
    title: "수도권 청약 캘린더",
    description:
      "서울·경기·인천 아파트·오피스텔 청약 일정·경쟁률·지도를 한눈에. 관심단지 임박 알림까지.",
  },
  twitter: {
    card: "summary_large_image",
    title: "수도권 청약 캘린더",
    description:
      "서울·경기·인천 아파트·오피스텔 청약 일정·경쟁률·지도를 한눈에.",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366F1",
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
          <main className="mx-auto w-full max-w-[var(--max-w)] px-4 pb-28 pt-6">
            {children}
          </main>
          <BottomNav />
          <Analytics />
        </FavoritesProvider>
      </body>
    </html>
  );
}
