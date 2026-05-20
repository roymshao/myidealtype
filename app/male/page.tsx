import type { Metadata } from "next";
import Link from "next/link";
import CalculatorForm from "@/components/CalculatorForm";
import { DEFAULT_FEMALE_CRITERIA } from "@/lib/probability";
import femaleStats from "@/data/female_stats_us.json";
import type { GenderStats } from "@/lib/probability";

export const metadata: Metadata = {
  title: "Men Seeking Women — Mate Calculator",
  description:
    "What percentage of US women meet your dating standards? Real Census + CDC statistics on height, income, body type, age, and more.",
  openGraph: {
    title: "Men: Are Your Standards for Women Realistic?",
    description:
      "Find out what % of US women actually match your preferences. Real data, no guessing.",
  },
};

const stats = femaleStats as unknown as GenderStats;

export default function MalePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition">
            ← Back
          </Link>
          <h1 className="text-base font-black text-slate-800">
            <span className="text-pink-600">Men</span> seeking women
          </h1>
          <Link
            href="/female"
            className="text-sm font-semibold text-blue-500 hover:text-blue-700 transition"
          >
            Switch →
          </Link>
        </div>
      </header>

      <div className="pt-2">
        <CalculatorForm
          stats={stats}
          seekerGender="male"
          defaultCriteria={DEFAULT_FEMALE_CRITERIA}
        />
      </div>
    </div>
  );
}
