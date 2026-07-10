/**
 * 청약홈 분양정보 조회 서비스(공공데이터포털 15098547)의 응답을 앱 내부에서
 * 다루기 쉬운 형태로 정규화한 타입.
 */

/** 지원하는 공급 지역(수도권: 서울·경기·인천). */
export type Region = "서울" | "경기" | "인천";

/** 주택 공급 유형. 공공 API의 여러 세부 엔드포인트를 하나로 묶기 위한 구분값. */
export type HouseType =
  | "APT" // 아파트(민영/국민)
  | "무순위" // 무순위/잔여세대
  | "오피스텔/도시형" // 오피스텔·도시형생활주택·민간임대 등
  | "임대" // LH 임대주택(국민임대·행복주택·전세임대 등)
  | "기타";

/** 청약 일정 구간(라벨 + 시작/종료일). */
export interface ScheduleItem {
  label: string;
  start?: string; // YYYY-MM-DD
  end?: string; // YYYY-MM-DD
}

/** 화면에서 사용하는 정규화된 청약 공고 1건. */
export interface Subscription {
  /** 고유 식별자(주택관리번호 + 공고번호). */
  id: string;
  /** 주택관리번호 (경쟁률 조회 키). */
  houseManageNo?: string;
  /** 공고번호 (경쟁률 조회 키). */
  pblancNo?: string;
  /** 주택(단지)명. */
  name: string;
  /** 공급 지역. */
  region: Region;
  /** 시/군/구까지 포함한 상세 주소. */
  address: string;
  /** 공급 유형. */
  houseType: HouseType;
  /** 세부 공급 유형 텍스트(예: "민영", "국민", "도시형생활주택"). */
  houseDetail?: string;
  /** 데이터 출처(청약홈/LH). */
  source?: "청약홈" | "LH";
  /** 총 공급 세대수. */
  totalSupply?: number;
  /** 모집공고일. */
  noticeDate?: string;
  /** 청약접수 시작일. */
  receiptStart?: string;
  /** 청약접수 종료일. */
  receiptEnd?: string;
  /** 당첨자 발표일. */
  winnerDate?: string;
  /** 계약 시작일. */
  contractStart?: string;
  /** 계약 종료일. */
  contractEnd?: string;
  /** 입주 예정월(YYYY-MM). */
  moveInMonth?: string;
  /** 시행사/사업주체명. */
  developer?: string;
  /** 문의 전화. */
  tel?: string;
  /** 분양 홈페이지. */
  homepage?: string;
  /** 청약홈 공고 상세 URL. */
  noticeUrl?: string;
  /** 상세 화면에서 순서대로 보여줄 전체 일정. */
  schedule: ScheduleItem[];
}

/** 청약 진행 상태(접수일 기준 계산값). */
export type SubscriptionStatus = "예정" | "접수중" | "마감";

/** 청약 경쟁률 1행 (주택형·순위·거주지 단위). */
export interface CompetitionRow {
  /** 주택형 (예: "084.9500A"). */
  houseType: string;
  /** 공급 세대수. */
  supply?: number;
  /** 순위 코드 (1=1순위, 2=2순위). */
  rankCode?: number;
  /** 거주지 구분명 (예: "해당지역", "기타경기", "기타지역"). */
  resideName?: string;
  /** 접수 건수. */
  reqCnt?: number;
  /** 경쟁률 (예: "12.5", "△" 미달 등 원문 문자열). */
  rate?: string;
}
