from fastapi import FastAPI
from app.database.connection import engine, Base, SessionLocal
from app.routers import auth, startup, analysis, report, admin, chatbot, competitors
from app.middleware.cors import add_cors_middleware
from app.middleware.rate_limiter import RateLimiterMiddleware
from app.models.user import User
import os


app = FastAPI(
    title="Vision2Venture API",
    description="AI-Powered Startup Analysis Platform",
    version="1.0.0"
)

# Add Middlewares
add_cors_middleware(app)
app.add_middleware(RateLimiterMiddleware, requests_limit=200, time_window=60)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(startup.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(report.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(chatbot.router, prefix="/api")
app.include_router(competitors.router, prefix="/api")

import os
import threading
import time
import urllib.request
from datetime import datetime

def _keep_alive_loop():
    """Background daemon worker that sends a heartbeat ping to Render's public router
    every 8 minutes, preventing the 15-minute inactivity spin-down."""
    base_url = os.getenv("RENDER_EXTERNAL_URL", "https://vision2venture.onrender.com").rstrip("/")
    health_url = f"{base_url}/api/health"
    print(f"[KeepAlive] Heartbeat daemon started. Target: {health_url}")
    time.sleep(25)  # Allow uvicorn to settle
    while True:
        try:
            req = urllib.request.Request(
                health_url,
                headers={"User-Agent": "Vision2Venture-KeepAlive/1.0"}
            )
            with urllib.request.urlopen(req, timeout=20) as resp:
                print(f"[KeepAlive] Heartbeat ping successful ({resp.status}) at {datetime.utcnow().strftime('%H:%M:%S')}")
        except Exception as e:
            print(f"[KeepAlive] Heartbeat notice: {e}")
        time.sleep(480)  # Sleep 8 minutes (Render sleeps at 15 minutes)

# Auto-promote admin and init DB on startup
@app.on_event("startup")
def startup_tasks():
    # 1. Start background keep-alive loop
    threading.Thread(target=_keep_alive_loop, daemon=True, name="KeepAliveWorker").start()

    # 2. Preload ML models asynchronously in background so Uvicorn accepts traffic in <1s
    try:
        from app.services.ml_service import ensure_ml_models_loaded
        threading.Thread(target=ensure_ml_models_loaded, daemon=True, name="MLPreloader").start()
    except Exception as e:
        print(f"[Startup] ML preload notice: {e}")

    try:
        from app.database.migration_helper import ensure_competitor_tables_and_columns
        ensure_competitor_tables_and_columns()
    except Exception as e:
        print(f"[DB] Competitor table setup notice: {e}")

    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "devendrababumotupalli@gmail.com")
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == ADMIN_EMAIL).first()
        if admin_user and admin_user.role != "admin":
            admin_user.role = "admin"
            db.commit()
            print(f"[ADMIN] Promoted {ADMIN_EMAIL} to admin role")
        elif admin_user:
            print(f"[ADMIN] {ADMIN_EMAIL} is already admin")
        else:
            print(f"[ADMIN] {ADMIN_EMAIL} not found yet - will be promoted on next restart after registration")

        # 4. Synchronize production seed ideas (removes stale ideas like NeuralLogistics, etc. on Render cloud DB)
        try:
            from app.database.migration_helper import sync_production_seed_if_needed
            sync_production_seed_if_needed(db)
        except Exception as e:
            print(f"[Startup] Production seed sync notice: {e}")
    except Exception as e:
        print(f"[ADMIN] Error initializing admin: {e}")
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "Welcome to Vision2Venture API", "version": "1.0.0"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Vision2Venture API"}

