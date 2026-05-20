import type { Metadata } from "next";
import Link from "next/link";
import CalculatorForm from "@/components/CalculatorForm";
import { DEFAULT_MALE_CRITERIA } from "@/lib/probability";
import maleStats from "@/data/male_stats_us.json";
import type { GenderStats } from "@/lib/probability";

export const metadata: Metadata = {
  title: "Women Seeking Men — Mate Calculator",
  description:
    "What percentage of US men meet your dating standards? Real Census + CDC statistics on height, income, body type, age, and more.",
  openGraph: {
    title: "Women: Are Your Standards for Men Realistic?",
    description:
      "Find out what % of US men actually match your preferences. Real data, no guessing.",
  },
};

const stats = maleStats as unknown as GenderStats;

export default function FemalePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition">
            ← Back
          </Link>
          <h1 className="text-base font-black text-slate-800">
            <span className="text-blue-600">Women</span> seeking men
          </h1>
          <Link
            href="/male"
            className="text-sm font-semibold text-pink-500 hover:text-pink-700 transition"
          >
            Switch →
          </Link>
        </div>
      </header>

      <div className="pt-2">
        <CalculatorForm
          stats={stats}
          seekerGender="female"
          defaultCriteria={DEFAULT_MALE_CRITERIA}
        />
      </div>
    </div>
  );
}
