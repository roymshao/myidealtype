import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const VALID_COUNTRIES = new Set(["us","kr","jp","cn","uk","de","fr","nl","es","it","se","pl"]);
const VALID_GENDERS = new Set(["male","female"]);

function finite(v: unknown, min: number, max: number): number | null {
  if (typeof v !== "number" || !isFinite(v)) return null;
  return v < min || v > max ? null : v;
}

function safeStr(v: unknown, maxLen = 128): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim().slice(0, maxLen);
  return s || null;
}

// No PII is stored. All fields are aggregate-safe preference data.
export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, reason: "not_configured" });
  }

  try {
    const body = await req.json();
    const {
      sessionToken,
      country,
      seekerGender,
      criteria,
      result,
      cityId,
      cityName,
      cityIncomeRatio,
    } = body;

    if (!VALID_COUNTRIES.has(country) || !VALID_GENDERS.has(seekerGender)) {
      return NextResponse.json({ ok: false, reason: "invalid_input" }, { status: 400 });
    }
    if (!criteria || typeof criteria !== "object") {
      return NextResponse.json({ ok: false, reason: "invalid_input" }, { status: 400 });
    }

    const minAge = finite(criteria.minAge, 18, 100) ?? 18;
    const maxAge = finite(criteria.maxAge, 18, 100) ?? 65;
    const minIncomeK = finite(criteria.minIncomeK, 0, 100000) ?? 0;
    const maxIncomeK = finite(criteria.maxIncomeK, 0, 100000) ?? 100000;
    const minNetWorthK = finite(criteria.minNetWorthK, 0, 1000000) ?? 0;
    const maxNetWorthK = finite(criteria.maxNetWorthK, 0, 1000000) ?? 1000000;
    const minHeightIn = finite(criteria.minHeightIn, 40, 100) ?? 60;
    const maxHeightIn = finite(criteria.maxHeightIn, 40, 100) ?? 80;
    const minWeightLbs = finite(criteria.minWeightLbs, 0, 600) ?? 0;
    const maxWeightLbs = finite(criteria.maxWeightLbs, 0, 600) ?? 400;
    const minLooksP = finite(criteria.minLooksPercentile, 0, 100) ?? 0;
    const maxLooksP = finite(criteria.maxLooksPercentile, 0, 100) ?? 100;
    const safeCityIncomeRatio = finite(cityIncomeRatio, 0.3, 3.0) ?? 1.0;

    const education = ["any","high_school","bachelors_plus","graduate"].includes(criteria.education)
      ? criteria.education as string : "any";
    const nonSmokerOnly = criteria.nonSmokerOnly === true;
    const acceptsImmigrants = criteria.acceptsImmigrants !== false;
    const relationship = Array.isArray(criteria.relationship)
      ? criteria.relationship.filter((r: unknown) => typeof r === "string").slice(0, 10) : [];
    const heritages = Array.isArray(criteria.heritages)
      ? criteria.heritages.filter((h: unknown) => typeof h === "string").slice(0, 20) : [];

    const safeProbability = finite(result?.probability, 0, 1) ?? 0;
    const safeEstimatedCount = finite(result?.estimatedCount, 0, 2_000_000_000) ?? 0;
    const safeLocalCount = finite(result?.localCount, 0, 10_000_000) ?? null;
    const safeGrade = ["Realistic","Selective","Very Selective","Elite","Delusional"]
      .includes(result?.grade) ? result.grade as string : "Delusional";

    const sql = neon(process.env.DATABASE_URL);

    await sql`
      INSERT INTO sessions (
        session_token, country, seeker_gender,
        city_id, city_name, city_income_ratio,
        min_age, max_age,
        min_height_in, max_height_in,
        min_weight_lbs, max_weight_lbs,
        min_income_k, max_income_k,
        min_net_worth_k, max_net_worth_k,
        min_looks_percentile, max_looks_percentile,
        education, non_smoker_only, accepts_immigrants,
        relationship_filters, heritages,
        cn_only_child, cn_tizhinei,
        probability, grade, estimated_count, local_count
      ) VALUES (
        ${safeStr(sessionToken) ?? null}, ${country}, ${seekerGender},
        ${safeStr(cityId) ?? null}, ${safeStr(cityName) ?? null}, ${safeCityIncomeRatio},
        ${minAge}, ${maxAge},
        ${minHeightIn}, ${maxHeightIn},
        ${minWeightLbs}, ${maxWeightLbs},
        ${minIncomeK}, ${maxIncomeK},
        ${minNetWorthK}, ${maxNetWorthK},
        ${minLooksP}, ${maxLooksP},
        ${education}, ${nonSmokerOnly}, ${acceptsImmigrants},
        ${relationship}, ${heritages},
        ${safeStr(criteria.cnOnlyChild) ?? null}, ${safeStr(criteria.cnTizhinei) ?? null},
        ${safeProbability}, ${safeGrade}, ${safeEstimatedCount}, ${safeLocalCount}
      )
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/log]", err);
    return NextResponse.json({ ok: false, reason: "db_error" });
  }
}
