#!/usr/bin/env python3
"""Add income_ratio to city JSON files."""
import json, pathlib

DATA = pathlib.Path(__file__).parent.parent / "data"

# US income ratios (individual metro vs national median)
# Sources: BLS QCEW 2022, ACS 5-yr 2022, metro-level median earnings
US = {
    # Tech/finance hubs (highest)
    "san_francisco": 1.50, "fremont": 1.35,
    "seattle": 1.35, "tacoma": 1.08,
    "dc": 1.30, "annapolis": 1.15, "frederick": 1.15,
    "boston": 1.20, "bridgeport": 1.22,
    "irvine": 1.25, "anaheim": 1.10, "pasadena": 1.15,
    "plano_tx": 1.18, "frisco_tx": 1.22, "mckinney": 1.15,
    "austin": 1.20, "durham": 1.15, "raleigh": 1.12,
    "boulder": 1.25, "denver": 1.10, "fort_collins": 1.08,
    "scottsdale": 1.20, "gilbert": 1.10, "chandler": 1.05,
    "tempe": 1.05, "mesa": 0.95, "glendale_az": 0.90,
    "nyc": 1.12, "hartford": 1.10,
    "minneapolis": 1.07, "rochester_mn": 1.05,
    "san_diego": 1.08, "portland": 1.08,
    "long_beach": 1.05, "glendale_ca": 1.05, "santa_rosa": 1.05,
    "napa": 1.10, "santa_barbara": 1.10, "santa_cruz": 1.10,
    "denton": 1.05, "arlington_tx": 1.05, "dallas": 1.05, "houston": 1.05,
    "ann_arbor": 1.08, "madison": 1.05, "iowa_city": 0.98,
    "olympia": 1.05, "honolulu": 1.05, "anchorage": 1.05,
    "la": 1.05, "philadelphia": 1.05, "baltimore": 1.05,
    "chicago": 1.02, "atlanta": 1.02,
    "west_palm_beach": 1.05, "fort_lauderdale": 1.00, "sarasota": 1.00,
    "nashville": 1.00, "charlotte": 1.00, "richmond": 1.00,
    "salt_lake_city": 1.02, "provo": 1.00,
    "midland_tx": 1.25,  # oil & gas
    # Average (0.90–1.00)
    "aurora_co": 1.00, "colorado_springs": 0.95, "boise": 1.00,
    "fayetteville_ar": 0.92, "huntsville": 1.05,
    "greenville_sc": 0.92, "charleston_sc": 0.95,
    "reno": 0.95, "henderson_nv": 0.95,
    "kansas_city": 0.95, "des_moines": 0.95, "omaha": 0.95,
    "columbus": 0.95, "cincinnati": 0.95, "indianapolis": 0.95,
    "pittsburgh": 0.95, "harrisburg": 0.95,
    "providence": 0.92, "worcester": 1.05, "rochester": 0.92,
    "buffalo": 0.90, "albany": 1.00,
    "baton_rouge": 0.90, "new_orleans": 0.88,
    "miami": 0.95, "tampa": 0.95, "orlando": 0.92, "jacksonville": 0.90,
    "phoenix": 0.95, "tucson": 0.85,
    "milwaukee": 0.92, "detroit": 0.92, "grand_rapids": 0.92,
    "st_louis": 0.92, "spokane": 0.88,
    "las_vegas": 0.90, "san_antonio": 0.88,
    "oklahoma_city": 0.90, "wichita": 0.90,
    "tulsa": 0.88, "albuquerque": 0.88,
    "lexington": 0.90, "louisville": 0.90,
    "knoxville": 0.88, "chattanooga": 0.88,
    "richmond_va": 1.00, "virginia_beach": 0.95,
    "corpus_christi": 0.90, "beaumont": 0.90,
    # Below average (0.75–0.90)
    "memphis": 0.85, "little_rock": 0.85,
    "birmingham": 0.88, "tuscaloosa": 0.85,
    "greensboro": 0.88, "winston_salem": 0.88,
    "el_paso": 0.78, "el_paso2": 0.78,
    "riverside": 0.88, "san_bernardino": 0.82, "palmdale": 0.85,
    "fresno": 0.78, "bakersfield": 0.78, "stockton": 0.78, "stockton2": 0.78,
    "modesto": 0.78, "visalia": 0.75, "salinas": 0.82, "merced": 0.72,
    "shreveport": 0.82, "jackson_ms": 0.75,
    "charleston_wv": 0.85, "huntington_wv": 0.80,
    "montgomery": 0.80, "mobile": 0.82,
    "laredo": 0.75, "brownsville": 0.72, "mcallen": 0.70,
    "flint": 0.78,
}

# Korean cities (vs national Korean average)
KR = {
    "seoul": 1.18,
    "suwon": 1.08,   # Samsung HQ area
    "seongnam": 1.10, "yongin": 1.05, "goyang": 1.02,
    "incheon": 0.96,
    "ulsan": 1.12,   # Hyundai manufacturing, highest industrial wages
    "changwon": 1.05, # heavy industry
    "daejeon": 0.93,
    "daegu": 0.89,
    "gwangju": 0.88,
    "busan": 0.92,
    "cheongju": 0.88, "jeonju": 0.87, "ansan": 0.90, "jeju": 0.88,
}

# Japanese cities (vs national Japanese average)
JP = {
    "tokyo": 1.18,
    "yokohama": 1.10,  # part of Tokyo metro
    "nagoya": 1.05,    # Toyota region
    "osaka": 1.00,
    "kobe": 0.96,
    "kyoto": 0.95,
    "fukuoka": 0.92,
    "sendai": 0.90,
    "hiroshima": 0.92,
    "okayama": 0.88,
    "kanazawa": 0.90,
    "sapporo": 0.88,
    "kumamoto": 0.86,
    "matsuyama": 0.85,
    "niigata": 0.88,
    "okinawa": 0.82,
}

# Chinese cities (vs national Chinese average) — large spread, tier-1 vs tier-3
CN = {
    "shenzhen": 1.52,
    "beijing": 1.42,
    "shanghai": 1.45,
    "hangzhou": 1.22,
    "guangzhou": 1.28,
    "suzhou": 1.28,
    "dongguan": 1.15,
    "foshan": 1.15,
    "nanjing": 1.10,
    "tianjin": 1.08,
    "xiamen": 1.12,
    "wuhan": 0.92,
    "chengdu": 0.92,
    "qingdao": 0.98,
    "zhengzhou": 0.88,
    "changsha": 0.90,
    "chongqing": 0.88,
    "xian": 0.85,
    "nanning": 0.82,
    "shenyang": 0.85,
    "harbin": 0.80,
    "kunming": 0.82,
}


def patch(filename: str, ratios: dict, default: float = 1.0):
    path = DATA / filename
    cities = json.loads(path.read_text())
    for city in cities:
        city["income_ratio"] = round(ratios.get(city["id"], default), 2)
    path.write_text(json.dumps(cities, ensure_ascii=False, indent=2) + "\n")
    print(f"Patched {filename} ({len(cities)} cities)")


patch("cities.json",    US, default=0.92)
patch("cities_kr.json", KR, default=0.90)
patch("cities_jp.json", JP, default=0.88)
patch("cities_cn.json", CN, default=0.88)
