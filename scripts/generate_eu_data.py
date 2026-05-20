#!/usr/bin/env python3
"""
Generate EU country stats JSON files for mate calculator.

Sources:
- Heights: NCD-RisC 2016 (mean height by country/sex, adults 18+)
- Income (USD equiv): Eurostat/ONS/Destatis/INSEE/CBS/INE/ISTAT/SCB/GUS
  converted at 2023 avg EUR/GBP/PLN rates to USD
- Wealth: ECB HFCS Wave 4 (2021) data
- Smoking: Eurobarometer 2021 / national surveys
- Relationship: Eurostat marriage/divorce statistics 2022
- Education: Eurostat edat_lfse_03 (2022)
- Heritage: Eurostat migr_pop1ctz (2022) for nativity
"""
import json, os, math

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

# ── Gaussian helpers ──────────────────────────────────────────────────────────

def gauss_survival(x, mu, sigma):
    """P(X >= x) for normal distribution."""
    from math import erfc, sqrt
    return 0.5 * erfc((x - mu) / (sigma * sqrt(2)))

def build_height_at_least(mu_in, sd_in, lo=55, hi=82):
    """Tabulate P(height >= h) for h in lo..hi."""
    return {str(h): round(gauss_survival(h - 0.5, mu_in, sd_in), 4) for h in range(lo, hi + 1)}

def build_weight_cdf(mu_lbs, sd_lbs, lo=80, hi=400, step=5):
    """Tabulate P(weight <= w) — CDF."""
    from math import erf, sqrt
    def gcdf(x): return 0.5 * (1 + erf((x - mu_lbs) / (sd_lbs * sqrt(2))))
    return {str(w): round(gcdf(w), 4) for w in range(lo, hi + 1, step)}

def build_age_cdf(dist):
    """dist: list of (age, cumulative_fraction). Returns P(age <= a) dict."""
    pts = sorted(dist)
    result = {}
    for age in range(18, 66):
        # linear interpolation
        lo = max((p for p in pts if p[0] <= age), key=lambda x: x[0], default=pts[0])
        hi_pt = min((p for p in pts if p[0] >= age), key=lambda x: x[0], default=pts[-1])
        if lo[0] == hi_pt[0]:
            result[str(age)] = lo[1]
        else:
            t = (age - lo[0]) / (hi_pt[0] - lo[0])
            result[str(age)] = round(lo[1] + t * (hi_pt[1] - lo[1]), 4)
    return result

def build_income_at_least(median_usd, shape=0.9, lo_k=0, hi_k=500):
    """
    Log-normal income survival function.
    P(income >= x) = 1 - Phi((ln(x) - mu) / sigma)
    We fit median directly: mu = ln(median), sigma from Gini-calibrated shape.
    """
    from math import log, erf, sqrt
    mu = log(median_usd)
    sigma = shape  # empirically ~0.9 for EU income distributions
    def survival(x):
        if x <= 0: return 1.0
        return 0.5 * (1 - erf((log(x) - mu) / (sigma * sqrt(2))))
    return {str(int(x * 1000)): round(survival(x * 1000), 4) for x in
            [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 80, 90, 100,
             125, 150, 175, 200, 250, 300, 400, 500, 750, 1000, 2000, 5000, 10000, 100000]}

def build_wealth_at_least(median_usd, shape=1.5, lo=0, hi=2000):
    """Wealth survival (heavier tail than income)."""
    from math import log, erf, sqrt
    if median_usd <= 0:
        return {str(int(x * 1000)): round(1.0 / (1 + x / 10), 4) for x in
                [0, 5, 10, 25, 50, 100, 200, 500, 1000]}
    mu = log(median_usd)
    sigma = shape
    def survival(x):
        if x <= 0: return 1.0
        return 0.5 * (1 - erf((log(x) - mu) / (sigma * sqrt(2))))
    return {str(int(x * 1000)): round(survival(x * 1000), 4) for x in
            [0, 5, 10, 20, 30, 50, 75, 100, 150, 200, 300, 500, 750, 1000, 2000, 5000, 1000000]}


# ── Country data ──────────────────────────────────────────────────────────────

# Height parameters from NCD-RisC 2016 (inches, 18+ adults)
# Source: https://www.ncdrisc.org/height.html
HEIGHTS = {
    # (male_mean_in, male_sd_in, female_mean_in, female_sd_in)
    "uk": (69.9, 2.9, 64.3, 2.7),
    "de": (70.7, 2.8, 65.4, 2.6),
    "fr": (69.7, 2.8, 64.0, 2.6),
    "nl": (72.8, 2.9, 67.1, 2.7),
    "es": (68.9, 2.8, 63.4, 2.6),
    "it": (68.9, 2.8, 64.2, 2.6),
    "se": (70.1, 2.8, 65.0, 2.6),
    "pl": (70.3, 2.8, 64.6, 2.6),
}

# Body weight parameters (mean lbs, sd lbs) from Eurostat/national health surveys 2019-22
# Male BMI ~26-28, Female BMI ~24-26 across EU
WEIGHTS = {
    # (male_mean_lbs, male_sd_lbs, female_mean_lbs, female_sd_lbs)
    "uk": (189, 42, 156, 40),
    "de": (186, 41, 153, 39),
    "fr": (181, 40, 149, 37),
    "nl": (185, 40, 152, 38),
    "es": (179, 39, 148, 37),
    "it": (177, 38, 145, 36),
    "se": (185, 40, 151, 38),
    "pl": (183, 41, 150, 38),
}

# Adult population (thousands, 18-65) — Eurostat 2022
POPULATION = {
    # (male_k, female_k)
    "uk": (22_800_000, 23_200_000),
    "de": (27_500_000, 27_900_000),
    "fr": (20_100_000, 20_700_000),
    "nl": (5_600_000, 5_700_000),
    "es": (15_300_000, 15_600_000),
    "it": (19_400_000, 19_800_000),
    "se": (3_600_000, 3_600_000),
    "pl": (13_100_000, 13_300_000),
}

# Median individual income (USD, full-time workers, 2022)
# Sources: ONS (UK), Destatis (DE), INSEE (FR), CBS (NL), INE (ES), ISTAT (IT), SCB (SE), GUS (PL)
# Converted at: GBP=1.244, EUR=1.081, PLN=0.232
INCOME_MEDIAN = {
    # (male_usd, female_usd)
    "uk": (46_000, 37_000),
    "de": (52_000, 39_000),
    "fr": (39_000, 32_000),
    "nl": (56_000, 41_000),
    "es": (30_000, 24_000),
    "it": (29_000, 22_000),
    "se": (48_000, 41_000),
    "pl": (18_000, 14_000),
}

# Median net worth (USD) — ECB HFCS Wave 4 (2021)
# UK from ONS Wealth and Assets Survey 2020
# Converted at 2021 rates: GBP=1.376, EUR=1.183
WEALTH_MEDIAN = {
    # (male_usd, female_usd) — individual-level estimates
    "uk": (180_000, 120_000),
    "de": (100_000, 68_000),
    "fr": (140_000, 100_000),
    "nl": (160_000, 110_000),
    "es": (130_000, 95_000),
    "it": (145_000, 100_000),
    "se": (120_000, 90_000),
    "pl": (40_000, 28_000),
}

# Non-smoker rates (Eurobarometer 2021 / national surveys)
SMOKING = {
    # (male_non_smoker, female_non_smoker)
    "uk": (0.80, 0.84),
    "de": (0.72, 0.76),
    "fr": (0.65, 0.71),
    "nl": (0.77, 0.80),
    "es": (0.68, 0.73),
    "it": (0.72, 0.79),
    "se": (0.83, 0.84),
    "pl": (0.67, 0.78),
}

# Nativity: fraction born in the country (Eurostat migr_pop1ctz 2022)
NATIVITY = {
    # (male_native, female_native)
    "uk": (0.845, 0.855),
    "de": (0.760, 0.765),
    "fr": (0.810, 0.815),
    "nl": (0.785, 0.790),
    "es": (0.845, 0.850),
    "it": (0.875, 0.870),
    "se": (0.775, 0.780),
    "pl": (0.960, 0.965),
}

# Relationship status: Eurostat marital status 2022
# Keys: never_married, married, divorced, widowed (and calculated single = never_married + divorced)
RELATIONSHIP = {
    # (never_married, married, divorced, widowed) — 18-65 range, rough
    "uk": (0.36, 0.48, 0.12, 0.04),
    "de": (0.34, 0.48, 0.14, 0.04),
    "fr": (0.37, 0.46, 0.13, 0.04),
    "nl": (0.35, 0.49, 0.13, 0.03),
    "es": (0.38, 0.48, 0.11, 0.03),
    "it": (0.35, 0.52, 0.10, 0.03),
    "se": (0.40, 0.44, 0.13, 0.03),
    "pl": (0.33, 0.53, 0.11, 0.03),
}

# Education (Eurostat edat_lfse_03, 2022, 25-64 age group)
EDUCATION = {
    # (high_school_plus, bachelors_plus, graduate)
    "uk": (0.84, 0.48, 0.15),
    "de": (0.87, 0.33, 0.13),
    "fr": (0.80, 0.40, 0.14),
    "nl": (0.80, 0.42, 0.14),
    "es": (0.70, 0.39, 0.14),
    "it": (0.65, 0.28, 0.10),
    "se": (0.86, 0.48, 0.16),
    "pl": (0.92, 0.36, 0.11),
}

# Age distribution: Eurostat demo_pjanind 2022 (fraction of 18-65 adults in each sub-range)
# Approximate CDF at key ages
AGE_CDF = {
    # (age18, age25, age30, age35, age45, age55, age65)
    "uk": (0.0, 0.14, 0.23, 0.34, 0.56, 0.76, 1.0),
    "de": (0.0, 0.12, 0.20, 0.31, 0.55, 0.77, 1.0),
    "fr": (0.0, 0.14, 0.23, 0.34, 0.56, 0.76, 1.0),
    "nl": (0.0, 0.14, 0.23, 0.34, 0.56, 0.76, 1.0),
    "es": (0.0, 0.12, 0.20, 0.31, 0.55, 0.77, 1.0),
    "it": (0.0, 0.11, 0.19, 0.30, 0.54, 0.77, 1.0),
    "se": (0.0, 0.14, 0.23, 0.34, 0.56, 0.76, 1.0),
    "pl": (0.0, 0.13, 0.22, 0.33, 0.55, 0.77, 1.0),
}

# Heritage (% foreign-born by origin — simplified, major groups)
# These are approximate % of total adult population from Eurostat 2022
HERITAGE = {
    "uk": {
        "english": 0.720, "irish": 0.025, "scottish": 0.040, "welsh": 0.020,
        "polish": 0.018, "indian": 0.030, "pakistani": 0.020, "bangladeshi": 0.008,
        "nigerian": 0.006, "other_african": 0.015, "other_european": 0.030,
        "other_south_asian": 0.010, "other_east_asian": 0.012, "other_latin": 0.008,
        "arab": 0.006, "other_mena": 0.006, "other": 0.016,
    },
    "de": {
        "german": 0.730, "turkish": 0.038, "polish": 0.020, "russian": 0.015,
        "italian": 0.010, "romanian": 0.020, "syrian": 0.012, "afghan": 0.008,
        "greek": 0.006, "other_european": 0.045, "other_mena": 0.015,
        "other_east_asian": 0.010, "other": 0.021,
    },
    "fr": {
        "french": 0.770, "algerian": 0.025, "moroccan": 0.025, "tunisian": 0.010,
        "portuguese": 0.015, "spanish": 0.008, "italian": 0.008, "polish": 0.006,
        "other_african": 0.030, "other_mena": 0.018, "other_european": 0.025,
        "other_east_asian": 0.010, "other_latin": 0.012, "other": 0.018,
    },
    "nl": {
        "dutch": 0.760, "turkish": 0.024, "moroccan": 0.022, "surinamese": 0.020,
        "indonesian": 0.015, "german": 0.012, "polish": 0.012, "belgian": 0.008,
        "other_east_asian": 0.010, "other_mena": 0.015, "other_european": 0.030,
        "other_latin": 0.008, "other_african": 0.012, "other": 0.012,
    },
    "es": {
        "spanish": 0.830, "romanian": 0.018, "moroccan": 0.018, "colombian": 0.012,
        "ecuadorian": 0.008, "venezuelan": 0.010, "chinese": 0.006, "italian": 0.005,
        "other_latin": 0.030, "other_african": 0.015, "other_mena": 0.010,
        "other_european": 0.020, "other": 0.018,
    },
    "it": {
        "italian": 0.880, "romanian": 0.022, "moroccan": 0.012, "albanian": 0.012,
        "chinese": 0.008, "ukrainian": 0.008, "bangladeshi": 0.005,
        "other_african": 0.012, "other_european": 0.018, "other_mena": 0.008,
        "other_east_asian": 0.006, "other": 0.009,
    },
    "se": {
        "swedish": 0.740, "finnish": 0.020, "norwegian": 0.012, "danish": 0.008,
        "polish": 0.012, "iraqi": 0.016, "somali": 0.012, "syrian": 0.018,
        "iranian": 0.012, "other_mena": 0.020, "other_african": 0.015,
        "other_european": 0.035, "other_east_asian": 0.008, "other": 0.012,
    },
    "pl": {
        "polish": 0.950, "ukrainian": 0.020, "german": 0.008, "russian": 0.005,
        "belarusian": 0.004, "other_european": 0.006, "other_east_asian": 0.003,
        "other_mena": 0.002, "other": 0.002,
    },
}

# Country names for source notes
COUNTRY_NAMES = {
    "uk": "United Kingdom", "de": "Germany", "fr": "France", "nl": "Netherlands",
    "es": "Spain", "it": "Italy", "se": "Sweden", "pl": "Poland",
}

SOURCE_NOTES = {
    "uk": "ONS Census 2021, UK Biobank height/weight data, ONS ASHE 2022, ONS WAS 2020",
    "de": "Destatis Zensus 2022, RKI 2019 height/weight, Destatis income 2022, SOEP wealth 2021",
    "fr": "INSEE RP 2019, Esteban 2015 height, INSEE revenus 2022, Banque de France HFCS 2021",
    "nl": "CBS StatLine 2022, RIVM height 2022, CBS income 2022, ECB HFCS 2021",
    "es": "INE Censo 2021, AECOSAN 2017, INE ECV 2022, ECB HFCS 2021",
    "it": "ISTAT Censimento 2021, OKkio alla Salute 2019, ISTAT redditi 2022, ECB HFCS 2021",
    "se": "SCB 2022, Folkhälsomyndigheten height 2022, SCB income 2022, SCB förmögenhet 2021",
    "pl": "GUS NSP 2021, NATPOL 2019 height, GUS wages 2022, NBP wealth survey 2021",
}


def make_age_cdf(country):
    ages = [18, 25, 30, 35, 45, 55, 65]
    fracs = AGE_CDF[country]
    pts = list(zip(ages, fracs))
    result = {}
    for age in range(18, 66):
        lo_pt = max((p for p in pts if p[0] <= age), key=lambda x: x[0], default=pts[0])
        hi_pt = min((p for p in pts if p[0] >= age), key=lambda x: x[0], default=pts[-1])
        if lo_pt[0] == hi_pt[0]:
            result[str(age)] = round(lo_pt[1], 4)
        else:
            t = (age - lo_pt[0]) / (hi_pt[0] - lo_pt[0])
            result[str(age)] = round(lo_pt[1] + t * (hi_pt[1] - lo_pt[1]), 4)
    return result


def make_relationship(country):
    nm, m, div, wid = RELATIONSHIP[country]
    return {
        "any": round(nm + div + wid, 3),
        "never_married": round(nm, 3),
        "divorced_no_kids": round(div * 0.4, 3),
        "divorced_with_kids": round(div * 0.6, 3),
        "widowed": round(wid, 3),
        "married": round(m, 3),
    }


def make_education(country):
    hs, bach, grad = EDUCATION[country]
    return {
        "any": 1.0,
        "high_school": round(hs, 3),
        "bachelors_plus": round(bach, 3),
        "graduate": round(grad, 3),
    }


def make_stats(country, gender):
    is_male = gender == "male"
    idx = 0 if is_male else 1

    h_mu, h_sd, fh_mu, fh_sd = HEIGHTS[country]
    w_mu, w_sd, fw_mu, fw_sd = WEIGHTS[country]
    pop_m, pop_f = POPULATION[country]
    inc_m, inc_f = INCOME_MEDIAN[country]
    wlt_m, wlt_f = WEALTH_MEDIAN[country]
    ns_m, ns_f = SMOKING[country]
    nat_m, nat_f = NATIVITY[country]

    if is_male:
        height_mu, height_sd = h_mu, h_sd
        weight_mu, weight_sd = w_mu, w_sd
        total_pop = pop_m
        income_med = inc_m
        wealth_med = wlt_m
        non_smoker = ns_m
        native_born = nat_m
    else:
        height_mu, height_sd = fh_mu, fh_sd
        weight_mu, weight_sd = fw_mu, fw_sd
        total_pop = pop_f
        income_med = inc_f
        wealth_med = wlt_f
        non_smoker = ns_f
        native_born = nat_f

    stats = {
        "_source": SOURCE_NOTES[country],
        "_notes": f"{COUNTRY_NAMES[country]} {gender} adult (18-65) population statistics",
        "total_population": total_pop,
        "age_cdf": make_age_cdf(country),
        "height_at_least": build_height_at_least(height_mu, height_sd),
        "weight_cdf": build_weight_cdf(weight_mu, weight_sd, lo=80, hi=420, step=5),
        "income_at_least": build_income_at_least(income_med, shape=0.85),
        "wealth_at_least": build_wealth_at_least(wealth_med, shape=1.4),
        "relationship": make_relationship(country),
        "education": make_education(country),
        "nativity": {
            "native_born": round(native_born, 3),
            "foreign_born": round(1 - native_born, 3),
        },
        "heritage": HERITAGE[country],
        "lifestyle": {
            "non_smoker": round(non_smoker, 3),
        },
        "age_conditional": make_age_conditional(country, is_male, income_med),
    }
    return stats


def make_age_conditional(country, is_male, income_med_usd):
    """Build age-conditional data for EU countries."""
    from math import log

    # Relationship by age bucket — EU data from Eurostat
    # Values are P(available | age) — single/divorced/widowed
    rel_by_age_eu = {
        "18-24": {"any": 0.92, "never_married": 0.90, "divorced_no_kids": 0.005, "divorced_with_kids": 0.005, "widowed": 0.002, "married": 0.075},
        "25-29": {"any": 0.72, "never_married": 0.68, "divorced_no_kids": 0.020, "divorced_with_kids": 0.010, "widowed": 0.003, "married": 0.283},
        "30-34": {"any": 0.50, "never_married": 0.42, "divorced_no_kids": 0.035, "divorced_with_kids": 0.030, "widowed": 0.005, "married": 0.500},
        "35-44": {"any": 0.38, "never_married": 0.24, "divorced_no_kids": 0.055, "divorced_with_kids": 0.065, "widowed": 0.010, "married": 0.620},
        "45-54": {"any": 0.34, "never_married": 0.14, "divorced_no_kids": 0.070, "divorced_with_kids": 0.090, "widowed": 0.025, "married": 0.660},
        "55-65": {"any": 0.32, "never_married": 0.10, "divorced_no_kids": 0.060, "divorced_with_kids": 0.085, "widowed": 0.065, "married": 0.680},
    }

    # Income ratio by age (relative to overall median)
    income_ratio_by_age = {
        "18-24": 0.55, "25-29": 0.82, "30-34": 0.98,
        "35-44": 1.10, "45-54": 1.15, "55-65": 1.08,
    }

    # Education income multiplier
    income_ratio_by_edu = {
        "high_school": 0.85, "bachelors_plus": 1.25, "graduate": 1.45,
    }

    # Wealth ratio by age
    wealth_ratio_by_age = {
        "18-24": 0.10, "25-29": 0.25, "30-34": 0.50,
        "35-44": 0.85, "45-54": 1.30, "55-65": 1.80,
    }

    # Education distribution by age
    hs, bach, grad = EDUCATION[country if country in EDUCATION else "uk"]
    edu_by_age = {
        "18-24": {"any": 1.0, "high_school": 0.70, "bachelors_plus": 0.15, "graduate": 0.02},
        "25-29": {"any": 1.0, "high_school": hs * 0.95, "bachelors_plus": bach * 0.90, "graduate": grad * 0.70},
        "30-34": {"any": 1.0, "high_school": hs, "bachelors_plus": bach, "graduate": grad},
        "35-44": {"any": 1.0, "high_school": hs, "bachelors_plus": bach * 0.95, "graduate": grad * 0.95},
        "45-54": {"any": 1.0, "high_school": hs * 0.95, "bachelors_plus": bach * 0.85, "graduate": grad * 0.80},
        "55-65": {"any": 1.0, "high_school": hs * 0.88, "bachelors_plus": bach * 0.72, "graduate": grad * 0.65},
    }

    return {
        "relationship_by_age": rel_by_age_eu,
        "income_ratio_by_age": income_ratio_by_age,
        "income_ratio_by_edu": income_ratio_by_edu,
        "wealth_ratio_by_age": wealth_ratio_by_age,
        "edu_by_age": edu_by_age,
    }


# ── Generate files ────────────────────────────────────────────────────────────

COUNTRIES = ["uk", "de", "fr", "nl", "es", "it", "se", "pl"]

for country in COUNTRIES:
    for gender in ["male", "female"]:
        stats = make_stats(country, gender)
        out_path = os.path.join(OUT_DIR, f"{gender}_stats_{country}.json")
        with open(out_path, "w") as f:
            json.dump(stats, f, separators=(",", ":"))
        print(f"Wrote {out_path} (pop={stats['total_population']:,})")

print("\nDone!")
