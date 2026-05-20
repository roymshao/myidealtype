import type { ProbabilityResult, Criteria } from "./probability";
import { MAX_WEIGHT_MALE, MAX_WEIGHT_FEMALE } from "./probability";
import { formatHeight, formatNetWorth } from "./formatters";

export interface PersonalityTitle {
  title: string;
  emoji: string;
  subtitle: string;
}

export function getPersonalityTitle(probability: number, seekerGender: "male" | "female"): PersonalityTitle {
  const target = seekerGender === "male" ? "women" : "men";

  if (probability >= 0.30) return { title: "The Pragmatist", emoji: "🎯", subtitle: `You know what you want and it's within reach. Your pool of eligible ${target} is genuinely large.` };
  if (probability >= 0.20) return { title: "The Realist", emoji: "✅", subtitle: `Healthy, grounded standards. Most people with your criteria find someone within a year of seriously looking.` };
  if (probability >= 0.10) return { title: "The Discerning Dater", emoji: "🔍", subtitle: `You have standards — real ones. Not impossible, but you'll need to actually put yourself out there.` };
  if (probability >= 0.05) return { title: "The Selective Romantic", emoji: "🌹", subtitle: `Your criteria are above-average strict. Statistically achievable, but patience is required.` };
  if (probability >= 0.02) return { title: "The Connoisseur", emoji: "🍷", subtitle: `You have refined taste. The pool is small enough that meeting your person requires intention and effort.` };
  if (probability >= 0.01) return { title: "The High-Standard Holder", emoji: "🏆", subtitle: `You're fishing in a small pond. Millions still qualify — but they're not walking up to you.` };
  if (probability >= 0.005) return { title: "The Elite Seeker", emoji: "💎", subtitle: `Your checklist is long and uncompromising. The right ${seekerGender === "male" ? "woman" : "man"} exists — finding them is a project.` };
  if (probability >= 0.001) return { title: "The Idealist", emoji: "🌟", subtitle: `You're describing someone rare. They exist, somewhere — probably also looking for someone equally specific.` };
  if (probability >= 0.0005) return { title: "The Rare Breed Hunter", emoji: "🦄", subtitle: `You're searching for a statistical anomaly. They could fill a decent-sized arena — if you could find them.` };
  if (probability >= 0.0001) return { title: "The Mythologist", emoji: "🏛️", subtitle: `Ancient Greeks wrote epics about quests this long. Yours is similar, but with better hygiene expectations.` };
  if (probability >= 0.00001) return { title: "The Statistical Outlier", emoji: "📊", subtitle: `The math has entered the realm of theoretical. You're not looking for a partner — you're designing one.` };
  return { title: "The Impossible Dreamer", emoji: "🌙", subtitle: `At this probability, you have a better chance of being struck by lightning twice. We respect the commitment to standards.` };
}

export interface RoastLine {
  icon: string;
  text: string;
}

export function generateRoastLines(
  criteria: Criteria,
  result: ProbabilityResult,
  seekerGender: "male" | "female",
): RoastLine[] {
  const lines: RoastLine[] = [];
  const maxWeightSentinel = seekerGender === "female" ? MAX_WEIGHT_MALE : MAX_WEIGHT_FEMALE;

  // Height roast
  if (result.breakdown.height < 0.40) {
    const eliminatedPct = Math.round((1 - result.breakdown.height) * 100);
    const minFt = formatHeight(criteria.minHeightIn);
    lines.push({
      icon: "📏",
      text: `Your height floor of ${minFt}+ eliminates ${eliminatedPct}% of ${seekerGender === "male" ? "women" : "men"} immediately.`,
    });
  }

  // Income roast
  if (criteria.minIncomeK > 0 && result.breakdown.income < 0.30) {
    const eliminatedPct = Math.round((1 - result.breakdown.income) * 100);
    lines.push({
      icon: "💰",
      text: `A $${criteria.minIncomeK}K+ income requirement filters out ${eliminatedPct}% of the population — that's a real scarcity.`,
    });
  }

  // Wealth roast
  if (criteria.minNetWorthK > 0 && result.breakdown.wealth < 0.20) {
    const eliminatedPct = Math.round((1 - result.breakdown.wealth) * 100);
    lines.push({
      icon: "🏦",
      text: `Requiring ${formatNetWorth(criteria.minNetWorthK)} net worth removes ${eliminatedPct}% from contention — that's a very exclusive club.`,
    });
  }

  // Weight roast
  if (criteria.maxWeightLbs < maxWeightSentinel && result.breakdown.weight < 0.50) {
    const eliminatedPct = Math.round((1 - result.breakdown.weight) * 100);
    lines.push({
      icon: "⚖️",
      text: `Your weight range filters out ${eliminatedPct}% of potential matches. Americans skew heavier — this one hits hard.`,
    });
  }

  // Attractiveness roast
  const looksSpread = criteria.maxLooksPercentile - criteria.minLooksPercentile;
  if (criteria.minLooksPercentile <= 20 && criteria.maxLooksPercentile >= 99) {
    lines.push({
      icon: "✨",
      text: `Top ${criteria.minLooksPercentile}% attractiveness — you're describing someone who literally turns heads in every room. Only ${criteria.minLooksPercentile} out of 100 people qualify.`,
    });
  } else if (criteria.minLooksPercentile <= 50 && criteria.maxLooksPercentile >= 99) {
    lines.push({
      icon: "✨",
      text: `You want someone in the top ${criteria.minLooksPercentile}% for looks — above average, which still cuts the pool in half.`,
    });
  } else if (criteria.maxLooksPercentile < 99 && looksSpread < 40) {
    lines.push({
      icon: "✨",
      text: `Narrow attractiveness window (top ${criteria.minLooksPercentile}%–${criteria.maxLooksPercentile}%): only ${looksSpread}% of people fall in this range.`,
    });
  }

  // Heritage roast
  if (criteria.heritages.length > 0 && result.breakdown.heritage < 0.30) {
    const eliminatedPct = Math.round((1 - result.breakdown.heritage) * 100);
    lines.push({
      icon: "🌍",
      text: `Your heritage preferences eliminate ${eliminatedPct}% of ${seekerGender === "male" ? "women" : "men"} in the US — that's significant geographic selectivity.`,
    });
  }

  // Nativity roast
  if (!criteria.acceptsImmigrants && result.breakdown.nativity < 0.80) {
    lines.push({
      icon: "🌍",
      text: `Requiring locally born narrows your pool — ${Math.round((1 - result.breakdown.nativity) * 100)}% of eligible ${seekerGender === "male" ? "women" : "men"} are foreign-born.`,
    });
  }

  // Education roast
  if (criteria.education === "graduate" && result.breakdown.education < 0.20) {
    lines.push({
      icon: "🎓",
      text: `Graduate degree required — only ${Math.round(result.breakdown.education * 100)}% of ${seekerGender === "male" ? "women" : "men"} hold one. That's a small, highly educated group.`,
    });
  } else if (criteria.education === "bachelors_plus" && result.breakdown.education < 0.45) {
    lines.push({
      icon: "🎓",
      text: `Bachelor's degree or higher: only ${Math.round(result.breakdown.education * 100)}% of ${seekerGender === "male" ? "women" : "men"} qualify — you're filtering for the college-educated half.`,
    });
  }

  // Age range roast
  const ageSpan = criteria.maxAge - criteria.minAge;
  if (ageSpan <= 5 && result.breakdown.age < 0.15) {
    lines.push({
      icon: "🗓️",
      text: `A ${ageSpan}-year age window (${criteria.minAge}–${criteria.maxAge}) is tight — that's one cohort of people at one life stage.`,
    });
  }

  // Relationship roast
  if (criteria.relationship.length > 0 && !criteria.relationship.includes("divorced_with_kids") && result.breakdown.relationship < 0.50) {
    lines.push({
      icon: "💍",
      text: `Excluding divorced parents shrinks your pool meaningfully — many ${seekerGender === "male" ? "women" : "men"} in their 30s+ have been married before.`,
    });
  }

  // Smoking roast
  if (criteria.nonSmokerOnly) {
    const smokerPct = seekerGender === "female" ? 12.5 : 9.3;
    lines.push({
      icon: "🚭",
      text: `Non-smoker requirement removes ~${smokerPct}% — a modest cut, but every percentage point compounds with your other filters.`,
    });
  }

  return lines.slice(0, 3);
}

export interface ShareTexts {
  twitter: string;
  whatsapp: string;
  tiktokCaption: string;
}

export function getShareTexts(
  result: ProbabilityResult,
  personality: PersonalityTitle,
  seekerGender: "male" | "female",
  url: string,
): ShareTexts {
  const target = seekerGender === "male" ? "women" : "men";
  const twitter = `I just ran my dating standards through the math. Only ${result.percentage} of ${target} in the US qualify. Grade: ${result.grade.toUpperCase()} — officially "${personality.title}" ${personality.emoji}\n\nWhat's your score? ${url}`;
  const whatsapp = `I used this calculator to check my dating standards and only ${result.percentage} of ${target} in the US match what I'm looking for 😭 Grade: ${result.grade}. Check yours: ${url}`;
  const tiktokCaption = `POV: I let math judge my dating standards 💀 Only ${result.percentage} of ${target} qualify. Grade: ${result.grade} — "${personality.title}" ${personality.emoji} #dating #datingstandards #matecalculator #relationships #realitycheck`;
  return { twitter, whatsapp, tiktokCaption };
}
