"""
Verification and Audit Test Suite for Competitor Intelligence Tab Data Flow & Separation.
Tests:
- Test A: Offline Bakery (Strict Physical OSM only, proper source badges, no digital/LLM fallback)
- Test B: Online Resume Builder (Digital only, Live Web/YC/LLM, no physical OSM, no map requirement)
- Test C: Hybrid AgriTech (Both physical and digital competitors separated cleanly)
- Test D: Zero Physical Competitors (Clean empty list, no fake Hyderabad coordinates or hallucinated records)
- Test E: Geolocation Permission Fallback (Manual location string and custom radius persistence and geocoding)
"""

import os
import sys
import uuid
import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

# Unbuffered output with UTF-8
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.database.connection import SessionLocal
from app.models.user import User
from app.models.startup_idea import StartupIdea
from app.models.analysis import Competitor, CompetitorIntelligence
from app.utils.security import hash_password, create_access_token
from app.services.location_service import LocationService
from app.services.online_competitor_service import OnlineCompetitorService
from app.services.competitor_intelligence_service import CompetitorIntelligenceService
from app.database.migration_helper import ensure_competitor_tables_and_columns

ensure_competitor_tables_and_columns()
client = TestClient(app)

print("=" * 80)
print("STARTING COMPETITOR TAB AUDIT TEST SUITE (5 TEST CASES)")
print("=" * 80)

from app.models.user import User, UserSession
from datetime import datetime, timedelta
from app.config import settings

# Prepare a test user and auth token
db = SessionLocal()
test_user = db.query(User).filter(User.email == "audit_tester@example.com").first()
if not test_user:
    test_user = User(
        id=str(uuid.uuid4()),
        name="Audit Tester",
        email="audit_tester@example.com",
        password_hash=hash_password("AuditSecret123!"),
        role="user"
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)

access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
auth_token = create_access_token({"sub": test_user.id}, expires_delta=access_token_expires)
session = UserSession(
    id=str(uuid.uuid4()),
    user_id=test_user.id,
    token=auth_token,
    expires_at=datetime.utcnow() + access_token_expires
)
db.add(session)
db.commit()
headers = {"Authorization": f"Bearer {auth_token}"}
db.close()


def test_case_a_offline_bakery():
    print("\n" + "-" * 70)
    print("TEST CASE A: Offline Startup (Artisan Bakery in Banjara Hills, Hyderabad)")
    print("-" * 70)
    
    # 1. Create StartupIdea with location & radius_km
    create_res = client.post(
        "/api/startup/create",
        json={
            "title": "Artisan Crust & Crumb Bakery",
            "description": "Artisanal sourdough bakery and specialty coffee serving fresh organic pastries.",
            "industry": "Food & Beverage",
            "country": "India",
            "business_type": "b2c",
            "target_customers": "Local residents, foodies, and office workers in Hyderabad",
            "budget": 1500000.0,
            "team_skills": "Baking, Culinary Arts, Hospitality",
            "sector": "offline",
            "pricing_model": "direct_sales",
            "team_size": 4,
            "business_stage": "early",
            "revenue_goal": 3500000.0,
            "funding_required": 1000000.0,
            "location": "Banjara Hills, Hyderabad",
            "radius_km": 5.0
        },
        headers=headers
    )
    assert create_res.status_code == 200, f"Failed to create offline startup: {create_res.text}"
    idea_data = create_res.json()
    idea_id = idea_data["id"]
    print(f"  [OK] Created offline idea ID: {idea_id}")
    print(f"  [OK] Saved Location: '{idea_data.get('location')}', Radius: {idea_data.get('radius_km')} km")
    assert idea_data.get("location") == "Banjara Hills, Hyderabad", "Location not saved correctly!"
    assert float(idea_data.get("radius_km")) == 5.0, "Radius not saved correctly!"

    # 2. Run Competitor Intelligence Discovery
    disc_res = client.post(
        "/api/competitors/discover",
        json={"idea_id": idea_id},
        headers=headers
    )
    assert disc_res.status_code == 200, f"Discovery failed: {disc_res.text}"
    disc_data = disc_res.json().get("data", {})
    physical = disc_data.get("physical_competitors", [])
    digital = disc_data.get("digital_competitors", [])
    
    print(f"  [OK] Physical competitors found: {len(physical)}")
    print(f"  [OK] Digital competitors found: {len(digital)}")
    
    # Strict Offline Separation:
    assert len(digital) == 0, f"Offline startup should have 0 digital competitors! Got: {len(digital)}"
    assert len(physical) > 0, "Expected physical bakery competitors in Banjara Hills, Hyderabad!"
    
    for comp in physical:
        assert comp.get("source_type") == "openstreetmap", f"Expected source_type='openstreetmap', got: {comp.get('source_type')}"
        assert comp.get("source_label") == "OpenStreetMap / Overpass", f"Unexpected source_label: {comp.get('source_label')}"
        assert comp.get("latitude") is not None and comp.get("longitude") is not None, "Missing coordinates!"
        print(f"    - {comp['name']} ({comp.get('distance_km')} km away) [{comp.get('source_label')}]")
        
    print("  [OK] TEST CASE A PASSED: Strict offline OSM discovery verified.")


def test_case_b_online_resume_builder():
    print("\n" + "-" * 70)
    print("TEST CASE B: Online Startup (AI Resume & Portfolio Builder SaaS)")
    print("-" * 70)
    
    create_res = client.post(
        "/api/startup/create",
        json={
            "title": "AI Resume & Portfolio Builder SaaS",
            "description": "Automated ATS-friendly resume tailoring, portfolio site generation, and LinkedIn sync.",
            "industry": "SaaS",
            "country": "Global",
            "business_type": "b2c",
            "target_customers": "Job seekers, software engineers, and university graduates",
            "budget": 500000.0,
            "team_skills": "Next.js, Python, LLMs",
            "sector": "online",
            "pricing_model": "subscription",
            "team_size": 3,
            "business_stage": "prototype",
            "revenue_goal": 5000000.0,
            "funding_required": 1500000.0
        },
        headers=headers
    )
    assert create_res.status_code == 200, f"Failed to create online startup: {create_res.text}"
    idea_data = create_res.json()
    idea_id = idea_data["id"]
    print(f"  [OK] Created online idea ID: {idea_id}")
    assert idea_data.get("location") is None or idea_data.get("location") == "", "Online startup should not enforce location!"

    disc_res = client.post(
        "/api/competitors/discover",
        json={"idea_id": idea_id},
        headers=headers
    )
    assert disc_res.status_code == 200, f"Discovery failed: {disc_res.text}"
    disc_data = disc_res.json().get("data", {})
    physical = disc_data.get("physical_competitors", [])
    digital = disc_data.get("digital_competitors", [])
    
    print(f"  [OK] Physical competitors found: {len(physical)}")
    print(f"  [OK] Digital competitors found: {len(digital)}")
    
    # Strict Online Separation:
    assert len(physical) == 0, f"Online startup must have 0 physical competitors! Got: {len(physical)}"
    assert len(digital) > 0, "Expected digital competitors from web/YC/LLM!"
    
    for comp in digital:
        st = comp.get("source_type")
        assert st in ["live_web", "yc_dataset", "llm", "manual"], f"Invalid digital source_type: {st}"
        print(f"    - {comp['name']} ({comp.get('website_url') or 'No website'}) [{comp.get('source_label')}]")
        
    print("  [OK] TEST CASE B PASSED: Strict online digital discovery verified.")


def test_case_c_hybrid_agritech():
    print("\n" + "-" * 70)
    print("TEST CASE C: Hybrid Startup (FreshFarm Organics Hyperlocal Grocery)")
    print("-" * 70)
    
    create_res = client.post(
        "/api/startup/create",
        json={
            "title": "FreshFarm Organics Hyperlocal Grocery",
            "description": "Farm-to-table organic produce store with app-based 30-minute hyperlocal delivery.",
            "industry": "Agriculture & Retail",
            "country": "India",
            "business_type": "b2c",
            "target_customers": "Health-conscious households and urban families",
            "budget": 2500000.0,
            "team_skills": "Supply chain, React Native, Retail management",
            "sector": "hybrid",
            "pricing_model": "direct_sales",
            "team_size": 6,
            "business_stage": "early",
            "revenue_goal": 8000000.0,
            "funding_required": 2000000.0,
            "location": "Madhapur, Hyderabad",
            "radius_km": 5.0
        },
        headers=headers
    )
    assert create_res.status_code == 200, f"Failed to create hybrid startup: {create_res.text}"
    idea_data = create_res.json()
    idea_id = idea_data["id"]
    print(f"  [OK] Created hybrid idea ID: {idea_id}")

    disc_res = client.post(
        "/api/competitors/discover",
        json={"idea_id": idea_id},
        headers=headers
    )
    assert disc_res.status_code == 200, f"Discovery failed: {disc_res.text}"
    disc_data = disc_res.json().get("data", {})
    physical = disc_data.get("physical_competitors", [])
    digital = disc_data.get("digital_competitors", [])
    
    print(f"  [OK] Physical competitors found: {len(physical)}")
    print(f"  [OK] Digital competitors found: {len(digital)}")
    
    assert len(physical) > 0, "Hybrid startup with retail should discover physical competitors!"
    assert len(digital) > 0, "Hybrid startup should also discover digital delivery / e-grocery competitors!"
    
    for comp in physical[:2]:
        assert comp.get("source_type") == "openstreetmap"
        print(f"    [Physical] {comp['name']} ({comp.get('distance_km')} km)")
    for comp in digital[:2]:
        assert comp.get("source_type") in ["live_web", "yc_dataset", "llm", "manual"]
        print(f"    [Digital] {comp['name']} ({comp.get('website_url')})")
        
    print("  [OK] TEST CASE C PASSED: Hybrid physical/digital separation verified.")


def test_case_d_zero_physical_competitors():
    print("\n" + "-" * 70)
    print("TEST CASE D: Zero Physical Competitors (Remote Antarctic Island)")
    print("-" * 70)
    
    # We test with coordinates in Bouvet Island (-54.42, 3.41)
    res = LocationService.search_offline_competitors(category="supermarket", location_query="Bouvet Island", radius_km=1.0)
    comps = res.get("competitors", [])
    print(f"  * Competitors found on Bouvet Island: {len(comps)}")
    assert len(comps) == 0, f"Zero physical competitors expected, but got: {len(comps)}"
    print("  [OK] TEST CASE D PASSED: Clean empty state on 0 physical competitors verified (Zero Hallucination).")


def test_case_e_geolocation_manual_fallback():
    print("\n" + "-" * 70)
    print("TEST CASE E: Geolocation Permission Denied / Manual Location Fallback")
    print("-" * 70)
    
    create_res = client.post(
        "/api/startup/create",
        json={
            "title": "Apex Strength & CrossFit Gym",
            "description": "High-intensity functional fitness, weightlifting, and personal athletic training gym.",
            "industry": "Fitness & Wellness",
            "country": "India",
            "business_type": "b2c",
            "target_customers": "Fitness enthusiasts, athletes, and working professionals",
            "budget": 3500000.0,
            "team_skills": "CrossFit Coaching, Sports Nutrition, Gym Operations",
            "sector": "offline",
            "pricing_model": "subscription",
            "team_size": 5,
            "business_stage": "early",
            "revenue_goal": 6000000.0,
            "funding_required": 1500000.0,
            "location": "Jubilee Hills, Hyderabad",
            "radius_km": 10.0
        },
        headers=headers
    )
    assert create_res.status_code == 200, f"Failed: {create_res.text}"
    idea_data = create_res.json()
    assert idea_data["location"] == "Jubilee Hills, Hyderabad"
    assert idea_data["radius_km"] == 10.0
    print(f"  [OK] Successfully accepted manual location: '{idea_data['location']}' with radius: {idea_data['radius_km']} km")
    
    geo = LocationService.geocode_location("Jubilee Hills, Hyderabad")
    assert geo is not None, "Failed to resolve manual location string!"
    lat, lng = geo["lat"], geo["lng"]
    print(f"  [OK] Geocoded to coordinates: ({lat:.4f}, {lng:.4f})")
    assert 17.0 <= lat <= 18.0 and 78.0 <= lng <= 79.0, f"Coordinates outside Hyderabad: ({lat}, {lng})"
    
    print("  [OK] TEST CASE E PASSED: Manual location string and custom radius fallback verified.")


if __name__ == "__main__":
    try:
        test_case_a_offline_bakery()
        test_case_b_online_resume_builder()
        test_case_c_hybrid_agritech()
        test_case_d_zero_physical_competitors()
        test_case_e_geolocation_manual_fallback()
        print("\n" + "=" * 80)
        print("ALL 5 COMPETITOR TAB AUDIT TEST CASES PASSED PERFECTLY!")
        print("=" * 80)
    except Exception as e:
        print(f"\n[FAIL] AUDIT TEST SUITE FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
