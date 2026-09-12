import sys
import json

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)

from app.services.location_service import LocationService
from app.services.online_competitor_service import OnlineCompetitorService
from app.services.competitor_intelligence_service import CompetitorIntelligenceService

def test_offline_discovery():
    print("\n--- 1. Testing Offline Competitor Discovery (OpenStreetMap + Haversine) ---")
    res = LocationService.search_offline_competitors(
        category="Restaurant",
        location_query="Hyderabad, India",
        radius_km=10.0,
        limit=5
    )
    print(f"Startup Location: {res.get('startup_location')}")
    print(f"Radius: {res.get('radius_km')} km | Total Found: {res.get('total_found')}")
    for c in res.get("competitors", [])[:3]:
        print(f"  * {c['name']} ({c['competitor_type']}): {c['distance_km']} km away | Source: {c['data_sources']}")
        assert c['distance_km'] <= 10.0, f"Distance {c['distance_km']} exceeds 10km radius!"
        assert c['evidence_status'] == "Verified from source"
    print("[OK] Offline discovery test PASSED.")

def test_online_discovery():
    print("\n--- 2. Testing Online Competitor Discovery (SaaS / E-commerce) ---")
    comps = OnlineCompetitorService.search_online_competitors(
        title="Vision2Venture",
        industry="Technology",
        description="AI startup validation and market research platform",
        target_market="Global",
        limit=4
    )
    print(f"Found {len(comps)} online competitors:")
    for c in comps:
        print(f"  * {c['name']} ({c['pricing_model']}): {c['website_url']} | Evidence: {c['evidence_status']}")
        assert c['business_type'] == "online"
    print("[OK] Online discovery test PASSED.")

def test_hybrid_discovery():
    print("\n--- 3. Testing Hybrid Competitor Discovery (Cloud Kitchen / Grocery) ---")
    res = CompetitorIntelligenceService.discover(
        idea_title="FreshKart Quick Commerce",
        industry="Grocery",
        description="Hybrid grocery with physical micro-warehouses and 10-minute online delivery app",
        business_type="hybrid",
        location="Hyderabad, India",
        radius_km=10.0,
        limit=8
    )
    counts = res.get("counts", {})
    print(f"Hybrid Counts: {counts}")
    assert counts.get("total", 0) > 0, "No competitors found in hybrid test!"
    
    # Test AI intelligence synthesis
    print("\n--- 4. Testing AI Competitive Intelligence Synthesis ---")
    idea_ctx = {
        "title": "FreshKart Quick Commerce",
        "industry": "Grocery",
        "business_type": "hybrid",
        "description": "Hybrid grocery with physical micro-warehouses and 10-minute delivery."
    }
    intel = CompetitorIntelligenceService.synthesize_intelligence(idea_ctx, res.get("competitors", []))
    print(f"Comparison Matrix Dimensions: {[r['dimension'] for r in intel.get('comparison_matrix', [])]}")
    print(f"Startup Advantages: {len(intel.get('startup_advantages', []))}")
    print(f"Strategic Recommendations: {len(intel.get('recommendations', []))}")
    assert len(intel.get("comparison_matrix", [])) > 0
    assert len(intel.get("recommendations", [])) > 0
    print("[OK] AI Competitive Intelligence synthesis test PASSED.")

if __name__ == "__main__":
    try:
        test_offline_discovery()
        test_online_discovery()
        test_hybrid_discovery()
        print("\n========================================================")
        print("ALL COMPETITOR INTELLIGENCE BACKEND TESTS PASSED (100%)")
        print("========================================================")
    except Exception as e:
        print(f"\nTEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
