from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal

class StartupIdeaBase(BaseModel):
    title: str
    description: str
    industry: str
    country: str
    business_type: str
    target_customers: str
    budget: Decimal
    team_skills: str
    sector: str
    pricing_model: str
    team_size: int
    business_stage: str
    revenue_goal: Decimal
    funding_required: Decimal

class StartupIdeaCreate(StartupIdeaBase):
    pass

class StartupIdeaResponse(StartupIdeaBase):
    id: str
    user_id: str
    analysis_status: str
    created_at: datetime

    class Config:
        from_attributes = True
