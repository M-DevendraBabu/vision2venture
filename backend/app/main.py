from fastapi import FastAPI
from app.database.connection import engine, Base, SessionLocal
from app.routers import auth, startup, analysis, report, admin, chatbot
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

# Auto-promote admin and init DB on startup
@app.on_event("startup")
def startup_tasks():
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[DB] Table creation notice: {e}")

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

