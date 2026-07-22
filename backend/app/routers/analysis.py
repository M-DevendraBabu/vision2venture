from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database.connection import get_db, SessionLocal
from app.models.startup_idea import StartupIdea
from app.models.analysis import (
    StartupAnalysis, MarketAnalysis, Competitor, TechnologyRecommendation,
    BusinessModel, SwotAnalysis, FinancialAnalysis, RiskAnalysis,
    FeasibilityAnalysis, InvestorReadiness, ImplementationRoadmap
)
from app.models.user import User
from app.utils.security import get_current_user
from app.services.analysis_service import AnalysisService

router = APIRouter(prefix="/analysis", tags=["analysis"])


def _verify_idea_ownership(idea_id: str, current_user: User, db: Session):
    """Helper to verify the idea exists and belongs to the current user."""
    idea = db.query(StartupIdea).filter(
        StartupIdea.id == idea_id,
        StartupIdea.user_id == current_user.id
    ).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Startup idea not found")
    return idea


def _run_analysis_with_new_session(idea_id: str):
    """Run analysis in a background thread with its own DB session."""
    db = SessionLocal()
    try:
        AnalysisService.run_full_analysis(idea_id, db)
    finally:
        db.close()


# ============================================================
# TRIGGER ANALYSIS
# ============================================================
@router.post("/{idea_id}/run")
def run_analysis(
    idea_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    idea = _verify_idea_ownership(idea_id, current_user, db)

    if idea.analysis_status == 'running':
        raise HTTPException(status_code=400, detail="Analysis is already running")

    idea.analysis_status = 'running'
    db.commit()

    # Use a NEW session in the background thread to avoid thread-safety issues
    background_tasks.add_task(_run_analysis_with_new_session, idea_id)
    return {"status": "success", "message": "Analysis started in background"}


# ============================================================
# STATUS
# ============================================================
@router.get("/{idea_id}/status")
def get_analysis_status(
    idea_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    idea = _verify_idea_ownership(idea_id, current_user, db)
    return {"status": "success", "data": {"analysis_status": idea.analysis_status}}


# ============================================================
# OVERVIEW (NLP Analysis)
# ============================================================
@router.get("/{idea_id}/overview")
def get_overview(
    idea_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _verify_idea_ownership(idea_id, current_user, db)
    analysis = db.query(StartupAnalysis).filter(StartupAnalysis.idea_id == idea_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Overview analysis not found")
    return {
        "status": "success",
        "data": {
            "business_domain": analysis.business_domain,
            "target_users": analysis.target_users,
            "problem_statement": analysis.problem_statement,
            "solution": analysis.solution,
            "keywords": analysis.keywords,
            "business_category": analysis.business_category,
            "summary": analysis.summary,
            "overall_score": float(analysis.overall_score)
        }
    }


# ============================================================
# MARKET ANALYSIS
# ============================================================
@router.get("/{idea_id}/market")
def get_market_analysis(
    idea_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _verify_idea_ownership(idea_id, current_user, db)
    market = db.query(MarketAnalysis).filter(MarketAnalysis.idea_id == idea_id).first()
    if not market:
        raise HTTPException(status_code=404, detail="Market analysis not found")
    return {
        "status": "success",
        "data": {
            "market_size": market.market_size,
            "growth_rate": float(market.growth_rate),
            "demand_level": market.demand_level,
            "opportunity_score": float(market.opportunity_score),
            "industry_trends": market.industry_trends,
            "market_analysis_explanation": market.market_analysis_explanation,
            "primary_demo": market.primary_demo,
            "key_pain_point": market.key_pain_point,
            "acquisition_channel": market.acquisition_channel,
            "purchase_trigger": market.purchase_trigger,
            "opportunity_explanation": market.opportunity_explanation
        }
    }


# ============================================================
# COMPETITORS
# ============================================================
@router.get("/{idea_id}/competitors")
def get_competitors(
    idea_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _verify_idea_ownership(idea_id, current_user, db)
    competitors = db.query(Competitor).filter(Competitor.idea_id == idea_id).all()
    return {
        "status": "success",
        "data": [
            {
                "name": c.name,
                "similarity_score": float(c.similarity_score),
                "strengths": c.strengths,
                "weaknesses": c.weaknesses,
                "competitive_gap": c.competitive_gap,
                "usp": c.usp,
                "analysis_explanation": c.analysis_explanation
            }
            for c in competitors
        ]
    }


# ============================================================
# TECHNOLOGY
# ============================================================
@router.get("/{idea_id}/technology")
def get_technology(
    idea_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _verify_idea_ownership(idea_id, current_user, db)
    tech = db.query(TechnologyRecommendation).filter(
        TechnologyRecommendation.idea_id == idea_id
    ).first()
    if not tech:
        raise HTTPException(status_code=404, detail="Technology recommendations not found")
    return {
        "status": "success",
        "data": {
            "frontend": tech.frontend,
            "backend": tech.backend,
            "database_system": tech.database_system,
            "cloud_platform": tech.cloud_platform,
            "ai_framework": tech.ai_framework,
            "deployment": tech.deployment,
            "reasoning": tech.reasoning
        }
    }


# ============================================================
# BUSINESS MODEL + SWOT
# ============================================================
@router.get("/{idea_id}/business")
def get_business(
    idea_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _verify_idea_ownership(idea_id, current_user, db)
    bm = db.query(BusinessModel).filter(BusinessModel.idea_id == idea_id).first()
    swot = db.query(SwotAnalysis).filter(SwotAnalysis.idea_id == idea_id).first()

    data = {}
    if bm:
        data["business_model"] = {
            "customer_segments": bm.customer_segments,
            "value_proposition": bm.value_proposition,
            "revenue_streams": bm.revenue_streams,
            "channels": bm.channels,
            "key_partners": bm.key_partners,
            "key_activities": bm.key_activities,
            "key_resources": bm.key_resources,
            "cost_structure": bm.cost_structure,
            "detailed_explanation": bm.detailed_explanation
        }
    if swot:
        data["swot"] = {
            "strengths": swot.strengths,
            "weaknesses": swot.weaknesses,
            "opportunities": swot.opportunities,
            "threats": swot.threats,
            "overall_assessment": swot.overall_assessment
        }

    if not data:
        raise HTTPException(status_code=404, detail="Business analysis not found")

    return {"status": "success", "data": data}


# ============================================================
# FINANCIAL ANALYSIS
# ============================================================
@router.get("/{idea_id}/financial")
def get_financial(
    idea_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _verify_idea_ownership(idea_id, current_user, db)
    fin = db.query(FinancialAnalysis).filter(FinancialAnalysis.idea_id == idea_id).first()
    if not fin:
        raise HTTPException(status_code=404, detail="Financial analysis not found")
    return {
        "status": "success",
        "data": {
            "subscription_revenue": float(fin.subscription_revenue),
            "freemium_conversion": float(fin.freemium_conversion),
            "monthly_recurring_revenue": float(fin.monthly_recurring_revenue),
            "customer_acquisition_cost": float(fin.customer_acquisition_cost),
            "lifetime_value": float(fin.lifetime_value),
            "churn_rate": float(fin.churn_rate),
            "daily_customers_estimate": fin.daily_customers_estimate,
            "average_order_value": float(fin.average_order_value),
            "monthly_revenue": float(fin.monthly_revenue),
            "rent_cost": float(fin.rent_cost),
            "staff_cost": float(fin.staff_cost),
            "raw_material_cost": float(fin.raw_material_cost),
            "utility_cost": float(fin.utility_cost),
            "marketing_cost": float(fin.marketing_cost),
            "development_cost": float(fin.development_cost),
            "monthly_operating_cost": float(fin.monthly_operating_cost),
            "break_even_analysis": fin.break_even_analysis,
            "roi": float(fin.roi),
            "profit_margins": float(fin.profit_margins),
            "detailed_explanation": fin.detailed_explanation
        }
    }


# ============================================================
# RISK + FEASIBILITY + INVESTOR READINESS
# ============================================================
@router.get("/{idea_id}/risk")
def get_risk(
    idea_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _verify_idea_ownership(idea_id, current_user, db)
    risk = db.query(RiskAnalysis).filter(RiskAnalysis.idea_id == idea_id).first()
    feas = db.query(FeasibilityAnalysis).filter(FeasibilityAnalysis.idea_id == idea_id).first()
    inv = db.query(InvestorReadiness).filter(InvestorReadiness.idea_id == idea_id).first()

    data = {}
    if risk:
        data["risk"] = {
            "technical_risk": risk.technical_risk,
            "market_risk": risk.market_risk,
            "competition_risk": risk.competition_risk,
            "financial_risk": risk.financial_risk,
            "operational_risk": risk.operational_risk,
            "overall_risk": float(risk.overall_risk)
        }
    if feas:
        data["feasibility"] = {
            "market_score": float(feas.market_score),
            "technical_score": float(feas.technical_score),
            "financial_score": float(feas.financial_score),
            "innovation_score": float(feas.innovation_score),
            "overall_feasibility": float(feas.overall_feasibility),
            "explanation": feas.explanation
        }
    if inv:
        data["investor_readiness"] = {
            "scalability": float(inv.scalability),
            "innovation": float(inv.innovation),
            "business_model": float(inv.business_model),
            "market": float(inv.market),
            "investor_score": float(inv.investor_score),
            "explanation": inv.explanation,
            "suggestions": inv.suggestions
        }

    if not data:
        raise HTTPException(status_code=404, detail="Risk analysis not found")

    return {"status": "success", "data": data}


# ============================================================
# ROADMAP
# ============================================================
@router.get("/{idea_id}/roadmap")
def get_roadmap(
    idea_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _verify_idea_ownership(idea_id, current_user, db)
    roadmap = db.query(ImplementationRoadmap).filter(
        ImplementationRoadmap.idea_id == idea_id
    ).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return {
        "status": "success",
        "data": {
            "phase_1": roadmap.phase_1,
            "phase_2": roadmap.phase_2,
            "phase_3": roadmap.phase_3,
            "phase_4": roadmap.phase_4,
            "phase_5": roadmap.phase_5,
            "timeline": roadmap.timeline
        }
    }
