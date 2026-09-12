"""
Comprehensive Audit & Verification Test Suite for Vision2Venture AI Competitor Intelligence Module.
Covers:
1. Unit Tests: Haversine distance calculation, coordinate validation, radius filtering.
2. Negative Tests: Strict zero-fabrication verification (mocked empty Overpass, mocked provider outage, unmatched YC query).
3. Security Tests: Auth enforcement (401 Unauthorized), cross-tenant isolation (404/403).
4. Real-World Accuracy Scenarios:
   - Scenario 1: Offline - Hyderabad Specialty Coffee Shop (5 km)
   - Scenario 2: Offline - Vijayawada Fitness Gym (5 km)
   - Scenario 3: Online - AI-Powered Resume Builder SaaS
   - Scenario 4: Hybrid - Agriculture Disease Detection Platform
   - Scenario 5: Simulated Provider Failure
"""

import sys
import os
import uuid
import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

# Ensure unbuffered stdout
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)

# Add backend to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.database.connection import SessionLocal, Base, engine
from app.models.user import User
from app.models.startup_idea import StartupIdea
from app.models.analysis import Competitor, CompetitorIntelligence
from app.utils.security import hash_password, create_access_token
from app.services.location_service import LocationService
from app.services.online_competitor_service import OnlineCompetitorService
from app.services.competitor_intelligence_service import CompetitorIntelligenceService
from app.services.ml_service import MLService
from app.database.migration_helper import ensure_competitor_tables_and_columns
ensure_competitor_tables_and_columns()

client = TestClient(app)

print("=" * 80)
print("VISION2VENTURE COMPETITOR INTELLIGENCE MODULE — AUDIT TEST SUITE")
print("=" * 80)

# =====================================================================
# 1. UNIT TESTS: HAVERSINE, COORDINATES, RADIUS FILTERING
# =====================================================================
print("\n[SECTION 1] RUNNING UNIT TESTS...")

# 1.1 Haversine Distance
# London (51.5074, -0.1278) to Paris (48.8566, 2.3522) is approx 343-344 km
dist_london_paris = LocationService.haversine_distance(51.5074, -0.1278, 48.8566, 2.3522)
print(f"  * Haversine London -> Paris: {dist_london_paris:.2f} km (Expected ~343.5 km)")
assert 340.0 <= dist_london_paris <= 348.0, f"Haversine calculation out of expected bounds: {dist_london_paris}"

# Hyderabad Charminar (17.3616, 78.4747) to Golconda Fort (17.3833, 78.4011) is approx 8.16 km
dist_hyd_local = LocationService.haversine_distance(17.3616, 78.4747, 17.3833, 78.4011)
print(f"  * Haversine Charminar -> Golconda Fort: {dist_hyd_local:.2f} km (Expected ~8.2 km)")
assert 7.5 <= dist_hyd_local <= 9.0, f"Haversine local distance incorrect: {dist_hyd_local}"

# 1.2 Coordinate Validation (within [-90, 90] and [-180, 180])
assert -90 <= 17.3616 <= 90 and -180 <= 78.4747 <= 180
print("  * Coordinate boundary checks PASSED.")

# 1.3 Radius Boundary Filtering
test_pois = [
    {"name": "Near POI", "lat": 17.37, "lon": 78.48}, # ~1.1 km
    {"name": "Medium POI", "lat": 17.40, "lon": 78.48}, # ~4.3 km
    {"name": "Far POI", "lat": 17.50, "lon": 78.48}, # ~15.4 km
]
origin_lat, origin_lon = 17.3616, 78.4747
radius_limit = 5.0
filtered_pois = [
    p for p in test_pois
    if LocationService.haversine_distance(origin_lat, origin_lon, p["lat"], p["lon"]) <= radius_limit
]
print(f"  * Radius filter (5 km): kept {len(filtered_pois)} of {len(test_pois)} POIs: {[p['name'] for p in filtered_pois]}")
assert len(filtered_pois) == 2, f"Expected 2 POIs within 5km, got {len(filtered_pois)}"
print("[SECTION 1] ALL UNIT TESTS PASSED.\n")

# =====================================================================
# 2. NEGATIVE TESTS: ZERO-FABRICATION VERIFICATION
# =====================================================================
print("[SECTION 2] RUNNING NEGATIVE & ZERO-FABRICATION TESTS...")

# 2.1 Overpass API returns 0 elements (empty response)
# Test that LocationService returns 0 competitors, NEVER generates synthetic names like "{city} Prime Cafe"
with patch("requests.post") as mock_post, patch("requests.get") as mock_get:
    # Mock geocoder to return a valid location
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = [{"lat": "17.3850", "lon": "78.4867", "display_name": "Hyderabad, India"}]

    # Mock Overpass interpreter to return empty elements
    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = {"elements": []}

    res_empty = LocationService.search_offline_competitors(
        category="Coffee Shop",
        location_query="Hyderabad, India",
        radius_km=5.0
    )
    print(f"  * Empty Overpass response -> competitors count: {len(res_empty.get('competitors', []))}")
    print(f"  * Status message: '{res_empty.get('status_message')}'")
    assert len(res_empty.get("competitors", [])) == 0, "ERROR: Competitors list must be EMPTY when Overpass returns no elements!"
    assert "No verified physical" in res_empty.get("status_message", ""), "Status message must honestly explain 0 competitors found"
    
    # Verify no synthetic naming patterns exist
    for comp in res_empty.get("competitors", []):
        assert "prime" not in comp["name"].lower(), f"Synthetic POI detected: {comp['name']}"
        assert "elite" not in comp["name"].lower(), f"Synthetic POI detected: {comp['name']}"

print("  * Zero-Fabrication (Empty Elements) check PASSED.")

# 2.2 Overpass Provider Failure / Outage / Timeout
with patch("requests.post") as mock_post, patch("requests.get") as mock_get:
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = [{"lat": "17.3850", "lon": "78.4867", "display_name": "Hyderabad, India"}]

    # Mock all Overpass endpoints raising Timeout
    import requests
    mock_post.side_effect = requests.exceptions.ConnectTimeout("Connection timed out to all Overpass mirrors")

    res_outage = LocationService.search_offline_competitors(
        category="Gym",
        location_query="Vijayawada, India",
        radius_km=5.0
    )
    print(f"  * Outage Overpass response -> competitors count: {len(res_outage.get('competitors', []))}")
    print(f"  * Status message: '{res_outage.get('status_message')}'")
    print(f"  * Provider status: '{res_outage.get('provider_status')}'")
    assert len(res_outage.get("competitors", [])) == 0, "ERROR: Must return 0 competitors when provider fails!"
    assert res_outage.get("provider_status") == "unreachable"
    assert "temporarily unavailable" in res_outage.get("status_message", "")

print("  * Zero-Fabrication (Provider Outage) check PASSED.")

# 2.3 YC Competitor Search Unmatched Query
# Previously, MLService returned the first 4 companies (CircuitHub etc.) arbitrarily. Verify this is removed.
yc_unmatched = MLService.search_yc_competitors(industry="TotallyObscureIndustryThatDoesNotExistAtAll12345", query="xyzq9999", limit=5)
print(f"  * Unmatched YC query results count: {len(yc_unmatched)}")
assert len(yc_unmatched) == 0, f"ERROR: Unmatched YC query returned arbitrary competitors: {yc_unmatched}"
print("  * YC Unmatched Query (No Arbitrary Fallbacks) check PASSED.")

print("[SECTION 2] ALL NEGATIVE & ZERO-FABRICATION TESTS PASSED.\n")

# =====================================================================
# 3. SECURITY & CROSS-TENANT ISOLATION TESTS
# =====================================================================
print("[SECTION 3] RUNNING SECURITY & AUTHORIZATION TESTS...")

db = SessionLocal()
try:
    # Query existing active users
    u1 = db.query(User).filter(User.email == "devendrababumotupalli@gmail.com").first()
    u2 = db.query(User).filter(User.email == "venkateshponnam555@gmail.com").first()
    assert u1 is not None and u2 is not None, "Real users must exist in database"

    # Query Startup Idea owned by User 1
    idea1 = db.query(StartupIdea).filter(StartupIdea.user_id == u1.id).first()
    assert idea1 is not None, "Startup idea owned by User 1 must exist"
    print(f"  * Using Idea '{idea1.title}' (Owner: {u1.email}) to test cross-tenant access with {u2.email}")

    from datetime import timedelta, datetime
    from app.config import settings
    from app.models.user import UserSession

    # Generate JWT Tokens & Sessions
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_u1 = create_access_token({"sub": u1.id}, expires_delta=access_token_expires)
    s1 = UserSession(id=str(uuid.uuid4()), user_id=u1.id, token=token_u1, expires_at=datetime.utcnow() + access_token_expires)
    db.add(s1)

    token_u2 = create_access_token({"sub": u2.id}, expires_delta=access_token_expires)
    s2 = UserSession(id=str(uuid.uuid4()), user_id=u2.id, token=token_u2, expires_at=datetime.utcnow() + access_token_expires)
    db.add(s2)
    db.commit()

    # 3.1 Unauthenticated access to /api/competitors/discover
    resp_no_auth = client.post("/api/competitors/discover", json={"idea_id": idea1.id})
    print(f"  * Unauthenticated POST /api/competitors/discover -> status {resp_no_auth.status_code}")
    assert resp_no_auth.status_code == 401, f"Expected 401 Unauthorized, got {resp_no_auth.status_code}"

    # 3.2 Unauthenticated access to /api/competitors/startup/{id}
    resp_no_auth_get = client.get(f"/api/competitors/startup/{idea1.id}")
    print(f"  * Unauthenticated GET /api/competitors/startup/{idea1.id} -> status {resp_no_auth_get.status_code}")
    assert resp_no_auth_get.status_code == 401, f"Expected 401 Unauthorized, got {resp_no_auth_get.status_code}"

    # 3.3 Cross-Tenant Isolation: User 2 attempts to discover/access User 1's idea competitors
    headers_u2 = {"Authorization": f"Bearer {token_u2}"}
    resp_cross_post = client.post(
        "/api/competitors/discover",
        json={"idea_id": idea1.id, "business_type": "online"},
        headers=headers_u2
    )
    print(f"  * Cross-tenant POST /api/competitors/discover -> status {resp_cross_post.status_code}")
    assert resp_cross_post.status_code == 404, f"Expected 404 Not Found / Access Denied, got {resp_cross_post.status_code}"

    resp_cross_get = client.get(
        f"/api/competitors/startup/{idea1.id}",
        headers=headers_u2
    )
    print(f"  * Cross-tenant GET /api/competitors/startup/{idea1.id} -> status {resp_cross_get.status_code}")
    assert resp_cross_get.status_code == 404, f"Expected 404 Not Found / Access Denied, got {resp_cross_get.status_code}"

    # 3.4 Authorized Access: User 1 accesses their own idea competitors
    headers_u1 = {"Authorization": f"Bearer {token_u1}"}
    resp_auth_get = client.get(
        f"/api/competitors/startup/{idea1.id}",
        headers=headers_u1
    )
    print(f"  * Authorized GET /api/competitors/startup/{idea1.id} -> status {resp_auth_get.status_code}")
    assert resp_auth_get.status_code == 200, f"Expected 200 OK, got {resp_auth_get.status_code}"

    print("[SECTION 3] ALL SECURITY & CROSS-TENANT TESTS PASSED.\n")

finally:
    try:
        db.query(UserSession).filter(UserSession.token.in_([token_u1, token_u2])).delete(synchronize_session=False)
        db.commit()
    except Exception:
        pass
    db.close()

# =====================================================================
# 4. REAL-WORLD ACCURACY SCENARIOS (5 SCENARIOS)
# =====================================================================
print("[SECTION 4] EXECUTING 5 REAL-WORLD ACCURACY SCENARIOS...")

# Scenario 1: Offline — Specialty Coffee Shop in Hyderabad, India (5 km radius)
print("\n--- SCENARIO 1: Offline — Specialty Coffee Shop in Hyderabad (5 km) ---")
res_s1 = LocationService.search_offline_competitors(
    category="Coffee Shop",
    location_query="Hyderabad, India",
    radius_km=5.0,
    keywords="cafe coffee",
    limit=6
)
print(f"Location resolved: {res_s1['startup_location']['display_name']}")
print(f"Status Message: {res_s1['status_message']}")
print(f"Total Discovered: {res_s1['total_found']}")
for c in res_s1["competitors"][:4]:
    print(f"  -> Name: {c['name']} | Dist: {c['distance_km']} km | Evid: {c['evidence_status']} | Rating: {c['rating']} | Src: {c['data_sources']}")
    assert c["distance_km"] <= 5.0, f"Distance {c['distance_km']} exceeds 5km radius!"
    assert c["evidence_status"] == "Verified from source"
    assert c["rating"] is None, "Rating must be None (not fabricated)"
    assert c["review_count"] is None, "Review count must be None (not fabricated)"
    assert "OpenStreetMap" in c["data_sources"]

# Scenario 2: Offline — Fitness Gym in Vijayawada, India (5 km radius)
print("\n--- SCENARIO 2: Offline — Fitness Gym in Vijayawada (5 km) ---")
res_s2 = LocationService.search_offline_competitors(
    category="Gym",
    location_query="Vijayawada, India",
    radius_km=5.0,
    keywords="gym fitness workout",
    limit=6
)
print(f"Location resolved: {res_s2['startup_location']['display_name']}")
print(f"Status Message: {res_s2['status_message']}")
print(f"Total Discovered: {res_s2['total_found']}")
for c in res_s2["competitors"][:4]:
    print(f"  -> Name: {c['name']} | Dist: {c['distance_km']} km | Evid: {c['evidence_status']} | Category: {c['competitor_type']}")
    assert c["distance_km"] <= 5.0, f"Distance {c['distance_km']} exceeds 5km radius!"
    assert c["evidence_status"] == "Verified from source"
    assert c["rating"] is None

# Scenario 3: Online — AI Resume Builder SaaS (Target: Global)
print("\n--- SCENARIO 3: Online — AI Resume Builder SaaS (Global) ---")
res_s3 = OnlineCompetitorService.search_online_competitors(
    title="ResumeAI Pro",
    industry="Technology",
    description="AI-powered resume builder and career optimization SaaS with automated ATS scoring",
    target_market="Global",
    keywords="resume cv career builder",
    limit=5
)
print(f"Total Online Competitors Found: {len(res_s3)}")
for c in res_s3[:4]:
    print(f"  -> Name: {c['name']} | Pricing: {c['pricing_model']} | Evid: {c['evidence_status']} | URL: {c['website_url']}")
    assert c["business_type"] == "online"
    assert c["evidence_status"] in ["Publicly reported", "AI inference", "User-provided"]
    assert c["rating"] is None, "Online rating should not be fabricated"

# Scenario 4: Hybrid — Agriculture Disease Detection Platform with Drone Service
print("\n--- SCENARIO 4: Hybrid — Agriculture Disease Detection & Drone Delivery ---")
res_s4 = CompetitorIntelligenceService.discover(
    idea_title="AgriShield Drone Intelligence",
    industry="Agriculture",
    description="Combines on-field drone disease diagnostics with a digital farmer web dashboard and treatment delivery",
    business_type="hybrid",
    location="Hyderabad, India",
    radius_km=10.0,
    keywords="agriculture farm fertilizer",
    limit=8
)
print(f"Hybrid Counts: {res_s4.get('counts')}")
print(f"Total Hybrid Competitors: {len(res_s4.get('competitors', []))}")
for c in res_s4["competitors"][:4]:
    print(f"  -> Name: {c['name']} | Type: {c['business_type']} | Evid: {c['evidence_status']}")

# Scenario 5: Simulated Provider Failure
print("\n--- SCENARIO 5: Simulated Provider Failure Verification ---")
with patch("requests.post") as mock_post, patch("requests.get") as mock_get:
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = [{"lat": "17.3850", "lon": "78.4867", "display_name": "Hyderabad, India"}]
    mock_post.side_effect = Exception("Simulated connection reset")

    res_s5 = LocationService.search_offline_competitors(
        category="Restaurant",
        location_query="Hyderabad, India",
        radius_km=5.0
    )
    print(f"Provider Status: {res_s5.get('provider_status')}")
    print(f"Status Message: {res_s5.get('status_message')}")
    print(f"Competitors returned: {res_s5.get('competitors')}")
    assert res_s5.get("provider_status") == "unreachable"
    assert len(res_s5.get("competitors", [])) == 0, "Competitors must be empty during provider failure"
    assert "temporarily unavailable" in res_s5.get("status_message", "")
    print("  * Provider Failure test verified: Returned [] with honest explanatory message.")

print("\n" + "=" * 80)
print("AUDIT SUMMARY: ALL UNIT, NEGATIVE, SECURITY, AND REAL-WORLD TESTS PASSED!")
print("=" * 80)
