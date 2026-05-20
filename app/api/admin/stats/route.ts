import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Protected by ADMIN_SECRET env var.
// Usage: GET /api/admin/stats  with header  Authorization: Bearer <secret>
export async function GET(req: Request) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "no_db" }, { status: 503 });
  }

  const sql = neon(process.env.DATABASE_URL);

  const [overview, byGrade, byCountry, topCities, incomeDistribution, recentSessions] =
    await Promise.all([
      sql`
        SELECT
          COUNT(*)                          AS total_sessions,
          AVG(probability)                  AS avg_probability,
          MIN(created_at)                   AS first_session,
          MAX(created_at)                   AS last_session,
          COUNT(*) FILTER (WHERE city_id IS NOT NULL) AS with_city
        FROM sessions
      `,
      sql`
        SELECT grade, COUNT(*) AS n
        FROM sessions
        GROUP BY grade
        ORDER BY n DESC
      `,
      sql`
        SELECT country, seeker_gender, COUNT(*) AS n, AVG(probability) AS avg_p
        FROM sessions
        GROUP BY country, seeker_gender
        ORDER BY n DESC
      `,
      sql`
        SELECT city_name, city_id, COUNT(*) AS n, AVG(probability) AS avg_p
        FROM sessions
        WHERE city_name IS NOT NULL
        GROUP BY city_name, city_id
        ORDER BY n DESC
        LIMIT 30
      `,
      sql`
        SELECT min_income_k, COUNT(*) AS n
        FROM sessions
        WHERE min_income_k > 0
        GROUP BY min_income_k
        ORDER BY min_income_k
      `,
      sql`
        SELECT id, created_at, country, seeker_gender, city_name,
               probability, grade, estimated_count, local_count,
               min_age, max_age, min_income_k, education
        FROM sessions
        ORDER BY created_at DESC
        LIMIT 50
      `,
    ]);

  return NextResponse.json({
    overview: overview[0],
    byGrade,
    byCountry,
    topCities,
    incomeDistribution,
    recentSessions,
  });
}
