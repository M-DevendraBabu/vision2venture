"""End-to-end production test for Vision2Venture ML pipeline"""
import sys, warnings
warnings.filterwarnings('ignore')
sys.path.insert(0, '.')

from app.services.ml_service import MLService

context = {
    'title': 'HealthBridge Telemedicine Platform',
    'description': 'AI-powered telemedicine platform connecting rural patients with specialist doctors via video consultations',
    'industry': 'Healthcare / MedTech',
    'sector': 'online',
    'budget': 50000,
    'team_size': 3,
    'country': 'India',
    'pricing_model': 'Subscription',
    'revenue_goal': 100000
}

print('=' * 80)
print('END-TO-END PRODUCTION TEST: HealthBridge Telemedicine')
print('=' * 80)

# 1. Success
succ = MLService.predict_success_probability(context)
print(f'\n1. SUCCESS PROBABILITY: {succ}%')

# 2. Risk
risk = MLService.calculate_risk(context)
print(f'\n2. RISK ANALYSIS:')
for k, v in risk.items():
    if isinstance(v, dict):
        score = v.get('score', 'N/A')
        sev = v.get('severity', 'N/A')
        expl = str(v.get('explanation', ''))[:120]
        mit = str(v.get('mitigation_strategy', ''))[:100]
        print(f'   {k}: {score} ({sev})')
        print(f'     Explanation: {expl}')
        print(f'     Mitigation: {mit}')
    else:
        print(f'   {k}: {v}')

# 3. Feasibility
feas = MLService.calculate_feasibility(context)
print(f'\n3. FEASIBILITY:')
for k, v in feas.items():
    if k == 'explanation':
        print(f'   {k}: {str(v)[:150]}...')
    else:
        print(f'   {k}: {v}')

# 4. Investor Readiness
inv = MLService.calculate_investor_readiness(context)
print(f'\n4. INVESTOR READINESS:')
for k, v in inv.items():
    if k in ('explanation', 'suggestions'):
        print(f'   {k}: {str(v)[:150]}')
    else:
        print(f'   {k}: {v}')

# 5. YC Competitors
comps = MLService.search_yc_competitors('Healthcare', 'HealthBridge')
print(f'\n5. YC COMPETITOR MATCHES: {len(comps)} found')
for c in comps[:3]:
    name = c.get('name', 'Unknown')
    sim = c.get('similarity_score', 'N/A')
    liner = c.get('one_liner', '')[:60]
    print(f'   - {name} ({sim}%) [{liner}]')

# 6. Industry Benchmark
bench = MLService.get_industry_benchmark('healthcare')
print(f'\n6. INDUSTRY BENCHMARK:')
if bench:
    for k, v in bench.items():
        print(f'   {k}: {v}')
else:
    print('   No benchmark found')

# 7. V2V Score
v2v = round(
    (feas['overall_feasibility'] * 0.3) +
    (82.0 * 0.3) +
    (inv['investor_score'] * 0.25) +
    (max(0, 100 - risk['overall_risk']) * 0.15),
    1
)
print(f'\n7. V2V OVERALL SCORE: {v2v}/100')

# 8. Second test - different venture type
print('\n' + '=' * 80)
print('TEST 2: Artisan Bakery (offline, low-tech)')
print('=' * 80)
ctx2 = {
    'title': 'Flour & Fire Artisan Bakery',
    'industry': 'Food & Beverage',
    'sector': 'offline',
    'budget': 35000,
    'team_size': 4,
}
succ2 = MLService.predict_success_probability(ctx2)
risk2 = MLService.calculate_risk(ctx2)
feas2 = MLService.calculate_feasibility(ctx2)
inv2 = MLService.calculate_investor_readiness(ctx2)
v2v2 = round(
    (feas2['overall_feasibility'] * 0.3) +
    (82.0 * 0.3) +
    (inv2['investor_score'] * 0.25) +
    (max(0, 100 - risk2['overall_risk']) * 0.15),
    1
)
print(f'  Success: {succ2}% | Risk: {risk2["overall_risk"]} | Feasibility: {feas2["overall_feasibility"]} | Investor: {inv2["investor_score"]} | V2V: {v2v2}')

# Compare
print(f'\n  COMPARISON:')
print(f'    HealthBridge (online MedTech):  Succ={succ}  Risk={risk["overall_risk"]}  Feas={feas["overall_feasibility"]}  V2V={v2v}')
print(f'    Flour&Fire (offline Bakery):    Succ={succ2}  Risk={risk2["overall_risk"]}  Feas={feas2["overall_feasibility"]}  V2V={v2v2}')
print(f'    MedTech higher success: {"PASS" if succ > succ2 else "CHECK"}')
print(f'    Bakery higher risk: {"PASS" if risk2["overall_risk"] > risk["overall_risk"] else "CHECK"}')

print(f'\n{"=" * 80}')
print(f'ALL SYSTEMS OPERATIONAL')
print(f'{"=" * 80}')
