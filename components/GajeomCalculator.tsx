"use client";

import { useMemo, useState } from "react";
import { calcGajeom } from "@/lib/gajeom";

function Stepper({
  label,
  hint,
  value,
  setValue,
  max,
  unit = "",
}: {
  label: string;
  hint?: string;
  value: number;
  setValue: (n: number) => void;
  max: number;
  unit?: string;
}) {
  const clamp = (n: number) => Math.max(0, Math.min(max, n));
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {label}
        </p>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setValue(clamp(value - 1))}
          className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-lg font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          aria-label="감소"
        >
          −
        </button>
        <span className="w-14 text-center text-base font-bold tabular-nums text-slate-900 dark:text-slate-100">
          {value}
          {unit}
        </span>
        <button
          type="button"
          onClick={() => setValue(clamp(value + 1))}
          className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-lg font-bold text-white hover:bg-brand-700"
          aria-label="증가"
        >
          +
        </button>
      </div>
    </div>
  );
}

function Bar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-slate-500 dark:text-slate-400">{label}</span>
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {score} / {max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-brand-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function GajeomCalculator() {
  const [noHouseYears, setNoHouseYears] = useState(0);
  const [dependents, setDependents] = useState(0);
  const [accountYears, setAccountYears] = useState(0);
  const [accountMonths, setAccountMonths] = useState(0);

  const r = useMemo(
    () =>
      calcGajeom({ noHouseYears, dependents, accountYears, accountMonths }),
    [noHouseYears, dependents, accountYears, accountMonths]
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5 text-center dark:border-brand-500/20 dark:bg-brand-500/10">
        <p className="text-sm text-brand-700 dark:text-brand-300">내 청약 가점</p>
        <p className="mt-1 text-5xl font-extrabold text-brand-700 dark:text-brand-300">
          {r.total}
          <span className="text-2xl font-bold text-brand-400"> / 84</span>
        </p>
      </div>

      <div className="space-y-3">
        <Stepper
          label="무주택 기간"
          hint="만 30세(또는 혼인신고일)부터 · 최대 32점"
          value={noHouseYears}
          setValue={setNoHouseYears}
          max={20}
          unit="년"
        />
        <Stepper
          label="부양가족 수"
          hint="배우자·직계존비속 · 최대 35점"
          value={dependents}
          setValue={setDependents}
          max={10}
          unit="명"
        />
        <div className="grid grid-cols-2 gap-3">
          <Stepper
            label="청약통장"
            hint="가입 연수"
            value={accountYears}
            setValue={setAccountYears}
            max={20}
            unit="년"
          />
          <Stepper
            label="(개월)"
            hint="추가 개월"
            value={accountMonths}
            setValue={setAccountMonths}
            max={11}
            unit="개월"
          />
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <Bar label="무주택 기간" score={r.noHouse} max={32} />
        <Bar label="부양가족 수" score={r.dependents} max={35} />
        <Bar label="청약통장 가입기간" score={r.account} max={17} />
      </div>

      <p className="text-xs text-slate-400">
        * 참고용 계산입니다. 실제 가점은 청약홈에서 세부 조건(무주택 인정 시점,
        부양가족 요건 등)에 따라 달라질 수 있습니다.
      </p>
    </div>
  );
}
