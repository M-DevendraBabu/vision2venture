import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DECIMAL, Integer, DateTime, ForeignKey, JSON, Index
from app.database.connection import Base

class StartupAnalysis(Base):
    __tablename__ = "startup_analysis"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    idea_id = Column(String(36), ForeignKey('startup_ideas.id', ondelete='CASCADE'), unique=True, nullable=False)
    business_domain = Column(String(255), nullable=False)
    target_users = Column(Text, nullable=False)
    problem_statement = Column(Text, nullable=False)
    solution = Column(Text, nullable=False)
    keywords = Column(JSON, nullable=False)
    business_category = Column(String(100), nullable=False)
    summary = Column(Text, nullable=False)
    overall_score = Column(DECIMAL(5, 2), nullable=False, default=85.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class MarketAnalysis(Base):
    __tablename__ = "market_analysis"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    idea_id = Column(String(36), ForeignKey('startup_ideas.id', ondelete='CASCADE'), unique=True, nullable=False)
    market_size = Column(String(255), nullable=False)
    growth_rate = Column(DECIMAL(5, 2), nullable=False)
    demand_level = Column(String(100), nullable=False)
    opportunity_score = Column(DECIMAL(5, 2), nullable=False)
    industry_trends = Column(JSON, nullable=False)
    market_analysis_explanation = Column(Text, nullable=False)
    primary_demo = Column(String(255), nullable=True)
    key_pain_point = Column(String(255), nullable=True)
    acquisition_channel = Column(String(255), nullable=True)
    purchase_trigger = Column(String(255), nullable=True)
    opportunity_explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Competitor(Base):
    __tablename__ = "competitors"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    idea_id = Column(String(36), ForeignKey('startup_ideas.id', ondelete='CASCADE'), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    similarity_score = Column(DECIMAL(5, 2), nullable=False)
    strengths = Column(Text, nullable=False)
    weaknesses = Column(Text, nullable=False)
    competitive_gap = Column(Text, nullable=False)
    usp = Column(Text, nullable=False)
    analysis_explanation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class TechnologyRecommendation(Base):
    __tablename__ = "technology_recommendations"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    idea_id = Column(String(36), ForeignKey('startup_ideas.id', ondelete='CASCADE'), unique=True, nullable=False)
    frontend = Column(String(255), nullable=False)
    backend = Column(String(255), nullable=False)
    database_system = Column(String(255), nullable=False)
    cloud_platform = Column(String(255), nullable=False)
    ai_framework = Column(String(255), nullable=False)
    deployment = Column(String(255), nullable=False)
    reasoning = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class BusinessModel(Base):
    __tablename__ = "business_models"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    idea_id = Column(String(36), ForeignKey('startup_ideas.id', ondelete='CASCADE'), unique=True, nullable=False)
    customer_segments = Column(Text, nullable=False)
    value_proposition = Column(Text, nullable=False)
    revenue_streams = Column(Text, nullable=False)
    channels = Column(Text, nullable=False)
    key_partners = Column(Text, nullable=False)
    key_activities = Column(Text, nullable=False)
    key_resources = Column(Text, nullable=False)
    cost_structure = Column(Text, nullable=False)
    detailed_explanation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class SwotAnalysis(Base):
    __tablename__ = "swot_analysis"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    idea_id = Column(String(36), ForeignKey('startup_ideas.id', ondelete='CASCADE'), unique=True, nullable=False)
    strengths = Column(JSON, nullable=False)
    weaknesses = Column(JSON, nullable=False)
    opportunities = Column(JSON, nullable=False)
    threats = Column(JSON, nullable=False)
    overall_assessment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class FinancialAnalysis(Base):
    __tablename__ = "financial_analysis"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    idea_id = Column(String(36), ForeignKey('startup_ideas.id', ondelete='CASCADE'), unique=True, nullable=False)
    subscription_revenue = Column(DECIMAL(15, 2), default=0)
    freemium_conversion = Column(DECIMAL(5, 2), default=0)
    monthly_recurring_revenue = Column(DECIMAL(15, 2), default=0)
    customer_acquisition_cost = Column(DECIMAL(15, 2), default=0)
    lifetime_value = Column(DECIMAL(15, 2), default=0)
    churn_rate = Column(DECIMAL(5, 2), default=0)
    daily_customers_estimate = Column(Integer, default=0)
    average_order_value = Column(DECIMAL(15, 2), default=0)
    monthly_revenue = Column(DECIMAL(15, 2), default=0)
    rent_cost = Column(DECIMAL(15, 2), default=0)
    staff_cost = Column(DECIMAL(15, 2), default=0)
    raw_material_cost = Column(DECIMAL(15, 2), default=0)
    utility_cost = Column(DECIMAL(15, 2), default=0)
    marketing_cost = Column(DECIMAL(15, 2), default=0)
    development_cost = Column(DECIMAL(15, 2), nullable=False)
    monthly_operating_cost = Column(DECIMAL(15, 2), nullable=False)
    break_even_analysis = Column(Text, nullable=False)
    roi = Column(DECIMAL(10, 2), nullable=False)
    profit_margins = Column(DECIMAL(5, 2), nullable=False)
    detailed_explanation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class RiskAnalysis(Base):
    __tablename__ = "risk_analysis"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    idea_id = Column(String(36), ForeignKey('startup_ideas.id', ondelete='CASCADE'), unique=True, nullable=False)
    technical_risk = Column(JSON, nullable=False)
    market_risk = Column(JSON, nullable=False)
    competition_risk = Column(JSON, nullable=False)
    financial_risk = Column(JSON, nullable=False)
    operational_risk = Column(JSON, nullable=False)
    overall_risk = Column(DECIMAL(5, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class FeasibilityAnalysis(Base):
    __tablename__ = "feasibility_analysis"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    idea_id = Column(String(36), ForeignKey('startup_ideas.id', ondelete='CASCADE'), unique=True, nullable=False)
    market_score = Column(DECIMAL(5, 2), nullable=False)
    technical_score = Column(DECIMAL(5, 2), nullable=False)
    financial_score = Column(DECIMAL(5, 2), nullable=False)
    innovation_score = Column(DECIMAL(5, 2), nullable=False)
    overall_feasibility = Column(DECIMAL(5, 2), nullable=False)
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class InvestorReadiness(Base):
    __tablename__ = "investor_readiness"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    idea_id = Column(String(36), ForeignKey('startup_ideas.id', ondelete='CASCADE'), unique=True, nullable=False)
    scalability = Column(DECIMAL(5, 2), nullable=False)
    innovation = Column(DECIMAL(5, 2), nullable=False)
    business_model = Column(DECIMAL(5, 2), nullable=False)
    market = Column(DECIMAL(5, 2), nullable=False)
    investor_score = Column(DECIMAL(5, 2), nullable=False)
    explanation = Column(Text, nullable=False)
    suggestions = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ImplementationRoadmap(Base):
    __tablename__ = "implementation_roadmap"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    idea_id = Column(String(36), ForeignKey('startup_ideas.id', ondelete='CASCADE'), unique=True, nullable=False)
    phase_1 = Column(JSON, nullable=False)
    phase_2 = Column(JSON, nullable=False)
    phase_3 = Column(JSON, nullable=False)
    phase_4 = Column(JSON, nullable=False)
    phase_5 = Column(JSON, nullable=False)
    timeline = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Report(Base):
    __tablename__ = "reports"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    idea_id = Column(String(36), ForeignKey('startup_ideas.id', ondelete='CASCADE'), unique=True, nullable=False)
    pdf_location = Column(String(512), nullable=False)
    download_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
