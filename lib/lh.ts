import type { Region, Subscription } from "./types";
import { normalizeDate } from "./format";
import { buildSchedule } from "./schedule";

/**
 * 한국토지주택공사(LH) 분양임대공고문 조회 서비스 (공공데이터포털 15058530).
 * 엔드포인트: apis.data.go.kr/B552555/lhLeaseNoticeInfo1
 * 청약홈(분양)과 달리 LH가 자체 접수하는 임대주택(국민임대·행복주택·전세임대 등)을 보완한다.
 * 인증키는 청약홈과 동일한 APPLYHOME_SERVICE_KEY(같은 data.go.kr 계정) 사용.
 *
 * ⚠️ LH API는 응답 구조가 특이하여, 실제 응답으로 필드 매핑을 최종 검증/보정할 것.
 */

const LH_BASE =
  "https://apis.data.go.kr/B552555/lhLeaseNoticeInfo1/lhLeaseNoticeInfo1";

function toRegion(name?: string): Region | null {
  if (!name) return null;
  if (name.includes("서울")) return "서울";
  if (name.includes("경기")) return "경기";
  if (name.includes("인천")) return "인천";
  return null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/** LH의 특이한 응답 형태들(배열 [header, body] / 표준 items 등)에서 목록을 추출. */
function extractRows(json: any): any[] {
  if (Array.isArray(json)) {
    const body = json.find((x) => x && x.resBody)?.resBody;
    if (Array.isArray(body)) return body;
    if (body && Array.isArray(body.list)) return body.list;
  }
  return (
    json?.response?.body?.items?.item ??
    json?.dsList ??
    (Array.isArray(json?.resBody) ? json.resBody : []) ??
    []
  );
}

function mapLH(row: any): Subscription | null {
  const region = toRegion(
    row.CNP_CD_NM ?? row.CNP_CD_NM ?? row.AREA_NM ?? row.HSSPLY_ADRES
  );
  if (!region) return null;

  const type = String(
    row.AIS_TP_CD_NM ?? row.UPP_AIS_TP_NM ?? row.PAN_SS ?? ""
  );
  // 임대성 공고만(분양은 청약홈에서 이미 제공). 분양·매각은 제외.
  if (type && /분양|매각/.test(type) && !/임대|전세|행복/.test(type)) {
    return null;
  }

  const base: Omit<Subscription, "schedule"> = {
    id: `lh-${row.PAN_ID ?? row.PAN_NM ?? Math.abs(hash(String(row.PAN_NM)))}`,
    name: row.PAN_NM ?? "LH 공고",
    region,
    address: row.CNP_CD_NM ?? region,
    houseType: "임대",
    houseDetail: type || undefined,
    source: "LH",
    noticeDate: normalizeDate(row.PAN_DT ?? row.PAN_NT_ST_DT),
    receiptStart: normalizeDate(row.RCRIT_BGNDE ?? row.SBSCRPT_RCEPT_BGNDE),
    receiptEnd: normalizeDate(row.CLSG_DT ?? row.RCRIT_ENDDE),
    noticeUrl: row.DTL_URL ?? row.PAN_URL,
  };
  return { ...base, schedule: buildSchedule(base) };
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * LH 임대 공고(수도권)를 반환. 인증키/서비스 미승인·필드 불일치 시 빈 배열(앱 정상).
 */
export async function getLHSubscriptions(): Promise<Subscription[]> {
  const key = process.env.APPLYHOME_SERVICE_KEY?.trim();
  if (!key) return [];

  const params = new URLSearchParams({
    serviceKey: key,
    PG_SZ: "100",
    PAGE: "1",
    UPP_AIS_TP_CD: "06", // 06=임대(분양은 05)
  });
  const url = `${LH_BASE}?${params.toString()}`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    const rows = extractRows(json);
    return rows
      .map(mapLH)
      .filter((r): r is Subscription => r !== null);
  } catch {
    return [];
  }
}
