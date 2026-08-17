import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'app')))

from app.database.connection import SessionLocal
from app.models.startup_idea import StartupIdea
from app.models.analysis import StartupAnalysis, FinancialAnalysis, MarketAnalysis, RiskAnalysis

db = SessionLocal()
ideas = db.query(StartupIdea).all()

print(f"{'TITLE':<30} | {'SEC':<7} | {'IND':<12} | {'V2V SCORE':<9} | {'RISK':<6} | {'CAPEX':<10} | {'OPEX':<9} | {'MRR':<9} | {'CAC':<6} | {'LTV':<7} | {'ROI %':<6}")
print("-" * 140)

for idea in ideas:
    sa = db.query(StartupAnalysis).filter(StartupAnalysis.idea_id == idea.id).first()
    fa = db.query(FinancialAnalysis).filter(FinancialAnalysis.idea_id == idea.id).first()
    ra = db.query(RiskAnalysis).filter(RiskAnalysis.idea_id == idea.id).first()
    
    v2v = f"{sa.overall_score:.1f}" if sa and sa.overall_score is not None else "N/A"
    risk = f"{ra.overall_risk:.1f}" if ra and ra.overall_risk is not None else "N/A"
    capex = f"${fa.development_cost:,.0f}" if fa and fa.development_cost else "N/A"
    opex = f"${fa.monthly_operating_cost:,.0f}" if fa and fa.monthly_operating_cost else "N/A"
    mrr = f"${fa.monthly_recurring_revenue:,.0f}" if fa and fa.monthly_recurring_revenue else "N/A"
    cac = f"${fa.customer_acquisition_cost:.0f}" if fa and fa.customer_acquisition_cost else "N/A"
    ltv = f"${fa.lifetime_value:.0f}" if fa and fa.lifetime_value else "N/A"
    roi = f"{fa.roi:.1f}%" if fa and fa.roi is not None else "N/A"
    
    print(f"{idea.title[:30]:<30} | {idea.sector:<7} | {idea.industry[:12]:<12} | {v2v:<9} | {risk:<6} | {capex:<10} | {opex:<9} | {mrr:<9} | {cac:<6} | {ltv:<7} | {roi:<6}")

db.close()
