"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  calculate,
  type GenderStats,
  type Criteria,
  type ProbabilityResult,
  MAX_HEIGHT_MALE,
  MAX_HEIGHT_FEMALE,
  MAX_WEIGHT_MALE,
  MAX_WEIGHT_FEMALE,
} from "@/lib/probability";
import {
  formatHeight,
  formatHeightCm,
  formatWeight,
  formatWeightKg,
  formatIncome,
  formatIncomeRange,
  formatNetWorth,
  formatNetWorthRange,
  formatLooks,
  INCOME_STEPS,
  NET_WORTH_STEPS,
  HEIGHT_MARKS_MALE,
  HEIGHT_MARKS_FEMALE,
  HEIGHT_MARKS_MALE_METRIC,
  HEIGHT_MARKS_FEMALE_METRIC,
  RELATIONSHIP_OPTIONS,
} from "@/lib/formatters";
import { t, defaultLang, LANG_TOGGLE_LABEL, type Lang } from "@/lib/i18n";
import RangeSlider from "./RangeSlider";
import HeritageFilter from "./HeritageFilter";
import ResultDisplay from "./ResultDisplay";
import AdBanner from "./AdBanner";
import citiesData from "@/data/cities.json";

interface City {
  id: string; name: string; state: string; aliases: string[];
  pop_female: number; pop_male: number; income_ratio?: number;
}
const DEFAULT_CITIES = citiesData as City[];

interface CalculatorFormProps {
  stats: GenderStats;
  seekerGender: "male" | "female";
  defaultCriteria: Criteria;
  country?: string;
  citiesData?: City[];
}

const ACCENT: Record<string, string> = { male: "#ec4899", female: "#3b82f6" };

function nearestStep(val: number, steps: number[]): number {
  return steps.reduce((best, v) => Math.abs(v - val) < Math.abs(best - val) ? v : best, steps[0]);
}

const TICKER_KEY: Record<string, Record<string, string>> = {
  male:   { us: "ticker_women_us", kr: "ticker_women_kr", jp: "ticker_women_jp", cn: "ticker_women_cn",
            uk: "ticker_women_uk", de: "ticker_women_de", fr: "ticker_women_fr", nl: "ticker_women_nl",
            es: "ticker_women_es", it: "ticker_women_it", se: "ticker_women_se", pl: "ticker_women_pl" },
  female: { us: "ticker_men_us",   kr: "ticker_men_kr",   jp: "ticker_men_jp",   cn: "ticker_men_cn",
            uk: "ticker_men_uk",   de: "ticker_men_de",   fr: "ticker_men_fr",   nl: "ticker_men_nl",
            es: "ticker_men_es",   it: "ticker_men_it",   se: "ticker_men_se",   pl: "ticker_men_pl" },
};

const NATIVE_BORN_LABEL: Record<string, string> = {
  us: "US-born only", kr: "Korea-born only", jp: "Japan-born only", cn: "China-born only",
  uk: "UK-born only", de: "Germany-born only", fr: "France-born only", nl: "Netherlands-born only",
  es: "Spain-born only", it: "Italy-born only", se: "Sweden-born only", pl: "Poland-born only",
};

export default function CalculatorForm({
  stats, seekerGender, defaultCriteria, country = "us", citiesData: citiesDataProp,
}: CalculatorFormProps) {
  const storageKey = `mate_calc_${country}_${seekerGender}`;

  const [criteria, setCriteria] = useState<Criteria>(() => {
    if (typeof window === "undefined") return defaultCriteria;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return { ...defaultCriteria, ...JSON.parse(saved) };
    } catch {}
    return defaultCriteria;
  });

  const [lang, setLang] = useState<Lang>(() => defaultLang(country));
  const [showResults, setShowResults] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [cityInput, setCityInput] = useState("");

  // Persist criteria to localStorage whenever it changes
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(criteria)); } catch {}
  }, [criteria, storageKey]);

  // Restore city selection from saved cityId on mount
  useEffect(() => {
    const savedId = criteria.cityId;
    if (savedId) {
      const city = activeCities.find((c) => c.id === savedId);
      if (city) {
        setSelectedCity(city);
        setCityInput(`${city.name}, ${city.state}`);
      }
    }
    // intentionally run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFemaleSeeking = seekerGender === "female";
  const useMetric = country !== "us";
  const maxH = isFemaleSeeking ? MAX_HEIGHT_MALE : MAX_HEIGHT_FEMALE;
  const maxW = isFemaleSeeking ? MAX_WEIGHT_MALE : MAX_WEIGHT_FEMALE;
  const heightMarks = useMetric
    ? (isFemaleSeeking ? HEIGHT_MARKS_MALE_METRIC : HEIGHT_MARKS_FEMALE_METRIC)
    : (isFemaleSeeking ? HEIGHT_MARKS_MALE : HEIGHT_MARKS_FEMALE);
  const minH = heightMarks[0].in;
  const minW = useMetric ? (isFemaleSeeking ? 88 : 77) : (isFemaleSeeking ? 90 : 70);
  const accent = ACCENT[seekerGender];
  const activeCities = citiesDataProp ?? DEFAULT_CITIES;
  const fmtHeight = useMetric ? formatHeightCm : formatHeight;
  const fmtWeight = useMetric
    ? (v: number) => formatWeightKg(v, maxW)
    : (v: number) => formatWeight(v, maxW);
  const weightLabels = useMetric
    ? (isFemaleSeeking ? ["45kg", "70kg", "100kg", "130kg", "No max"] : ["35kg", "55kg", "80kg", "105kg", "No max"])
    : (isFemaleSeeking ? ["90", "150", "210", "280", "No max"] : ["70", "120", "175", "240", "No max"]);

  // Distance: KM for non-US (max 200km), miles for US (max 100mi)
  const distUnit = useMetric ? "km" : "mi";
  const distMax = useMetric ? 200 : 100;
  const distStep = useMetric ? 10 : 5;

  const localPop = useMemo(
    () => selectedCity ? (isFemaleSeeking ? selectedCity.pop_male : selectedCity.pop_female) : null,
    [selectedCity, isFemaleSeeking],
  );

  const cityIncomeRatio = selectedCity?.income_ratio ?? 1.0;

  const liveResult: ProbabilityResult = useMemo(
    () => calculate(criteria, stats, localPop, maxH, maxW, cityIncomeRatio),
    [criteria, stats, localPop, maxH, maxW, cityIncomeRatio],
  );

  // Keep a ref to liveResult so handleCalculate always logs the current result
  // without needing liveResult in its dependency array (which would re-create on every slider move).
  const liveResultRef = useRef(liveResult);
  liveResultRef.current = liveResult;

  const set = useCallback(<K extends keyof Criteria>(key: K, value: Criteria[K]) => {
    setCriteria((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleCityInput = useCallback((val: string) => {
    setCityInput(val);
    const lower = val.toLowerCase().trim();
    if (!lower) { setSelectedCity(null); set("cityId", null); return; }
    const match = activeCities.find(
      (c) =>
        c.name.toLowerCase() === lower ||
        `${c.name.toLowerCase()}, ${c.state.toLowerCase()}` === lower ||
        c.aliases.some((a) => a.toLowerCase() === lower),
    );
    setSelectedCity(match ?? null);
    set("cityId", match?.id ?? null);
  }, [set, activeCities]);

  // Fire-and-forget session log. Never blocks the UI; silently ignores errors.
  const fireLog = useCallback((result: ProbabilityResult) => {
    try {
      let sessionToken = localStorage.getItem("mate_calc_session_token");
      if (!sessionToken) {
        sessionToken = crypto.randomUUID();
        localStorage.setItem("mate_calc_session_token", sessionToken);
      }
      fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken,
          country,
          seekerGender,
          criteria,
          result: {
            probability: result.probability,
            grade: result.grade,
            estimatedCount: result.estimatedCount,
            localCount: result.localCount,
          },
          cityId: selectedCity?.id ?? null,
          cityName: selectedCity?.name ?? null,
          cityIncomeRatio,
        }),
      }).catch(() => {});
    } catch {}
  }, [country, seekerGender, criteria, selectedCity, cityIncomeRatio]);

  const handleCalculate = useCallback(() => {
    setCalculating(true);
    setTimeout(() => {
      setCalculating(false);
      setShowResults(true);
      setTimeout(() => document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" }), 50);
      fireLog(liveResultRef.current);
    }, 1800);
  }, [fireLog]);

  const handleSwitchCity = useCallback((city: City | null) => {
    setSelectedCity(city);
    setCityInput(city ? `${city.name}, ${city.state}` : "");
    set("cityId", city?.id ?? null);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  }, [set]);

  const incomeMinIdx = INCOME_STEPS.indexOf(nearestStep(criteria.minIncomeK, INCOME_STEPS));
  const incomeMaxIdx = INCOME_STEPS.indexOf(nearestStep(criteria.maxIncomeK, INCOME_STEPS));
  const wealthMinIdx = NET_WORTH_STEPS.indexOf(nearestStep(criteria.minNetWorthK, NET_WORTH_STEPS));
  const wealthMaxIdx = NET_WORTH_STEPS.indexOf(nearestStep(criteria.maxNetWorthK, NET_WORTH_STEPS));

  function toggleRelationship(key: string) {
    const current = criteria.relationship;
    const next = current.includes(key) ? current.filter((r) => r !== key) : [...current, key];
    set("relationship", next);
  }

  const REL_KEYS = ["never_married", "divorced_no_kids", "divorced_with_kids", "widowed"] as const;

  const nativeBornLabel = lang !== "en"
    ? t("native_born_only", lang)
    : (NATIVE_BORN_LABEL[country] ?? "Locally born only");

  const foreignBornPct = Math.round((1 - stats.nativity.native_born) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 pb-28">
      {/* Language toggle for non-US countries that have translations */}
      {country !== "us" && LANG_TOGGLE_LABEL[country] && (
        <div className="flex justify-end pt-3 pb-1">
          <button
            onClick={() => setLang((l) => l === "en" ? defaultLang(country) : "en")}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-300 text-slate-500 hover:border-slate-500 hover:text-slate-700 transition"
          >
            {LANG_TOGGLE_LABEL[country]}
          </button>
        </div>
      )}

      {/* Live ticker */}
      <div className="text-center py-8">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
          {t(TICKER_KEY[seekerGender][country], lang)}
        </p>
        <p
          className="text-5xl sm:text-7xl font-black tabular-nums transition-all duration-300"
          style={{ color: liveResult.gradeColor }}
        >
          {liveResult.percentage}
        </p>
        <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
            style={{ background: liveResult.gradeColor + "22", color: liveResult.gradeColor }}
          >
            {liveResult.grade}
          </span>
          {selectedCity && (
            <span className="text-xs text-slate-500">
              · ~{liveResult.localCount?.toLocaleString() ?? "?"} in {selectedCity.name}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">

        {/* Location — FIRST, so users anchor context before setting criteria */}
        <Section label={t("location", lang)} accent={accent}>
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text" list="cities-list" value={cityInput}
                onChange={(e) => handleCityInput(e.target.value)}
                placeholder={t("city_placeholder", lang)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 transition"
              />
              <datalist id="cities-list">
                {activeCities.map((c) => <option key={c.id} value={`${c.name}, ${c.state}`} />)}
                {activeCities.flatMap((c) => c.aliases.map((a) => <option key={`${c.id}-${a}`} value={a} />))}
              </datalist>
              {selectedCity && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{ color: accent }}>✓</span>
              )}
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{t("max_distance", lang)}</span>
                <span className="font-semibold" style={{ color: accent }}>
                  {criteria.maxDistanceMiles} {distUnit}
                </span>
              </div>
              <input
                type="range" min={distStep} max={distMax} step={distStep}
                value={Math.min(criteria.maxDistanceMiles, distMax)}
                onChange={(e) => set("maxDistanceMiles", Number(e.target.value))}
                className="slider-single w-full"
                style={{ "--thumb-color": accent } as React.CSSProperties}
              />
              <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                <span>{distStep}{distUnit}</span>
                <span>{Math.round(distMax / 2)}{distUnit}</span>
                <span>{distMax}{distUnit}</span>
              </div>
            </div>

            {selectedCity && (
              <>
                {liveResult.localCount !== null && (
                  <div className="rounded-lg px-3 py-2 text-sm text-center"
                    style={{ background: accent + "12", color: accent }}>
                    ~{liveResult.localCount.toLocaleString()} {t("local_match", lang).replace("%s", selectedCity.name)}
                  </div>
                )}
                {cityIncomeRatio !== 1.0 && (
                  <p className="text-xs text-slate-400 text-center">
                    📍 {t("city_income_note", lang)}
                    {" "}({cityIncomeRatio > 1 ? "+" : ""}{Math.round((cityIncomeRatio - 1) * 100)}%)
                  </p>
                )}
              </>
            )}
          </div>
        </Section>

        {/* Age */}
        <Section label={t("age_range", lang)} accent={accent}>
          <RangeSlider
            min={18} max={65} step={1}
            valueMin={criteria.minAge} valueMax={criteria.maxAge}
            accent={accent} formatValue={(v) => `${v} ${t("yrs", lang)}`}
            labels={["18", "30", "40", "50", "65"]}
            onChange={(lo, hi) => setCriteria((p) => ({ ...p, minAge: lo, maxAge: hi }))}
          />
        </Section>

        {/* Height */}
        <Section label={t("height_range", lang)} accent={accent}>
          <RangeSlider
            min={minH} max={maxH} step={1}
            valueMin={criteria.minHeightIn} valueMax={criteria.maxHeightIn}
            accent={accent} formatValue={fmtHeight}
            noMaxSentinel={maxH} noMaxLabel={t("no_max", lang)}
            labels={heightMarks.map((m) => m.label)}
            onChange={(lo, hi) => setCriteria((p) => ({ ...p, minHeightIn: lo, maxHeightIn: hi }))}
          />
        </Section>

        {/* Weight */}
        <Section label={t(useMetric ? "weight_range_kg" : "weight_range_lbs", lang)} accent={accent}>
          <RangeSlider
            min={minW} max={maxW} step={5}
            valueMin={criteria.minWeightLbs} valueMax={criteria.maxWeightLbs}
            accent={accent}
            formatValue={fmtWeight}
            noMaxSentinel={maxW} noMaxLabel={t("no_max", lang)}
            labels={weightLabels}
            onChange={(lo, hi) => setCriteria((p) => ({ ...p, minWeightLbs: lo, maxWeightLbs: hi }))}
          />
        </Section>

        {/* Income */}
        <Section label={t(country === "cn" ? "annual_income_usd" : "annual_income", lang)} accent={accent}>
          <RangeSlider
            min={0} max={INCOME_STEPS.length - 1} step={1}
            valueMin={incomeMinIdx} valueMax={incomeMaxIdx}
            accent={accent}
            formatValue={(i) => {
              if (i === 0) return t("no_min", lang);
              if (i === INCOME_STEPS.length - 1) return "$100M+";
              return formatIncome(INCOME_STEPS[i]);
            }}
            labels={["$0", "$100K", "$1M", "$100M+"]}
            onChange={(lo, hi) => setCriteria((p) => ({
              ...p,
              minIncomeK: INCOME_STEPS[lo],
              maxIncomeK: INCOME_STEPS[hi],
            }))}
          />
          <p className="text-xs text-slate-400 mt-1 text-center">
            {formatIncomeRange(criteria.minIncomeK, criteria.maxIncomeK)}
            {useMetric && (
              <> · {t(country === "cn" ? "usd_equiv" : "usd_equiv", lang)}</>
            )}
          </p>
        </Section>

        {/* Net Worth / Wealth */}
        <Section label={t("net_worth", lang)} accent={accent}>
          <RangeSlider
            min={0} max={NET_WORTH_STEPS.length - 1} step={1}
            valueMin={wealthMinIdx} valueMax={wealthMaxIdx}
            accent={accent}
            formatValue={(i) => {
              if (i === 0) return t("no_min", lang);
              if (i === NET_WORTH_STEPS.length - 1) return "$1B+";
              return formatNetWorth(NET_WORTH_STEPS[i]);
            }}
            noMaxSentinel={NET_WORTH_STEPS.length - 1} noMaxLabel={t("no_max", lang)}
            labels={["None", "$250K", "$1M", "$25M", "$1B+"]}
            onChange={(lo, hi) => setCriteria((p) => ({
              ...p,
              minNetWorthK: NET_WORTH_STEPS[lo],
              maxNetWorthK: NET_WORTH_STEPS[hi],
            }))}
          />
          <p className="text-xs text-slate-400 mt-1 text-center">
            {formatNetWorthRange(criteria.minNetWorthK, criteria.maxNetWorthK, 1000000)}
            {" · "}
            {t("net_worth_note", lang)}
          </p>
        </Section>

        {/* Attractiveness */}
        <Section label={t("attractiveness", lang)} accent={accent}>
          <RangeSlider
            min={1} max={100} step={1}
            valueMin={criteria.minLooksPercentile} valueMax={criteria.maxLooksPercentile}
            accent={accent}
            formatValue={(v) => v >= 100 ? (t("no_max", lang)) : `Top ${v}%`}
            noMaxSentinel={100} noMaxLabel={t("no_max", lang)}
            labels={["Top 1%", "Top 25%", "Top 50%", "Top 75%", "Any"]}
            onChange={(lo, hi) => setCriteria((p) => ({
              ...p,
              minLooksPercentile: lo,
              maxLooksPercentile: hi,
            }))}
          />
          <p className="text-xs text-slate-400 mt-1 text-center">
            {criteria.minLooksPercentile <= 1 && criteria.maxLooksPercentile >= 100
              ? t("looks_no_pref", lang)
              : `${formatLooks(criteria.minLooksPercentile)}${criteria.maxLooksPercentile < 100 ? ` – max top ${criteria.maxLooksPercentile}%` : ""}`}
          </p>
        </Section>

        {/* Relationship History */}
        <Section label={t("relationship", lang)} accent={accent}>
          <p className="text-xs text-slate-500 mb-2">{t("rel_hint_blank", lang)}</p>
          <div className="grid grid-cols-2 gap-2">
            {REL_KEYS.map((key) => (
              <OptionBtn
                key={key}
                active={criteria.relationship.includes(key)}
                accent={accent}
                onClick={() => toggleRelationship(key)}
                label={t(key, lang)}
              />
            ))}
          </div>
          {criteria.relationship.length === 0 && (
            <p className="text-xs text-slate-400 mt-2 text-center">{t("rel_hint_none", lang)}</p>
          )}
        </Section>

        {/* Education */}
        <Section label={t("education", lang)} accent={accent}>
          <div className="grid grid-cols-2 gap-2">
            {(["any", "high_school", "bachelors_plus", "graduate"] as const).map((v) => (
              <OptionBtn key={v} active={criteria.education === v} accent={accent}
                onClick={() => set("education", v)}
                label={t(
                  v === "any" ? "edu_any"
                    : v === "high_school" ? "edu_high_school"
                    : v === "bachelors_plus" ? "edu_bachelors"
                    : "edu_graduate",
                  lang,
                )} />
            ))}
          </div>
        </Section>

        {/* Smoking */}
        <Section label={t("smoking", lang)} accent={accent}>
          <div className="grid grid-cols-2 gap-2">
            <OptionBtn
              active={!criteria.nonSmokerOnly}
              accent={accent}
              onClick={() => set("nonSmokerOnly", false)}
              label={t("smokers_ok", lang)}
            />
            <OptionBtn
              active={criteria.nonSmokerOnly}
              accent={accent}
              onClick={() => set("nonSmokerOnly", true)}
              label={t("non_smokers_only", lang)}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            ~{Math.round((1 - stats.lifestyle.non_smoker) * 100)}%{" "}
            {t(seekerGender === "male" ? "smoke_stat_female" : "smoke_stat_male", lang)}
          </p>
        </Section>

        {/* Only Child — CN only */}
        {country === "cn" && (
          <Section label="独生子女状况" accent={accent}>
            <div className="grid grid-cols-3 gap-2">
              {(["any", "only_child", "has_siblings"] as const).map((v) => (
                <OptionBtn key={v} active={(criteria.cnOnlyChild ?? "any") === v} accent={accent}
                  onClick={() => set("cnOnlyChild", v)}
                  label={v === "any" ? "不限" : v === "only_child" ? "独生子女" : "非独生子女"} />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              约 {Math.round((stats.only_child?.only_child ?? 0.45) * 100)}% 为独生子女（一孩政策1980—2015年）
            </p>
          </Section>
        )}

        {/* Work Sector (体制内) — CN only */}
        {country === "cn" && (
          <Section label="工作性质" accent={accent}>
            <div className="grid grid-cols-3 gap-2">
              {(["any", "tizhinei", "non_tizhinei"] as const).map((v) => (
                <OptionBtn key={v} active={(criteria.cnTizhinei ?? "any") === v} accent={accent}
                  onClick={() => set("cnTizhinei", v)}
                  label={v === "any" ? "不限" : v === "tizhinei" ? "体制内" : "体制外"} />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              体制内：政府机关、国有企业、公立学校、医院等。约 {Math.round((stats.work_sector?.tizhinei ?? 0.22) * 100)}% 在体制内
            </p>
          </Section>
        )}

        {/* Heritage — US only */}
        {!useMetric && (
          <Section label="Heritage / Country of Origin" accent={accent}>
            <p className="text-xs text-slate-500 mb-2">
              Based on US Census ACS ancestry data. Proportions may overlap for multi-heritage individuals.
            </p>
            <HeritageFilter
              selected={criteria.heritages}
              accent={accent}
              onChange={(h) => set("heritages", h)}
            />
          </Section>
        )}

        {/* Immigration — hidden for CN */}
        {country !== "cn" && (
          <Section label={t("immigration", lang)} accent={accent}>
            <div className="grid grid-cols-2 gap-2">
              <OptionBtn active={criteria.acceptsImmigrants} accent={accent}
                onClick={() => set("acceptsImmigrants", true)}
                label={t("open_to_immigrants", lang)} />
              <OptionBtn active={!criteria.acceptsImmigrants} accent={accent}
                onClick={() => set("acceptsImmigrants", false)}
                label={nativeBornLabel} />
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              ~{foreignBornPct}%{" "}
              {t(seekerGender === "male" ? "foreign_born_stat_f" : "foreign_born_stat", lang)}
            </p>
          </Section>
        )}

        <AdBanner slot="REPLACE_INLINE_AD_SLOT" format="horizontal" className="rounded-xl" />

        <div className="flex gap-3">
          <button
            onClick={handleCalculate}
            disabled={calculating}
            className="flex-1 rounded-2xl py-4 text-lg font-black text-white shadow-lg transition-all active:scale-95 disabled:opacity-70"
            style={{ background: accent }}
          >
            {calculating ? t("calculating", lang) : t("calculate", lang)}
          </button>
          <button
            onClick={() => {
              setCriteria(defaultCriteria);
              setSelectedCity(null);
              setCityInput("");
              setShowResults(false);
              try { localStorage.removeItem(storageKey); } catch {}
            }}
            disabled={calculating}
            title="Reset to defaults"
            className="rounded-2xl px-4 py-4 text-sm font-semibold text-slate-500 border border-slate-200 bg-white hover:border-slate-400 hover:text-slate-700 transition-all active:scale-95 disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </div>

      {calculating && (
        <div className="mt-8 flex flex-col items-center gap-4 py-8">
          <div className="h-10 w-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: accent + "44", borderTopColor: accent }} />
          <p className="text-slate-500 text-sm font-medium">{t("scanning", lang)}</p>
          <p className="text-xs text-slate-400">{t("data_sources", lang)}</p>
          <div className="w-full max-w-sm mt-2">
            <AdBanner slot="REPLACE_INTERSTITIAL_AD_SLOT" format="rectangle" className="rounded-xl" />
          </div>
        </div>
      )}

      {showResults && !calculating && (
        <div id="results-section" className="mt-10">
          <h2 className="text-xl font-bold text-slate-800 mb-4">{t("your_results", lang)}</h2>
          <ResultDisplay
            result={liveResult} criteria={criteria} seekerGender={seekerGender}
            selectedCity={selectedCity ? `${selectedCity.name}, ${selectedCity.state}` : null}
            cities={activeCities}
            stats={stats}
            maxH={maxH}
            maxW={maxW}
            onSwitchCity={handleSwitchCity}
          />
        </div>
      )}

      <div className="sticky-bottom-bar fixed bottom-0 left-0 right-0 flex justify-center bg-white/95 backdrop-blur border-t border-slate-200 shadow-md z-50 p-1">
        <AdBanner slot="REPLACE_STICKY_AD_SLOT" format="horizontal" className="max-w-sm w-full" />
      </div>
    </div>
  );
}

function Section({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-700 mb-3"
        style={{ borderLeft: `3px solid ${accent}`, paddingLeft: "8px" }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function OptionBtn({ active, accent, onClick, label }: {
  active: boolean; accent: string; onClick: () => void; label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border px-3 py-2 text-sm font-medium transition-all text-left"
      style={
        active
          ? { borderColor: accent, background: accent + "15", color: accent }
          : { borderColor: "#e2e8f0", background: "white", color: "#475569" }
      }
    >
      {label}
    </button>
  );
}
