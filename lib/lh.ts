import type { Region, Subscription } from "./types";
import { normalizeDate } from "./format";
import { buildSchedule } from "./schedule";

/**
 * 한국토지주택공사(LH) 분양임대공고문 조회 서비스 (공공데이터포털 15058530).
 * 엔드포인트: apis.data.go.kr/B552555/lhLeaseNoticeInfo1
 *
 * 실제 응답 구조(확인됨):
 *   [ { "dsSch": [ {검색조건} ] },
 *     { "dsList": [ {공고}, ... ], "resHeader": [ {RS_DTIM, SS_CODE} ] } ]
 * 공고 필드: PAN_NM(공고명), CNP_CD_NM(지역), AIS_TP_CD_NM(세부유형),
 *   UPP_AIS_TP_NM(상위유형: 임대주택/분양주택/토지/상가), PAN_DT(공고일),
 *   CLSG_DT(마감일), DTL_URL(상세), PAN_ID.
 *
 * 청약홈에 이미 있는 분양은 제외하고, LH가 자체 접수하는 "임대주택"만 보완.
 * 인증키는 청약홈과 동일한 APPLYHOME_SERVICE_KEY(같은 data.go.kr 계정) 사용.
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

/** 공고명에서 개행 아티팩트(₩n, \n) 및 중복 공백 정리. */
function cleanName(s?: string): string {
  if (!s) return "LH 공고";
  return s.replace(/₩n|\\n|[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/** 응답 배열에서 dsList(공고 목록)를 추출. */
function extractRows(json: any): any[] {
  if (Array.isArray(json)) {
    const listObj = json.find((x) => x && Array.isArray(x.dsList));
    if (listObj) return listObj.dsList;
  }
  return [];
}

function mapLH(row: any): Subscription | null {
  // 임대주택만(분양은 청약홈, 토지·상가는 주택 아님).
  if (row.UPP_AIS_TP_NM !== "임대주택") return null;
  const region = toRegion(row.CNP_CD_NM);
  if (!region) return null;

  const base: Omit<Subscription, "schedule"> = {
    id: `lh-${row.PAN_ID}`,
    name: cleanName(row.PAN_NM),
    region,
    source: "LH",
    address: row.CNP_CD_NM ?? region, // 목록 API엔 상세주소 없음 → 지역명
    houseType: "임대",
    houseDetail: row.AIS_TP_CD_NM || undefined,
    noticeDate: normalizeDate(row.PAN_DT),
    receiptEnd: normalizeDate(row.CLSG_DT),
    noticeUrl: row.DTL_URL,
  };
  return { ...base, schedule: buildSchedule(base) };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * LH 임대 공고(수도권)를 반환. 인증키/서비스 미승인·필드 불일치 시 빈 배열(앱 정상).
 */
export async function getLHSubscriptions(): Promise<Subscription[]> {
  const key = process.env.APPLYHOME_SERVICE_KEY?.trim();
  if (!key) return [];

  const results: Subscription[] = [];
  for (let page = 1; page <= 3; page++) {
    const params = new URLSearchParams({
      serviceKey: key,
      PG_SZ: "100",
      PAGE: String(page),
      UPP_AIS_TP_CD: "06", // 06 = 임대주택
    });
    try {
      const res = await fetch(`${LH_BASE}?${params.toString()}`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const json = await res.json();
      const rows = extractRows(json);
      if (rows.length === 0) break;
      for (const row of rows) {
        const mapped = mapLH(row);
        if (mapped) results.push(mapped);
      }
      if (rows.length < 100) break;
    } catch {
      break;
    }
  }
  return results;
}
