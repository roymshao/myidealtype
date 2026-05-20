import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How the Algorithm Works — My Ideal Type",
  description:
    "The probability model behind My Ideal Type: conditional distributions, Bayesian conditioning on age and heritage, and the real government data sources powering every calculation.",
};

export default function AlgorithmPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition">
            ← Back
          </Link>
          <span className="text-sm font-black text-slate-800">The Method</span>
          <span className="w-16" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-14">

        {/* Hero */}
        <section className="text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            Methodology
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
            The math behind<br />
            <span className="italic text-slate-500">your number</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Every percentage you see is the output of a conditional probability model built on
            government census microdata — not surveys, not vibes, not crowd-sourced guesses.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-700 transition"
          >
            Try the calculator →
          </Link>
        </section>

        <Divider />

        {/* Data Sources */}
        <section className="space-y-6">
          <SectionLabel>The data</SectionLabel>
          <h2 className="text-2xl font-black text-slate-900">
            Primary sources — not proxies
          </h2>
          <p className="text-slate-600">
            Every statistical claim in this tool traces back to a public government dataset.
            No third-party polls. No app self-reports. The raw microdata is processed once,
            compiled into lookup tables, and served statically — so every calculation runs
            in your browser in milliseconds with no external API calls.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <SourceCard
              flag="🇺🇸"
              label="US Census Bureau — ACS 5-Year (2022)"
              detail="Age, income, marital status, education, nativity, and heritage distributions across 330M+ Americans. The ACS is the gold standard for US population statistics — it covers 3.5 million households per year."
            />
            <SourceCard
              flag="🏥"
              label="CDC NHANES (2017–2020)"
              detail="Height and weight distributions measured by trained examiners using calibrated equipment — not self-reported. This is the only nationally representative source for actual physical measurements."
            />
            <SourceCard
              flag="🏦"
              label="Federal Reserve SCF (2022)"
              detail="Survey of Consumer Finances — the definitive source for US wealth distributions. Conducted every 3 years with oversampling of wealthy households to accurately capture the top tail."
            />
            <SourceCard
              flag="📊"
              label="International: Statistics Korea, Statistics Bureau Japan, NBS China, ONS UK, Destatis, INSEE, CBS, INE, ISTAT, SCB, GUS"
              detail="Country-specific equivalents covering height (NCD-RisC 2016 global study), income (Eurostat LCS), and wealth (ECB Household Finance and Consumption Survey 2021)."
            />
          </div>
        </section>

        <Divider />

        {/* The Model */}
        <section className="space-y-6">
          <SectionLabel>The model</SectionLabel>
          <h2 className="text-2xl font-black text-slate-900">
            Conditional independence — and when we break it
          </h2>
          <p className="text-slate-600">
            The core calculation is a product of marginal probabilities across each criterion.
            If you require someone who is in the top 15% for height, the top 20% for income,
            and has never been married, the naive estimate is:
          </p>
          <div className="rounded-xl bg-slate-900 text-slate-100 px-6 py-5 font-mono text-sm overflow-x-auto">
            <p className="text-slate-400 mb-2">// Naïve independence assumption:</p>
            <p>P(match) = P(height) × P(income) × P(never_married) × …</p>
          </div>
          <p className="text-slate-600">
            This is the same approach used by every competitor tool. It works as a first approximation
            but misses the real structure of the data — people's traits are correlated with each other.
            We partially correct for this in three places.
          </p>

          <div className="space-y-5">
            <ConditionalCard
              number="01"
              title="Age-conditional distributions"
              detail="Relationship status, income, and net worth all shift dramatically with age. A 23-year-old who has 'never been married' is totally unremarkable; a 42-year-old is relatively rare. Rather than applying a flat national marriage rate, we decompose the user's age range into six age buckets and apply bucket-specific rates, then take a population-weighted average across buckets."
              formula="P(never_married) = Σ_bucket  P(age in bucket) × P(never_married | age bucket)"
            />
            <ConditionalCard
              number="02"
              title="Heritage-conditional physical and economic traits"
              detail="Height, weight, income, wealth, and education distributions differ substantially across ancestral groups — not because of any inherent ranking, but because immigration selection effects, geographic concentration, and historical context all shift the distribution. When a heritage preference is selected, we replace the national Gaussian height parameters and income/wealth multipliers with group-specific ones derived from CDC NHANES and ACS microdata."
              formula="P(height ≥ h | Korean heritage) ≠ P(height ≥ h | national average)"
            />
            <ConditionalCard
              number="03"
              title="Heritage-conditional nativity"
              detail="This is where most tools go wrong. If someone selects 'East Asian heritage' and 'locally born only', a naïve model multiplies P(East Asian) × P(native_born_nationally) ≈ 0.006 × 0.87. But P(native_born | East Asian) ≈ 0.42 — less than half the overall rate. Treating it otherwise overestimates the locally-born East Asian pool by more than 2×. We apply heritage-group-specific nativity rates drawn from ACS nativity-by-ancestry tables."
              formula="P(native_born | heritage group) — not P(native_born) × P(heritage)"
            />
            <ConditionalCard
              number="04"
              title="Education–income joint probability"
              detail="If you filter for 'bachelor's degree or higher' AND a minimum income, the two are not independent — educated people earn more. Multiplying P(bachelor's+) × P(income ≥ X) would overstate the rarity. Instead, when both filters are active, we use P(income ≥ X | education level, age) via an education income-ratio multiplier, and report P(bachelor's+ | age) separately. Together they yield the correct joint P(edu ∩ income | age)."
              formula="P(edu) × P(income | edu, age) — not P(edu) × P(income)"
            />
          </div>
        </section>

        <Divider />

        {/* Height */}
        <section className="space-y-4">
          <SectionLabel>Physical traits</SectionLabel>
          <h2 className="text-2xl font-black text-slate-900">
            Height: parametric Gaussian over lookup tables
          </h2>
          <p className="text-slate-600">
            For the general population, height is read from a survival function table
            derived from NHANES measurements. When a specific heritage is selected,
            we switch to a parametric Gaussian with group-specific mean and standard deviation —
            because the group may be too small in the NHANES sample to produce a reliable
            empirical CDF at the tails. A continuity correction of ±0.5 inches is applied
            to account for discrete reporting of height in whole inches.
          </p>
          <div className="rounded-xl bg-slate-100 px-6 py-4 text-sm text-slate-700 font-mono">
            P(h₁ ≤ height ≤ h₂) = Φ((h₂ + 0.5 − μ) / σ) − Φ((h₁ − 0.5 − μ) / σ)
          </div>
          <p className="text-slate-500 text-sm">
            Erf computed via the Abramowitz & Stegun polynomial approximation (max error 1.5 × 10⁻⁷).
          </p>
        </section>

        <Divider />

        {/* Income & wealth */}
        <section className="space-y-4">
          <SectionLabel>Economic traits</SectionLabel>
          <h2 className="text-2xl font-black text-slate-900">
            Income and wealth: ratio-shifted survival functions
          </h2>
          <p className="text-slate-600">
            Raw income and wealth distributions are stored as empirical survival functions —
            P(income ≥ X) at discrete dollar thresholds. To condition on age, heritage, education,
            or city, we apply a multiplicative ratio to the <em>threshold</em> rather than to the
            probability, which is equivalent to a location shift in log-space and preserves the
            shape of the distribution.
          </p>
          <div className="rounded-xl bg-slate-100 px-6 py-4 text-sm text-slate-700 font-mono space-y-1">
            <p>adjusted_threshold = raw_threshold / ratio</p>
            <p>P(income ≥ X | age, edu, city) = survival_fn(X / (age_ratio × edu_ratio × city_ratio))</p>
          </div>
          <p className="text-slate-600">
            City wealth is dampened relative to city income using a 0.75 exponent — because
            high-cost cities consume the income premium through housing, so high earners in
            San Francisco don't accumulate proportionally more wealth than their Dallas counterparts.
          </p>
        </section>

        <Divider />

        {/* Attractiveness */}
        <section className="space-y-4">
          <SectionLabel>Attractiveness</SectionLabel>
          <h2 className="text-2xl font-black text-slate-900">
            Looks: a uniform percentile model
          </h2>
          <p className="text-slate-600">
            Attractiveness is not measurable from government data. We model it as a uniform
            distribution across [0, 100] percentiles. Selecting "Top 15%" means
            P(looks qualifies) = 0.15. This is the one place where the model is deliberately
            simple — because no dataset exists that would let us do better. We trust users
            to self-calibrate this slider based on their own honest assessment.
          </p>
          <p className="text-slate-500 text-sm italic">
            Peer-reviewed literature suggests that people reliably overestimate their own
            attractiveness by roughly one standard deviation — take that as you will.
          </p>
        </section>

        <Divider />

        {/* Grade scale */}
        <section className="space-y-5">
          <SectionLabel>Grading</SectionLabel>
          <h2 className="text-2xl font-black text-slate-900">
            The grade scale
          </h2>
          <p className="text-slate-600">
            The final probability is mapped to a letter grade based on how rare your match is
            within the total adult population of the target sex.
          </p>
          <div className="space-y-2">
            {[
              { grade: "Realistic", range: "≥ 20% of population", color: "#16a34a", note: "One in five people qualifies. You'll find them without much difficulty." },
              { grade: "Selective", range: "5–20%", color: "#ca8a04", note: "One in 5–20. More effort required, but a healthy dating pool remains." },
              { grade: "Very Selective", range: "1–5%", color: "#ea580c", note: "One in 20–100. You're in the territory where luck plays a meaningful role." },
              { grade: "Elite", range: "0.1–1%", color: "#dc2626", note: "One in 100–1,000. They exist — statistically all of them could fit in a stadium." },
              { grade: "Delusional", range: "< 0.1%", color: "#7c3aed", note: "Fewer than one in 1,000. The math has concerns." },
            ].map(({ grade, range, color, note }) => (
              <div key={grade} className="flex gap-4 items-start rounded-xl border border-slate-200 bg-white px-4 py-3">
                <span className="shrink-0 mt-0.5 rounded-full px-2.5 py-0.5 text-xs font-bold text-white" style={{ background: color }}>{grade}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{range}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* Limitations */}
        <section className="space-y-4">
          <SectionLabel>Transparency</SectionLabel>
          <h2 className="text-2xl font-black text-slate-900">
            What we don't model — and why
          </h2>
          <div className="space-y-3 text-slate-600">
            <LimitationRow
              title="Remaining correlations between traits"
              body="Height and weight are correlated (taller people weigh more on average). Income and wealth are correlated (r ≈ 0.65). Attractiveness and income are correlated (the 'beauty premium' is approximately 10–15% in wage data). We condition on several of these but not all — a fully joint multivariate model would require microdata with every variable measured on the same individual, which no single public dataset provides."
            />
            <LimitationRow
              title="Geographic heterogeneity beyond city income"
              body="We adjust income and wealth thresholds for the selected city, but we don't yet adjust height or weight distributions by region (which do vary slightly), or relationship status by metro area (cities skew younger and more single)."
            />
            <LimitationRow
              title="Dating pool, not total population"
              body="We estimate the share of the total adult population meeting your criteria. The actual singles dating market is a subset of this — it excludes people in relationships, people not actively dating, and people outside your geography. The true number of findable matches is lower. We show a floor, not a ceiling."
            />
            <LimitationRow
              title="Attractiveness measurement"
              body="There is no validated, large-scale measurement of physical attractiveness distributions. Our uniform model is an acknowledged simplification."
            />
          </div>
        </section>

        <Divider />

        {/* CTA */}
        <section className="text-center space-y-4 pb-8">
          <h2 className="text-2xl font-black text-slate-900">Run the numbers</h2>
          <p className="text-slate-500">Now that you know how it works, let the math tell you something true.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/female"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-7 py-3 text-sm font-bold text-white hover:bg-rose-700 transition"
            >
              Men: check your standards →
            </Link>
            <Link
              href="/male"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-700 px-7 py-3 text-sm font-bold text-white hover:bg-blue-800 transition"
            >
              Women: check your standards →
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}

function Divider() {
  return <hr className="border-slate-200" />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">{children}</p>
  );
}

function SourceCard({ flag, label, detail }: { flag: string; label: string; detail: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1.5">
      <p className="text-base">{flag}</p>
      <p className="text-sm font-bold text-slate-800">{label}</p>
      <p className="text-xs text-slate-500 leading-relaxed">{detail}</p>
    </div>
  );
}

function ConditionalCard({
  number, title, detail, formula,
}: {
  number: string; title: string; detail: string; formula: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-xs font-black text-slate-300">{number}</span>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{detail}</p>
      <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-2.5 font-mono text-xs text-slate-700">
        {formula}
      </div>
    </div>
  );
}

function LimitationRow({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
      <p className="text-sm font-bold text-slate-800">{title}</p>
      <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
    </div>
  );
}
