/**
 * 청약 가점(84점 만점) 계산 로직.
 * = 무주택기간(32) + 부양가족수(35) + 청약통장 가입기간(17)
 * (국토교통부 주택공급규칙 가점 기준)
 */

/** 무주택 기간 점수 (최대 32). years=0이면 0점(유주택·만30세미만 미혼 등). */
export function noHouseScore(years: number): number {
  if (years <= 0) return 0;
  return Math.min(32, 2 + Math.floor(years) * 2);
}

/** 부양가족 수 점수 (최대 35). */
export function dependentsScore(count: number): number {
  if (count < 0) return 0;
  return Math.min(35, 5 + count * 5);
}

/** 청약통장 가입기간 점수 (최대 17). months 단위. */
export function accountScore(months: number): number {
  if (months < 6) return 1;
  if (months < 12) return 2;
  const years = Math.floor(months / 12);
  return Math.min(17, 3 + (years - 1));
}

export interface GajeomInput {
  noHouseYears: number;
  dependents: number;
  accountYears: number;
  accountMonths: number;
}

export interface GajeomResult {
  noHouse: number;
  dependents: number;
  account: number;
  total: number;
}

export function calcGajeom(input: GajeomInput): GajeomResult {
  const noHouse = noHouseScore(input.noHouseYears);
  const dependents = dependentsScore(input.dependents);
  const account = accountScore(input.accountYears * 12 + input.accountMonths);
  return { noHouse, dependents, account, total: noHouse + dependents + account };
}
