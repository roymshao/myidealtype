import type { Metadata } from "next";
import Link from "next/link";
import CalculatorForm from "@/components/CalculatorForm";
import { DEFAULT_FEMALE_CRITERIA_CN } from "@/lib/probability";
import maleStats from "@/data/male_stats_cn.json";
import citiesCn from "@/data/cities_cn.json";
import type { GenderStats } from "@/lib/probability";

export const metadata: Metadata = {
  title: "中国 — 女生找男生 · 配对计算器",
  description: "全中国有多少男生符合你的择偶标准？基于国家统计局、CHNS 真实数据。",
};

const stats = maleStats as unknown as GenderStats;

export default function ChinaFemalePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/cn" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition">
            ← 返回
          </Link>
          <h1 className="text-base font-black text-slate-800">
            🇨🇳 <span className="text-blue-600">女生</span>找男生
          </h1>
          <Link href="/cn/male" className="text-sm font-semibold text-pink-500 hover:text-pink-700 transition">
            切换 →
          </Link>
        </div>
      </header>

      <div className="pt-2">
        <CalculatorForm
          stats={stats}
          seekerGender="female"
          defaultCriteria={DEFAULT_FEMALE_CRITERIA_CN}
          country="cn"
          citiesData={citiesCn}
        />
      </div>
    </div>
  );
}
