import { ImageResponse } from "next/og";

export const runtime = "nodejs";
// 빌드 시 사전생성하지 않고 요청 시 렌더(폰트 원격 로드 때문).
export const dynamic = "force-dynamic";
export const alt = "수도권 청약 캘린더 — 서울·경기·인천 청약 일정";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 카톡/SNS 공유 시 뜨는 미리보기 카드 이미지. 한글 렌더링용 폰트를 로드한다.
async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(
      "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@5.0.19/files/noto-sans-kr-korean-700-normal.woff"
    );
    if (res.ok) return await res.arrayBuffer();
  } catch {
    /* 실패 시 폰트 없이 렌더 */
  }
  return null;
}

export default async function OpengraphImage() {
  const font = await loadFont();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #818CF8 0%, #6366F1 55%, #4F46E5 100%)",
          color: "white",
          fontFamily: font ? "Noto" : "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              width: "104px",
              height: "104px",
              borderRadius: "26px",
              background: "rgba(255,255,255,0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "62px",
              fontWeight: 700,
            }}
          >
            청
          </div>
          <div style={{ fontSize: "66px", fontWeight: 700 }}>
            수도권 청약 캘린더
          </div>
        </div>
        <div style={{ fontSize: "38px", opacity: 0.92 }}>
          서울·경기·인천 아파트·오피스텔 청약 일정
        </div>
        <div style={{ fontSize: "32px", opacity: 0.8, marginTop: "10px" }}>
          경쟁률 · 지도 · 관심단지 임박 알림까지
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: "Noto", data: font, weight: 700 as const, style: "normal" as const }]
        : [],
    }
  );
}
