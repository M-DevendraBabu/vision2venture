import sys; sys.stderr = open('NUL','w')
from app.services.ml_service import MLService

tests = [
    {'title':'AI SaaS','industry':'AI/SaaS','sector':'online','budget':50000,'team_size':3},
    {'title':'Restaurant','industry':'Food & Beverage','sector':'offline','budget':80000,'team_size':5},
    {'title':'Fintech App','industry':'Fintech','sector':'online','budget':150000,'team_size':8},
]
for t in tests:
    f = MLService.calculate_financial_projections(t)
    mrr = f['monthly_recurring_revenue']
    cac_v = f['customer_acquisition_cost']
    ltv_v = f['lifetime_value']
    roi_v = f['roi']
    margin_v = f['profit_margins']
    print(f"{t['title']}:")
    print(f"  MRR: ${mrr:,.0f}  CAC: ${cac_v:,.0f}  LTV: ${ltv_v:,.0f}  LTV/CAC: {ltv_v/max(cac_v,1):.1f}x")
    print(f"  ROI: {roi_v}%  Margins: {margin_v}%")
    print(f"  Explanation: {f['detailed_explanation'][:200]}...")
    print()
