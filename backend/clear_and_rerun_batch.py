import sys
import os
import time
sys.path.insert(0, r'C:\Users\DEVENDRA\.gemini\antigravity\scratch\vision2venture\backend')

from app.database.connection import SessionLocal
from app.models.user import User
from app.models.startup_idea import StartupIdea
from app.models.analysis import (
    StartupAnalysis, MarketAnalysis, Competitor, TechnologyRecommendation,
    BusinessModel, SwotAnalysis, FinancialAnalysis, RiskAnalysis,
    FeasibilityAnalysis, InvestorReadiness, ImplementationRoadmap
)
from app.services.analysis_service import AnalysisService

db = SessionLocal()

print("[Batch Clean] Clearing existing startup ideas and analysis records...")
db.query(Report).delete() if 'Report' in globals() else None
db.query(ImplementationRoadmap).delete()
db.query(InvestorReadiness).delete()
db.query(FeasibilityAnalysis).delete()
db.query(RiskAnalysis).delete()
db.query(FinancialAnalysis).delete()
db.query(SwotAnalysis).delete()
db.query(BusinessModel).delete()
db.query(TechnologyRecommendation).delete()
db.query(Competitor).delete()
db.query(MarketAnalysis).delete()
db.query(StartupAnalysis).delete()
db.query(StartupIdea).delete()
db.commit()

first_user = db.query(User).first()
if not first_user:
    first_user = User(id='test-user-123', name='Test User', email='test@example.com', password_hash='hash')
    db.add(first_user)
    db.commit()

user_id = first_user.id

test_cases = [
    {
        'title': 'NeuralLogistics AI',
        'description': 'Predictive AI supply chain route optimization and fleet dispatch for enterprise logistics.',
        'industry': 'AI / Logistics',
        'sector': 'online',
        'budget': 50000,
        'country': 'United States',
        'pricing_model': 'SaaS Tiered Subscription'
    },
    {
        'title': 'GreenBite Organic Cafe',
        'description': 'Farm-to-table organic salad bar and smoothie store with drive-thru POS and loyalty app.',
        'industry': 'Food & Beverage',
        'sector': 'offline',
        'budget': 35000,
        'country': 'India',
        'pricing_model': 'Pay-per-order'
    },
    {
        'title': 'CarePulse Smart Patient Wearable',
        'description': 'Remote ECG and oxygen monitoring wearable with real-time AI doctor alert telemetry.',
        'industry': 'Healthcare / MedTech',
        'sector': 'hybrid',
        'budget': 75000,
        'country': 'Germany',
        'pricing_model': 'Device Fee + Monthly Subscription'
    },
    {
        'title': 'SkillCraft Interactive EdTech',
        'description': 'Gamified coding and robotics learning platform for high school students.',
        'industry': 'EdTech',
        'sector': 'online',
        'budget': 20000,
        'country': 'United Kingdom',
        'pricing_model': 'Monthly Subscription'
    },
    {
        'title': 'VaultPay Crypto Gateway',
        'description': 'Non-custodial cross-border crypto settlement and fiat off-ramp for e-commerce merchants.',
        'industry': 'Fintech',
        'sector': 'online',
        'budget': 90000,
        'country': 'Singapore',
        'pricing_model': 'Transaction Fee (0.5%)'
    },
    {
        'title': 'EcoPrint Sustainable Packaging',
        'description': 'Biodegradable mushroom mycelium packaging manufacturing plant for retail logistics.',
        'industry': 'Manufacturing / CleanTech',
        'sector': 'offline',
        'budget': 60000,
        'country': 'Canada',
        'pricing_model': 'B2B Bulk Unit Orders'
    },
    {
        'title': 'HyperMart Quick Commerce',
        'description': '10-minute grocery dark store delivery network powered by micro-fulfillment centers.',
        'industry': 'E-Commerce / Quick Comm',
        'sector': 'hybrid',
        'budget': 85000,
        'country': 'India',
        'pricing_model': 'Delivery Fee + Margin markup'
    },
    {
        'title': 'MetaVerse Quest Studio',
        'description': 'Web3 multiplayer action game studio with player-owned asset marketplace.',
        'industry': 'Gaming / Web3',
        'sector': 'online',
        'budget': 40000,
        'country': 'Japan',
        'pricing_model': 'Free-to-Play + In-App Marketplace'
    },
    {
        'title': 'SolarGrid Clean Energy',
        'description': 'Community solar panel installation and peer-to-peer microgrid energy trading.',
        'industry': 'CleanTech / Energy',
        'sector': 'offline',
        'budget': 100000,
        'country': 'Australia',
        'pricing_model': 'PPA Energy Tariff'
    },
    {
        'title': 'PropMatch AI Real Estate',
        'description': 'AI-driven commercial real estate valuation and automated tenant matching engine.',
        'industry': 'PropTech / Real Estate',
        'sector': 'online',
        'budget': 30000,
        'country': 'United States',
        'pricing_model': 'Listing Fee + Commission'
    },
    {
        'title': 'RoboFarm Precision AgTech',
        'description': 'Autonomous soil testing drones and automated crop irrigation robotic rovers.',
        'industry': 'AgTech / Robotics',
        'sector': 'hybrid',
        'budget': 70000,
        'country': 'Brazil',
        'pricing_model': 'Hardware Lease + SaaS Analytics'
    },
    {
        'title': 'CyberShield Zero Trust',
        'description': 'AI-powered endpoint threat detection and zero-trust identity access management.',
        'industry': 'Cybersecurity',
        'sector': 'online',
        'budget': 95000,
        'country': 'United States',
        'pricing_model': 'Annual Enterprise License'
    }
]

print(f"Executing clean 12-domain batch evaluation...")
for i, tc in enumerate(test_cases, 1):
    idea = StartupIdea(
        user_id=user_id,
        title=tc['title'],
        description=tc['description'],
        industry=tc['industry'],
        sector=tc['sector'],
        budget=tc['budget'],
        country=tc['country'],
        pricing_model=tc['pricing_model'],
        business_type=tc['sector'],
        target_customers='Enterprise & Retail Users',
        team_skills='Software Engineering, Domain Expertise, Marketing',
        team_size=3,
        business_stage='Early Stage / MVP',
        funding_required=tc['budget'],
        revenue_goal=tc['budget'] * 2.8,
        analysis_status='COMPLETED'
    )
    db.add(idea)
    db.commit()
    db.refresh(idea)
    
    print(f"[{i}/12] Analyzing {idea.title} ({idea.sector} | {idea.industry})...")
    AnalysisService.run_full_analysis(idea.id, db)

print("\n" + "=" * 135)
print(f"{'TITLE':<30} | {'SEC':<7} | {'IND':<15} | {'V2V SCORE':<9} | {'RISK':<6} | {'CAPEX':<9} | {'OPEX':<9} | {'MRR':<9} | {'CAC':<6} | {'LTV':<7} | {'ROI %':<6}")
print("=" * 135)

ideas = db.query(StartupIdea).all()
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
    
    print(f"{idea.title[:30]:<30} | {idea.sector:<7} | {idea.industry[:15]:<15} | {v2v:<9} | {risk:<6} | {capex:<9} | {opex:<9} | {mrr:<9} | {cac:<6} | {ltv:<7} | {roi:<6}")

print("=" * 135)
db.close()
