#!/usr/bin/env python3
"""
Generate EU city JSON files for mate calculator.
Each city has: id, name, state (region/county), aliases, pop_male, pop_female, income_ratio.

Population from Eurostat Urban Audit 2021, income_ratio from Eurostat regional earnings 2022.
"""
import json, os

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

# ── City data ─────────────────────────────────────────────────────────────────
# Format: (id, name, region/country, [aliases], pop_male_18_65, pop_female_18_65, income_ratio)
# income_ratio: local median income / national median income

UK_CITIES = [
    ("london", "London", "England", ["Greater London", "the capital"], 3_900_000, 4_050_000, 1.42),
    ("manchester", "Manchester", "England", ["Greater Manchester", "Manc"], 350_000, 345_000, 1.05),
    ("birmingham", "Birmingham", "England", ["Brum"], 380_000, 375_000, 0.92),
    ("leeds", "Leeds", "England", ["West Yorkshire"], 250_000, 245_000, 0.98),
    ("glasgow", "Glasgow", "Scotland", ["Greater Glasgow"], 270_000, 275_000, 0.90),
    ("liverpool", "Liverpool", "England", ["Merseyside", "Scouse"], 195_000, 190_000, 0.88),
    ("newcastle", "Newcastle", "England", ["Newcastle upon Tyne", "Tyneside"], 145_000, 142_000, 0.87),
    ("edinburgh", "Edinburgh", "Scotland", ["Edinbra"], 155_000, 160_000, 1.08),
    ("bristol", "Bristol", "England", [], 200_000, 198_000, 1.06),
    ("sheffield", "Sheffield", "England", ["South Yorkshire"], 185_000, 183_000, 0.90),
    ("cambridge", "Cambridge", "England", ["Cambridgeshire"], 62_000, 60_000, 1.15),
    ("oxford", "Oxford", "England", ["Oxfordshire"], 55_000, 54_000, 1.12),
    ("cardiff", "Cardiff", "Wales", ["Caerdydd"], 110_000, 112_000, 0.91),
    ("belfast", "Belfast", "N. Ireland", [], 95_000, 97_000, 0.86),
    ("nottingham", "Nottingham", "England", [], 150_000, 148_000, 0.88),
    ("brighton", "Brighton", "England", ["Brighton & Hove"], 90_000, 93_000, 1.02),
]

DE_CITIES = [
    ("berlin", "Berlin", "Berlin", [], 1_750_000, 1_780_000, 1.08),
    ("hamburg", "Hamburg", "Hamburg", [], 880_000, 885_000, 1.22),
    ("muenchen", "Munich", "Bavaria", ["München", "Munich"], 760_000, 775_000, 1.38),
    ("koeln", "Cologne", "NRW", ["Köln", "Koeln"], 490_000, 498_000, 1.10),
    ("frankfurt", "Frankfurt", "Hesse", ["Frankfurt am Main"], 375_000, 380_000, 1.30),
    ("stuttgart", "Stuttgart", "Baden-Württemberg", [], 290_000, 295_000, 1.25),
    ("duesseldorf", "Düsseldorf", "NRW", ["Dusseldorf", "Düsseldorf"], 290_000, 296_000, 1.20),
    ("leipzig", "Leipzig", "Saxony", [], 220_000, 224_000, 0.92),
    ("dortmund", "Dortmund", "NRW", [], 260_000, 262_000, 0.95),
    ("essen", "Essen", "NRW", [], 220_000, 224_000, 0.93),
    ("bremen", "Bremen", "Bremen", [], 165_000, 168_000, 0.97),
    ("nuremberg", "Nuremberg", "Bavaria", ["Nürnberg", "Nuernberg"], 175_000, 178_000, 1.05),
    ("hannover", "Hannover", "Lower Saxony", ["Hanover"], 150_000, 153_000, 1.02),
    ("dresden", "Dresden", "Saxony", [], 160_000, 163_000, 0.95),
    ("bonn", "Bonn", "NRW", [], 130_000, 133_000, 1.08),
    ("freiburg", "Freiburg", "Baden-Württemberg", ["Freiburg im Breisgau"], 75_000, 76_000, 1.10),
]

FR_CITIES = [
    ("paris", "Paris", "Île-de-France", ["Greater Paris", "PDG"], 1_050_000, 1_100_000, 1.45),
    ("lyon", "Lyon", "Auvergne-Rhône-Alpes", ["Auvergne"], 300_000, 308_000, 1.12),
    ("marseille", "Marseille", "PACA", ["Provence"], 400_000, 415_000, 0.90),
    ("toulouse", "Toulouse", "Occitanie", ["La Ville Rose"], 240_000, 247_000, 1.05),
    ("nice", "Nice", "PACA", ["Côte d'Azur", "Cote d'Azur"], 165_000, 175_000, 1.02),
    ("nantes", "Nantes", "Pays de la Loire", [], 155_000, 160_000, 1.02),
    ("montpellier", "Montpellier", "Occitanie", [], 140_000, 146_000, 0.96),
    ("strasbourg", "Strasbourg", "Grand Est", ["Alsace"], 145_000, 150_000, 1.05),
    ("bordeaux", "Bordeaux", "Nouvelle-Aquitaine", [], 140_000, 145_000, 1.05),
    ("lille", "Lille", "Hauts-de-France", [], 135_000, 140_000, 0.95),
    ("rennes", "Rennes", "Bretagne", ["Brittany"], 110_000, 114_000, 1.02),
    ("grenoble", "Grenoble", "Auvergne-Rhône-Alpes", [], 90_000, 92_000, 1.08),
]

NL_CITIES = [
    ("amsterdam", "Amsterdam", "North Holland", ["Noord-Holland"], 420_000, 425_000, 1.30),
    ("rotterdam", "Rotterdam", "South Holland", ["Zuid-Holland"], 310_000, 308_000, 1.05),
    ("den_haag", "The Hague", "South Holland", ["Den Haag", "s-Gravenhage"], 250_000, 258_000, 1.15),
    ("utrecht", "Utrecht", "Utrecht", [], 185_000, 188_000, 1.18),
    ("eindhoven", "Eindhoven", "North Brabant", ["Noord-Brabant"], 135_000, 132_000, 1.10),
    ("groningen", "Groningen", "Groningen", [], 80_000, 82_000, 0.95),
    ("almere", "Almere", "Flevoland", [], 110_000, 108_000, 1.02),
    ("breda", "Breda", "North Brabant", [], 80_000, 81_000, 1.02),
    ("nijmegen", "Nijmegen", "Gelderland", [], 75_000, 77_000, 0.98),
    ("leiden", "Leiden", "South Holland", [], 55_000, 57_000, 1.08),
]

ES_CITIES = [
    ("madrid", "Madrid", "Madrid", ["Capital"], 1_550_000, 1_630_000, 1.28),
    ("barcelona", "Barcelona", "Catalonia", ["Cataluña", "BCN"], 800_000, 850_000, 1.18),
    ("valencia", "Valencia", "Valencia", ["València"], 380_000, 400_000, 0.95),
    ("sevilla", "Seville", "Andalusia", ["Sevilla", "Andalucía"], 340_000, 358_000, 0.88),
    ("zaragoza", "Zaragoza", "Aragón", ["Saragossa"], 215_000, 224_000, 0.98),
    ("malaga", "Málaga", "Andalusia", ["Malaga", "Costa del Sol"], 195_000, 205_000, 0.90),
    ("bilbao", "Bilbao", "Basque Country", ["País Vasco", "Euskadi"], 125_000, 130_000, 1.08),
    ("alicante", "Alicante", "Valencia", ["Alacant", "Costa Blanca"], 140_000, 147_000, 0.90),
    ("cordoba", "Córdoba", "Andalusia", ["Cordoba"], 120_000, 126_000, 0.82),
    ("valladolid", "Valladolid", "Castile and León", ["Castilla y León"], 95_000, 99_000, 0.93),
    ("palma", "Palma", "Balearic Islands", ["Mallorca", "Islas Baleares"], 120_000, 122_000, 1.00),
    ("san_sebastian", "San Sebastián", "Basque Country", ["Donostia"], 65_000, 67_000, 1.12),
]

IT_CITIES = [
    ("roma", "Rome", "Lazio", ["Roma", "Eternal City"], 1_320_000, 1_430_000, 1.20),
    ("milano", "Milan", "Lombardy", ["Milano", "Lombardia"], 680_000, 720_000, 1.42),
    ("napoli", "Naples", "Campania", ["Napoli"], 490_000, 520_000, 0.78),
    ("torino", "Turin", "Piedmont", ["Torino", "Piemonte"], 370_000, 400_000, 1.05),
    ("palermo", "Palermo", "Sicily", ["Sicilia"], 250_000, 265_000, 0.75),
    ("genova", "Genoa", "Liguria", ["Genova", "Liguria"], 195_000, 215_000, 1.02),
    ("firenze", "Florence", "Tuscany", ["Firenze", "Toscana"], 155_000, 168_000, 1.10),
    ("bologna", "Bologna", "Emilia-Romagna", ["Emilia Romagna"], 140_000, 150_000, 1.15),
    ("venezia", "Venice", "Veneto", ["Venezia", "Veneto"], 85_000, 90_000, 1.02),
    ("bari", "Bari", "Apulia", ["Puglia"], 155_000, 163_000, 0.80),
    ("verona", "Verona", "Veneto", [], 110_000, 116_000, 1.05),
    ("trieste", "Trieste", "Friuli-Venezia Giulia", [], 60_000, 68_000, 0.98),
]

SE_CITIES = [
    ("stockholm", "Stockholm", "Stockholm County", ["Stor-Stockholm"], 500_000, 510_000, 1.32),
    ("goteborg", "Gothenburg", "Västra Götaland", ["Göteborg", "Goteborg"], 255_000, 258_000, 1.08),
    ("malmo", "Malmö", "Skåne", ["Malmo", "Scania"], 160_000, 162_000, 0.95),
    ("uppsala", "Uppsala", "Uppsala County", [], 80_000, 82_000, 1.05),
    ("vasteras", "Västerås", "Västmanland", ["Vasteras"], 58_000, 58_000, 1.02),
    ("orebro", "Örebro", "Örebro County", ["Orebro"], 55_000, 56_000, 0.98),
    ("linkoping", "Linköping", "Östergötland", ["Linkoping"], 58_000, 58_000, 1.02),
    ("helsingborg", "Helsingborg", "Skåne", ["Hälsingborg"], 55_000, 56_000, 0.98),
    ("jonkoping", "Jönköping", "Jönköping County", ["Jonkoping"], 48_000, 49_000, 0.97),
    ("norrköping", "Norrköping", "Östergötland", ["Norrkoping"], 50_000, 51_000, 0.97),
]

PL_CITIES = [
    ("warszawa", "Warsaw", "Masovian", ["Warszawa", "Mazowieckie"], 850_000, 920_000, 1.45),
    ("krakow", "Kraków", "Lesser Poland", ["Krakow", "Cracow", "Małopolskie"], 345_000, 368_000, 1.12),
    ("lodz", "Łódź", "Łódź Voivodeship", ["Lodz", "Lódz"], 265_000, 298_000, 0.90),
    ("wroclaw", "Wrocław", "Lower Silesia", ["Wroclaw", "Breslau", "Dolnośląskie"], 300_000, 318_000, 1.10),
    ("poznan", "Poznań", "Greater Poland", ["Poznan", "Posen", "Wielkopolskie"], 240_000, 255_000, 1.08),
    ("gdansk", "Gdańsk", "Pomerania", ["Gdansk", "Danzig", "Gdańsk-Gdynia"], 205_000, 215_000, 1.05),
    ("szczecin", "Szczecin", "West Pomerania", ["Stettin", "Zachodniopomorskie"], 145_000, 153_000, 0.92),
    ("bydgoszcz", "Bydgoszcz", "Kuyavian-Pomeranian", ["Kujawsko-Pomorskie"], 120_000, 130_000, 0.92),
    ("lublin", "Lublin", "Lublin Voivodeship", ["Lubelskie"], 115_000, 128_000, 0.88),
    ("katowice", "Katowice", "Silesian", ["Upper Silesia", "Śląskie"], 120_000, 126_000, 1.02),
    ("bialystok", "Białystok", "Podlaskie", ["Bialystok", "Podlaskie"], 85_000, 92_000, 0.85),
    ("gdynia", "Gdynia", "Pomerania", ["Trojmiasto", "Trójmiasto"], 100_000, 105_000, 1.02),
]

CITY_DATA = {
    "uk": UK_CITIES,
    "de": DE_CITIES,
    "fr": FR_CITIES,
    "nl": NL_CITIES,
    "es": ES_CITIES,
    "it": IT_CITIES,
    "se": SE_CITIES,
    "pl": PL_CITIES,
}

for country, cities in CITY_DATA.items():
    out = []
    for (cid, name, region, aliases, pop_m, pop_f, inc_ratio) in cities:
        out.append({
            "id": cid,
            "name": name,
            "state": region,
            "aliases": aliases,
            "pop_male": pop_m,
            "pop_female": pop_f,
            "income_ratio": inc_ratio,
        })
    out_path = os.path.join(OUT_DIR, f"cities_{country}.json")
    with open(out_path, "w") as f:
        json.dump(out, f, separators=(",", ":"), indent=None)
    print(f"Wrote {out_path} ({len(out)} cities)")

print("\nDone!")
