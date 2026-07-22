import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DECIMAL, Integer, DateTime, ForeignKey, Index
from app.database.connection import Base

class StartupIdea(Base):
    __tablename__ = "startup_ideas"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    industry = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    business_type = Column(String(100), nullable=False)
    target_customers = Column(Text, nullable=False)
    budget = Column(DECIMAL(15, 2), nullable=False)
    team_skills = Column(Text, nullable=False)
    sector = Column(String(50), nullable=False, default='online')
    pricing_model = Column(String(100), nullable=False)
    team_size = Column(Integer, nullable=False)
    business_stage = Column(String(100), nullable=False)
    revenue_goal = Column(DECIMAL(15, 2), nullable=False)
    funding_required = Column(DECIMAL(15, 2), nullable=False)
    analysis_status = Column(String(50), default='pending', index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
