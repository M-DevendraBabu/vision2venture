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
    except Exception as e:
        print(f"[Analysis] Background task fatal error: {e}")
        try:
            idea = db.query(StartupIdea).filter(StartupIdea.id == idea_id).first()
            if idea and idea.analysis_status == 'running':
                idea.analysis_status = 'failed'
                db.commit()
        except Exception as inner_e:
            print(f"[Analysis] Failed to update status to failed: {inner_e}")
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
    idea = _verify_idea_ownership(idea_id, current_user, db)
    bm = db.query(BusinessModel).filter(BusinessModel.idea_id == idea_id).first()
    swot = db.query(SwotAnalysis).filter(SwotAnalysis.idea_id == idea_id).first()

    # Generate or enrich with 25-sector business intelligence
    from app.services.business_intelligence import generate_business_model, generate_swot_analysis
    context = {
        'id': idea.id,
        'title': idea.title,
        'description': idea.description,
        'industry': idea.industry,
        'country': idea.country,
        'sector': idea.sector,
        'pricing_model': idea.pricing_model,
        'target_customers': idea.target_customers,
        'budget': idea.budget,
        'team_size': idea.team_size
    }
    bi_bm = generate_business_model(context)
    bi_swot = generate_swot_analysis(context)

    # Assemble Business Model with rich 9-pillar Lean Canvas & Unit Economics
    bm_dict = {
        "customer_segments": (bm.customer_segments if bm and bm.customer_segments and not bm.customer_segments.startswith("Primary: Users seeking") else bi_bm["customer_segments_str"]),
        "value_proposition": (bm.value_proposition if bm and bm.value_proposition and not bm.value_proposition.startswith("Solves key pain") else bi_bm["value_proposition"]),
        "revenue_streams": (bm.revenue_streams if bm and bm.revenue_streams and not bm.revenue_streams.startswith("Revenue model based on") else bi_bm["revenue_streams_str"]),
        "channels": (bm.channels if bm and bm.channels and not bm.channels.startswith("Digital Marketing, SEO, Social") else bi_bm["channels_str"]),
        "key_partners": (bm.key_partners if bm and bm.key_partners and not bm.key_partners.startswith("Payment Processors, Cloud Providers") else bi_bm["key_partners_str"]),
        "key_activities": (bm.key_activities if bm and bm.key_activities and not bm.key_activities.startswith("Product Development, Marketing") else bi_bm["key_activities_str"]),
        "key_resources": (bm.key_resources if bm and bm.key_resources else bi_bm["key_resources_str"]),
        "cost_structure": (bm.cost_structure if bm and bm.cost_structure and not bm.cost_structure.startswith("Development, Operations, Marketing") else bi_bm["cost_structure_str"]),
        "detailed_explanation": (bm.detailed_explanation if bm and bm.detailed_explanation and not bm.detailed_explanation.startswith("Comprehensive business strategy for") else bi_bm["detailed_explanation"]),
        
        # Extended 9-pillar blocks & unit economics
        "archetype": bi_bm["archetype"],
        "gross_margin": bi_bm["gross_margin"],
        "ltv_cac": bi_bm["ltv_cac"],
        "payback_months": bi_bm["payback_months"],
        "problem": bi_bm["problem"],
        "solution": bi_bm["solution"],
        "key_metrics": bi_bm["key_metrics"],
        "unfair_advantage": bi_bm["unfair_advantage"],
        "pricing_tiers": bi_bm["pricing_tiers"]
    }

    # Assemble SWOT with detailed impact annotations
    swot_dict = {
        "strengths": swot.strengths if swot and swot.strengths and not (len(swot.strengths) == 2 and 'Innovative approach' in str(swot.strengths[0])) else bi_swot["strengths"],
        "weaknesses": swot.weaknesses if swot and swot.weaknesses and not (len(swot.weaknesses) == 2 and 'Early stage brand awareness' in str(swot.weaknesses[0])) else bi_swot["weaknesses"],
        "opportunities": swot.opportunities if swot and swot.opportunities and not (len(swot.opportunities) == 2 and 'Expanding market' in str(swot.opportunities[0])) else bi_swot["opportunities"],
        "threats": swot.threats if swot and swot.threats and not (len(swot.threats) == 2 and 'Incumbent market position' in str(swot.threats[0])) else bi_swot["threats"],
        "overall_assessment": swot.overall_assessment if swot and swot.overall_assessment and not swot.overall_assessment.startswith("Strong overall baseline") else bi_swot["overall_assessment"],
        
        # Detailed structured SWOT objects
        "strengths_detailed": bi_swot["strengths_detailed"],
        "weaknesses_detailed": bi_swot["weaknesses_detailed"],
        "opportunities_detailed": bi_swot["opportunities_detailed"],
        "threats_detailed": bi_swot["threats_detailed"]
    }

    return {"status": "success", "data": {"business_model": bm_dict, "swot": swot_dict}}


# ============================================================
# FINANCIAL ANALYSIS
# ============================================================
@router.get("/{idea_id}/financial")
def get_financial(
    idea_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    idea = _verify_idea_ownership(idea_id, current_user, db)
    fin = db.query(FinancialAnalysis).filter(FinancialAnalysis.idea_id == idea_id).first()

    # Generate or enrich with 25-sector realistic Indian financial intelligence
    from app.services.financial_intelligence import generate_financial_analysis
    context = {
        'id': idea.id,
        'title': idea.title,
        'description': idea.description,
        'industry': idea.industry,
        'country': idea.country,
        'sector': idea.sector,
        'pricing_model': idea.pricing_model,
        'target_customers': idea.target_customers,
        'budget': idea.budget,
        'team_size': idea.team_size,
        'revenue_goal': idea.revenue_goal
    }
    fi_data = generate_financial_analysis(context)

    # Return merged payload ensuring all enriched CapEx, OpEx, unit economics, break-even, and methodology exist
    fin_dict = {
        "subscription_revenue": float(fin.subscription_revenue) if fin and fin.subscription_revenue > 0 else fi_data["subscription_revenue"],
        "freemium_conversion": float(fin.freemium_conversion) if fin else fi_data["freemium_conversion"],
        "monthly_recurring_revenue": float(fin.monthly_recurring_revenue) if fin and fin.monthly_recurring_revenue > 25000 else fi_data["monthly_recurring_revenue"],
        "customer_acquisition_cost": float(fin.customer_acquisition_cost) if fin and fin.customer_acquisition_cost > 300 else fi_data["customer_acquisition_cost"],
        "lifetime_value": float(fin.lifetime_value) if fin and fin.lifetime_value > 1000 else fi_data["lifetime_value"],
        "churn_rate": float(fin.churn_rate) if fin else fi_data["churn_rate"],
        "daily_customers_estimate": fin.daily_customers_estimate if fin and fin.daily_customers_estimate > 0 else fi_data["daily_customers_estimate"],
        "average_order_value": float(fin.average_order_value) if fin and fin.average_order_value > 100 else fi_data["average_order_value"],
        "monthly_revenue": float(fin.monthly_revenue) if fin and fin.monthly_revenue > 25000 else fi_data["monthly_revenue"],
        "rent_cost": float(fin.rent_cost) if fin and fin.rent_cost > 5000 else fi_data["rent_cost"],
        "staff_cost": float(fin.staff_cost) if fin and fin.staff_cost > 18000 else fi_data["staff_cost"],
        "raw_material_cost": float(fin.raw_material_cost) if fin and fin.raw_material_cost > 0 else fi_data["raw_material_cost"],
        "utility_cost": float(fin.utility_cost) if fin and fin.utility_cost > 1500 else fi_data["utility_cost"],
        "marketing_cost": float(fin.marketing_cost) if fin and fin.marketing_cost > 5000 else fi_data["marketing_cost"],
        "development_cost": float(fin.development_cost) if fin and fin.development_cost > 30000 else fi_data["development_cost"],
        "monthly_operating_cost": float(fin.monthly_operating_cost) if fin and fin.monthly_operating_cost > 35000 else fi_data["monthly_operating_cost"],
        "break_even_analysis": (fin.break_even_analysis if fin and len(fin.break_even_analysis) > 50 and not fin.break_even_analysis.startswith("Break-Even Projection: Based on capital efficiency models and") else fi_data["break_even_analysis"]),
        "roi": float(fin.roi) if fin and fin.roi > 0 else fi_data["roi"],
        "profit_margins": float(fin.profit_margins) if fin and fin.profit_margins > 0 else fi_data["profit_margins"],
        "detailed_explanation": (fin.detailed_explanation if fin and len(fin.detailed_explanation) > 50 and not fin.detailed_explanation.startswith("Financial Methodology: These projections are generated using") else fi_data["detailed_explanation"]),

        # Rich financial cockpit intelligence
        "total_capex": fi_data["total_capex"],
        "hardware_equipment_cost": fi_data["hardware_equipment_cost"],
        "licensing_legal_cost": fi_data["licensing_legal_cost"],
        "branding_design_cost": fi_data["branding_design_cost"],
        "inventory_staging_cost": fi_data["inventory_staging_cost"],

        "monthly_sales_volume": fi_data["monthly_sales_volume"],
        "gross_margin_percent": fi_data["gross_margin_percent"],
        "ltv_cac_ratio": fi_data["ltv_cac_ratio"],
        "payback_period_months": fi_data["payback_period_months"],
        "break_even_months": fi_data["break_even_months"],
        "break_even_units_monthly": fi_data["break_even_units_monthly"],
        "break_even_daily_transactions": fi_data["break_even_daily_transactions"],
        "break_even_revenue_monthly": fi_data["break_even_revenue_monthly"],
        "contribution_margin_per_unit": fi_data["contribution_margin_per_unit"],
        "monthly_fixed_costs": fi_data["monthly_fixed_costs"],

        "year1_revenue": fi_data["year1_revenue"],
        "year2_revenue": fi_data["year2_revenue"],
        "year3_revenue": fi_data["year3_revenue"],
        "year1_opex": fi_data["year1_opex"],
        "year2_opex": fi_data["year2_opex"],
        "year3_opex": fi_data["year3_opex"],

        "capex_breakdown": fi_data["capex_breakdown"],
        "opex_breakdown": fi_data["opex_breakdown"],
        "revenue_breakdown": fi_data["revenue_breakdown"],
        "methodology_sources": fi_data["methodology_sources"]
    }
    return {"status": "success", "data": fin_dict}


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
            "explanation": feas.explanation,
            "technical_explanation": getattr(feas, 'technical_explanation', None),
            "market_explanation": getattr(feas, 'market_explanation', None),
            "financial_explanation": getattr(feas, 'financial_explanation', None),
            "innovation_explanation": getattr(feas, 'innovation_explanation', None)
        }
    if inv:
        data["investor_readiness"] = {
            "scalability": float(inv.scalability),
            "innovation": float(inv.innovation),
            "business_model": float(inv.business_model),
            "market": float(inv.market),
            "investor_score": float(inv.investor_score),
            "explanation": inv.explanation,
            "suggestions": inv.suggestions,
            "scalability_explanation": getattr(inv, 'scalability_explanation', None),
            "innovation_explanation": getattr(inv, 'innovation_explanation', None),
            "business_model_explanation": getattr(inv, 'business_model_explanation', None),
            "market_explanation": getattr(inv, 'market_explanation', None)
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
