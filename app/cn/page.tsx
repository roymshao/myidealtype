import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "配对计算器 — 你的择偶标准现实吗？",
  description: "全中国有多少人符合你的择偶标准？基于国家统计局、CHNS、CHFS 真实数据计算。",
};

export default function ChinaHomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 bg-slate-50">
      <div className="text-center max-w-2xl w-full">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mb-4">
          🇨🇳 中国 · 国家统计局 + CHNS + CHFS 数据
        </p>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-4">
          全中国，有多少人{" "}
          <span className="italic text-slate-500">符合你的标准？</span>
        </h1>
        <p className="text-base text-slate-500 mb-2 italic">
          How realistic are your dating standards in China?
        </p>
        <p className="text-lg text-slate-600 mb-10">
          真实数据 · 身高、收入、体重、颜值、独生子女、体制内……
          <br />
          不猜测，只算数。
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <Link
            href="/cn/female"
            className="group relative flex flex-col items-center rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 w-full sm:w-64 min-h-[220px]"
            style={{
              background: "repeating-linear-gradient(45deg, #9f1239, #9f1239 12px, #881337 12px, #881337 24px)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
            <div className="relative flex flex-col items-center justify-center h-full py-10 px-6 gap-3">
              <span className="text-5xl drop-shadow-lg">👩</span>
              <span className="text-2xl font-black text-white drop-shadow">我是女生</span>
              <span className="text-sm font-medium text-rose-200">寻找男性 →</span>
              <div className="mt-2 rounded-full border border-rose-300/50 bg-white/10 backdrop-blur px-4 py-1.5 text-xs font-semibold text-white">
                男性标准计算器
              </div>
            </div>
          </Link>

          <Link
            href="/cn/male"
            className="group relative flex flex-col items-center rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 w-full sm:w-64 min-h-[220px]"
            style={{
              background: "repeating-linear-gradient(-45deg, #1e3a8a, #1e3a8a 12px, #1e40af 12px, #1e40af 24px)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
            <div className="relative flex flex-col items-center justify-center h-full py-10 px-6 gap-3">
              <span className="text-5xl drop-shadow-lg">👨</span>
              <span className="text-2xl font-black text-white drop-shadow">我是男生</span>
              <span className="text-sm font-medium text-blue-200">寻找女性 →</span>
              <div className="mt-2 rounded-full border border-blue-300/50 bg-white/10 backdrop-blur px-4 py-1.5 text-xs font-semibold text-white">
                女性标准计算器
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-10">
          <Link href="/?country=us" className="text-sm text-slate-400 hover:text-slate-600 transition underline">
            ← 切换到美国版
          </Link>
        </div>
      </div>

      <div className="mt-16 flex flex-wrap justify-center gap-8 text-center">
        <Stat value="4.75亿" label="已分析中国男性" />
        <Stat value="4.55亿" label="已分析中国女性" />
        <Stat value="22" label="主要城市" />
        <Stat value="真实数据" label="统计局 · CHNS · CHFS" />
      </div>

      <footer className="mt-14 text-xs text-slate-400 text-center max-w-md leading-relaxed">
        数据来源：国家统计局2022年人口普查、中国健康与营养调查（CHNS）2018年、
        中国家庭金融调查（CHFS）2021年。收入与财富均以美元等值计算（按7.0汇率换算）。
        仅供娱乐，概率模型假设各变量独立。
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
