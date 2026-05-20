export function formatHeight(inches: number): string {
  const feet = Math.floor(inches / 12);
  const in_ = inches % 12;
  return `${feet}'${in_}"`;
}

export function formatHeightCm(inches: number): string {
  return `${Math.round(inches * 2.54)} cm`;
}

export function formatWeight(lbs: number, sentinel: number): string {
  if (lbs >= sentinel) return "No max";
  return `${lbs} lbs`;
}

export function formatWeightKg(lbs: number, sentinel?: number): string {
  if (sentinel !== undefined && lbs >= sentinel) return "No max";
  return `${Math.round(lbs / 2.205)} kg`;
}

export function formatIncome(k: number): string {
  if (k === 0) return "No min";
  if (k >= 100000) return "$100M+";
  if (k >= 1000) return `$${(k / 1000).toFixed(k % 1000 === 0 ? 0 : 1)}M`;
  return `$${k}K`;
}

export function formatIncomeRange(minK: number, maxK: number): string {
  const lo = minK === 0 ? "Any" : formatIncome(minK);
  const hi = maxK >= 100000 ? "No max" : formatIncome(maxK);
  if (minK === 0 && maxK >= 100000) return "No preference";
  return `${lo} – ${hi}`;
}

export function formatNetWorth(k: number): string {
  if (k === 0) return "No minimum";
  if (k >= 1000000) return "$1B+";
  if (k >= 1000) return `$${(k / 1000).toFixed(k % 1000 === 0 ? 0 : 1)}M+`;
  return `$${k}K+`;
}

export function formatNetWorthRange(minK: number, maxK: number, sentinel: number): string {
  const lo = minK === 0 ? "No min" : formatNetWorth(minK).replace("+", "");
  const hi = maxK >= sentinel ? "No max" : formatNetWorth(maxK).replace("+", "");
  if (minK === 0 && maxK >= sentinel) return "No preference";
  return `${lo} – ${hi}`;
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `~${(n / 1_000_000).toFixed(1)}M people`;
  if (n >= 1_000) return `~${Math.round(n / 1000)}K people`;
  if (n <= 0) return "< 1 person";
  return `~${n.toLocaleString()} people`;
}

export function formatLooks(minPercentile: number): string {
  const top = 100 - minPercentile;
  if (minPercentile <= 1) return "No preference (all attractiveness levels)";
  if (top <= 1)  return `Top 1% (extremely attractive)`;
  if (top <= 10) return `Top ${top}% (very attractive)`;
  if (top <= 25) return `Top ${top}% (quite attractive)`;
  if (top <= 50) return `Top ${top}% (above average)`;
  return `Top ${top}% (average or better)`;
}

export const HEIGHT_MARKS_MALE = [
  { in: 60, label: "5'0\"" }, { in: 63, label: "5'3\"" }, { in: 66, label: "5'6\"" },
  { in: 69, label: "5'9\"" }, { in: 72, label: "6'0\"" }, { in: 75, label: "6'3\"" },
  { in: 78, label: "6'6\"" },
];

export const HEIGHT_MARKS_FEMALE = [
  { in: 57, label: "4'9\"" }, { in: 60, label: "5'0\"" }, { in: 63, label: "5'3\"" },
  { in: 66, label: "5'6\"" }, { in: 69, label: "5'9\"" }, { in: 72, label: "6'0\"" },
];

export const HEIGHT_MARKS_MALE_METRIC = [
  { in: 63, label: "160cm" }, { in: 65, label: "165cm" }, { in: 67, label: "170cm" },
  { in: 69, label: "175cm" }, { in: 71, label: "180cm" }, { in: 74, label: "188cm" },
];

export const HEIGHT_MARKS_FEMALE_METRIC = [
  { in: 57, label: "145cm" }, { in: 59, label: "150cm" }, { in: 61, label: "155cm" },
  { in: 63, label: "160cm" }, { in: 65, label: "165cm" }, { in: 67, label: "170cm" },
];

export const INCOME_STEPS = [
  0, 25, 50, 75, 100, 125, 150, 175, 200, 250, 300,
  400, 500, 750, 1000, 2000, 5000, 10000, 50000, 100000,
];
export const NET_WORTH_STEPS = [
  0, 50, 100, 250, 500, 1000, 2000, 5000, 10000,
  25000, 50000, 100000, 500000, 1000000,
];

export const RELATIONSHIP_OPTIONS = [
  { key: "never_married", label: "Never married", note: "" },
  { key: "divorced_no_kids", label: "Divorced, no children", note: "" },
  { key: "divorced_with_kids", label: "Divorced, has children", note: "" },
  { key: "widowed", label: "Widowed", note: "" },
];

export const HERITAGE_GROUPS = [
  {
    region: "East & SE Asian",
    key: "east_asian",
    items: [
      { key: "chinese", label: "Chinese" },
      { key: "korean", label: "Korean" },
      { key: "japanese", label: "Japanese" },
      { key: "vietnamese", label: "Vietnamese" },
      { key: "filipino", label: "Filipino" },
      { key: "thai", label: "Thai" },
      { key: "cambodian", label: "Cambodian" },
      { key: "hmong", label: "Hmong" },
      { key: "indonesian", label: "Indonesian" },
      { key: "other_east_asian", label: "Other E/SE Asian" },
    ],
  },
  {
    region: "South Asian",
    key: "south_asian",
    items: [
      { key: "indian", label: "Indian" },
      { key: "pakistani", label: "Pakistani" },
      { key: "bangladeshi", label: "Bangladeshi" },
      { key: "sri_lankan", label: "Sri Lankan" },
      { key: "nepalese", label: "Nepalese" },
      { key: "other_south_asian", label: "Other South Asian" },
    ],
  },
  {
    region: "Latin American",
    key: "latin",
    items: [
      { key: "mexican", label: "Mexican" },
      { key: "puerto_rican", label: "Puerto Rican" },
      { key: "cuban", label: "Cuban" },
      { key: "dominican", label: "Dominican" },
      { key: "colombian", label: "Colombian" },
      { key: "salvadoran", label: "Salvadoran" },
      { key: "guatemalan", label: "Guatemalan" },
      { key: "honduran", label: "Honduran" },
      { key: "venezuelan", label: "Venezuelan" },
      { key: "ecuadorian", label: "Ecuadorian" },
      { key: "peruvian", label: "Peruvian" },
      { key: "other_latin", label: "Other Latin" },
    ],
  },
  {
    region: "Middle Eastern / N. African",
    key: "mena",
    items: [
      { key: "arab", label: "Arab (Lebanese, Egyptian, Syrian…)" },
      { key: "iranian", label: "Iranian / Persian" },
      { key: "turkish", label: "Turkish" },
      { key: "israeli", label: "Israeli" },
      { key: "afghan", label: "Afghan" },
      { key: "other_mena", label: "Other Middle Eastern" },
    ],
  },
  {
    region: "African & Caribbean",
    key: "african",
    items: [
      { key: "african_american", label: "African American (ancestral)" },
      { key: "nigerian", label: "Nigerian" },
      { key: "ghanaian", label: "Ghanaian" },
      { key: "ethiopian", label: "Ethiopian / Eritrean" },
      { key: "somali", label: "Somali" },
      { key: "congolese", label: "Congolese" },
      { key: "kenyan", label: "Kenyan" },
      { key: "other_african", label: "Other African" },
      { key: "jamaican", label: "Jamaican" },
      { key: "haitian", label: "Haitian" },
      { key: "trinidadian", label: "Trinidadian" },
      { key: "other_caribbean", label: "Other Caribbean" },
    ],
  },
  {
    region: "European",
    key: "european",
    items: [
      { key: "german", label: "German" },
      { key: "irish", label: "Irish" },
      { key: "english", label: "English / British" },
      { key: "italian", label: "Italian" },
      { key: "polish", label: "Polish" },
      { key: "french", label: "French" },
      { key: "scandinavian", label: "Scandinavian" },
      { key: "scottish", label: "Scottish" },
      { key: "russian", label: "Russian" },
      { key: "eastern_european", label: "E. European (Ukrainian, Czech…)" },
      { key: "greek", label: "Greek" },
      { key: "portuguese", label: "Portuguese" },
      { key: "dutch", label: "Dutch" },
      { key: "other_european", label: "Other European" },
    ],
  },
  {
    region: "Indigenous",
    key: "indigenous",
    items: [
      { key: "native_american", label: "Native American / Alaskan" },
      { key: "pacific_islander", label: "Pacific Islander / Hawaiian" },
    ],
  },
];
