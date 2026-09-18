"""
Create three sample ideas - one offline, one online, one hybrid - and run the real
analysis on each, against whatever database the environment points at.

This exists to answer one question end to end: do the figures a user sees actually
come from somewhere, and do they respond to what the user typed. It calls
AnalysisService.run_full_analysis, the same entry point the API uses, so there is
no separate code path that could pass here and fail in the app.

It only ever INSERTs. It does not touch existing ideas and it never calls the seed
sync, which deletes the admin user's ideas before re-inserting its own.

Run against Aiven:

    cd backend
    $env:DB_HOST="<host>"; $env:DB_PORT="<port>"
    $env:DB_USER="<user>"; $env:DB_PASSWORD="<password>"; $env:DB_NAME="<db>"
    python seed_sample_ideas.py

Add --dry-run to print what would be created without writing anything.
"""
import os
import sys
import uuid

from sqlalchemy import text

from app.database.connection import SessionLocal
from app.models.startup_idea import StartupIdea
from app.models.analysis import FinancialAnalysis, MarketAnalysis
from app.services.analysis_service import AnalysisService

OWNER_EMAIL = os.getenv("SEED_OWNER_EMAIL", "devendrababumotupalli@gmail.com")

IDEAS = [
    dict(
        title="Guntur Tiffin House",
        description=("A 30-seat tiffin centre near Vignan University serving idli, dosa and "
                     "thali to students and staff, with UPI ordering and a small delivery radius."),
        industry="food & beverage",
        business_type="Restaurant",
        sector="offline",
        target_customers="College students, hostel residents and staff within 3 km",
        budget=1200000,
        team_skills="Kitchen operations, local supply sourcing, basic accounting",
        pricing_model="Per plate",
        team_size=6,
        business_stage="Idea",
        revenue_goal=3600000,
        funding_required=1200000,
        location="Vadlamudi, Guntur, Andhra Pradesh",
    ),
    dict(
        title="LedgerLoop Payments",
        description=("A UPI-based payments and reconciliation product for small Indian merchants, "
                     "with automated settlement reports and GST-ready invoices."),
        industry="fintech",
        business_type="SaaS",
        sector="online",
        target_customers="Kirana stores and small merchants doing 100-2000 UPI transactions a month",
        budget=4000000,
        team_skills="Backend engineering, payments integration, compliance",
        pricing_model="Subscription",
        team_size=4,
        business_stage="Idea",
        revenue_goal=6000000,
        funding_required=4000000,
        location="Hyderabad, Telangana",
    ),
    dict(
        title="CarePoint Clinics",
        description=("A hybrid primary-care clinic: walk-in consultations at a physical clinic in "
                     "Guntur plus teleconsultation and follow-up through an app, with ABDM records."),
        industry="healthtech",
        business_type="Clinic",
        sector="hybrid",
        target_customers="Families and working adults needing primary care and follow-up",
        budget=2500000,
        team_skills="Clinical practice, health informatics, operations",
        pricing_model="Per consultation",
        team_size=5,
        business_stage="Idea",
        revenue_goal=4800000,
        funding_required=2500000,
        location="Guntur, Andhra Pradesh",
    ),
]


def report(db, idea_id):
    idea = db.query(StartupIdea).filter(StartupIdea.id == idea_id).first()
    fin = db.query(FinancialAnalysis).filter(FinancialAnalysis.idea_id == idea_id).first()
    mkt = db.query(MarketAnalysis).filter(MarketAnalysis.idea_id == idea_id).first()

    print("\n--- %s  [%s]  status=%s" % (idea.title, idea.sector, idea.analysis_status))
    if mkt:
        print("    market size       : %s" % getattr(mkt, "market_size", None))
        print("    market confidence : %s" % getattr(mkt, "market_size_confidence", None))
        print("    market source     : %s" % str(getattr(mkt, "market_size_source", None))[:100])
    if not fin:
        print("    NO FINANCIAL ROW WRITTEN")
        return
    print("    roi               : %s%%  (basis=%s capped=%s)" %
          (fin.roi, fin.roi_basis, fin.roi_was_capped))
    print("    gross margin      : %s%%" % fin.gross_margin_percent)
    print("    break-even        : %s months" % fin.break_even_months)
    print("    revenue y1/y2/y3  : %s / %s / %s" %
          (fin.year1_revenue, fin.year2_revenue, fin.year3_revenue))
    print("    benchmark conf    : %s" % fin.benchmark_confidence)
    print("    benchmark source  : %s" % str(fin.benchmark_source)[:100])
    print("    volume constraint : %s" % fin.volume_constraint)


def main():
    dry = "--dry-run" in sys.argv
    db = SessionLocal()
    try:
        # Report where this actually connected, not what the environment asked for.
        # Running this against the wrong database is the one mistake worth preventing,
        # and DB_HOST is empty whenever the settings come from .env instead.
        print("Database host: %s" % (db.get_bind().url.host or "unknown"))
        if dry:
            for spec in IDEAS:
                print("  would create: %-22s [%s] budget Rs %s" %
                      (spec["title"], spec["sector"], format(spec["budget"], ",")))
            return 0

        user_id = db.execute(
            text("SELECT id FROM users WHERE email = :e LIMIT 1"), {"e": OWNER_EMAIL}
        ).scalar() or db.execute(text("SELECT id FROM users LIMIT 1")).scalar()
        if not user_id:
            print("No user rows exist - cannot attach ideas.")
            return 1
        print("Attaching to user_id %s" % user_id)

        created = []
        for spec in IDEAS:
            existing = db.query(StartupIdea).filter(
                StartupIdea.user_id == user_id,
                StartupIdea.title == spec["title"]).first()
            if existing:
                print("\nSkipping '%s' - already present (%s)." % (spec["title"], existing.id))
                created.append(existing.id)
                continue
            idea = StartupIdea(id=str(uuid.uuid4()), user_id=user_id, country="India",
                               analysis_status="pending", **spec)
            db.add(idea)
            db.commit()
            created.append(idea.id)
            print("\n" + "=" * 78)
            print("ANALYSING  %-22s  [%s]  budget Rs %s" %
                  (spec["title"], spec["sector"], format(spec["budget"], ",")))
            print("=" * 78)
            AnalysisService.run_full_analysis(idea.id, db)

        print("\n" + "=" * 78)
        print("RESULTS")
        print("=" * 78)
        for idea_id in created:
            report(db, idea_id)
        print("\nIds: %s" % ", ".join(created))
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
