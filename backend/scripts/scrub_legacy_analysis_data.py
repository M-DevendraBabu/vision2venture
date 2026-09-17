# -*- coding: utf-8 -*-
"""
One-off maintenance: scrub pre-accuracy-pass data out of a live database.
=========================================================================
The analysis code no longer invents star ratings, review counts or measured
outcome claims, but rows written *before* that change are still stored in MySQL
and are what users see. This rewrites those rows in place:

  * clears every `rating` / `review_count` whose `rating_source` is NULL — i.e.
    every rating that did not come from Google Places or Foursquare;
  * relabels `evidence_status = 'web_verified'` to 'web_listed', because being
    listed on the web is not the same as having verified customer ratings;
  * removes "N% Positive Feedback (N Reviews)" and "Rated 4.6* across 512
    verified user reviews" text, which was derived from hash(name);
  * rewords measured-outcome claims about products that do not exist yet
    ("10x faster setup than <competitor>", "cutting table turnover by 35%").

Users, sessions and user-entered idea text are never touched.

Run it once per database. It is idempotent and defaults to a dry run:

    # local (uses whatever backend/.env points at)
    python scripts/scrub_legacy_analysis_data.py
    python scripts/scrub_legacy_analysis_data.py --apply

    # a different database, e.g. the hosted one, without editing .env
    DB_HOST=... DB_PORT=... DB_USER=... DB_PASSWORD=... DB_NAME=... \
        python scripts/scrub_legacy_analysis_data.py --apply
"""
import os
import re
import sys
import collections

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import MetaData, String, Text, text  # noqa: E402
from app.database.connection import engine  # noqa: E402
from app.config import settings  # noqa: E402

APPLY = "--apply" in sys.argv
SHOW = "--show" in sys.argv

# Auth, session and user-entered idea text are not generated analysis content.
SKIP_TABLES = {"users", "user_sessions", "alembic_version", "startup_ideas"}

FEEDBACK = re.compile(r"\s*\d+% Positive Feedback \(\d+ Reviews\)\.?")
RATED_BULLET = re.compile(
    r"^\s*(?:•\s*)?(?:Likely gap:\s*)?Rated\s+\d(?:\.\d)?\s*★[^\n]*?verified user reviews[^\n]*$",
    re.I | re.M)

TEXT_SUBS = [
    ("Next-generation modern architecture delivering 10x faster setup and lower total cost of ownership than ",
     "Opportunity to differentiate on faster setup and lower total cost of ownership than "),
    ("cutting table turnover time by 35%.",
     "with the goal of shortening table turnover time."),
    ("Cut cloud costs by 30% in the first 90 days without engineering overhead.",
     "Aims to cut cloud costs materially within the first 90 days without engineering overhead."),
    ("The value proposition is clear: save 30% on cloud bills within 90 days.",
     "The value proposition is clear: measurable savings on cloud bills within the first 90 days."),
    ("at 35% lower subscription fees", "at a lower subscription fee"),
    ("at 80% lower cost (Rs 15k-30k)", "at a materially lower price point (Rs 15k-30k)"),
    ("pay 3x–4x higher software fees in USD", "pay materially higher software fees in USD"),
    ("operates with ~35% lower administrative overhead than legacy incumbents, allowing faster service iteration and direct customer cost savings.",
     "is designed to run leaner than legacy incumbents, targeting lower administrative overhead so savings can be passed to customers and service can iterate faster."),
    ("delivers transparent value-based packages with bundled perks and zero hidden charges, providing 15-20% higher perceived customer ROI.",
     "delivers transparent value-based packages with bundled perks and no hidden charges, so customers can see exactly what they pay for."),
    ("• Customer Praise: ", "• "),
    ("• Customer Complaints: ", "• Likely gap: "),
    ("Customer Praise: ", ""),
    ("Customer Complaints: ", "Likely gap: "),
    ("Likely gap: Reviews cite ", "Likely gap: "),
    ("Reviews cite ", "Possible gap: "),
]

NO_RATING = "Rating data not available for this competitor"


def scrub(value: str) -> str:
    out = FEEDBACK.sub("", value)
    for old, new in TEXT_SUBS:
        out = out.replace(old, new)
    out = RATED_BULLET.sub("", out)
    return re.sub(r"\n{2,}", "\n", out).strip("\n ").strip()


def changed_materially(old: str, new: str) -> bool:
    """True only when something other than whitespace changed."""
    return "".join(old.split()) != "".join(new.split())


def main() -> int:
    stats = collections.Counter()
    md = MetaData()
    md.reflect(bind=engine)

    with engine.begin() as conn:
        for tname, tbl in md.tables.items():
            if tname in SKIP_TABLES:
                continue
            pk = list(tbl.primary_key.columns)
            if not pk:
                continue
            pkc = pk[0]
            strcols = [c for c in tbl.columns
                       if isinstance(c.type, (String, Text)) and c.name != pkc.name]
            if not strcols:
                continue

            for row in conn.execute(tbl.select()).mappings().all():
                changes = {}
                for col in strcols:
                    val = row.get(col.name)
                    if isinstance(val, str) and val:
                        new = scrub(val)
                        if changed_materially(val, new):
                            changes[col.name] = new
                if not changes:
                    continue
                stats[f"{tname}: rows rewritten"] += 1
                if SHOW:
                    for k, new in changes.items():
                        print(f"    [{tname}.{k}]\n      - {row[k][:130]}\n      + {new[:130]}")
                if APPLY:
                    conn.execute(tbl.update().where(pkc == row[pkc.name]).values(**changes))

        cols = {r[0] for r in conn.execute(text("SHOW COLUMNS FROM competitors")).fetchall()}
        if {"rating", "review_count", "rating_source"} <= cols:
            stats["competitors: unsourced ratings cleared"] = conn.execute(text(
                "SELECT COUNT(*) FROM competitors WHERE rating_source IS NULL "
                "AND (rating IS NOT NULL OR review_count IS NOT NULL)")).scalar()
            if APPLY:
                conn.execute(text(
                    "UPDATE competitors SET rating = NULL, review_count = NULL, "
                    "customer_sentiment = :s "
                    "WHERE rating_source IS NULL "
                    "AND (rating IS NOT NULL OR review_count IS NOT NULL)"), {"s": NO_RATING})

            stats["competitors: 'web_verified' relabelled 'web_listed'"] = conn.execute(text(
                "SELECT COUNT(*) FROM competitors WHERE evidence_status = 'web_verified'")).scalar()
            if APPLY:
                conn.execute(text("UPDATE competitors SET evidence_status = 'web_listed' "
                                  "WHERE evidence_status = 'web_verified'"))

    mode = "APPLIED" if APPLY else "DRY RUN (re-run with --apply to write)"
    print(f"=== {settings.DB_HOST}/{settings.DB_NAME} - {mode} ===")
    for key, count in sorted(stats.items()):
        if count:
            print(f"  {count:>5}  {key}")
    if not any(stats.values()):
        print("  nothing to change - this database is already clean")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
