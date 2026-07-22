from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal

class StartupAnalysisResponse(BaseModel):
    id: str
    business_domain: str
    target_users: str
    problem_statement: str
    solution: str
    keywords: List[str]
    business_category: str
    summary: str
    overall_score: Decimal
    
    class Config: from_attributes = True

class MarketAnalysisResponse(BaseModel):
    market_size: str
    growth_rate: Decimal
    demand_level: str
    opportunity_score: Decimal
    industry_trends: List[str]
    primary_demo: Optional[str] = None
    key_pain_point: Optional[str] = None
    acquisition_channel: Optional[str] = None
    purchase_trigger: Optional[str] = None
    opportunity_explanation: Optional[str] = None
    
    class Config: from_attributes = True

class CompetitorResponse(BaseModel):
    name: str
    similarity_score: Decimal
    strengths: str
    weaknesses: str
    competitive_gap: str
    usp: str
    
    class Config: from_attributes = True

class TechnologyRecommendationResponse(BaseModel):
    frontend: str
    backend: str
    database_system: str
    cloud_platform: str
    ai_framework: str
    deployment: str
    reasoning: str
    
    class Config: from_attributes = True

class BusinessModelResponse(BaseModel):
    customer_segments: str
    value_proposition: str
    revenue_streams: str
    channels: str
    key_partners: str
    key_activities: str
    key_resources: str
    cost_structure: str
    
    class Config: from_attributes = True

class SwotAnalysisResponse(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    opportunities: List[str]
    threats: List[str]
    
    class Config: from_attributes = True

class FinancialAnalysisResponse(BaseModel):
    development_cost: Decimal
    infrastructure_cost: Decimal
    cloud_cost: Decimal
    api_cost: Decimal
    maintenance_cost: Decimal
    revenue_estimate: Decimal
    profit_estimate: Decimal
    roi: Decimal
    break_even_months: int
    
    class Config: from_attributes = True

class RiskAnalysisResponse(BaseModel):
    technical_risk: Decimal
    market_risk: Decimal
    competition_risk: Decimal
    financial_risk: Decimal
    overall_risk: Decimal
    
    class Config: from_attributes = True

class FeasibilityAnalysisResponse(BaseModel):
    market_score: Decimal
    technical_score: Decimal
    financial_score: Decimal
    innovation_score: Decimal
    overall_feasibility: Decimal
    
    class Config: from_attributes = True

class InvestorReadinessResponse(BaseModel):
    scalability: Decimal
    innovation: Decimal
    business_model: Decimal
    market: Decimal
    investor_score: Decimal
    suggestions: List[str]
    
    class Config: from_attributes = True

class ImplementationRoadmapResponse(BaseModel):
    phase_1: Dict[str, Any]
    phase_2: Dict[str, Any]
    phase_3: Dict[str, Any]
    phase_4: Dict[str, Any]
    phase_5: Dict[str, Any]
    timeline: str
    
    class Config: from_attributes = True

class ReportResponse(BaseModel):
    pdf_location: str
    download_count: int
    
    class Config: from_attributes = True
