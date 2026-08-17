"""Quick validation of all 7 ML models - forces reimport."""
import importlib
import sys

# Force reimport of ml_service
for mod in list(sys.modules.keys()):
    if 'ml_service' in mod or 'ai_service' in mod:
        del sys.modules[mod]

import numpy as np
from app.services.ml_service import MLService

print("=" * 60)
print("  VALIDATION: Testing all 7 ML models with 5 scenarios")
print("=" * 60)

tests = [
    {"title": "AI Code Review Platform", "industry": "AI/SaaS", "sector": "online", "budget": 50000, "team_size": 3, "country": "India", "revenue_goal": 100000},
    {"title": "Organic Farm-to-Table Restaurant", "industry": "Food & Beverage", "sector": "offline", "budget": 80000, "team_size": 5, "country": "India", "revenue_goal": 200000},
    {"title": "FinTech Payment Gateway", "industry": "Fintech", "sector": "online", "budget": 150000, "team_size": 8, "country": "USA", "revenue_goal": 500000},
    {"title": "EdTech Learning App", "industry": "EdTech", "sector": "online", "budget": 30000, "team_size": 2, "country": "India", "revenue_goal": 60000},
    {"title": "EV Charging Network", "industry": "CleanTech/EV", "sector": "hybrid", "budget": 200000, "team_size": 10, "country": "Germany", "revenue_goal": 300000},
]

print("\n--- 1. SUCCESS PREDICTION ---")
scores = []
for t in tests:
    s = MLService.predict_success_probability(t)
    scores.append(s)
    print(f"  {t['title'][:35]:<36} -> {s:.1f}%")
print(f"  Unique scores: {len(set(scores))}/5")

print("\n--- 2. MARKET ANALYSIS ---")
for t in tests:
    m = MLService.calculate_market_analysis(t)
    print(f"  {t['title'][:35]:<36} -> Opp:{m['opportunity_score']:.1f} Growth:{m['growth_rate']:.1f}%")

print("\n--- 3. FINANCIAL PROJECTIONS ---")
for t in tests:
    f = MLService.calculate_financial_projections(t)
    print(f"  {t['title'][:35]:<36} -> ROI:{f['roi']:.1f}% Margin:{f['profit_margins']:.1f}% BE:{f.get('break_even_analysis', 'N/A')[:30]}")

print("\n--- 4. RISK ANALYSIS ---")
for t in tests:
    r = MLService.calculate_risk(t)
    print(f"  {t['title'][:35]:<36} -> Tech:{r['technical_risk']['score']:.1f} Mkt:{r['market_risk']['score']:.1f} Fin:{r['financial_risk']['score']:.1f} Overall:{r['overall_risk']:.1f}")

print("\n--- 5. FEASIBILITY ---")
for t in tests:
    fe = MLService.calculate_feasibility(t)
    print(f"  {t['title'][:35]:<36} -> Mkt:{fe['market_score']:.1f} Tech:{fe['technical_score']:.1f} Fin:{fe['financial_score']:.1f} Inn:{fe['innovation_score']:.1f} Overall:{fe['overall_feasibility']:.1f}")

print("\n--- 6. INVESTOR READINESS ---")
for t in tests:
    inv = MLService.calculate_investor_readiness(t)
    print(f"  {t['title'][:35]:<36} -> Scal:{inv['scalability']:.1f} Inn:{inv['innovation']:.1f} Biz:{inv['business_model']:.1f} Mkt:{inv['market']:.1f} Score:{inv['investor_score']:.1f}")

print("\n--- 7. TECH STACK ---")
for t in tests:
    ts = MLService.recommend_tech_stack(t)
    print(f"  {t['title'][:35]:<36} -> {ts.get('frontend', 'N/A')[:25]} | {ts.get('backend', 'N/A')[:25]}")

print("\n" + "=" * 60)
print("  VALIDATION COMPLETE")
print("=" * 60)
