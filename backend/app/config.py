from pydantic_settings import BaseSettings
from pathlib import Path

# Resolve .env path relative to this file: backend/app/config.py -> project root/.env
_ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "vision2venture_db"
    
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days (43,200 minutes) - persistent session
    
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    NVIDIA_API_KEY: str = ""

    # SMTP Configuration for sending OTP emails
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""

    # Google OAuth Configuration
    VITE_GOOGLE_CLIENT_ID: str = ""

    # Cloud HTTPS Email APIs (Unblocked on Render free tier)
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "Vision2Venture <onboarding@resend.dev>"
    BREVO_API_KEY: str = ""
    SENDGRID_API_KEY: str = ""

    # Google Apps Script Webhook (sends through Gmail's own servers - 100% delivery)
    GMAIL_WEBHOOK_URL: str = ""

    # Search Engine Configuration for Online Competitor Discovery
    TAVILY_API_KEY: str = ""
    BRAVE_API_KEY: str = ""
    SEARCH_PROVIDER: str = "auto"  # 'auto', 'tavily', 'brave', 'duckduckgo'

    class Config:
        env_file = str(_ENV_FILE)
        env_file_encoding = "utf-8"
        extra = "ignore"

import os
settings = Settings()

is_production = settings.ENVIRONMENT.lower() in ("production", "prod") or bool(os.getenv("RENDER"))

if not settings.SECRET_KEY:
    if is_production:
        raise RuntimeError("FATAL: SECRET_KEY is required in production environment.")
    import secrets
    import logging
    logging.getLogger("vision2venture.config").warning(
        "CRITICAL SECURITY NOTICE: SECRET_KEY is not set in environment or .env file. "
        "Generating an ephemeral session key. All active user sessions will be invalidated on server restart. "
        "Define SECRET_KEY in .env for persistent sessions."
    )
    settings.SECRET_KEY = secrets.token_hex(32)

if is_production:
    has_email = bool(
        settings.GMAIL_WEBHOOK_URL or
        settings.RESEND_API_KEY or
        settings.BREVO_API_KEY or
        settings.SENDGRID_API_KEY or
        (settings.SMTP_USER and settings.SMTP_PASSWORD)
    )
    if not has_email:
        raise RuntimeError("FATAL: At least one email provider credential (GMAIL_WEBHOOK_URL, RESEND_API_KEY, BREVO_API_KEY, SENDGRID_API_KEY, or SMTP_PASSWORD) must be configured in production.")

