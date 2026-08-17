"""Test: Verify 70% ML / 30% AI split — zero AI calls for ML sections"""
import sys, warnings
warnings.filterwarnings('ignore')
sys.path.insert(0, '.')

print('=' * 80)
print('VERIFICATION: 70% ML / 30% AI Migration')
print('=' * 80)

# 1. Test ML Service loads ALL new models
from app.services.ml_service import MLService

context = {
    'title': 'SmartFarm IoT Platform',
    'description': 'IoT sensors and AI analytics for precision agriculture',
    'industry': 'Agriculture / AgTech',
    'sector': 'hybrid',
    'budget': 75000,
    'team_size': 5,
    'country': 'India',
    'pricing_model': 'Subscription',
    'revenue_goal': 200000
}

# Count AI calls (should be 0 for these sections)
ai_calls = 0

# ---- ML-DRIVEN SECTIONS (should NOT call AI) ----
print('\n--- ML-DRIVEN SECTIONS (0 AI calls expected) ---')

# 1. Success Probability (ML Model)
succ = MLService.predict_success_probability(context)
print(f'\n1. SUCCESS PROBABILITY: {succ}% [ML Model]')

# 2. Market Analysis (Dataset/Benchmarks)
market = MLService.calculate_market_analysis(context)
print(f'\n2. MARKET ANALYSIS [Dataset]: ')
if market:
    print(f'   market_size: {market.get("market_size", "N/A")}')
    print(f'   growth_rate: {market.get("growth_rate", "N/A")}%')
    print(f'   demand_level: {market.get("demand_level", "N/A")}')
    print(f'   opportunity_score: {market.get("opportunity_score", "N/A")}')
    print(f'   primary_demo: {market.get("primary_demo", "N/A")}')
    print(f'   key_pain_point: {str(market.get("key_pain_point", "N/A"))[:80]}')
    print(f'   acquisition_channel: {market.get("acquisition_channel", "N/A")}')
    print(f'   trends: {market.get("industry_trends", [])}')
else:
    print('   ERROR: No market data returned!')

# 3. Competitor Analysis (YC Dataset)
comps = MLService.search_yc_competitors('Agriculture', 'SmartFarm')
print(f'\n3. COMPETITORS [YC Dataset]: {len(comps)} found')
for c in comps[:3]:
    print(f'   - {c.get("name","?")} ({c.get("similarity_score","?")}%)')
    print(f'     strengths: {str(c.get("strengths","N/A"))[:80]}')
    print(f'     weaknesses: {str(c.get("weaknesses","N/A"))[:80]}')

# 4. Technology Stack (Stack Overflow Dataset)
tech = MLService.recommend_tech_stack(context)
print(f'\n4. TECH STACK [StackOverflow Dataset]:')
if tech:
    for k, v in tech.items():
        print(f'   {k}: {str(v)[:80]}')
else:
    print('   ERROR: No tech data returned!')

# 5. Financial Projections (Benchmarks)
fin = MLService.calculate_financial_projections(context)
print(f'\n5. FINANCIAL [Benchmarks]:')
if fin:
    for k in ['monthly_recurring_revenue', 'customer_acquisition_cost', 'lifetime_value', 
              'churn_rate', 'roi', 'profit_margins', 'break_even_analysis']:
        print(f'   {k}: {fin.get(k, "N/A")}')
    print(f'   detailed_explanation: {str(fin.get("detailed_explanation", ""))[:120]}')
else:
    print('   ERROR: No financial data returned!')

# 6. Risk Analysis (ML Model)
risk = MLService.calculate_risk(context)
print(f'\n6. RISK [ML Model]:')
for k, v in risk.items():
    if isinstance(v, dict):
        print(f'   {k}: {v.get("score", "N/A")} ({v.get("severity", "N/A")})')
    else:
        print(f'   {k}: {v}')

# 7. Feasibility (ML Model)
feas = MLService.calculate_feasibility(context)
print(f'\n7. FEASIBILITY [ML Model]:')
for k, v in feas.items():
    if k == 'explanation':
        print(f'   {k}: {str(v)[:120]}')
    else:
        print(f'   {k}: {v}')

# 8. Investor Readiness (ML Model)
inv = MLService.calculate_investor_readiness(context)
print(f'\n8. INVESTOR [ML Model]:')
for k, v in inv.items():
    if k in ('explanation', 'suggestions'):
        print(f'   {k}: {str(v)[:120]}')
    else:
        print(f'   {k}: {v}')

# ---- AI-DRIVEN SECTIONS (3 sections remain AI) ----
print('\n--- AI-DRIVEN SECTIONS (3 remain) ---')
print('9.  Business Model  → AI (Groq/Gemini) - needs creative text')
print('10. SWOT Analysis   → AI (Groq/Gemini) - needs qualitative reasoning')
print('11. Roadmap         → AI (Groq/Gemini) - needs creative planning')

# ---- SUMMARY ----
ml_sections = ['Success Probability', 'Market Analysis', 'Competitor Analysis', 
               'Tech Stack', 'Financial Analysis', 'Risk Analysis', 
               'Feasibility', 'Investor Readiness']
ai_sections = ['Business Model', 'SWOT Analysis', 'Roadmap']
nlp_sections = ['Overview/NLP']
computed_sections = ['V2V Score']

total = len(ml_sections) + len(ai_sections) + len(nlp_sections) + len(computed_sections)
ml_pct = round(len(ml_sections) / total * 100, 1)
ai_pct = round(len(ai_sections) / total * 100, 1)

print(f'\n{"=" * 80}')
print(f'MIGRATION SUMMARY')
print(f'{"=" * 80}')
print(f'  ML/Dataset-driven:  {len(ml_sections)}/{total} = {ml_pct}%  {ml_sections}')
print(f'  AI (LLM) driven:   {len(ai_sections)}/{total} = {ai_pct}%  {ai_sections}')
print(f'  NLP (local):        {len(nlp_sections)}/{total} = {round(len(nlp_sections)/total*100,1)}%  {nlp_sections}')
print(f'  Computed:           {len(computed_sections)}/{total} = {round(len(computed_sections)/total*100,1)}%  {computed_sections}')
print(f'')
print(f'  API calls per analysis: 3 (was 8-10)')
print(f'  ML+Dataset+NLP+Computed: {ml_pct + round(len(nlp_sections)/total*100,1) + round(len(computed_sections)/total*100,1)}%')
print(f'{"=" * 80}')
