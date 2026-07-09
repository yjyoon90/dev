import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "수도권 청약 캘린더",
    short_name: "청약캘린더",
    description:
      "서울·경기·인천 수도권 아파트·오피스텔 청약 일정과 상세정보 조회",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#2563eb",
    lang: "ko",
    icons: [
      {
        src:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Crect width='192' height='192' rx='36' fill='%232563eb'/%3E%3Ctext x='96' y='128' font-size='104' font-family='sans-serif' font-weight='bold' fill='white' text-anchor='middle'%3E%EC%B2%AD%3C/text%3E%3C/svg%3E",
        sizes: "192x192",
        type: "image/svg+xml",
      },
    ],
  };
}
