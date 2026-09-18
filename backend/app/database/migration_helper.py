from sqlalchemy import text
from app.database.connection import engine, Base

def ensure_competitor_tables_and_columns():
    """
    Idempotent database migration:
    1. Runs Base.metadata.create_all to create any missing tables (like competitor_intelligence).
    2. Dynamically verifies and adds any missing columns on the 'competitors' table for existing databases.
    """
    try:
        # Create missing tables
        Base.metadata.create_all(bind=engine)
        
        # Check existing columns on competitors table
        with engine.connect() as conn:
            dialect = engine.dialect.name
            
            existing_cols = set()
            if dialect == 'mysql':
                res = conn.execute(text("SHOW COLUMNS FROM competitors"))
                existing_cols = {row[0] for row in res.fetchall()}
            elif dialect == 'sqlite':
                res = conn.execute(text("PRAGMA table_info(competitors)"))
                existing_cols = {row[1] for row in res.fetchall()}
            else:
                try:
                    res = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'competitors'"))
                    existing_cols = {row[0] for row in res.fetchall()}
                except Exception:
                    pass

            columns_to_add = [
                ("business_type", "VARCHAR(50) DEFAULT 'online'"),
                ("competitor_type", "VARCHAR(50) DEFAULT 'direct'"),
                ("description", "TEXT NULL"),
                ("website_url", "VARCHAR(500) NULL"),
                ("app_url", "VARCHAR(500) NULL"),
                ("location", "VARCHAR(255) NULL"),
                ("latitude", "FLOAT NULL"),
                ("longitude", "FLOAT NULL"),
                ("distance_km", "FLOAT NULL"),
                ("phone", "VARCHAR(50) NULL"),
                ("rating", "FLOAT NULL"),
                ("review_count", "INT NULL"),
                ("reviews", "JSON NULL"),
                ("customer_sentiment", "TEXT NULL"),
                ("rating_source", "VARCHAR(50) NULL"),
                ("opening_hours", "VARCHAR(255) NULL"),
                ("pricing_model", "VARCHAR(100) NULL"),
                ("pricing_details", "TEXT NULL"),
                ("target_audience", "TEXT NULL"),
                ("features", "TEXT NULL"),
                ("relevance_score", "DECIMAL(5, 2) DEFAULT 50.0"),
                ("source_urls", "JSON NULL"),
                ("data_sources", "JSON NULL"),
                ("data_freshness", "VARCHAR(50) NULL"),
                ("confidence_score", "DECIMAL(5, 2) DEFAULT 80.0"),
                ("evidence_status", "VARCHAR(50) DEFAULT 'AI inference'"),
                ("source_type", "VARCHAR(50) NULL"),
                ("source_label", "VARCHAR(100) NULL"),
                ("verified", "BOOLEAN DEFAULT FALSE"),
                ("is_selected", "BOOLEAN DEFAULT TRUE"),
                ("updated_at", "DATETIME NULL"),
            ]

            for col_name, col_type in columns_to_add:
                if col_name not in existing_cols and existing_cols:
                    try:
                        conn.execute(text(f"ALTER TABLE competitors ADD COLUMN {col_name} {col_type}"))
                        conn.commit()
                        print(f"[Migration] Added column '{col_name}' to 'competitors' table.")
                    except Exception as e:
                        print(f"[Migration] Notice adding {col_name}: {e}")

            # Check existing columns on startup_ideas table
            idea_cols = set()
            if dialect == 'mysql':
                res = conn.execute(text("SHOW COLUMNS FROM startup_ideas"))
                idea_cols = {row[0] for row in res.fetchall()}
            elif dialect == 'sqlite':
                res = conn.execute(text("PRAGMA table_info(startup_ideas)"))
                idea_cols = {row[1] for row in res.fetchall()}
            else:
                try:
                    res = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'startup_ideas'"))
                    idea_cols = {row[0] for row in res.fetchall()}
                except Exception:
                    pass

            idea_cols_to_add = [
                ("location", "VARCHAR(255) NULL"),
                ("latitude", "FLOAT NULL"),
                ("longitude", "FLOAT NULL"),
                ("radius_km", "FLOAT DEFAULT 5.0")
            ]
            for col_name, col_type in idea_cols_to_add:
                if col_name not in idea_cols and idea_cols:
                    try:
                        conn.execute(text(f"ALTER TABLE startup_ideas ADD COLUMN {col_name} {col_type}"))
                        conn.commit()
                        print(f"[Migration] Added column '{col_name}' to 'startup_ideas' table.")
                    except Exception as e:
                        print(f"[Migration] Notice adding {col_name} to startup_ideas: {e}")

            # 3. Allow NULL scores on startup_analysis and market_analysis
            if dialect == 'mysql':
                try:
                    conn.execute(text("ALTER TABLE startup_analysis MODIFY overall_score DECIMAL(5, 2) NULL DEFAULT NULL"))
                    conn.commit()
                except Exception as e:
                    print(f"[Migration] startup_analysis.overall_score null update notice: {e}")

                try:
                    conn.execute(text("ALTER TABLE market_analysis MODIFY growth_rate DECIMAL(5, 2) NULL DEFAULT NULL"))
                    conn.execute(text("ALTER TABLE market_analysis MODIFY opportunity_score DECIMAL(5, 2) NULL DEFAULT NULL"))
                    conn.commit()
                except Exception as e:
                    print(f"[Migration] market_analysis score null update notice: {e}")

            # 4. Add data_source column to analysis tables if missing
            analysis_tables = ["market_analysis", "business_models", "swot_analysis", "financial_analysis"]
            for tbl in analysis_tables:
                try:
                    tbl_cols = set()
                    if dialect == 'mysql':
                        res = conn.execute(text(f"SHOW COLUMNS FROM {tbl}"))
                        tbl_cols = {row[0] for row in res.fetchall()}
                    elif dialect == 'sqlite':
                        res = conn.execute(text(f"PRAGMA table_info({tbl})"))
                        tbl_cols = {row[1] for row in res.fetchall()}

                    if "data_source" not in tbl_cols and tbl_cols:
                        conn.execute(text(f"ALTER TABLE {tbl} ADD COLUMN data_source VARCHAR(100) NULL"))
                        conn.commit()
                        print(f"[Migration] Added 'data_source' column to '{tbl}' table.")
                except Exception as e:
                    print(f"[Migration] Notice adding data_source to {tbl}: {e}")

            # 4b. Provenance for the market_size figure, so the UI can show whether it
            #     is a published statistic or a flagged planning assumption.
            try:
                ma_cols = set()
                if dialect == 'mysql':
                    res = conn.execute(text("SHOW COLUMNS FROM market_analysis"))
                    ma_cols = {row[0] for row in res.fetchall()}
                elif dialect == 'sqlite':
                    res = conn.execute(text("PRAGMA table_info(market_analysis)"))
                    ma_cols = {row[1] for row in res.fetchall()}

                for col_name, col_type in [
                    ("market_size_source", "VARCHAR(500) NULL"),
                    ("market_size_confidence", "VARCHAR(20) NULL"),
                ]:
                    if col_name not in ma_cols and ma_cols:
                        conn.execute(text(f"ALTER TABLE market_analysis ADD COLUMN {col_name} {col_type}"))
                        conn.commit()
                        print(f"[Migration] Added market_analysis.{col_name}.")
            except Exception as e:
                print(f"[Migration] market_analysis provenance column notice: {e}")

            # ─────────────────────────────────────────────────────────────
            # 5. Fix market_analysis columns: VARCHAR(255) → TEXT
            #    (LLM-generated primary_demo / key_pain_point can exceed 255 chars
            #     causing "Data too long" insert errors on Artisan Bakery etc.)
            # ─────────────────────────────────────────────────────────────
            if dialect == 'mysql':
                market_text_fixes = [
                    ("primary_demo",       "TEXT"),
                    ("key_pain_point",     "TEXT"),
                    ("purchase_trigger",   "TEXT"),
                    ("acquisition_channel","VARCHAR(500)"),
                ]
                try:
                    res = conn.execute(text("SHOW COLUMNS FROM market_analysis"))
                    ma_cols = {row[0]: row[1].upper() for row in res.fetchall()}
                    for col_name, new_type in market_text_fixes:
                        if col_name in ma_cols:
                            current_type = ma_cols[col_name]
                            # Only alter if it's still a short VARCHAR (needs upgrade)
                            if "VARCHAR(255)" in current_type or "VARCHAR(500)" in current_type and col_name == "acquisition_channel":
                                conn.execute(text(f"ALTER TABLE market_analysis MODIFY COLUMN {col_name} {new_type}"))
                                conn.commit()
                                print(f"[Migration] Widened market_analysis.{col_name} to {new_type}.")
                except Exception as e:
                    print(f"[Migration] market_analysis text-column fix notice: {e}")

            # ─────────────────────────────────────────────────────────────
            # 6. Add gross_margin_percent, break_even_months, year1/2/3_revenue
            #    columns to financial_analysis (added to track real metrics in DB)
            # ─────────────────────────────────────────────────────────────
            try:
                fa_cols = set()
                if dialect == 'mysql':
                    res = conn.execute(text("SHOW COLUMNS FROM financial_analysis"))
                    fa_cols = {row[0] for row in res.fetchall()}
                elif dialect == 'sqlite':
                    res = conn.execute(text("PRAGMA table_info(financial_analysis)"))
                    fa_cols = {row[1] for row in res.fetchall()}

                new_fa_cols = [
                    ("gross_margin_percent", "DECIMAL(5,2) NULL DEFAULT NULL"),
                    ("break_even_months",    "INT NULL DEFAULT NULL"),
                    ("year1_revenue",        "DECIMAL(18,2) NULL DEFAULT NULL"),
                    ("year2_revenue",        "DECIMAL(18,2) NULL DEFAULT NULL"),
                    ("year3_revenue",        "DECIMAL(18,2) NULL DEFAULT NULL"),
                    # Provenance for the figures above. Nullable so existing rows, which
                    # were written before any of this was recorded, stay valid and simply
                    # show nothing rather than claiming a source they never had.
                    ("benchmark_source",       "VARCHAR(500) NULL DEFAULT NULL"),
                    ("benchmark_confidence",   "VARCHAR(20) NULL DEFAULT NULL"),
                    ("roi_basis",              "VARCHAR(60) NULL DEFAULT NULL"),
                    ("roi_was_capped",         "TINYINT(1) NULL DEFAULT NULL"),
                    ("volume_constraint",      "VARCHAR(20) NULL DEFAULT NULL"),
                    ("growth_assumption_note", "VARCHAR(500) NULL DEFAULT NULL"),
                ]
                for col_name, col_type in new_fa_cols:
                    if col_name not in fa_cols and fa_cols:
                        conn.execute(text(f"ALTER TABLE financial_analysis ADD COLUMN {col_name} {col_type}"))
                        conn.commit()
                        print(f"[Migration] Added financial_analysis.{col_name} ({col_type}).")
            except Exception as e:
                print(f"[Migration] financial_analysis new-columns notice: {e}")

            print("[Migration] All database tables and columns verified successfully.")
    except Exception as e:
        print(f"[Migration] Notice running migration check: {e}")

import os
import json
from datetime import datetime
from app.models.user import User
from app.models.startup_idea import StartupIdea
from app.models.analysis import (
    StartupAnalysis, MarketAnalysis, TechnologyRecommendation, BusinessModel,
    SwotAnalysis, FinancialAnalysis, RiskAnalysis, FeasibilityAnalysis,
    InvestorReadiness, ImplementationRoadmap, CompetitorIntelligence, Competitor
)

PROD_TITLES = {
    "AI Resume & Portfolio Builder SaaS",
    "Apex Strength & CrossFit Gym",
    "CloudCost Sentinel FinOps Platform",
    "CarePoint Omnichannel Smart Clinic",
    "FreshFarm Organics Hyperlocal Grocery",
    "Artisan Crust & Crumb Bakery",
    "Biryani Point near Vignan University, Vadlamudi",
    # 3 new production ideas added
    "CodeSprint EdTech Platform",
    "Dosa King Tiffin Center",
    "PawsFirst Vet & Pet Clinic",
}

def _clean_attrs(model_cls, data_dict, overrides=None, actual_db_cols=None):
    if not data_dict:
        return None
    d = dict(data_dict)
    if overrides:
        d.update(overrides)
    col_names = {c.name: c for c in model_cls.__table__.columns}
    res = {}
    for k, v in d.items():
        if k in col_names:
            # If actual DB columns are known, never try to insert a column that isn't physically in the table
            if actual_db_cols is not None and k.lower() not in actual_db_cols:
                continue
            col = col_names[k]
            if 'DATETIME' in str(col.type).upper() or 'TIMESTAMP' in str(col.type).upper():
                if isinstance(v, str):
                    try:
                        v = datetime.fromisoformat(v)
                    except Exception:
                        v = datetime.utcnow()
            res[k] = v
    return model_cls(**res)

def sync_production_seed_if_needed(db, force=False, target_user=None):
    """
    Ensures that the admin user on production (Render / Cloud DB) has the 10 clean production
    startup ideas (3 Online, 4 Offline, 3 Hybrid) and all their associated analyses,
    benchmarks, and competitors.
    """
    try:
        if target_user:
            admin_user = target_user
        else:
            admin_email = os.getenv("ADMIN_EMAIL", "devendrababumotupalli@gmail.com").strip().lower()
            admin_user = db.query(User).filter(User.email.ilike(admin_email)).first()
            if not admin_user:
                admin_user = db.query(User).filter(User.role == 'admin').first()
                if not admin_user:
                    print(f"[SeedSync] Admin user ({admin_email}) not found yet. Skipping seed sync.")
                    return {"status": "skipped", "reason": "admin not found"}

        current_ideas = db.query(StartupIdea).filter(StartupIdea.user_id == admin_user.id).all()
        current_titles = {i.title.strip() for i in current_ideas}

        stale_prefixes = ("neurallogistics", "solargrid", "propmatch", "vaultpay", "skillcraft", "greenbite")
        has_stale = any(i.title.lower().startswith(stale_prefixes) for i in current_ideas)
        is_exact_match = (current_titles == PROD_TITLES)

        seed_path = os.path.join(os.path.dirname(__file__), "production_seed_data.json")
        if not os.path.exists(seed_path):
            print(f"[SeedSync] Error: {seed_path} not found.")
            return {"status": "error", "message": f"Seed file not found: {seed_path}"}

        with open(seed_path, "r", encoding="utf-8") as f:
            seed_items = json.load(f)

        seed_scores = {
            item['idea']['title'].strip(): (item.get('startup_analysis') or {}).get('overall_score')
            for item in seed_items if 'idea' in item and item.get('idea') and 'title' in item['idea']
        }

        # Check for duplicate matrix strings in existing intelligence, missing data_source, or score mismatches
        has_legacy_intel = False
        has_unmigrated_data = False
        has_score_mismatch = False
        if is_exact_match:
            for idea in current_ideas:
                intel = db.query(CompetitorIntelligence).filter(CompetitorIntelligence.idea_id == idea.id).first()
                if intel and intel.comparison_matrix:
                    if any("legacy technical debt" in str(r.get("advantage", "")) for r in intel.comparison_matrix):
                        has_legacy_intel = True
                        break
                m = db.query(MarketAnalysis).filter(MarketAnalysis.idea_id == idea.id).first()
                if not m or getattr(m, 'data_source', None) is None:
                    has_unmigrated_data = True
                    break
                s = db.query(StartupAnalysis).filter(StartupAnalysis.idea_id == idea.id).first()
                expected_score = seed_scores.get(idea.title.strip())
                actual_score = float(s.overall_score) if s and s.overall_score is not None else None
                if expected_score is not None:
                    if actual_score is None or abs(float(expected_score) - actual_score) > 0.05:
                        has_score_mismatch = True
                        print(f"[SeedSync] Idea '{idea.title}' score mismatch: DB={actual_score} vs Seed={expected_score}. Refresh required.")
                        break

        # Check if new financial columns are missing data (triggers resync after schema migration)
        has_missing_financial_cols = False
        if is_exact_match:
            try:
                fa_sample = db.query(FinancialAnalysis).first()
                if fa_sample and getattr(fa_sample, 'gross_margin_percent', None) is None:
                    has_missing_financial_cols = True
                    print("[SeedSync] financial_analysis.gross_margin_percent is empty — resync needed.")
            except Exception:
                pass

        if not force and is_exact_match and not has_stale and not has_legacy_intel and not has_unmigrated_data and not has_score_mismatch and not has_missing_financial_cols:
            print(f"[SeedSync] Admin user {admin_user.email} already has {len(PROD_TITLES)} verified production ideas with fresh data. No action needed.")
            return {"status": "ok", "message": "already synchronized", "count": len(current_ideas)}

        print(f"[SeedSync] Syncing production seed for {admin_user.email} (current ideas: {len(current_ideas)}, target: {len(seed_items)}, force={force})...")

        # Proactively ensure new financial columns exist before inserting
        for col_name, col_type in [
            ("gross_margin_percent", "DECIMAL(5,2) NULL DEFAULT NULL"),
            ("break_even_months",    "INT NULL DEFAULT NULL"),
            ("year1_revenue",        "DECIMAL(18,2) NULL DEFAULT NULL"),
            ("year2_revenue",        "DECIMAL(18,2) NULL DEFAULT NULL"),
            ("year3_revenue",        "DECIMAL(18,2) NULL DEFAULT NULL"),
        ]:
            try:
                db.execute(text(f"ALTER TABLE financial_analysis ADD COLUMN {col_name} {col_type}"))
                db.commit()
                print(f"[SeedSync] Added missing column '{col_name}' to financial_analysis.")
            except Exception:
                db.rollback()

        for col_name, new_type in [
            ("primary_demo",        "TEXT"),
            ("key_pain_point",      "TEXT"),
            ("purchase_trigger",    "TEXT"),
            ("acquisition_channel", "VARCHAR(500)"),
        ]:
            try:
                db.execute(text(f"ALTER TABLE market_analysis MODIFY COLUMN {col_name} {new_type}"))
                db.commit()
            except Exception:
                db.rollback()

        # Cache physical table columns from MySQL
        table_cols_cache = {}
        def get_actual_cols(tbl_name):
            if tbl_name not in table_cols_cache:
                try:
                    res = db.execute(text(f"SHOW COLUMNS FROM {tbl_name}"))
                    table_cols_cache[tbl_name] = {row[0].lower() for row in res.fetchall()}
                except Exception:
                    table_cols_cache[tbl_name] = None
            return table_cols_cache[tbl_name]

        for idea in current_ideas:
            db.delete(idea)
        db.flush()

        for item in seed_items:
            idea_dict = item.get("idea") or {}
            if not idea_dict:
                continue
            idea_obj = _clean_attrs(StartupIdea, idea_dict, {"user_id": admin_user.id}, actual_db_cols=get_actual_cols("startup_ideas"))
            db.add(idea_obj)
            db.flush()

            analysis_mappings = [
                (StartupAnalysis, "startup_analysis"),
                (MarketAnalysis, "market_analysis"),
                (TechnologyRecommendation, "technology_recommendation"),
                (BusinessModel, "business_model"),
                (SwotAnalysis, "swot_analysis"),
                (FinancialAnalysis, "financial_analysis"),
                (RiskAnalysis, "risk_analysis"),
                (FeasibilityAnalysis, "feasibility_analysis"),
                (InvestorReadiness, "investor_readiness"),
                (ImplementationRoadmap, "implementation_roadmap"),
                (CompetitorIntelligence, "competitor_intelligence"),
            ]

            for model_cls, key in analysis_mappings:
                data = item.get(key)
                if data:
                    tbl_name = getattr(model_cls, '__tablename__', None)
                    actual_cols = get_actual_cols(tbl_name) if tbl_name else None
                    obj = _clean_attrs(model_cls, data, {"idea_id": idea_obj.id}, actual_db_cols=actual_cols)
                    db.add(obj)

            comps = item.get("competitors", [])
            for c_data in comps:
                c_obj = _clean_attrs(Competitor, c_data, {"idea_id": idea_obj.id}, actual_db_cols=get_actual_cols("competitors"))
                db.add(c_obj)

        db.commit()
        print(f"[SeedSync] Successfully seeded {len(seed_items)} production ideas for {admin_user.email}!")
        return {"status": "success", "message": f"Seeded {len(seed_items)} ideas successfully", "user": admin_user.email}
    except Exception as e:
        db.rollback()
        print(f"[SeedSync] Error during seed sync: {e}")
        return {"status": "error", "message": str(e)}

