# Data Sources & Research References

All statistics used in this calculator. Numbers are reviewed against primary sources; exact values are interpolated or estimated where published tables give ranges rather than exact percentiles.

---

## US Population Statistics

### Age Distribution
- **Source:** U.S. Census Bureau, American Community Survey (ACS) 5-Year Estimates 2022, Table B01001 (Sex by Age)
- Used to construct `age_cdf` for men and women aged 18–65.

### Height Distribution
- **Primary source:** Fryar CD, Gu Q, Ogden CL, Flegal KM. *Anthropometric Reference Data for Children and Adults: United States, 2011–2014.* Vital and Health Statistics, Series 3, No. 39. National Center for Health Statistics, 2016.
- **Cross-checked with:** Ryan CM et al. *Mean Body Weight, Height, Waist Circumference, and Body Mass Index Among Adults: United States, 1999–2000 Through 2015–2016.* NCHS National Health Statistics Reports No. 122, 2018.
- Overall male mean: 175.7 cm (69.2 in); female mean: 161.8 cm (63.7 in).
- Used to construct `height_at_least` survival function tables.

### Height by Race/Ethnicity (Heritage Correlations)
- **Source:** NHANES 2015–2018. Mean heights extracted from Fryar et al. 2016 and Ryan et al. 2018.

| Group | Men (mean, in) | Men (SD, in) | Women (mean, in) | Women (SD, in) |
|---|---|---|---|---|
| Non-Hispanic White | 69.8 | 2.80 | 64.4 | 2.56 |
| Non-Hispanic Black | 69.1 | 2.91 | 64.2 | 2.72 |
| Hispanic (any) | 66.7 | 2.76 | 61.8 | 2.56 |
| Non-Hispanic Asian (East) | 66.5 | 2.68 | 61.9 | 2.48 |
| South Asian (estimated) | 67.5 | 2.56 | 61.8 | 2.36 |
| MENA (estimated) | 68.5 | 2.75 | 63.5 | 2.55 |
| Native American (estimated) | 67.5 | 2.75 | 63.0 | 2.60 |
| Pacific Islander (estimated) | 68.0 | 2.80 | 63.2 | 2.65 |

*South Asian, MENA, Native, and Pacific values are estimates based on related studies and should be treated as approximate.*

### Weight / BMI Distribution
- **Source:** NCHS Data Brief No. 360. *Prevalence of Obesity Among Adults and Youth: United States, 2017–2018.* Hales CM, Carroll MD, Fryar CD, Ogden CL. NCHS, 2020.
- Also: Fryar et al. 2016 mean weight data.
- Overall male mean weight: ~200 lbs; female mean: ~170 lbs.

### Weight by Race/Ethnicity
| Group | Men (weight ratio vs. overall) | Women (weight ratio) |
|---|---|---|
| Non-Hispanic White | 1.01 | 1.01 |
| Non-Hispanic Black | 1.05 | 1.09 |
| Hispanic | 0.97 | 0.96 |
| Non-Hispanic Asian (East) | 0.85 | 0.76 |
| South Asian | 0.88 | 0.79 |
| MENA | 0.98 | 0.97 |
| Native American | 1.03 | 1.06 |
| Pacific Islander | 1.08 | 1.11 |

*Ratio = group mean weight / overall population mean weight. Applied as a scale factor on the income table lookup.*

### Income Distribution
- **Source:** U.S. Census Bureau, ACS 2022, Table B20017 (Median Earnings by Sex and Race/Hispanic Origin); also Bureau of Labor Statistics, CPS 2022 Annual Averages.
- Overall male median individual earnings (FT/YR workers): ~$65,000. Female: ~$52,000.

### Income by Race/Ethnicity
| Group | Men (income ratio) | Women (income ratio) |
|---|---|---|
| Non-Hispanic White | 1.08 | 1.06 |
| Non-Hispanic Black | 0.77 | 0.87 |
| Hispanic | 0.71 | 0.77 |
| East Asian | 1.28 | 1.25 |
| South Asian (Indian origin) | 1.42 | 1.35 |
| MENA | 1.05 | 1.02 |
| Native American | 0.68 | 0.70 |
| Pacific Islander | 0.80 | 0.82 |

- **Key reference:** Bureau of Labor Statistics. *Usual Weekly Earnings of Wage and Salary Workers, Annual Average 2022.* Table 3.
- **Supplemental:** Kochhar R, Cilluffo A. *Income Inequality in the U.S. Is Rising Most Rapidly Among Asians.* Pew Research Center, July 12, 2018.

### Wealth / Net Worth Distribution
- **Source:** Board of Governors of the Federal Reserve System. *Survey of Consumer Finances (SCF), 2022.*
- Bhutta N, Chang AC, Dettling LJ, Hsu JW. *Disparities in Wealth by Race and Ethnicity in the 2019 Survey of Consumer Finances.* FEDS Notes, September 28, 2020.

### Wealth by Race/Ethnicity
| Group | Wealth ratio vs. overall |
|---|---|
| Non-Hispanic White | 1.48 |
| Non-Hispanic Black | 0.23 |
| Hispanic | 0.32 |
| East Asian | 1.66 |
| South Asian | 2.07 |
| MENA | 1.10 |
| Native American | 0.20 |
| Pacific Islander | 0.30 |

*Overall median family net worth (2022): ~$193,000 (Fed SCF 2022). White median: ~$285,000; Black: ~$44,900; Hispanic: ~$61,600.*
*Asian/Other category in SCF: ~$320,000. South Asian estimated separately based on Pew research on Indian Americans.*

**Note:** The racial wealth gap is substantially larger than the income gap, especially for Black and Hispanic populations. This reflects compounding historical inequities in homeownership and inheritance. Source: Darity WA Jr et al. *What We Get Wrong About Closing the Racial Wealth Gap.* Samuel DuBois Cook Center, Duke University, 2018.

### Education by Race/Ethnicity
- **Source:** U.S. Census Bureau, ACS 2022, Table B15002 (Educational Attainment by Sex); National Center for Education Statistics (NCES), *Status and Trends in the Education of Racial and Ethnic Groups 2018.*

| Group | Men bachelor's+ | Men graduate+ | Women bachelor's+ | Women graduate+ |
|---|---|---|---|---|
| Non-Hispanic White | 39% | 14% | 40% | 13% |
| Non-Hispanic Black | 27% | 8% | 28% | 10% |
| Hispanic | 19% | 5% | 21% | 6% |
| East Asian | 56% | 23% | 55% | 22% |
| South Asian (Indian origin) | 72% | 38% | 65% | 30% |
| MENA | 45% | 18% | 42% | 16% |
| Native American | 20% | 5% | 21% | 6% |
| Pacific Islander | 25% | 7% | 26% | 8% |

### Relationship / Marital Status
- **Source:** Census ACS 2022, Table B12001 (Marital Status by Sex and Age).
- ~50% of US adults aged 18–65 are currently unmarried and not cohabiting (single/never-married, divorced, widowed, separated).

### Nativity (Immigration Status)
- **Source:** Census ACS 2022, Table B05012 (Nativity by Sex).
- ~86% of US adults are native-born; ~14% are foreign-born.

### Smoking / Lifestyle
- **Source:** CDC National Center for Health Statistics, *National Health Interview Survey (NHIS) 2022.*
- 12.5% of US adults currently smoke. Male rate: ~13.1%; female rate: ~10.7%.
- Non-smoker fraction in model: male ~87.4%, female ~90.7%.

---

## Correlation Methodology

When a heritage filter is selected, the model replaces the unconditional probability distributions with heritage-conditioned estimates:

- **Height:** Replaces the CDC overall height survival-function lookup with a Gaussian CDF using the heritage group's empirical mean and SD (Fryar et al. 2016).
- **Income & Wealth:** Scales the income/wealth threshold inversely by the heritage group's income/wealth ratio before looking it up in the base survival function. This approximates `P(income ≥ X | group) ≈ P(income ≥ X/ratio | overall)`.
- **Weight:** Same ratio approach applied to weight CDF thresholds.
- **Education:** Replaces the overall bachelors+/graduate fractions with the heritage group's empirically measured values.

**Limitation:** The ratio-scaling approximation captures the directional effect but not the shape of the distribution tails. It should be treated as a directionally correct first-order correction, not an exact conditional distribution.

When multiple heritages are selected, correlations are blended as a weighted average, with weights equal to each group's population fraction from Census ACS 2022.

---

## Korea Statistics

- **Age / Population:** Statistics Korea, 2020 Census
- **Height / Weight / BMI:** Korea National Health and Nutrition Examination Survey (KNHANES), 2020–2021. Korea Disease Control and Prevention Agency.
  - Mean male height: 172.5 cm (~67.9 in); female: 159.6 cm (~62.8 in)
- **Income:** Statistics Korea, *Household Income and Expenditure Survey 2022*; Korean Statistical Information Service (KOSIS).
- **Education:** Statistics Korea, *Educational Statistics 2022*
- **Smoking:** Korea Centers for Disease Control and Prevention (KCDC), KNHANES 2020–21. Male smoking rate: ~32.8%; female: ~7.2%.

---

## Japan Statistics

- **Age / Population:** Statistics Bureau Japan, *Population Census 2022*
- **Height / Weight / BMI:** Japan National Health and Nutrition Survey (NHNS) 2019. Ministry of Health, Labour and Welfare.
  - Mean male height: 171.4 cm (~67.5 in); female: 158.0 cm (~62.2 in)
- **Income:** National Tax Agency Japan, *Survey on Private Wages 2022*
- **Education:** Ministry of Education, Culture, Sports, Science and Technology (MEXT), *School Basic Survey 2022*
- **Smoking:** Japan Tobacco Inc., *JT Nationwide Smoking Survey 2022*. Male rate: ~25.5%; female: ~8.7%.

---

## China Statistics

- **Age / Population:** National Bureau of Statistics (NBS), *China Population Census 2020.* Total working-age (18–65) population: ~475M men, ~455M women.
- **Height / Weight / BMI:** China Health and Nutrition Survey (CHNS) 2018. Chinese Center for Disease Control and Prevention.
  - Mean male height: 171.7 cm (~67.6 in); female: 159.7 cm (~62.9 in)
  - Mean male weight: ~70 kg (~154 lbs); female: ~58 kg (~128 lbs)
- **Income:** NBS, *Survey on Household Income and Expenditure 2022*; NBS Annual Average Wages of Employees 2022. Values in USD equivalent at 7.0 CNY/USD.
  - Average urban employee annual wage: RMB 114,029 (~$16,290 USD). Median is substantially lower.
- **Wealth:** China Household Finance Survey (CHFS), Southwest University of Finance and Economics, 2021 wave. Median family net worth: ~RMB 420,000 (~$60,000 USD).
- **Education:** NBS, *China Statistical Yearbook 2022.* Bachelor's+ attainment for adults 25+: ~25% male, ~22% female (rapidly rising among younger cohorts).
- **Smoking:** Global Adult Tobacco Survey (GATS) China 2018, Chinese Center for Disease Control. Male smoking rate: ~50.5%; female: ~2.6%.
- **Only Child (独生子女):** National estimates based on NBS birth registration data and academic studies on the one-child policy cohort (1980–2015). Estimated ~46% of men and ~44% of women aged 18–45 are only children. Overall 18–65 range adjusted for older cohorts.
- **Work Sector (体制内):** NBS *Statistical Yearbook 2022* employment by ownership type. Government civil servants, SOE employees, and public institutions (教育、医疗、科研) combined total ~162M workers out of ~740M labor force (~22%). Female share slightly higher due to public-sector concentration in education and healthcare.

---

## Notes on Methodology

1. **Independence assumption:** Probabilities are multiplied assuming statistical independence across filters. Real-world correlations exist (e.g., taller people tend to weigh more; higher income correlates with education) beyond the heritage-conditioned adjustments applied here.

2. **Population base:** US stats use 100M men / 105M women aged 18–65. These are order-of-magnitude round numbers; the Census 2022 counts ~104M men and ~107M women aged 18–65. The probability percentages are the meaningful output, not the raw count.

3. **Heritage fractions:** Heritage proportions sum to >100% because individuals can report multiple ancestries (Census ACS asks about ancestry separately from race). Fractions represent ancestry self-identification, not mutually exclusive race categories.

4. **For entertainment purposes only.** These calculations use real data but involve many simplifying assumptions. They are not a sociological or demographic research product.
