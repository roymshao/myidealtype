import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Netherlands Mate Calculator — Are Your Dating Standards Realistic?",
  description: "What percentage of Netherlands men or women match your dating standards? Real CBS StatLine 2022 data.",
};

export default function NetherlandsHomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 bg-slate-50">
      <div className="text-center max-w-2xl w-full">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mb-4">
          🇳🇱 Netherlands · CBS StatLine 2022, RIVM health data, CBS income 2022
        </p>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-4">
          Zijn jouw eisen realistisch? (Are your dating standards realistic?)
        </h1>
        <p className="text-lg text-slate-600 mb-10">
          Real statistics on height, income, weight, relationship status, and more.
          No guessing — just math.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <Link
            href="/nl/female"
            className="group relative flex flex-col items-center rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 w-full sm:w-64 min-h-[220px]"
            style={{
              background: "repeating-linear-gradient(45deg, #9f1239, #9f1239 12px, #881337 12px, #881337 24px)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
            <div className="relative flex flex-col items-center justify-center h-full py-10 px-6 gap-3">
              <span className="text-5xl drop-shadow-lg">👩</span>
              <span className="text-2xl font-black text-white drop-shadow">I&apos;m a Woman</span>
              <span className="text-sm font-medium text-rose-200">Seeking men →</span>
              <div className="mt-2 rounded-full border border-rose-300/50 bg-white/10 backdrop-blur px-4 py-1.5 text-xs font-semibold text-white">
                Male standards calculator
              </div>
            </div>
          </Link>

          <Link
            href="/nl/male"
            className="group relative flex flex-col items-center rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 w-full sm:w-64 min-h-[220px]"
            style={{
              background: "repeating-linear-gradient(-45deg, #1e3a8a, #1e3a8a 12px, #1e40af 12px, #1e40af 24px)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
            <div className="relative flex flex-col items-center justify-center h-full py-10 px-6 gap-3">
              <span className="text-5xl drop-shadow-lg">👨</span>
              <span className="text-2xl font-black text-white drop-shadow">I&apos;m a Man</span>
              <span className="text-sm font-medium text-blue-200">Seeking women →</span>
              <div className="mt-2 rounded-full border border-blue-300/50 bg-white/10 backdrop-blur px-4 py-1.5 text-xs font-semibold text-white">
                Female standards calculator
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-10">
          <Link href="/?country=us" className="text-sm text-slate-400 hover:text-slate-600 transition underline">
            ← Switch to US Calculator
          </Link>
        </div>
      </div>

      <div className="mt-16 flex flex-wrap justify-center gap-8 text-center">
        <Stat value="5.6M+" label="Netherlands men analyzed" />
        <Stat value="5.7M+" label="Netherlands women analyzed" />
        <Stat value="10" label="Netherlands cities" />
        <Stat value="Real data" label="CBS StatLine 2022" />
      </div>

      <footer className="mt-14 text-xs text-slate-400 text-center max-w-md leading-relaxed">
        Data from CBS StatLine 2022, RIVM health data, CBS income 2022.
        Income and wealth in USD equivalent. For entertainment purposes.
        Probability model assumes independence between variables.
      </footer>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-black text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
