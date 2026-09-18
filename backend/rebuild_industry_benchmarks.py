"""
Rebuild industry_benchmarks.json from the raw Indian startup funding records.

Three defects in the previous build are fixed here.

Grouping. The old build grouped on the raw 'Industry Vertical' string, which has
799 distinct spellings across 2,873 rows. The same sector was therefore split
across several keys and each got its own average: education appeared as four
separate verticals whose averages ranged from US$2.8mn to US$50.4mn, an
eighteen-fold spread decided by nothing more than which spelling the incoming
text happened to match. Verticals are normalised to canonical sectors first.

Currency. Deals were converted at a flat Rs 87/USD. The records run from 2015 to
2020, when the rupee traded between 64 and 74, so that rate - taken from 2025 -
overstated every rupee figure by 17 to 36%. Each deal is now converted at the
FEDAI rate for the calendar year it closed in.

Central tendency. Only the mean was surfaced. On small, heavily skewed samples a
single large round drags it: transportation showed a US$979mn average across four
deals. Median and quartiles are carried alongside it, and sample size travels
with every row so a thin bucket is visible as thin.

The records are 2015-2020. That is stated in the file's _meta and must stay
visible wherever these figures are shown - they describe the market of that
period, not today's.
"""
import json
import io
import sys
from pathlib import Path

import pandas as pd

BASE = Path(__file__).resolve().parent
CSV = BASE / "data" / "startup_funding.csv"
OUT = BASE / "app" / "ml_models" / "industry_benchmarks.json"
SIZES = BASE / "app" / "ml_models" / "india_market_sizes.json"

MIN_DEALS = 5   # below this a bucket is not written at all

# Canonical sector <- ordered match rules. The first rule that hits wins, so the
# specific sectors are listed before the broad ones.
RULES = [
    ("edtech", ["edtech", "ed-tech", "ed tech", "education", "e-learning", "elearning",
                "learning", "tutor", "coaching", "school", "university", "skill"]),
    ("fintech", ["fintech", "fin-tech", "fin tech", "finance", "financial", "payment",
                 "lending", "insurance", "insurtech", "banking", "wealth", "credit"]),
    ("healthcare", ["healthcare", "health care", "health and wellness", "healthtech",
                    "health-tech", "health", "medical", "pharma", "diagnostic", "wellness",
                    "fitness", "hospital"]),
    ("food", ["food", "beverage", "restaurant", "grocery", "dining", "kitchen", "nutrition"]),
    ("logistics", ["logistic", "delivery", "courier", "freight", "shipping", "supply chain",
                   "warehous", "transport", "mobility", "automobile", "automotive", "cab",
                   "taxi", "fleet"]),
    ("ecommerce", ["ecommerce", "e-commerce", "e commerce", "marketplace", "retail",
                   "online store", "d2c", "commerce"]),
    ("realestate", ["real estate", "realestate", "proptech", "property", "housing",
                    "construction", "co-working", "coworking"]),
    ("agritech", ["agri", "farm", "crop", "dairy", "livestock"]),
    ("travel", ["travel", "tourism", "hotel", "hospitality", "booking"]),
    ("media", ["media", "entertainment", "gaming", "game", "music", "video", "content",
               "news", "publishing", "advertis", "marketing"]),
    ("saas", ["saas", "b2b software", "enterprise software", "crm", "erp", "hr tech",
              "hrtech", "analytics platform", "big data"]),
    ("technology", ["technology", "information technology", "it services", "software",
                    "artificial intelligence", "machine learning", "iot", "blockchain",
                    "cloud", "cyber", "tech", "it", "ai"]),
    ("consumer_internet", ["consumer internet", "consumer", "social", "classified", "dating",
                           "community", "lifestyle", "services"]),
]

# Short tokens that would otherwise match inside longer words ("it" in "unit").
WORD_ONLY = {"it", "ai", "tech"}


def canonical(vertical):
    """Map one raw vertical label to a canonical sector, or None if nothing fits."""
    raw = str(vertical).strip().lower()
    padded = " " + raw + " "
    for sector, keys in RULES:
        for key in keys:
            if key in WORD_ONLY:
                if (" " + key + " ") in padded:
                    return sector
            elif key in padded:
                return sector
    return None


def fx_rates():
    meta = json.load(io.open(SIZES, encoding="utf-8"))["_meta"]["fx_inr_per_usd"]
    return {k: v for k, v in meta["rates"].items() if len(k) == 4}, meta["source"]


def parse_usd(val):
    if pd.isna(val):
        return None
    text = str(val).replace(",", "").replace("$", "").replace("+", "").strip()
    if text.lower() in ("", "n/a", "na", "undisclosed", "unknown", "nan"):
        return None
    try:
        amount = float(text)
    except ValueError:
        return None
    return amount if amount > 0 else None


def build():
    if not CSV.exists():
        print("[benchmarks] %s not found - nothing rebuilt." % CSV, file=sys.stderr)
        return False

    rates, fx_source = fx_rates()
    df = pd.read_csv(CSV)
    df["amt_usd"] = df["Amount in USD"].apply(parse_usd)
    df["year"] = pd.to_datetime(df["Date dd/mm/yyyy"], errors="coerce", dayfirst=True).dt.year
    df["sector"] = df["Industry Vertical"].apply(canonical)

    clean = df.dropna(subset=["amt_usd", "sector", "year"]).copy()
    clean["year"] = clean["year"].astype(int)
    # Convert each deal at the rate for the year it closed, not one flat rate.
    clean["rate"] = clean["year"].map(lambda y: rates.get(str(y)))
    clean = clean.dropna(subset=["rate"])
    clean["amt_inr_cr"] = clean["amt_usd"] * clean["rate"] / 1e7

    sectors = {}
    dropped = []
    for sector, group in clean.groupby("sector"):
        count = len(group)
        if count < MIN_DEALS:
            dropped.append((sector, count))
            continue
        usd = group["amt_usd"]
        inr = group["amt_inr_cr"]
        cities = group["City  Location"].dropna().str.strip().str.title()
        median_usd = float(usd.median())
        mean_usd = float(usd.mean())
        sectors[sector] = {
            "deal_count": int(count),
            "median_funding_usd": round(median_usd, 2),
            "mean_funding_usd": round(mean_usd, 2),
            "p25_funding_usd": round(float(usd.quantile(0.25)), 2),
            "p75_funding_usd": round(float(usd.quantile(0.75)), 2),
            "median_funding_inr_cr": round(float(inr.median()), 2),
            "mean_funding_inr_cr": round(float(inr.mean()), 2),
            "years_covered": [int(group["year"].min()), int(group["year"].max())],
            "top_hub_cities": cities.value_counts().head(3).index.tolist(),
            "reliability": "good" if count >= 50 else "moderate" if count >= 20 else "thin",
            "skew_note": (
                "Mean is more than 3x the median - the average is pulled by a few large rounds, "
                "so prefer the median."
                if mean_usd > 3 * max(median_usd, 1) else ""
            ),
        }

    meta = {
        "description": ("Indian startup funding benchmarks by canonical sector, rebuilt from the "
                        "deal-level records rather than from raw vertical strings."),
        "source": "Indian Startup Funding dataset (startup_funding.csv), deal-level records",
        "rebuilt_by": "backend/rebuild_industry_benchmarks.py",
        "records_total": int(len(df)),
        "records_used": int(len(clean)),
        "years_covered": [int(clean["year"].min()), int(clean["year"].max())],
        "vintage_warning": (
            "These deals closed between 2015 and 2020. They describe the funding market of that "
            "period and are NOT current. Anything displaying these figures must show the year "
            "range with them."),
        "currency": ("Each deal is converted at the FEDAI rate for its own calendar year. The "
                     "previous build used a flat Rs 87/USD, a 2025 rate applied to deals up to a "
                     "decade older, which overstated rupee figures by 17-36%."),
        "fx_source": fx_source,
        "grouping": ("799 raw vertical spellings normalised to %d canonical sectors. Previously the "
                     "same sector was split across up to five keys, with up to a 36x spread between "
                     "their averages." % len(sectors)),
        "min_deals": MIN_DEALS,
        "prefer": ("median_funding_usd. The mean is retained for comparison but is unreliable on "
                   "skewed samples; check skew_note and deal_count before using it."),
        "dropped_below_min": [{"sector": s, "deal_count": n} for s, n in sorted(dropped)],
        # Published so the lookup in ml_service resolves an incoming industry string with
        # exactly the rules that built these buckets. One source of truth: if the rules
        # change here, the lookup follows automatically on the next rebuild.
        "sector_aliases": {sector: keys for sector, keys in RULES if sector in sectors},
        "word_only_aliases": sorted(WORD_ONLY),
    }

    ordered = {"_meta": meta}
    for key in sorted(sectors, key=lambda s: -sectors[s]["deal_count"]):
        ordered[key] = sectors[key]

    with io.open(OUT, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(ordered, handle, indent=2, ensure_ascii=False)
        handle.write("\n")

    print("[benchmarks] %d canonical sectors from %d deals (%d-%d) -> %s"
          % (len(sectors), len(clean), clean["year"].min(), clean["year"].max(), OUT.name))
    for key, value in ordered.items():
        if key == "_meta":
            continue
        print("   %-18s n=%-4d median US$%12s  mean US$%13s  %s"
              % (key, value["deal_count"],
                 format(round(value["median_funding_usd"]), ","),
                 format(round(value["mean_funding_usd"]), ","),
                 value["reliability"]))
    if dropped:
        print("   dropped (under %d deals): %s"
              % (MIN_DEALS, ", ".join("%s(%d)" % (s, n) for s, n in dropped)))
    return True


if __name__ == "__main__":
    sys.exit(0 if build() else 1)
