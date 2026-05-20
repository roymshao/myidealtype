import type { Metadata } from "next";
import Link from "next/link";
import CalculatorForm from "@/components/CalculatorForm";
import { DEFAULT_MALE_CRITERIA_JP } from "@/lib/probability";
import femaleStats from "@/data/female_stats_jp.json";
import citiesJp from "@/data/cities_jp.json";
import type { GenderStats } from "@/lib/probability";

export const metadata: Metadata = {
  title: "Japan — Men Seeking Women · Mate Calculator",
  description: "What percentage of Japanese women meet your dating standards? Real Japan NHNS + Statistics Bureau data.",
};

const stats = femaleStats as unknown as GenderStats;

export default function JapanMalePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/jp" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition">
            ← Back
          </Link>
          <h1 className="text-base font-black text-slate-800">
            🇯🇵 <span className="text-pink-600">Men</span> seeking women
          </h1>
          <Link href="/jp/female" className="text-sm font-semibold text-blue-500 hover:text-blue-700 transition">
            Switch →
          </Link>
        </div>
      </header>

      <div className="pt-2">
        <CalculatorForm
          stats={stats}
          seekerGender="male"
          defaultCriteria={DEFAULT_MALE_CRITERIA_JP}
          country="jp"
          citiesData={citiesJp}
        />
      </div>
    </div>
  );
}
