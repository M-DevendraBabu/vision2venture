from fastapi import FastAPI
from app.database.connection import engine, Base
from app.routers import auth, startup, analysis, report, admin, chatbot
from app.middleware.cors import add_cors_middleware
from app.middleware.rate_limiter import RateLimiterMiddleware

# Initialize DB tables (in production use Alembic)
Base.metadata.create_all(bind=engine)

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

@app.get("/")
def root():
    return {"message": "Welcome to Vision2Venture API", "version": "1.0.0"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Vision2Venture API"}
