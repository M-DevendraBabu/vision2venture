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
                        
            print("[Migration] Competitor tables and columns verified successfully.")
    except Exception as e:
        print(f"[Migration] Notice running migration check: {e}")
