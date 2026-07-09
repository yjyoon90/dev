import type {
  CompetitionRow,
  HouseType,
  Region,
  Subscription,
} from "./types";
import { normalizeDate } from "./format";
import { buildSchedule } from "./schedule";
import { mockSubscriptions } from "./mockData";

/**
 * 청약홈 분양정보 조회 서비스 (공공데이터포털 15098547).
 * odcloud REST 엔드포인트를 호출하고, 수도권(서울·경기·인천)만 필터링해 정규화한다.
 *
 * 인증키(APPLYHOME_SERVICE_KEY)가 없으면 샘플 데이터로 폴백한다.
 * 서버 전용 모듈(인증키를 클라이언트로 노출하지 않음).
 */

const BASE = "https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1";
// 청약접수 경쟁률 및 특별공급 신청현황 조회 서비스 (공공데이터포털 15098905).
const CMPET_BASE = "https://api.odcloud.kr/api/ApplyhomeInfoCmpetRtSvc/v1";

/** 공급 유형별 세부 엔드포인트. */
const ENDPOINTS: { path: string; houseType: HouseType }[] = [
  { path: "getAPTLttotPblancDetail", houseType: "APT" },
  { path: "getRemndrLttotPblancDetail", houseType: "무순위" },
  { path: "getUrbtyOfctlLttotPblancDetail", houseType: "오피스텔/도시형" },
];

/** 공공 API가 지역명을 "서울"/"경기"/"인천" 등으로 주는 것을 정규화(수도권만). */
function toRegion(areaName?: string): Region | null {
  if (!areaName) return null;
  if (areaName.includes("서울")) return "서울";
  if (areaName.includes("경기")) return "경기";
  if (areaName.includes("인천")) return "인천";
  return null;
}

function num(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(String(v).replace(/[^0-9]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/** odcloud 응답의 한 row(한글 키)를 내부 Subscription으로 매핑. */
function mapRow(row: any, houseType: HouseType): Subscription | null {
  // 지역명 필드가 없거나 이름이 달라도, 공급주소로 수도권(서울·경기·인천)를 판별하도록 폴백.
  const region = toRegion(
    row.SUBSCRPT_AREA_CODE_NM ?? row.SUBSCRPT_AREA_NM ?? row.HSSPLY_ADRES
  );
  if (!region) return null;

  const base: Omit<Subscription, "schedule"> = {
    id: `${row.HOUSE_MANAGE_NO ?? "x"}-${row.PBLANC_NO ?? "x"}`,
    houseManageNo: row.HOUSE_MANAGE_NO ? String(row.HOUSE_MANAGE_NO) : undefined,
    pblancNo: row.PBLANC_NO ? String(row.PBLANC_NO) : undefined,
    name: row.HOUSE_NM ?? "이름 미상",
    region,
    address: row.HSSPLY_ADRES ?? row.HSSPLY_ZIP ?? "",
    houseType,
    houseDetail: row.HOUSE_DTL_SECD_NM ?? row.RENT_SECD_NM ?? row.HOUSE_SECD_NM,
    totalSupply: num(row.TOT_SUPLY_HSHLDCO),
    noticeDate: normalizeDate(row.RCRIT_PBLANC_DE),
    receiptStart: normalizeDate(
      row.SUBSCRPT_RCEPT_BGNDE ?? row.RCEPT_BGNDE
    ),
    receiptEnd: normalizeDate(row.SUBSCRPT_RCEPT_ENDDE ?? row.RCEPT_ENDDE),
    winnerDate: normalizeDate(row.PRZWNER_PRESNATN_DE),
    contractStart: normalizeDate(row.CNTRCT_CNCLS_BGNDE),
    contractEnd: normalizeDate(row.CNTRCT_CNCLS_ENDDE),
    moveInMonth: row.MVN_PREARNGE_YM
      ? String(row.MVN_PREARNGE_YM).replace(/(\d{4})(\d{2})/, "$1-$2")
      : undefined,
    developer: row.BSNS_MBY_NM,
    tel: row.MDHS_TELNO,
    homepage: row.HMPG_ADRES,
    noticeUrl: row.PBLANC_URL,
  };
  return { ...base, schedule: buildSchedule(base) };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

async function fetchEndpoint(
  path: string,
  houseType: HouseType,
  serviceKey: string
): Promise<Subscription[]> {
  const results: Subscription[] = [];
  const perPage = 100;
  // 서버 필터(cond) 대신 여러 페이지를 받아 앱에서 수도권(서울·경기·인천)를 필터링한다.
  // (필드명·필터 문법이 조금 달라도 데이터를 놓치지 않도록 하기 위함)
  for (let page = 1; page <= 3; page++) {
    const params = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
      serviceKey,
    });
    const url = `${BASE}/${path}?${params.toString()}`;
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) break;
      const json = await res.json();
      const rows: unknown[] = json?.data ?? [];
      if (rows.length === 0) break;
      for (const row of rows) {
        const mapped = mapRow(row, houseType);
        if (mapped) results.push(mapped); // mapRow가 수도권(서울·경기·인천)만 통과시킴
      }
      if (rows.length < perPage) break; // 마지막 페이지
    } catch {
      break; // 개별 엔드포인트 실패는 무시하고 나머지 데이터로 진행.
    }
  }
  return results;
}

/** 최신 접수순으로 정렬. */
function sortByReceipt(list: Subscription[]): Subscription[] {
  return [...list].sort((a, b) =>
    (b.receiptStart ?? "").localeCompare(a.receiptStart ?? "")
  );
}

/**
 * 수도권(서울·경기·인천) 청약 공고 전체를 반환. 인증키가 없으면 샘플 데이터.
 * `usingSampleData`로 현재 어떤 데이터인지 화면에서 구분할 수 있다.
 */
export async function getSubscriptions(): Promise<{
  data: Subscription[];
  usingSampleData: boolean;
}> {
  const serviceKey = process.env.APPLYHOME_SERVICE_KEY?.trim();
  if (!serviceKey) {
    return { data: sortByReceipt(mockSubscriptions), usingSampleData: true };
  }

  const batches = await Promise.all(
    ENDPOINTS.map((e) => fetchEndpoint(e.path, e.houseType, serviceKey))
  );
  const all = batches.flat();

  // API 호출은 성공했지만 데이터가 비어있을 때도 샘플로 폴백해 빈 화면을 방지.
  if (all.length === 0) {
    return { data: sortByReceipt(mockSubscriptions), usingSampleData: true };
  }
  return { data: sortByReceipt(all), usingSampleData: false };
}

/** id로 단건 조회. */
export async function getSubscriptionById(
  id: string
): Promise<Subscription | null> {
  const { data } = await getSubscriptions();
  return data.find((s) => s.id === id) ?? null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapCompetitionRow(row: any): CompetitionRow | null {
  const houseType = row.HOUSE_TY ?? row.MODEL_NO;
  if (!houseType) return null;
  return {
    houseType: String(houseType),
    supply: num(row.SUPLY_HSHLDCO),
    rankCode: num(row.SUBSCRPT_RANK_CODE),
    resideName: row.RESIDE_SENM ? String(row.RESIDE_SENM) : undefined,
    reqCnt: num(row.REQ_CNT),
    rate: row.CMPET_RATE != null ? String(row.CMPET_RATE) : undefined,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * 특정 공고의 APT 청약 경쟁률을 조회한다 (주택형·순위·거주지 단위).
 * 인증키가 없거나(샘플 모드) 경쟁률 서비스가 아직 미승인/미제공이면 빈 배열.
 * 분양정보와 동일한 APPLYHOME_SERVICE_KEY 를 사용한다.
 */
export async function getCompetitionRates(
  houseManageNo?: string,
  pblancNo?: string
): Promise<CompetitionRow[]> {
  const serviceKey = process.env.APPLYHOME_SERVICE_KEY?.trim();
  if (!serviceKey || !houseManageNo || !pblancNo) return [];

  const params = new URLSearchParams({
    page: "1",
    perPage: "300",
    serviceKey,
    "cond[HOUSE_MANAGE_NO::EQ]": houseManageNo,
    "cond[PBLANC_NO::EQ]": pblancNo,
  });
  const url = `${CMPET_BASE}/getAPTLttotPblancCmpet?${params.toString()}`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    const rows: unknown[] = json?.data ?? [];
    return rows
      .map(mapCompetitionRow)
      .filter((r): r is CompetitionRow => r !== null);
  } catch {
    return [];
  }
}
