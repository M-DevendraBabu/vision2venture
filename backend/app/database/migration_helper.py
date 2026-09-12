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
                        
            print("[Migration] Competitor and startup tables/columns verified successfully.")
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
    "Artisan Crust & Crumb Bakery"
}

def _clean_attrs(model_cls, data_dict, overrides=None):
    if not data_dict:
        return None
    d = dict(data_dict)
    if overrides:
        d.update(overrides)
    col_names = {c.name: c for c in model_cls.__table__.columns}
    res = {}
    for k, v in d.items():
        if k in col_names:
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
    Ensures that the admin user on production (Render / Cloud DB) has the 6 clean production
    startup ideas (2 Online, 2 Offline, 2 Hybrid) and all their associated analyses,
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

        if not force and is_exact_match and not has_stale:
            print(f"[SeedSync] Admin user {admin_user.email} already has the 6 verified production ideas. No action needed.")
            return {"status": "ok", "message": "already synchronized", "count": len(current_ideas)}

        print(f"[SeedSync] Syncing production seed for {admin_user.email} (current ideas: {len(current_ideas)}, force={force}, has_stale={has_stale})...")

        for idea in current_ideas:
            db.delete(idea)
        db.flush()

        seed_path = os.path.join(os.path.dirname(__file__), "production_seed_data.json")
        if not os.path.exists(seed_path):
            print(f"[SeedSync] Error: {seed_path} not found.")
            return {"status": "error", "message": f"Seed file not found: {seed_path}"}

        with open(seed_path, "r", encoding="utf-8") as f:
            seed_items = json.load(f)

        for item in seed_items:
            idea_dict = item.get("idea", {})
            idea_obj = _clean_attrs(StartupIdea, idea_dict, {"user_id": admin_user.id})
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
                    obj = _clean_attrs(model_cls, data, {"idea_id": idea_obj.id})
                    db.add(obj)

            comps = item.get("competitors", [])
            for c_data in comps:
                c_obj = _clean_attrs(Competitor, c_data, {"idea_id": idea_obj.id})
                db.add(c_obj)

        db.commit()
        print(f"[SeedSync] Successfully seeded {len(seed_items)} production ideas for {admin_user.email}!")
        return {"status": "success", "message": f"Seeded {len(seed_items)} ideas successfully", "user": admin_user.email}
    except Exception as e:
        db.rollback()
        print(f"[SeedSync] Error during seed sync: {e}")
        return {"status": "error", "message": str(e)}

