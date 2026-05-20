-- Run once to set up the sessions table in Neon Postgres.
-- Vercel: Dashboard → Storage → Create Database → Postgres (Neon)
-- Local:  Copy DATABASE_URL from Neon console into .env.local

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS sessions (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Context
  session_token   VARCHAR(64),          -- anonymous client UUID, no user identity
  country         VARCHAR(2)   NOT NULL, -- us/kr/jp/cn
  seeker_gender   VARCHAR(6)   NOT NULL, -- male/female

  -- Location
  city_id         VARCHAR(50),
  city_name       VARCHAR(100),
  city_income_ratio NUMERIC(5,3) DEFAULT 1.0,

  -- Criteria: age
  min_age         SMALLINT,
  max_age         SMALLINT,

  -- Criteria: height (inches)
  min_height_in   SMALLINT,
  max_height_in   SMALLINT,

  -- Criteria: weight (lbs)
  min_weight_lbs  SMALLINT,
  max_weight_lbs  SMALLINT,

  -- Criteria: income ($K)
  min_income_k    INTEGER,
  max_income_k    INTEGER,

  -- Criteria: net worth ($K)
  min_net_worth_k INTEGER,
  max_net_worth_k INTEGER,

  -- Criteria: looks
  min_looks_percentile SMALLINT,
  max_looks_percentile SMALLINT,

  -- Criteria: categorical
  education       VARCHAR(20),
  non_smoker_only BOOLEAN,
  accepts_immigrants BOOLEAN,
  relationship_filters TEXT[],
  heritages       TEXT[],
  cn_only_child   VARCHAR(20),
  cn_tizhinei     VARCHAR(20),

  -- Result
  probability     NUMERIC(12, 10),
  grade           VARCHAR(20),
  estimated_count INTEGER,
  local_count     INTEGER
);

-- Indexes for aggregate analytics (Phase 3 data report)
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_country    ON sessions (country);
CREATE INDEX IF NOT EXISTS idx_sessions_grade      ON sessions (grade);
CREATE INDEX IF NOT EXISTS idx_sessions_city_id    ON sessions (city_id);

-- Useful analytics queries:
--
-- Grade distribution:
--   SELECT grade, COUNT(*) FROM sessions GROUP BY grade ORDER BY 2 DESC;
--
-- Average probability by country:
--   SELECT country, AVG(probability), COUNT(*) FROM sessions GROUP BY country;
--
-- Most-filtered cities:
--   SELECT city_name, COUNT(*) FROM sessions WHERE city_name IS NOT NULL GROUP BY city_name ORDER BY 2 DESC LIMIT 20;
--
-- Income filter distribution:
--   SELECT min_income_k, COUNT(*) FROM sessions GROUP BY min_income_k ORDER BY min_income_k;
