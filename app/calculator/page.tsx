import Link from "next/link";
import type { Metadata } from "next";
import GajeomCalculator from "@/components/GajeomCalculator";

export const metadata: Metadata = {
  title: "청약 가점 계산기 · 수도권 청약 캘린더",
  description: "무주택기간·부양가족·청약통장 기간으로 청약 가점(84점)을 계산해보세요.",
};

export default function CalculatorPage() {
  return (
    <div>
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-brand-600"
      >
        ← 목록으로
      </Link>
      <h1 className="mb-1 text-xl font-bold text-slate-900 dark:text-slate-100">
        청약 가점 계산기
      </h1>
      <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
        아래 값을 조절하면 실시간으로 가점이 계산됩니다.
      </p>
      <GajeomCalculator />
    </div>
  );
}
