import type { Metadata } from "next";
import Link from "next/link";
import CalculatorForm from "@/components/CalculatorForm";
import { DEFAULT_FEMALE_CRITERIA_JP } from "@/lib/probability";
import maleStats from "@/data/male_stats_jp.json";
import citiesJp from "@/data/cities_jp.json";
import type { GenderStats } from "@/lib/probability";

export const metadata: Metadata = {
  title: "Japan — Women Seeking Men · Mate Calculator",
  description: "What percentage of Japanese men meet your dating standards? Real Japan NHNS + Statistics Bureau data.",
};

const stats = maleStats as unknown as GenderStats;

export default function JapanFemalePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/jp" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition">
            ← Back
          </Link>
          <h1 className="text-base font-black text-slate-800">
            🇯🇵 <span className="text-blue-600">Women</span> seeking men
          </h1>
          <Link href="/jp/male" className="text-sm font-semibold text-pink-500 hover:text-pink-700 transition">
            Switch →
          </Link>
        </div>
      </header>

      <div className="pt-2">
        <CalculatorForm
          stats={stats}
          seekerGender="female"
          defaultCriteria={DEFAULT_FEMALE_CRITERIA_JP}
          country="jp"
          citiesData={citiesJp}
        />
      </div>
    </div>
  );
}
