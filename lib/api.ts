import type { HouseType, Region, Subscription } from "./types";
import { normalizeDate } from "./format";
import { buildSchedule } from "./schedule";
import { mockSubscriptions } from "./mockData";

/**
 * 청약홈 분양정보 조회 서비스 (공공데이터포털 15098547).
 * odcloud REST 엔드포인트를 호출하고, 서울/경기만 필터링해 정규화한다.
 *
 * 인증키(APPLYHOME_SERVICE_KEY)가 없으면 샘플 데이터로 폴백한다.
 * 서버 전용 모듈(인증키를 클라이언트로 노출하지 않음).
 */

const BASE = "https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1";

/** 공급 유형별 세부 엔드포인트. */
const ENDPOINTS: { path: string; houseType: HouseType }[] = [
  { path: "getAPTLttotPblancDetail", houseType: "APT" },
  { path: "getRemndrLttotPblancDetail", houseType: "무순위" },
  { path: "getUrbtyOfctlLttotPblancDetail", houseType: "오피스텔/도시형" },
];

const TARGET_REGIONS: Region[] = ["서울", "경기"];

/** 공공 API가 지역명을 "서울"/"경기"/"경기도" 등으로 주는 것을 정규화. */
function toRegion(areaName?: string): Region | null {
  if (!areaName) return null;
  if (areaName.includes("서울")) return "서울";
  if (areaName.includes("경기")) return "경기";
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
  const region = toRegion(row.SUBSCRPT_AREA_CODE_NM ?? row.SUBSCRPT_AREA_NM);
  if (!region) return null;

  const base: Omit<Subscription, "schedule"> = {
    id: `${row.HOUSE_MANAGE_NO ?? "x"}-${row.PBLANC_NO ?? "x"}`,
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
  for (const region of TARGET_REGIONS) {
    const params = new URLSearchParams({
      page: "1",
      perPage: "100",
      serviceKey,
      "cond[SUBSCRPT_AREA_CODE_NM::EQ]": region,
    });
    const url = `${BASE}/${path}?${params.toString()}`;
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) continue;
      const json = await res.json();
      const rows: unknown[] = json?.data ?? [];
      for (const row of rows) {
        const mapped = mapRow(row, houseType);
        if (mapped) results.push(mapped);
      }
    } catch {
      // 개별 엔드포인트 실패는 무시하고 나머지 데이터로 진행.
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
 * 서울/경기 청약 공고 전체를 반환. 인증키가 없으면 샘플 데이터.
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
