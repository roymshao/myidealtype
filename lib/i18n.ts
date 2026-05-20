export type Lang = "en" | "ko" | "ja" | "zh";

export function defaultLang(country: string): Lang {
  if (country === "kr") return "ko";
  if (country === "jp") return "ja";
  if (country === "cn") return "zh";
  return "en";
}

export const LANG_TOGGLE_LABEL: Record<string, string> = {
  kr: "한국어 / EN",
  jp: "日本語 / EN",
  cn: "中文 / EN",
};

const T: Record<string, Record<Lang, string>> = {
  // Section headers
  age_range:           { en: "Age Range",                    ko: "나이 범위",          ja: "年齢範囲",          zh: "年龄范围" },
  height_range:        { en: "Height Range",                 ko: "키 범위",            ja: "身長範囲",          zh: "身高范围" },
  weight_range_kg:     { en: "Weight Range (kg)",            ko: "체중 범위 (kg)",     ja: "体重範囲 (kg)",     zh: "体重范围（kg）" },
  weight_range_lbs:    { en: "Weight Range (lbs)",           ko: "체중 범위 (lbs)",    ja: "体重範囲 (lbs)",    zh: "体重范围（lbs）" },
  annual_income:       { en: "Annual Income Range",          ko: "연소득 범위",         ja: "年収範囲",          zh: "年收入范围" },
  annual_income_usd:   { en: "Annual Income Range",          ko: "연소득 범위",         ja: "年収範囲",          zh: "年收入范围（美元等值）" },
  net_worth:           { en: "Net Worth Range (Wealth)",     ko: "순자산 범위",         ja: "純資産範囲",        zh: "净资产范围（财富）" },
  attractiveness:      { en: "Attractiveness Range",         ko: "외모 범위",           ja: "魅力範囲",          zh: "颜值范围" },
  relationship:        { en: "Relationship History",         ko: "연애 이력",           ja: "交際歴",            zh: "感情经历" },
  education:           { en: "Education",                    ko: "학력",               ja: "学歴",              zh: "学历" },
  religion:            { en: "Religion / Faith",              ko: "종교",               ja: "宗教",              zh: "宗教信仰" },
  mbti:                { en: "Personality (MBTI)",            ko: "성격 유형 (MBTI)",   ja: "性格 (MBTI)",       zh: "性格类型 (MBTI)" },
  mbti_ei:             { en: "Energy",                        ko: "에너지",             ja: "エネルギー",        zh: "精力方向" },
  mbti_sn:             { en: "Mind",                          ko: "인식",               ja: "情報収集",          zh: "感知方式" },
  mbti_tf:             { en: "Nature",                        ko: "판단",               ja: "判断",              zh: "判断方式" },
  mbti_jp:             { en: "Tactics",                       ko: "생활 방식",           ja: "外界への態度",      zh: "行动方式" },
  mbti_E:              { en: "E — Extraverted",               ko: "E — 외향형",          ja: "E — 外向型",        zh: "E — 外向" },
  mbti_I:              { en: "I — Introverted",               ko: "I — 내향형",          ja: "I — 内向型",        zh: "I — 内向" },
  mbti_S:              { en: "S — Sensing",                   ko: "S — 현실형",          ja: "S — 感覚型",        zh: "S — 感觉" },
  mbti_N:              { en: "N — Intuitive",                 ko: "N — 직관형",          ja: "N — 直感型",        zh: "N — 直觉" },
  mbti_T:              { en: "T — Thinking",                  ko: "T — 사고형",          ja: "T — 思考型",        zh: "T — 思考" },
  mbti_F:              { en: "F — Feeling",                   ko: "F — 감정형",          ja: "F — 感情型",        zh: "F — 情感" },
  mbti_J:              { en: "J — Judging",                   ko: "J — 판단형",          ja: "J — 判断型",        zh: "J — 判断" },
  mbti_P:              { en: "P — Perceiving",                ko: "P — 인식형",          ja: "P — 知覚型",        zh: "P — 感知" },
  smoking:             { en: "Lifestyle — Smoking",          ko: "생활 방식 — 흡연",   ja: "ライフスタイル — 喫煙", zh: "生活习惯 — 吸烟" },
  immigration:         { en: "Immigration Status",           ko: "출생지",              ja: "出生地",            zh: "出生地" },
  location:            { en: "Location & Distance",          ko: "지역 및 거리",        ja: "地域と距離",        zh: "城市 & 距离" },

  // Relationship options
  never_married:       { en: "Never married",                ko: "미혼",               ja: "未婚",              zh: "未婚" },
  divorced_no_kids:    { en: "Divorced, no kids",            ko: "이혼, 자녀 없음",    ja: "離婚・子なし",     zh: "离异，无子女" },
  divorced_with_kids:  { en: "Divorced, with kids",          ko: "이혼, 자녀 있음",    ja: "離婚・子あり",     zh: "离异，有子女" },
  widowed:             { en: "Widowed",                      ko: "사별",               ja: "死別",              zh: "丧偶" },
  rel_hint_blank:      {
    en: "Select all you're open to. Leave blank for no preference (not currently married).",
    ko: "허용하는 모든 항목을 선택하세요. 미선택 시 현재 미혼이면 됩니다.",
    ja: "許容するものすべてを選択。未選択は「未婚であればOK」と同じ意味です。",
    zh: "选择所有你接受的情况。不选则表示无特别要求（未婚即可）。",
  },
  rel_hint_none:       {
    en: "No preference (anyone not currently married)",
    ko: "상관없음 (현재 미혼이면 됩니다)",
    ja: "こだわらない（現在未婚であればOK）",
    zh: "无特别要求（未婚即可）",
  },

  // Education options
  edu_any:             { en: "No preference",                ko: "상관없음",            ja: "こだわらない",      zh: "不限" },
  edu_high_school:     { en: "High school+",                 ko: "고졸 이상",           ja: "高卒以上",          zh: "高中及以上" },
  edu_bachelors:       { en: "Bachelor's+",                  ko: "대졸 이상",           ja: "大卒以上",          zh: "本科及以上" },
  edu_graduate:        { en: "Master's / PhD",               ko: "석사 / 박사",         ja: "修士・博士",        zh: "硕士/博士" },

  // Smoking
  smokers_ok:          { en: "Smokers OK",                   ko: "흡연자 가능",         ja: "喫煙者可",          zh: "可以吸烟" },
  non_smokers_only:    { en: "Non-smokers only",             ko: "비흡연자만",           ja: "非喫煙者のみ",     zh: "不吸烟" },
  smoke_stat_male:     {
    en: "% of men smoke",
    ko: "% 남성이 흡연합니다",
    ja: "% の男性が喫煙",
    zh: "% 的男性吸烟",
  },
  smoke_stat_female:   {
    en: "% of women smoke",
    ko: "% 여성이 흡연합니다",
    ja: "% の女性が喫煙",
    zh: "% 的女性吸烟",
  },

  // Immigration / nativity
  open_to_immigrants:  { en: "Open to immigrants",           ko: "이민자도 가능",       ja: "外国出身可",        zh: "不限" },
  native_born_only:    { en: "Locally born only",            ko: "한국 출생만",         ja: "日本生まれのみ",   zh: "国内出生" },
  foreign_born_stat:   {
    en: "% of men are foreign-born",
    ko: "% 남성이 외국 출생입니다",
    ja: "% の男性が外国出身",
    zh: "% 为境外出生",
  },
  foreign_born_stat_f: {
    en: "% of women are foreign-born",
    ko: "% 여성이 외국 출생입니다",
    ja: "% の女性が外国出身",
    zh: "% 为境外出生",
  },

  // Location
  max_distance:        { en: "Max distance",                 ko: "최대 거리",           ja: "最大距離",          zh: "最远距离" },
  city_placeholder:    {
    en: "Type a city (e.g. Chicago, IL)",
    ko: "도시 입력 (예: 서울, 부산)",
    ja: "都市を入力 (例: 東京, 大阪)",
    zh: "输入城市（如 上海、北京）",
  },
  local_match:         {
    en: "matches in the %s metro area",
    ko: "%s 지역 내 매칭",
    ja: "%s エリアのマッチ数",
    zh: "%s 地区匹配人数",
  },
  city_income_note:    {
    en: "Income & wealth adjusted for local cost of living",
    ko: "소득 및 자산이 지역 물가에 맞게 조정됩니다",
    ja: "収入・資産は地域物価に合わせて調整されます",
    zh: "收入和资产已按当地消费水平进行调整",
  },

  // Ticker
  ticker_women_us:     { en: "women in the US who match",   ko: "미국 여성 중 매칭",   ja: "条件に合う米国女性", zh: "符合条件的美国女性" },
  ticker_men_us:       { en: "men in the US who match",     ko: "미국 남성 중 매칭",   ja: "条件に合う米国男性", zh: "符合条件的美国男性" },
  ticker_women_kr:     { en: "women in Korea who match",    ko: "한국 여성 중 매칭",   ja: "条件に合う韓国女性", zh: "符合条件的韩国女性" },
  ticker_men_kr:       { en: "men in Korea who match",      ko: "한국 남성 중 매칭",   ja: "条件に合う韓国男性", zh: "符合条件的韩国男性" },
  ticker_women_jp:     { en: "women in Japan who match",    ko: "일본 여성 중 매칭",   ja: "条件に合う日本女性", zh: "符合条件的日本女性" },
  ticker_men_jp:       { en: "men in Japan who match",      ko: "일본 남성 중 매칭",   ja: "条件に合う日本男性", zh: "符合条件的日本男性" },
  ticker_women_cn:     { en: "women in China who match",    ko: "중국 여성 중 매칭",   ja: "条件に合う中国女性", zh: "符合条件的中国女性" },
  ticker_men_cn:       { en: "men in China who match",      ko: "중국 남성 중 매칭",   ja: "条件に合う中国男性", zh: "符合条件的中国男性" },
  ticker_women_uk:     { en: "women in the UK who match",   ko: "영국 여성 중 매칭",   ja: "条件に合う英国女性", zh: "符合条件的英国女性" },
  ticker_men_uk:       { en: "men in the UK who match",     ko: "영국 남성 중 매칭",   ja: "条件に合う英国男性", zh: "符合条件的英国男性" },
  ticker_women_de:     { en: "women in Germany who match",  ko: "독일 여성 중 매칭",   ja: "条件に合うドイツ女性", zh: "符合条件的德国女性" },
  ticker_men_de:       { en: "men in Germany who match",    ko: "독일 남성 중 매칭",   ja: "条件に合うドイツ男性", zh: "符合条件的德国男性" },
  ticker_women_fr:     { en: "women in France who match",   ko: "프랑스 여성 중 매칭", ja: "条件に合うフランス女性", zh: "符合条件的法国女性" },
  ticker_men_fr:       { en: "men in France who match",     ko: "프랑스 남성 중 매칭", ja: "条件に合うフランス男性", zh: "符合条件的法国男性" },
  ticker_women_nl:     { en: "women in the Netherlands who match", ko: "네덜란드 여성 중 매칭", ja: "条件に合うオランダ女性", zh: "符合条件的荷兰女性" },
  ticker_men_nl:       { en: "men in the Netherlands who match",   ko: "네덜란드 남성 중 매칭", ja: "条件に合うオランダ男性", zh: "符合条件的荷兰男性" },
  ticker_women_es:     { en: "women in Spain who match",    ko: "스페인 여성 중 매칭", ja: "条件に合うスペイン女性", zh: "符合条件的西班牙女性" },
  ticker_men_es:       { en: "men in Spain who match",      ko: "스페인 남성 중 매칭", ja: "条件に合うスペイン男性", zh: "符合条件的西班牙男性" },
  ticker_women_it:     { en: "women in Italy who match",    ko: "이탈리아 여성 중 매칭", ja: "条件に合うイタリア女性", zh: "符合条件的意大利女性" },
  ticker_men_it:       { en: "men in Italy who match",      ko: "이탈리아 남성 중 매칭", ja: "条件に合うイタリア男性", zh: "符合条件的意大利男性" },
  ticker_women_se:     { en: "women in Sweden who match",   ko: "스웨덴 여성 중 매칭", ja: "条件に合うスウェーデン女性", zh: "符合条件的瑞典女性" },
  ticker_men_se:       { en: "men in Sweden who match",     ko: "스웨덴 남성 중 매칭", ja: "条件に合うスウェーデン男性", zh: "符合条件的瑞典男性" },
  ticker_women_pl:     { en: "women in Poland who match",   ko: "폴란드 여성 중 매칭", ja: "条件に合うポーランド女性", zh: "符合条件的波兰女性" },
  ticker_men_pl:       { en: "men in Poland who match",     ko: "폴란드 남성 중 매칭", ja: "条件に合うポーランド男性", zh: "符合条件的波兰男性" },

  // Buttons
  calculate:           {
    en: "Calculate My Odds →",
    ko: "나의 확률 계산하기 →",
    ja: "確率を計算する →",
    zh: "计算我的概率 →",
  },
  calculating:         {
    en: "Crunching the numbers...",
    ko: "계산 중...",
    ja: "計算中...",
    zh: "正在计算中...",
  },

  // Scanning text
  scanning:            {
    en: "Scanning the US population...",
    ko: "인구 데이터 분석 중...",
    ja: "人口データを解析中...",
    zh: "正在扫描人口数据...",
  },
  data_sources:        {
    en: "Cross-referencing Census, CDC, Pew Research data",
    ko: "통계청, 보건복지부, 연구 데이터 교차 검증 중",
    ja: "国勢調査・厚生労働省・研究データを照合中",
    zh: "交叉比对统计局、CHNS、CHFS 数据",
  },

  // Results
  your_results:        { en: "Your Results",                 ko: "나의 결과",           ja: "あなたの結果",      zh: "你的结果" },

  // Misc
  no_max:              { en: "No max",                       ko: "상한 없음",           ja: "上限なし",          zh: "不限" },
  no_min:              { en: "No min",                       ko: "하한 없음",           ja: "下限なし",          zh: "不限" },
  usd_equiv:           { en: "USD equivalent",               ko: "달러 환산",           ja: "USD換算",           zh: "美元等值" },
  net_worth_note:      {
    en: "Net worth = assets minus debt (home equity, savings, investments)",
    ko: "순자산 = 총자산 - 부채 (주택 자산, 예금, 투자 포함)",
    ja: "純資産 = 総資産 − 負債（住宅資産・預金・投資含む）",
    zh: "净资产 = 总资产减去负债（房产、存款、投资）",
  },
  looks_no_pref:       {
    en: "No preference (all attractiveness levels)",
    ko: "외모 무관 (모든 수준 포함)",
    ja: "こだわらない（全ての魅力レベル含む）",
    zh: "无要求（接受所有颜值水平）",
  },
  yrs:                 { en: "yrs",                          ko: "세",                  ja: "歳",                zh: "岁" },
};

export function t(key: string, lang: Lang): string {
  return T[key]?.[lang] ?? T[key]?.["en"] ?? key;
}
