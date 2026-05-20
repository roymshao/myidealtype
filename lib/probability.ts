// Age-conditional statistics: P(variable | age bucket)
// Sources: ACS B12001 (relationship), BLS CPS Table 1.1 (income), Census ACS B15002 (education), Fed SCF (wealth)
export interface AgeConditionalData {
  // P(rel_status | age bucket) — replaces flat unconditional rates
  relationship_by_age: Record<string, Record<string, number>>;
  // Multiplier: a person in this age bucket earns this fraction of the overall median
  // P(income >= X | age) ≈ base_survival(X / ratio)
  income_ratio_by_age: Record<string, number>;
  // Multiplier for education level on top of age-conditional income
  // P(income >= X | edu) ≈ base_survival(X / ratio)
  income_ratio_by_edu: Record<string, number>;
  // Multiplier: net worth accumulates with age
  wealth_ratio_by_age: Record<string, number>;
  // P(edu_level | age bucket) — replaces flat unconditional rates
  edu_by_age: Record<string, { any: number; high_school: number; bachelors_plus: number; graduate: number }>;
}

export interface HeritageCorrelationData {
  height_mean_in: number;
  height_sd_in: number;
  income_ratio: number;
  wealth_ratio: number;
  weight_ratio: number;
  edu_bachelors_plus: number;
  edu_graduate: number;
}

export interface GenderStats {
  total_population: number;
  age_cdf: Record<string, number>;
  height_at_least: Record<string, number>;
  weight_cdf: Record<string, number>;
  income_at_least: Record<string, number>;
  wealth_at_least: Record<string, number>;
  relationship: Record<string, number>;
  education: { any: number; high_school: number; bachelors_plus: number; graduate: number };
  nativity: { native_born: number; foreign_born: number };
  heritage: Record<string, number>;
  lifestyle: { non_smoker: number };
  heritage_correlations?: Record<string, HeritageCorrelationData>;
  only_child?: Record<string, number>;
  work_sector?: Record<string, number>;
  age_conditional?: AgeConditionalData;
}

export interface Criteria {
  minAge: number;
  maxAge: number;
  minHeightIn: number;
  maxHeightIn: number;
  minWeightLbs: number;
  maxWeightLbs: number;
  minIncomeK: number;
  maxIncomeK: number;
  minNetWorthK: number;
  maxNetWorthK: number;
  minLooksPercentile: number;
  maxLooksPercentile: number;
  relationship: string[];
  education: "any" | "high_school" | "bachelors_plus" | "graduate";
  heritages: string[];
  nonSmokerOnly: boolean;
  acceptsImmigrants: boolean;
  cityId: string | null;
  maxDistanceMiles: number;
  cnOnlyChild?: "any" | "only_child" | "has_siblings";
  cnTizhinei?: "any" | "tizhinei" | "non_tizhinei";
}

export type Country = "us" | "kr" | "jp" | "cn" | "uk" | "de" | "fr" | "nl" | "es" | "it" | "se" | "pl";

export type Grade = "Realistic" | "Selective" | "Very Selective" | "Elite" | "Delusional";

export interface ProbabilityResult {
  probability: number;
  percentage: string;
  estimatedCount: number;
  localCount: number | null;
  grade: Grade;
  gradeColor: string;
  message: string;
  breakdown: {
    age: number;
    height: number;
    weight: number;
    income: number;
    wealth: number;
    looks: number;
    relationship: number;
    education: number;
    heritage: number;
    nativity: number;
    smoking: number;
    only_child?: number;
    tizhinei?: number;
  };
}

export const MAX_HEIGHT_MALE = 80;
export const MAX_HEIGHT_FEMALE = 75;
export const MAX_WEIGHT_MALE = 400;
export const MAX_WEIGHT_FEMALE = 350;
export const MAX_INCOME_K = 100000;
export const MAX_NETWORTH_K = 1000000;

// ─── Heritage group map ────────────────────────────────────────────────────
// Maps every granular heritage key to a broad correlation group.
// Sources: see DATA_SOURCES.md
const HERITAGE_GROUP_MAP: Record<string, string> = {
  chinese: "east_asian", korean: "east_asian", japanese: "east_asian",
  vietnamese: "east_asian", filipino: "east_asian", thai: "east_asian",
  cambodian: "east_asian", hmong: "east_asian", indonesian: "east_asian",
  other_east_asian: "east_asian",
  indian: "south_asian", pakistani: "south_asian", bangladeshi: "south_asian",
  sri_lankan: "south_asian", nepalese: "south_asian", other_south_asian: "south_asian",
  german: "white", irish: "white", english: "white", italian: "white",
  polish: "white", french: "white", scandinavian: "white", scottish: "white",
  russian: "white", eastern_european: "white", greek: "white",
  portuguese: "white", dutch: "white", other_european: "white",
  african_american: "black", nigerian: "black", ghanaian: "black",
  ethiopian: "black", somali: "black", congolese: "black", kenyan: "black",
  other_african: "black", jamaican: "black", haitian: "black",
  trinidadian: "black", other_caribbean: "black",
  mexican: "hispanic", puerto_rican: "hispanic", cuban: "hispanic",
  dominican: "hispanic", colombian: "hispanic", salvadoran: "hispanic",
  guatemalan: "hispanic", honduran: "hispanic", venezuelan: "hispanic",
  ecuadorian: "hispanic", peruvian: "hispanic", other_latin: "hispanic",
  iranian: "mena", arab: "mena", turkish: "mena",
  israeli: "mena", afghan: "mena", other_mena: "mena",
  native_american: "native",
  pacific_islander: "pacific",
};

// ─── Age bucket helpers ───────────────────────────────────────────────────

// Half-open intervals [lo, hi) so there are no gaps or overlaps between buckets.
// "18-24" means [18, 25), "55-65" means [55, 66) to include age 65 fully.
const AGE_BUCKETS: Array<{ key: string; lo: number; hi: number }> = [
  { key: "18-24", lo: 18, hi: 25 },
  { key: "25-29", lo: 25, hi: 30 },
  { key: "30-34", lo: 30, hi: 35 },
  { key: "35-44", lo: 35, hi: 45 },
  { key: "45-54", lo: 45, hi: 55 },
  { key: "55-65", lo: 55, hi: 66 },
];

// Returns population-weighted fraction of [minAge, maxAge] that falls in each bucket
function getAgeBucketWeights(minAge: number, maxAge: number): Array<{ key: string; w: number }> {
  const span = Math.max(1, maxAge - minAge);
  const result: Array<{ key: string; w: number }> = [];
  for (const b of AGE_BUCKETS) {
    const lo = Math.max(minAge, b.lo);
    const hi = Math.min(maxAge, b.hi);
    if (hi > lo) result.push({ key: b.key, w: (hi - lo) / span });
  }
  return result;
}

// Weighted average of a scalar value across age buckets
function bucketWeightedScalar(
  weights: Array<{ key: string; w: number }>,
  table: Record<string, number>,
  fallback: number,
): number {
  let sum = 0, totalW = 0;
  for (const { key, w } of weights) {
    const v = table[key];
    if (v !== undefined) { sum += v * w; totalW += w; }
  }
  return totalW > 0 ? sum / totalW : fallback;
}

// Weighted average relationship probability across age buckets
function bucketWeightedRelProbability(
  selected: string[],
  weights: Array<{ key: string; w: number }>,
  relByAge: Record<string, Record<string, number>>,
  fallback: Record<string, number>,
): number {
  let sum = 0, totalW = 0;
  for (const { key, w } of weights) {
    const bucketData = relByAge[key];
    if (bucketData) {
      sum += getRelationshipProbability(selected, bucketData) * w;
      totalW += w;
    }
  }
  return totalW > 0 ? sum / totalW : getRelationshipProbability(selected, fallback);
}

// ─── Math helpers ─────────────────────────────────────────────────────────

function lerp(value: number, lookup: Record<string, number>): number {
  const keys = Object.keys(lookup).map(Number).sort((a, b) => a - b);
  if (value <= keys[0]) return lookup[String(keys[0])];
  if (value >= keys[keys.length - 1]) return lookup[String(keys[keys.length - 1])];
  for (let i = 0; i < keys.length - 1; i++) {
    if (value >= keys[i] && value <= keys[i + 1]) {
      const t = (value - keys[i]) / (keys[i + 1] - keys[i]);
      return lookup[String(keys[i])] + t * (lookup[String(keys[i + 1])] - lookup[String(keys[i])]);
    }
  }
  return 0;
}

// Abramowitz & Stegun erf approximation, max error 1.5e-7
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const a = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * a);
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  return sign * (1 - poly * Math.exp(-a * a));
}

function gaussianCDF(x: number, mean: number, sd: number): number {
  return 0.5 * (1 + erf((x - mean) / (sd * Math.SQRT2)));
}

// P(height in [minH, maxH]) using normal distribution with continuity correction
function gaussianRangeProbability(minH: number, maxH: number, mean: number, sd: number, maxSentinel: number): number {
  const pAboveMin = 1 - gaussianCDF(minH - 0.5, mean, sd);
  if (maxH >= maxSentinel) return pAboveMin;
  const pAboveMax = 1 - gaussianCDF(maxH + 0.5, mean, sd);
  return Math.max(0, pAboveMin - pAboveMax);
}

// ─── Heritage correlation helpers ─────────────────────────────────────────

function getWeightedCorrelation(
  selectedHeritages: string[],
  heritageData: Record<string, number>,
  correlations: Record<string, HeritageCorrelationData>,
): HeritageCorrelationData | null {
  if (selectedHeritages.length === 0) return null;

  const groupWeights: Record<string, number> = {};
  let totalWeight = 0;

  for (const h of selectedHeritages) {
    const group = HERITAGE_GROUP_MAP[h];
    if (!group || !correlations[group]) continue;
    const w = heritageData[h] ?? 0.001;
    groupWeights[group] = (groupWeights[group] ?? 0) + w;
    totalWeight += w;
  }

  if (totalWeight === 0) return null;

  const result: HeritageCorrelationData = {
    height_mean_in: 0, height_sd_in: 0,
    income_ratio: 0, wealth_ratio: 0, weight_ratio: 0,
    edu_bachelors_plus: 0, edu_graduate: 0,
  };

  for (const [group, w] of Object.entries(groupWeights)) {
    const c = correlations[group];
    const norm = w / totalWeight;
    result.height_mean_in += c.height_mean_in * norm;
    result.height_sd_in += c.height_sd_in * norm;
    result.income_ratio += c.income_ratio * norm;
    result.wealth_ratio += c.wealth_ratio * norm;
    result.weight_ratio += c.weight_ratio * norm;
    result.edu_bachelors_plus += c.edu_bachelors_plus * norm;
    result.edu_graduate += c.edu_graduate * norm;
  }

  return result;
}

// ─── Probability sub-functions ────────────────────────────────────────────

function getAgeProbability(minAge: number, maxAge: number, cdf: Record<string, number>): number {
  return Math.max(0, lerp(maxAge, cdf) - lerp(minAge, cdf));
}

function getHeightProbability(minH: number, maxH: number, table: Record<string, number>, maxSentinel: number): number {
  const pMin = lerp(minH, table);
  if (maxH >= maxSentinel) return pMin;
  return Math.max(0, pMin - lerp(maxH + 1, table));
}

function getWeightProbability(minW: number, maxW: number, cdf: Record<string, number>, maxSentinel: number): number {
  const cdfMin = lerp(minW, cdf);
  if (maxW >= maxSentinel) return Math.max(0, 1 - cdfMin);
  return Math.max(0, lerp(maxW, cdf) - cdfMin);
}

function getIncomeProbability(minK: number, maxK: number, table: Record<string, number>): number {
  const pMin = lerp(minK * 1000, table);
  if (maxK >= MAX_INCOME_K) return pMin;
  return Math.max(0, pMin - lerp(maxK * 1000, table));
}

function getWealthProbability(minK: number, maxK: number, table: Record<string, number>, sentinel: number): number {
  if (minK === 0 && maxK >= sentinel) return 1.0;
  const pMin = minK === 0 ? 1.0 : lerp(minK * 1000, table);
  if (maxK >= sentinel) return pMin;
  return Math.max(0, pMin - lerp(maxK * 1000, table));
}

function getRelationshipProbability(selected: string[], data: Record<string, number>): number {
  if (selected.length === 0) return data.any ?? 0.50;
  return Math.min(1.0, selected.reduce((sum, r) => sum + (data[r] ?? 0), 0));
}

function getHeritageProbability(selected: string[], data: Record<string, number>): number {
  if (selected.length === 0) return 1.0;
  return Math.min(1.0, selected.reduce((sum, h) => sum + (data[h] ?? 0), 0));
}

function getGrade(p: number): Grade {
  if (p >= 0.20) return "Realistic";
  if (p >= 0.05) return "Selective";
  if (p >= 0.01) return "Very Selective";
  if (p >= 0.001) return "Elite";
  return "Delusional";
}

function getGradeColor(grade: Grade): string {
  const map: Record<Grade, string> = {
    Realistic: "#16a34a",
    Selective: "#ca8a04",
    "Very Selective": "#ea580c",
    Elite: "#dc2626",
    Delusional: "#7c3aed",
  };
  return map[grade];
}

const MESSAGES: Record<Grade, string[]> = {
  Realistic: [
    "You have healthy, achievable standards.",
    "Your pool is large — get out there!",
    "Finding someone who fits this should be very doable.",
  ],
  Selective: [
    "You're particular, but not unreasonably so.",
    "Your ideal person exists — it just takes effort to find them.",
    "Selective, but statistically achievable.",
  ],
  "Very Selective": [
    "Your standards are... ambitious.",
    "This person exists. Whether they want you is a separate question.",
    "You may be waiting a while.",
  ],
  Elite: [
    "You're hunting for a rare specimen.",
    "They exist. All of them could fit in a stadium.",
    "Good luck. Seriously.",
  ],
  Delusional: [
    "Statistically speaking, you may be waiting until the next census.",
    "Have you considered lowering the bar? Just a little?",
    "The math has spoken. The math is concerned.",
  ],
};

function getMessage(grade: Grade): string {
  const options = MESSAGES[grade];
  return options[Math.floor(Math.random() * options.length)];
}

// ─── Main calculation ──────────────────────────────────────────────────────

export function calculate(
  criteria: Criteria,
  stats: GenderStats,
  localPop: number | null,
  maxHeightSentinel: number,
  maxWeightSentinel: number,
  // City income ratio: scales income/wealth thresholds relative to national average.
  // NYC (1.12) means local incomes are 12% above average, so $100K there ≈ $89K nationally.
  cityIncomeRatio: number = 1.0,
): ProbabilityResult {
  // Compute heritage-conditioned correlation weights (null = no specific heritage selected)
  const corr = stats.heritage_correlations && criteria.heritages.length > 0
    ? getWeightedCorrelation(criteria.heritages, stats.heritage, stats.heritage_correlations)
    : null;

  const cond = stats.age_conditional ?? null;

  // Age bucket weights — used to condition relationship, income, wealth, education on the selected age range
  const bucketWeights = getAgeBucketWeights(criteria.minAge, criteria.maxAge);

  const pAge = getAgeProbability(criteria.minAge, criteria.maxAge, stats.age_cdf);

  // Height: use Gaussian with heritage-specific mean/SD when a heritage is selected
  const pHeight = corr
    ? gaussianRangeProbability(criteria.minHeightIn, criteria.maxHeightIn, corr.height_mean_in, corr.height_sd_in, maxHeightSentinel)
    : getHeightProbability(criteria.minHeightIn, criteria.maxHeightIn, stats.height_at_least, maxHeightSentinel);

  // Weight: scale thresholds inversely by heritage weight ratio
  const adjMinW = criteria.minWeightLbs <= 0 ? 0 : criteria.minWeightLbs / (corr?.weight_ratio ?? 1);
  const adjMaxW = criteria.maxWeightLbs >= maxWeightSentinel ? maxWeightSentinel : criteria.maxWeightLbs / (corr?.weight_ratio ?? 1);
  const pWeight = getWeightProbability(adjMinW, adjMaxW, stats.weight_cdf, maxWeightSentinel);

  // Income: combine heritage ratio (if set) with age × education conditional ratios,
  // then further scale by city income ratio (high-income cities have higher local wages).
  let incomeRatio: number;
  if (corr) {
    incomeRatio = corr.income_ratio * cityIncomeRatio;
  } else if (cond) {
    const ageIncRatio = bucketWeightedScalar(bucketWeights, cond.income_ratio_by_age, 1.0);
    const eduIncRatio = criteria.education !== "any" ? (cond.income_ratio_by_edu[criteria.education] ?? 1.0) : 1.0;
    incomeRatio = ageIncRatio * eduIncRatio * cityIncomeRatio;
  } else {
    incomeRatio = cityIncomeRatio;
  }
  const adjMinIncK = criteria.minIncomeK === 0 ? 0 : criteria.minIncomeK / incomeRatio;
  const adjMaxIncK = criteria.maxIncomeK >= MAX_INCOME_K ? MAX_INCOME_K : criteria.maxIncomeK / incomeRatio;
  const pIncome = getIncomeProbability(adjMinIncK, adjMaxIncK, stats.income_at_least);

  // Wealth: city effect on wealth is dampened (Math.pow 0.75) because wealth is less
  // mobile than income — a $250K earner in SF doesn't have proportionally more wealth
  // than one in Dallas due to higher housing costs eating into savings.
  const cityWealthRatio = cityIncomeRatio !== 1.0 ? Math.pow(cityIncomeRatio, 0.75) : 1.0;
  let wealthRatio: number;
  if (corr) {
    wealthRatio = corr.wealth_ratio * cityWealthRatio;
  } else if (cond) {
    wealthRatio = bucketWeightedScalar(bucketWeights, cond.wealth_ratio_by_age, 1.0) * cityWealthRatio;
  } else {
    wealthRatio = cityWealthRatio;
  }
  const adjMinWK = criteria.minNetWorthK === 0 ? 0 : criteria.minNetWorthK / wealthRatio;
  const adjMaxWK = criteria.maxNetWorthK >= MAX_NETWORTH_K ? MAX_NETWORTH_K : criteria.maxNetWorthK / wealthRatio;
  const pWealth = getWealthProbability(adjMinWK, adjMaxWK, stats.wealth_at_least, MAX_NETWORTH_K);

  const pLooks = Math.max(0, criteria.maxLooksPercentile - criteria.minLooksPercentile) / 100;

  // Relationship: use age-conditional rates (P(never_married | age 30) is very different from P(never_married | age 22))
  const pRel = cond?.relationship_by_age
    ? bucketWeightedRelProbability(criteria.relationship, bucketWeights, cond.relationship_by_age, stats.relationship)
    : getRelationshipProbability(criteria.relationship, stats.relationship);

  // Education: heritage > age-conditional > unconditional
  let pEdu: number;
  if (corr && (criteria.education === "bachelors_plus" || criteria.education === "graduate")) {
    pEdu = criteria.education === "bachelors_plus" ? corr.edu_bachelors_plus : corr.edu_graduate;
  } else if (cond?.edu_by_age && criteria.education !== "any") {
    // When both edu filter AND age conditional income ratio are active, pEdu is P(edu | age).
    // pIncome has already been conditioned on edu via incomeRatio above, so together they give
    // P(edu | age) × P(income | edu, age) = P(edu ∩ income | age), avoiding double-counting.
    pEdu = bucketWeightedScalar(
      bucketWeights,
      Object.fromEntries(Object.entries(cond.edu_by_age).map(([k, v]) => [k, v[criteria.education]])),
      stats.education[criteria.education],
    );
  } else {
    pEdu = stats.education[criteria.education];
  }

  const pHeritage = getHeritageProbability(criteria.heritages, stats.heritage);
  const pNativity = criteria.acceptsImmigrants ? 1.0 : stats.nativity.native_born;
  const pSmoking = criteria.nonSmokerOnly ? stats.lifestyle.non_smoker : 1.0;

  const cnOnlyChildKey = criteria.cnOnlyChild ?? "any";
  const pOnlyChild = cnOnlyChildKey !== "any" && stats.only_child
    ? (stats.only_child[cnOnlyChildKey] ?? 1.0)
    : 1.0;

  const cnTizhineiKey = criteria.cnTizhinei ?? "any";
  const pTizhinei = cnTizhineiKey !== "any" && stats.work_sector
    ? (stats.work_sector[cnTizhineiKey] ?? 1.0)
    : 1.0;

  const probability = pAge * pHeight * pWeight * pIncome * pWealth * pLooks * pRel * pEdu * pHeritage * pNativity * pSmoking * pOnlyChild * pTizhinei;
  const estimatedCount = Math.round(stats.total_population * probability);
  const localCount = localPop !== null ? Math.round(localPop * probability) : null;

  const grade = getGrade(probability);
  const pct = probability * 100;
  const percentage =
    pct >= 1 ? `${pct.toFixed(1)}%` : pct >= 0.01 ? `${pct.toFixed(2)}%` : `${pct.toFixed(3)}%`;

  return {
    probability,
    percentage,
    estimatedCount,
    localCount,
    grade,
    gradeColor: getGradeColor(grade),
    message: getMessage(grade),
    breakdown: {
      age: pAge,
      height: pHeight,
      weight: pWeight,
      income: pIncome,
      wealth: pWealth,
      looks: pLooks,
      relationship: pRel,
      education: pEdu,
      heritage: pHeritage,
      nativity: pNativity,
      smoking: pSmoking,
      ...(pOnlyChild < 1.0 ? { only_child: pOnlyChild } : {}),
      ...(pTizhinei < 1.0 ? { tizhinei: pTizhinei } : {}),
    },
  };
}

// ─── Default criteria ─────────────────────────────────────────────────────

export const DEFAULT_MALE_CRITERIA: Criteria = {
  minAge: 25, maxAge: 40,
  minHeightIn: 70, maxHeightIn: 80,
  minWeightLbs: 140, maxWeightLbs: 400,
  minIncomeK: 75, maxIncomeK: 100000,
  minNetWorthK: 0, maxNetWorthK: 1000000,
  minLooksPercentile: 50, maxLooksPercentile: 100,
  relationship: [],
  education: "any",
  heritages: [],
  nonSmokerOnly: false,
  acceptsImmigrants: true,
  cityId: null, maxDistanceMiles: 50,
};

export const DEFAULT_FEMALE_CRITERIA: Criteria = {
  minAge: 22, maxAge: 35,
  minHeightIn: 62, maxHeightIn: 75,
  minWeightLbs: 100, maxWeightLbs: 350,
  minIncomeK: 0, maxIncomeK: 100000,
  minNetWorthK: 0, maxNetWorthK: 1000000,
  minLooksPercentile: 50, maxLooksPercentile: 100,
  relationship: [],
  education: "any",
  heritages: [],
  nonSmokerOnly: false,
  acceptsImmigrants: true,
  cityId: null, maxDistanceMiles: 50,
};

export const DEFAULT_MALE_CRITERIA_KR: Criteria = {
  minAge: 23, maxAge: 32,
  minHeightIn: 63, maxHeightIn: 76,
  minWeightLbs: 88, maxWeightLbs: 275,
  minIncomeK: 35, maxIncomeK: 100000,
  minNetWorthK: 0, maxNetWorthK: 1000000,
  minLooksPercentile: 50, maxLooksPercentile: 100,
  relationship: [],
  education: "any",
  heritages: [],
  nonSmokerOnly: false,
  acceptsImmigrants: true,
  cityId: null, maxDistanceMiles: 50,
};

export const DEFAULT_FEMALE_CRITERIA_KR: Criteria = {
  minAge: 22, maxAge: 30,
  minHeightIn: 63, maxHeightIn: 76,
  minWeightLbs: 99, maxWeightLbs: 198,
  minIncomeK: 25, maxIncomeK: 100000,
  minNetWorthK: 0, maxNetWorthK: 1000000,
  minLooksPercentile: 50, maxLooksPercentile: 100,
  relationship: [],
  education: "any",
  heritages: [],
  nonSmokerOnly: false,
  acceptsImmigrants: true,
  cityId: null, maxDistanceMiles: 50,
};

export const DEFAULT_MALE_CRITERIA_JP: Criteria = {
  minAge: 23, maxAge: 32,
  minHeightIn: 63, maxHeightIn: 76,
  minWeightLbs: 88, maxWeightLbs: 242,
  minIncomeK: 35, maxIncomeK: 100000,
  minNetWorthK: 0, maxNetWorthK: 1000000,
  minLooksPercentile: 50, maxLooksPercentile: 100,
  relationship: [],
  education: "any",
  heritages: [],
  nonSmokerOnly: false,
  acceptsImmigrants: true,
  cityId: null, maxDistanceMiles: 50,
};

export const DEFAULT_FEMALE_CRITERIA_JP: Criteria = {
  minAge: 22, maxAge: 30,
  minHeightIn: 63, maxHeightIn: 76,
  minWeightLbs: 88, maxWeightLbs: 176,
  minIncomeK: 25, maxIncomeK: 100000,
  minNetWorthK: 0, maxNetWorthK: 1000000,
  minLooksPercentile: 50, maxLooksPercentile: 100,
  relationship: [],
  education: "any",
  heritages: [],
  nonSmokerOnly: false,
  acceptsImmigrants: true,
  cityId: null, maxDistanceMiles: 50,
};

export const DEFAULT_MALE_CRITERIA_CN: Criteria = {
  minAge: 22, maxAge: 32,
  minHeightIn: 61, maxHeightIn: 75,
  minWeightLbs: 88, maxWeightLbs: 242,
  minIncomeK: 20, maxIncomeK: 100000,
  minNetWorthK: 0, maxNetWorthK: 1000000,
  minLooksPercentile: 50, maxLooksPercentile: 100,
  relationship: [],
  education: "any",
  heritages: [],
  nonSmokerOnly: false,
  acceptsImmigrants: true,
  cityId: null, maxDistanceMiles: 50,
  cnOnlyChild: "any",
  cnTizhinei: "any",
};

export const DEFAULT_FEMALE_CRITERIA_CN: Criteria = {
  minAge: 23, maxAge: 33,
  minHeightIn: 67, maxHeightIn: 80,
  minWeightLbs: 110, maxWeightLbs: 264,
  minIncomeK: 30, maxIncomeK: 100000,
  minNetWorthK: 0, maxNetWorthK: 1000000,
  minLooksPercentile: 50, maxLooksPercentile: 100,
  relationship: [],
  education: "any",
  heritages: [],
  nonSmokerOnly: false,
  acceptsImmigrants: true,
  cityId: null, maxDistanceMiles: 50,
  cnOnlyChild: "any",
  cnTizhinei: "any",
};

// ─── EU default criteria (income in USD equivalent) ───────────────────────

function euMale(minIncomeK: number): Criteria {
  return {
    minAge: 25, maxAge: 38,
    minHeightIn: 62, maxHeightIn: 75,
    minWeightLbs: 110, maxWeightLbs: 350,
    minIncomeK, maxIncomeK: 100000,
    minNetWorthK: 0, maxNetWorthK: 1000000,
    minLooksPercentile: 50, maxLooksPercentile: 100,
    relationship: [],
    education: "any",
    heritages: [],
    nonSmokerOnly: false,
    acceptsImmigrants: true,
    cityId: null, maxDistanceMiles: 50,
  };
}

function euFemale(minIncomeK: number): Criteria {
  return {
    minAge: 22, maxAge: 35,
    minHeightIn: 67, maxHeightIn: 80,
    minWeightLbs: 130, maxWeightLbs: 400,
    minIncomeK, maxIncomeK: 100000,
    minNetWorthK: 0, maxNetWorthK: 1000000,
    minLooksPercentile: 50, maxLooksPercentile: 100,
    relationship: [],
    education: "any",
    heritages: [],
    nonSmokerOnly: false,
    acceptsImmigrants: true,
    cityId: null, maxDistanceMiles: 50,
  };
}

export const DEFAULT_MALE_CRITERIA_UK: Criteria = euMale(40);
export const DEFAULT_FEMALE_CRITERIA_UK: Criteria = euFemale(50);
export const DEFAULT_MALE_CRITERIA_DE: Criteria = euMale(45);
export const DEFAULT_FEMALE_CRITERIA_DE: Criteria = euFemale(55);
export const DEFAULT_MALE_CRITERIA_FR: Criteria = euMale(35);
export const DEFAULT_FEMALE_CRITERIA_FR: Criteria = euFemale(40);
export const DEFAULT_MALE_CRITERIA_NL: Criteria = euMale(50);
export const DEFAULT_FEMALE_CRITERIA_NL: Criteria = euFemale(60);
export const DEFAULT_MALE_CRITERIA_ES: Criteria = euMale(25);
export const DEFAULT_FEMALE_CRITERIA_ES: Criteria = euFemale(30);
export const DEFAULT_MALE_CRITERIA_IT: Criteria = euMale(25);
export const DEFAULT_FEMALE_CRITERIA_IT: Criteria = euFemale(30);
export const DEFAULT_MALE_CRITERIA_SE: Criteria = euMale(45);
export const DEFAULT_FEMALE_CRITERIA_SE: Criteria = euFemale(55);
export const DEFAULT_MALE_CRITERIA_PL: Criteria = euMale(15);
export const DEFAULT_FEMALE_CRITERIA_PL: Criteria = euFemale(20);
