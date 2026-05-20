import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mate Calculator — Are Your Dating Standards Realistic?",
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 bg-slate-50">
      <div className="text-center max-w-2xl w-full">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mb-4">
          Powered by US Census + CDC data
        </p>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-4">
          Are your dating standards{" "}
          <span className="italic text-slate-500">actually</span> realistic?
        </h1>
        <p className="text-lg text-slate-600 mb-10">
          Real statistics on height, income, weight, looks, religion, heritage, and more.
          No guessing — just math.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          {/* Woman card — bold rose diagonal pattern */}
          <Link
            href="/female"
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

          {/* Man card — bold navy diagonal pattern */}
          <Link
            href="/male"
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
      </div>

      {/* International links */}
      <div className="mt-12 w-full max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 text-center mb-3">
          Also available for
        </p>
        <div className="mb-2 text-center text-xs text-slate-400 font-semibold uppercase tracking-wider">Asia</div>
        <div className="flex gap-3 justify-center flex-wrap mb-4">
          <Link href="/kr" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition shadow-sm">
            🇰🇷 Korea
          </Link>
          <Link href="/jp" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition shadow-sm">
            🇯🇵 Japan
          </Link>
          <Link href="/cn" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition shadow-sm">
            🇨🇳 中国
          </Link>
        </div>
        <div className="mb-2 text-center text-xs text-slate-400 font-semibold uppercase tracking-wider">Europe</div>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/uk" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition shadow-sm">
            🇬🇧 UK
          </Link>
          <Link href="/de" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition shadow-sm">
            🇩🇪 Germany
          </Link>
          <Link href="/fr" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition shadow-sm">
            🇫🇷 France
          </Link>
          <Link href="/nl" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition shadow-sm">
            🇳🇱 Netherlands
          </Link>
          <Link href="/es" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition shadow-sm">
            🇪🇸 Spain
          </Link>
          <Link href="/it" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition shadow-sm">
            🇮🇹 Italy
          </Link>
          <Link href="/se" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition shadow-sm">
            🇸🇪 Sweden
          </Link>
          <Link href="/pl" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition shadow-sm">
            🇵🇱 Poland
          </Link>
        </div>
      </div>

      {/* Stats strip */}
      <div className="mt-12 flex flex-wrap justify-center gap-8 text-center">
        <Stat value="100M+" label="US men analyzed" />
        <Stat value="105M+" label="US women analyzed" />
        <Stat value="253" label="US cities" />
        <Stat value="12+" label="criteria filters" />
        <Stat value="Real data" label="Census · CDC · Pew" />
      </div>

      <footer className="mt-14 text-xs text-slate-400 text-center max-w-md leading-relaxed">
        Data from US Census Bureau ACS (2022), CDC NHANES (2017–2018), Fed Reserve SCF (2022), and Pew Research Center (2023).
        International data from Statistics Korea (2022), KNHANES (2020–21), Statistics Bureau Japan (2022), Japan NHNS (2019),
        NBS China (2022), CHNS (2018), and CHFS (2021).
        For entertainment purposes. Probability model assumes independence between variables.
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
