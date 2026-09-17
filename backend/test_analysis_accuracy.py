"""
Vision2Venture — Analysis Accuracy Regression Suite
===================================================
Locks in the accuracy properties that were found broken during the analysis audit,
so they cannot silently regress. Each test states the defect it guards against.

Runs offline: no database, no network, no LLM calls.

Usage (from backend/):
    python test_analysis_accuracy.py
"""
import os
import sys
import warnings

warnings.filterwarnings("ignore")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from unittest.mock import patch

from app.services.ml_service import MLService, _safe_encode, _sector_cagr, _venture_economics
import app.services.ml_service as M
from app.services.financial_intelligence import generate_financial_analysis
from app.services.business_intelligence import generate_business_model, generate_swot_analysis
from app.services.location_service import LocationService

PASSED, FAILED = [], []


def check(name, condition, detail=""):
    if condition:
        PASSED.append(name)
        print(f"  [PASS] {name}")
    else:
        FAILED.append((name, detail))
        print(f"  [FAIL] {name}  {detail}")


def base(**over):
    ctx = dict(
        title="Test Venture", industry="SaaS", description="A software product for businesses",
        sector="online", business_type="online", budget=500000, team_size=5,
        revenue_goal=5000000, country="India", location="India", pricing_model="Standard",
    )
    ctx.update(over)
    return ctx


def scores(ctx):
    m = MLService.calculate_market_analysis(dict(ctx))
    f = MLService.calculate_feasibility(dict(ctx))
    i = MLService.calculate_investor_readiness(dict(ctx))
    r = MLService.calculate_risk(dict(ctx))
    return {
        "oppty": m["opportunity_score"], "growth": m["growth_rate"], "tam": m["market_size"],
        "feasib": f["overall_feasibility"], "invest": i["investor_score"], "risk": r["overall_risk"],
    }


def spread(values):
    return round(max(values) - min(values), 1)


# ============================================================
def test_encoder_resolves_real_categories():
    """Guards: every encoder lookup missed (100%), so all ideas shared one category."""
    print("\n[1] Categorical encoder resolves founder-entered text")
    M.ensure_ml_models_loaded()
    enc = M._market_industry_encoder
    if enc is None:
        check("industry encoder present", False, "encoder not loaded")
        return
    classes = list(enc.classes_)
    expectations = {
        "saas": "Internet software & services", "fintech": "Fintech", "healthcare": "Health",
        "food & beverage": "Consumer & retail", "cybersecurity": "Cybersecurity",
        "logistics": "Supply chain, logistics, & delivery",
    }
    for raw, want in expectations.items():
        check(f"'{raw}' -> {want}", classes[_safe_encode(enc, raw)] == want,
              f"got {classes[_safe_encode(enc, raw)]}")
    check("'india' -> India",
          list(M._market_country_encoder.classes_)[_safe_encode(M._market_country_encoder, "india")] == "India")
    # Class 0 is a stray investor-name string; nothing should land there.
    check("no input falls back to the investor-name class 0",
          all(_safe_encode(enc, x) != 0 for x in
              ["saas", "fintech", "health", "total gibberish xyz", "", "food"]))


def test_growth_rate_varies_by_sector():
    """Guards: growth was `12 + company_age*0.8` with company_age hardcoded -> constant."""
    print("\n[2] Growth rate reflects the sector")
    inds = ["Artificial Intelligence", "SaaS", "Fintech", "Healthcare", "Logistics", "Retail"]
    g = [scores(base(industry=i))["growth"] for i in inds]
    check("growth differs across sectors (spread > 8)", spread(g) > 8.0, f"spread={spread(g)}")
    check("AI grows faster than Retail", _sector_cagr("artificial intelligence") > _sector_cagr("retail"))
    check("physical venture damped below its online sector rate",
          _sector_cagr("food & beverage", is_offline=True) < _sector_cagr("food & beverage", is_offline=False))


def test_opportunity_is_not_a_budget_proxy():
    """Guards: opportunity had 0.0 industry spread and 28.2 budget spread, floored at 65."""
    print("\n[3] Market opportunity measures the market, not the wallet")
    by_industry = [scores(base(industry=i))["oppty"]
                   for i in ["Artificial Intelligence", "SaaS", "Fintech", "Healthcare", "Logistics", "Retail"]]
    by_budget = [scores(base(budget=b))["oppty"] for b in [5000, 100000, 1000000, 10000000]]
    by_demand = [scores(base(_trends_data={"avg_interest": a, "status": "success"}))["oppty"]
                 for a in [5, 30, 60, 95]]
    check("responds to industry (spread > 8)", spread(by_industry) > 8.0, f"spread={spread(by_industry)}")
    check("demand matters more than budget", spread(by_demand) > spread(by_budget),
          f"demand={spread(by_demand)} budget={spread(by_budget)}")
    check("a weak idea can score below 60",
          scores(base(budget=5000, team_size=1, revenue_goal=20000,
                      _trends_data={"avg_interest": 5, "status": "success"}))["oppty"] < 60.0)


def test_revenue_goal_is_used():
    """Guards: revenue_goal moved every score by 0.0 and never reached the financials."""
    print("\n[4] The founder's revenue target is actually used")
    modest = generate_financial_analysis(base(revenue_goal=1200000, industry="Food & Beverage",
                                              sector="offline", business_type="offline", location="Pune"))
    huge = generate_financial_analysis(base(revenue_goal=300000000, industry="Food & Beverage",
                                            sector="offline", business_type="offline", location="Pune"))
    check("goal_assessment present", bool(modest.get("goal_assessment")))
    check("attainment differs with the target",
          modest.get("goal_attainment_percent") != huge.get("goal_attainment_percent"))
    check("an unreachable target is called out",
          "capacity supports" in (huge.get("goal_assessment") or "").lower()
          or "x what" in (huge.get("goal_assessment") or "").lower())
    s = [scores(base(revenue_goal=r))["feasib"] for r in [50000, 1000000, 50000000]]
    check("feasibility responds to the target", spread(s) > 0.0, f"spread={spread(s)}")


def test_financials_reconcile():
    """Guards: online opex double-counted utilities; revenue streams drifted on rounding."""
    print("\n[5] Financial statements reconcile exactly")
    cases = [
        ("offline cafe", base(industry="Food & Beverage", sector="offline", business_type="offline", location="Pune")),
        ("offline gym", base(industry="Fitness", sector="offline", business_type="offline", location="Mumbai")),
        ("online saas", base(industry="SaaS", sector="online", business_type="online")),
        ("online fintech", base(industry="Fintech", sector="online", business_type="online")),
    ]
    for label, ctx in cases:
        f = generate_financial_analysis(ctx)
        opex = sum(r["cost"] for r in f["opex_breakdown"])
        rev = sum(r["amount"] for r in f["revenue_breakdown"])
        pct = sum(r["percent"] for r in f["opex_breakdown"])
        check(f"{label}: opex breakdown sums to total",
              abs(opex - f["monthly_operating_cost"]) < 0.5, f"{opex} vs {f['monthly_operating_cost']}")
        check(f"{label}: revenue breakdown sums to total",
              abs(rev - f["monthly_revenue"]) < 0.5, f"{rev} vs {f['monthly_revenue']}")
        check(f"{label}: opex percentages total 100", abs(pct - 100.0) < 1.5, f"{pct}%")
        check(f"{label}: no zero-cost filler lines", all(r["cost"] > 0 for r in f["opex_breakdown"]))


def test_no_cross_industry_content_leakage():
    """Guards: 'Vignan University', 'clay handi dum biryani' and 'certified organic' copy
    appearing in ventures they had nothing to do with."""
    print("\n[6] Generated copy does not describe someone else's business")
    banned = ["vignan", "vadlamudi", "biryani", "basmati", "mirchi", "certified organic", "farm-fresh"]
    cases = [
        ("cafe/Pune", base(industry="Food & Beverage", sector="offline", business_type="offline",
                           location="Pune", title="Neighborhood Cafe", description="A 30-seat cafe serving coffee")),
        ("pizzeria/Surat", base(industry="Food & Beverage", sector="offline", business_type="offline",
                                location="Surat", title="Wood Fired Pizzeria", description="A pizza restaurant")),
        ("gym/Mumbai", base(industry="Fitness", sector="offline", business_type="offline",
                            location="Mumbai", title="CrossFit Box", description="A 24/7 gym")),
        ("clinic/Kochi", base(industry="Healthcare", sector="offline", business_type="offline",
                              location="Kochi", title="Dental Clinic", description="A dental clinic")),
        ("campus cafe/Delhi", base(industry="Food & Beverage", sector="offline", business_type="offline",
                                   location="North Campus, Delhi", title="Campus Cafe",
                                   description="A cafe near the university campus")),
    ]
    for label, ctx in cases:
        blobs = [
            " ".join(str(v) for v in MLService.calculate_market_analysis(dict(ctx)).values()),
            " ".join(str(v) for v in generate_financial_analysis(dict(ctx)).values()),
            " ".join(str(v) for v in generate_business_model(dict(ctx)).values()),
            " ".join(str(v) for v in generate_swot_analysis(dict(ctx)).values()),
        ]
        blob = " ".join(blobs).lower()
        hits = [w for w in banned if w in blob]
        check(f"{label}: no foreign business copy", not hits, f"leaked {hits}")


def test_hybrid_national_scope_sizing():
    """Guards: a nationwide hybrid brand was sized as a 28,000-person local catchment."""
    print("\n[7] Nationwide ventures are sized nationally")
    nat = MLService.calculate_market_analysis(base(
        sector="hybrid", business_type="hybrid", location="India",
        description="Online platform plus campus kiosks nationwide", industry="Food & Beverage"))
    local = MLService.calculate_market_analysis(base(
        sector="offline", business_type="offline", location="Vadlamudi, Guntur",
        description="A single campus outlet", industry="Food & Beverage"))
    check("nationwide hybrid is NOT a local catchment", "Catchment" not in nat["market_size"], nat["market_size"])
    check("a single local outlet still is", "Catchment" in local["market_size"], local["market_size"])


def test_zero_fabrication():
    """Guards: LLM-recalled businesses were labelled verified, given hash-derived
    coordinates and invented ratings, then plotted on the competitor map."""
    print("\n[8] Nothing unverified is presented as verified")
    with patch("requests.post") as mp, patch("requests.get") as mg:
        mg.return_value.status_code = 200
        mg.return_value.json.return_value = [{"lat": "17.3850", "lon": "78.4867",
                                              "display_name": "Hyderabad, India"}]
        mp.return_value.status_code = 200
        mp.return_value.json.return_value = {"elements": []}
        res = LocationService.search_offline_competitors(
            category="Coffee Shop", location_query="Hyderabad, India", radius_km=5.0)
    comps = res.get("competitors", [])
    check("no unverified entry claims verified=True", not [c for c in comps if c.get("verified")])
    check("no fabricated map coordinates", not [c for c in comps if c.get("latitude") is not None])
    check("no invented ratings", not [c for c in comps if c.get("rating") is not None])
    check("no invented review counts", not [c for c in comps if c.get("review_count") is not None])
    check("unverified entries labelled llm_inferred",
          all(c.get("evidence_status") == "llm_inferred" for c in comps))
    check("unverified entries not auto-selected", not [c for c in comps if c.get("is_selected")])


def test_no_hash_derived_statistics():
    """Guards: ratings, review counts, distances and "N% Positive Feedback" figures were
    synthesised from hash(name) and then described as verified user reviews."""
    print("\n[11] No statistic is invented from a name hash")
    root = os.path.dirname(os.path.abspath(__file__))
    hits = []
    for dirpath, _dirs, files in os.walk(os.path.join(root, "app")):
        if "__pycache__" in dirpath:
            continue
        for fn in files:
            if not fn.endswith(".py"):
                continue
            path = os.path.join(dirpath, fn)
            with open(path, encoding="utf-8", errors="ignore") as fh:
                for i, line in enumerate(fh, 1):
                    if "abs(hash(" in line and not line.strip().startswith("#"):
                        hits.append(f"{os.path.relpath(path, root)}:{i}")
    check("no hash-derived values remain in app/", not hits, f"found {hits}")

    # Percentages presented as measured customer sentiment must not be synthesised.
    from app.services.web_search_service import WebSearchService  # noqa: F401
    check("no '% Positive Feedback' synthesised from a hash",
          not [h for h in hits if "sentiment" in h.lower()])


def test_venture_economics():
    """Guards: budget and team_size were read in isolation, so runway was invisible."""
    print("\n[9] Runway combines capital, team size and delivery mode")
    solo = _venture_economics(base(budget=500000, team_size=1))
    big = _venture_economics(base(budget=500000, team_size=12))
    check("same capital, bigger team = shorter runway", solo["runway_months"] > big["runway_months"],
          f"{solo['runway_months']} vs {big['runway_months']}")
    offline = _venture_economics(base(budget=500000, team_size=5, sector="offline"))
    online = _venture_economics(base(budget=500000, team_size=5, sector="online"))
    check("physical venture burns faster", offline["runway_months"] < online["runway_months"])
    check("ambition ratio computed", _venture_economics(base(budget=1000000, revenue_goal=5000000))["ambition"] == 5.0)


def test_strong_beats_weak():
    """End-to-end: a genuinely strong venture must out-score a genuinely weak one."""
    print("\n[10] Strong ventures out-score weak ones end to end")
    strong = scores(base(title="AI Contract Review", industry="Artificial Intelligence",
                         budget=25000000, team_size=15, revenue_goal=100000000,
                         location="Bangalore", _trends_data={"avg_interest": 85, "status": "success"}))
    weak = scores(base(title="Another Todo App", industry="SaaS", budget=5000, team_size=1,
                       revenue_goal=20000, _trends_data={"avg_interest": 8, "status": "success"}))
    check("opportunity higher", strong["oppty"] > weak["oppty"], f"{strong['oppty']} vs {weak['oppty']}")
    check("feasibility higher", strong["feasib"] > weak["feasib"], f"{strong['feasib']} vs {weak['feasib']}")
    check("investor readiness higher", strong["invest"] > weak["invest"], f"{strong['invest']} vs {weak['invest']}")
    check("risk lower", strong["risk"] < weak["risk"], f"{strong['risk']} vs {weak['risk']}")
    check("opportunity gap is meaningful (> 15)", (strong["oppty"] - weak["oppty"]) > 15.0,
          f"gap={round(strong['oppty'] - weak['oppty'], 1)}")


def main():
    print("=" * 74)
    print("VISION2VENTURE — ANALYSIS ACCURACY REGRESSION SUITE")
    print("=" * 74)
    for fn in [test_encoder_resolves_real_categories, test_growth_rate_varies_by_sector,
               test_opportunity_is_not_a_budget_proxy, test_revenue_goal_is_used,
               test_financials_reconcile, test_no_cross_industry_content_leakage,
               test_hybrid_national_scope_sizing, test_zero_fabrication,
               test_no_hash_derived_statistics, test_venture_economics,
               test_strong_beats_weak]:
        try:
            fn()
        except Exception as e:
            FAILED.append((fn.__name__, f"raised {type(e).__name__}: {e}"))
            print(f"  [ERROR] {fn.__name__}: {e}")

    print("\n" + "=" * 74)
    print(f"SUMMARY: {len(PASSED)} passed, {len(FAILED)} failed")
    print("=" * 74)
    for name, detail in FAILED:
        print(f"  FAILED: {name}  {detail}")
    return 1 if FAILED else 0


if __name__ == "__main__":
    sys.exit(main())
