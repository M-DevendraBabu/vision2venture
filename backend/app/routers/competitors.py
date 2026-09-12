import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.models.startup_idea import StartupIdea
from app.models.analysis import Competitor, CompetitorIntelligence
from app.utils.security import get_current_user
from app.services.competitor_intelligence_service import CompetitorIntelligenceService

router = APIRouter(prefix="/competitors", tags=["competitors"])

# ----------------- Pydantic Schemas -----------------
class DiscoverRequest(BaseModel):
    idea_id: str
    business_type: Optional[str] = None
    location: Optional[str] = None
    radius_km: Optional[float] = 10.0
    lat: Optional[float] = None
    lng: Optional[float] = None
    keywords: Optional[str] = ""
    user_known_competitors: Optional[str] = ""

class AnalyzeRequest(BaseModel):
    idea_id: str
    selected_competitor_ids: Optional[List[str]] = None

class ManualCompetitorCreate(BaseModel):
    idea_id: str
    name: str
    business_type: Optional[str] = "online"
    competitor_type: Optional[str] = "direct"
    description: Optional[str] = ""
    website_url: Optional[str] = ""
    location: Optional[str] = ""
    pricing_model: Optional[str] = "Not specified"
    pricing_details: Optional[str] = ""
    strengths: Optional[str] = ""
    weaknesses: Optional[str] = ""
    competitive_gap: Optional[str] = ""

class CompetitorPatch(BaseModel):
    is_selected: Optional[bool] = None
    competitor_type: Optional[str] = None
    pricing_model: Optional[str] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None

# ----------------- Helper -----------------
def _get_authorized_idea(idea_id: str, current_user: User, db: Session) -> StartupIdea:
    idea = db.query(StartupIdea).filter(
        StartupIdea.id == idea_id,
        StartupIdea.user_id == current_user.id
    ).first()
    if not idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Startup idea not found or access denied."
        )
    return idea

# ----------------- Endpoints -----------------

@router.post("/discover")
def discover_competitors(
    payload: DiscoverRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Triggers on-demand competitor discovery across Offline, Online, or Hybrid dimensions.
    Saves discovered competitors and updates intelligence analysis.
    """
    idea = _get_authorized_idea(payload.idea_id, current_user, db)

    # Resolve parameters
    b_type = (payload.business_type or idea.business_type or idea.sector or "online").lower()
    loc = payload.location or idea.country or ""
    radius = float(payload.radius_km or 10.0)

    # Run discovery
    discovery_result = CompetitorIntelligenceService.discover(
        idea_title=idea.title,
        industry=idea.industry,
        description=idea.description,
        business_type=b_type,
        location=loc,
        radius_km=radius,
        lat=payload.lat,
        lng=payload.lng,
        keywords=payload.keywords or "",
        target_market=idea.country or "Global",
        user_known_competitors=payload.user_known_competitors or ""
    )

    discovered_comps = discovery_result.get("competitors", [])

    # Clear old competitors for this idea to keep dashboard fresh
    db.query(Competitor).filter(Competitor.idea_id == idea.id).delete()

    # Persist new competitors
    db_competitors = []
    for c in discovered_comps:
        comp_obj = Competitor(
            id=str(uuid.uuid4()),
            idea_id=idea.id,
            name=c["name"],
            business_type=c.get("business_type", b_type),
            competitor_type=c.get("competitor_type", "direct"),
            description=c.get("description", ""),
            website_url=c.get("website_url", ""),
            app_url=c.get("app_url", ""),
            location=c.get("location", loc),
            latitude=c.get("latitude"),
            longitude=c.get("longitude"),
            distance_km=c.get("distance_km"),
            phone=c.get("phone", "Not available"),
            rating=c.get("rating"),
            review_count=c.get("review_count"),
            opening_hours=c.get("opening_hours", "Not available"),
            pricing_model=c.get("pricing_model", "Not available"),
            pricing_details=c.get("pricing_details", ""),
            target_audience=c.get("target_audience", ""),
            features=c.get("features", ""),
            similarity_score=float(c.get("similarity_score", 50.0)),
            relevance_score=float(c.get("relevance_score", 50.0)),
            strengths=c.get("strengths", ""),
            weaknesses=c.get("weaknesses", ""),
            competitive_gap=c.get("competitive_gap", ""),
            usp=c.get("usp", ""),
            analysis_explanation=c.get("analysis_explanation", ""),
            source_urls=c.get("source_urls", []),
            data_sources=c.get("data_sources", []),
            data_freshness=c.get("data_freshness", "Current"),
            confidence_score=float(c.get("confidence_score", 85.0)),
            evidence_status=c.get("evidence_status", "AI inference"),
            verified=bool(c.get("verified", False)),
            is_selected=bool(c.get("is_selected", True))
        )
        db.add(comp_obj)
        db_competitors.append(comp_obj)

    # Synthesize AI intelligence
    idea_context = {
        "title": idea.title,
        "industry": idea.industry,
        "description": idea.description,
        "business_type": b_type,
        "location": loc,
        "country": idea.country
    }
    intelligence_data = CompetitorIntelligenceService.synthesize_intelligence(idea_context, discovered_comps)

    # Save or update CompetitorIntelligence
    existing_intel = db.query(CompetitorIntelligence).filter(CompetitorIntelligence.idea_id == idea.id).first()
    search_cfg = {
        "business_type": b_type,
        "location": loc,
        "radius_km": radius,
        "startup_location": discovery_result.get("startup_location")
    }

    if existing_intel:
        existing_intel.search_config = search_cfg
        existing_intel.comparison_matrix = intelligence_data.get("comparison_matrix", [])
        existing_intel.startup_advantages = intelligence_data.get("startup_advantages", [])
        existing_intel.startup_gaps = intelligence_data.get("startup_gaps", [])
        existing_intel.market_opportunities = intelligence_data.get("market_opportunities", [])
        existing_intel.competitive_risks = intelligence_data.get("competitive_risks", [])
        existing_intel.recommendations = intelligence_data.get("recommendations", [])
        existing_intel.data_limitations = intelligence_data.get("data_limitations", [])
        existing_intel.updated_at = datetime.utcnow()
    else:
        intel_obj = CompetitorIntelligence(
            id=str(uuid.uuid4()),
            idea_id=idea.id,
            search_config=search_cfg,
            comparison_matrix=intelligence_data.get("comparison_matrix", []),
            startup_advantages=intelligence_data.get("startup_advantages", []),
            startup_gaps=intelligence_data.get("startup_gaps", []),
            market_opportunities=intelligence_data.get("market_opportunities", []),
            competitive_risks=intelligence_data.get("competitive_risks", []),
            recommendations=intelligence_data.get("recommendations", []),
            data_limitations=intelligence_data.get("data_limitations", [])
        )
        db.add(intel_obj)

    db.commit()

    return {
        "status": "success",
        "data": {
            "counts": discovery_result.get("counts"),
            "startup_location": discovery_result.get("startup_location"),
            "radius_km": radius,
            "status_message": discovery_result.get("status_message", ""),
            "provider_status": discovery_result.get("provider_status", "ok"),
            "competitors": [c.to_dict() if hasattr(c, 'to_dict') else _serialize_competitor(c) for c in db_competitors],
            "intelligence": intelligence_data
        }
    }

@router.post("/analyze")
def analyze_selected_competitors(
    payload: AnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reruns AI strategic analysis on the user-selected subset of competitors.
    """
    idea = _get_authorized_idea(payload.idea_id, current_user, db)

    query = db.query(Competitor).filter(Competitor.idea_id == idea.id)
    if payload.selected_competitor_ids:
        query = query.filter(Competitor.id.in_(payload.selected_competitor_ids))
    else:
        query = query.filter(Competitor.is_selected == True)

    selected_comps = query.all()
    comps_dicts = [_serialize_competitor(c) for c in selected_comps]

    idea_context = {
        "title": idea.title,
        "industry": idea.industry,
        "description": idea.description,
        "business_type": idea.business_type or idea.sector or "online",
        "location": idea.country
    }
    intelligence_data = CompetitorIntelligenceService.synthesize_intelligence(idea_context, comps_dicts)

    # Update intelligence in DB
    intel_record = db.query(CompetitorIntelligence).filter(CompetitorIntelligence.idea_id == idea.id).first()
    if intel_record:
        intel_record.comparison_matrix = intelligence_data.get("comparison_matrix", [])
        intel_record.startup_advantages = intelligence_data.get("startup_advantages", [])
        intel_record.startup_gaps = intelligence_data.get("startup_gaps", [])
        intel_record.market_opportunities = intelligence_data.get("market_opportunities", [])
        intel_record.competitive_risks = intelligence_data.get("competitive_risks", [])
        intel_record.recommendations = intelligence_data.get("recommendations", [])
        intel_record.updated_at = datetime.utcnow()
        db.commit()

    return {
        "status": "success",
        "data": {
            "intelligence": intelligence_data,
            "selected_count": len(selected_comps)
        }
    }

@router.get("/startup/{idea_id}")
def get_startup_competitor_data(
    idea_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetches all discovered competitors, search configuration, and AI intelligence for an idea.
    If no competitors exist yet, triggers initial discovery automatically.
    """
    idea = _get_authorized_idea(idea_id, current_user, db)

    competitors = db.query(Competitor).filter(Competitor.idea_id == idea.id).order_by(
        Competitor.distance_km.is_(None),
        Competitor.distance_km.asc(),
        Competitor.relevance_score.desc()
    ).all()

    intel = db.query(CompetitorIntelligence).filter(CompetitorIntelligence.idea_id == idea.id).first()

    # If empty, trigger on-the-fly initial discovery
    if not competitors:
        b_type = (idea.business_type or idea.sector or "online").lower()
        return discover_competitors(
            DiscoverRequest(
                idea_id=idea.id,
                business_type=b_type,
                location=idea.country,
                radius_km=10.0
            ),
            current_user=current_user,
            db=db
        )

    comps_serialized = [_serialize_competitor(c) for c in competitors]

    counts = {
        "total": len(competitors),
        "offline": sum(1 for c in competitors if getattr(c, "business_type", "") == "offline"),
        "online": sum(1 for c in competitors if getattr(c, "business_type", "") == "online"),
        "hybrid": sum(1 for c in competitors if getattr(c, "business_type", "") == "hybrid"),
        "selected": sum(1 for c in competitors if getattr(c, "is_selected", True))
    }

    intelligence_payload = {}
    if intel:
        intelligence_payload = {
            "comparison_matrix": intel.comparison_matrix or [],
            "startup_advantages": intel.startup_advantages or [],
            "startup_gaps": intel.startup_gaps or [],
            "market_opportunities": intel.market_opportunities or [],
            "competitive_risks": intel.competitive_risks or [],
            "recommendations": intel.recommendations or [],
            "data_limitations": intel.data_limitations or []
        }

    search_cfg = (intel.search_config if intel and intel.search_config else {}) or {
        "business_type": idea.business_type or idea.sector or "online",
        "location": idea.country or "",
        "radius_km": 10.0,
        "startup_location": {"lat": 0.0, "lng": 0.0, "display_name": idea.country or "Global"}
    }

    return {
        "status": "success",
        "data": {
            "idea_info": {
                "id": idea.id,
                "title": idea.title,
                "industry": idea.industry,
                "business_type": idea.business_type or idea.sector or "online",
                "country": idea.country,
                "description": idea.description
            },
            "search_config": search_cfg,
            "counts": counts,
            "competitors": comps_serialized,
            "intelligence": intelligence_payload
        }
    }

@router.post("/manual")
def add_manual_competitor(
    payload: ManualCompetitorCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Allows user to manually add a custom competitor.
    """
    idea = _get_authorized_idea(payload.idea_id, current_user, db)

    new_comp = Competitor(
        id=str(uuid.uuid4()),
        idea_id=idea.id,
        name=payload.name.strip(),
        business_type=payload.business_type or "online",
        competitor_type=payload.competitor_type or "direct",
        description=payload.description or f"Custom competitor entered for {idea.industry}.",
        website_url=payload.website_url or "",
        location=payload.location or idea.country or "",
        pricing_model=payload.pricing_model or "Custom / Inquiry",
        pricing_details=payload.pricing_details or "",
        strengths=payload.strengths or "• Established product presence.",
        weaknesses=payload.weaknesses or "• Potential agility/pricing friction.",
        competitive_gap=payload.competitive_gap or "Differentiate on dedicated service and transparent pricing.",
        similarity_score=80.0,
        relevance_score=85.0,
        analysis_explanation="User-provided competitor integrated into competitive benchmarking matrix.",
        source_urls=[payload.website_url] if payload.website_url else [],
        data_sources=["User Input"],
        data_freshness="Manual Entry",
        confidence_score=90.0,
        evidence_status="User-provided",
        verified=False,
        is_selected=True
    )

    db.add(new_comp)
    db.commit()
    db.refresh(new_comp)

    return {
        "status": "success",
        "data": _serialize_competitor(new_comp)
    }

@router.patch("/{competitor_id}")
def update_competitor(
    competitor_id: str,
    payload: CompetitorPatch,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates competitor attributes (e.g. selection toggle).
    """
    comp = db.query(Competitor).filter(Competitor.id == competitor_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Competitor not found")

    _get_authorized_idea(comp.idea_id, current_user, db)

    if payload.is_selected is not None:
        comp.is_selected = payload.is_selected
    if payload.competitor_type is not None:
        comp.competitor_type = payload.competitor_type
    if payload.pricing_model is not None:
        comp.pricing_model = payload.pricing_model
    if payload.strengths is not None:
        comp.strengths = payload.strengths
    if payload.weaknesses is not None:
        comp.weaknesses = payload.weaknesses

    comp.updated_at = datetime.utcnow()
    db.commit()

    return {
        "status": "success",
        "data": _serialize_competitor(comp)
    }

@router.delete("/{competitor_id}")
def delete_competitor(
    competitor_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes an irrelevant or rejected competitor.
    """
    comp = db.query(Competitor).filter(Competitor.id == competitor_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Competitor not found")

    _get_authorized_idea(comp.idea_id, current_user, db)

    db.delete(comp)
    db.commit()

    return {
        "status": "success",
        "message": f"Competitor '{comp.name}' removed successfully."
    }

def _serialize_competitor(c: Competitor) -> Dict[str, Any]:
    """Helper to convert SQLAlchemy Competitor model to JSON serializable dict."""
    return {
        "id": c.id,
        "idea_id": c.idea_id,
        "name": c.name,
        "business_type": getattr(c, "business_type", "online") or "online",
        "competitor_type": getattr(c, "competitor_type", "direct") or "direct",
        "description": c.description or "",
        "website_url": getattr(c, "website_url", "") or "",
        "app_url": getattr(c, "app_url", "") or "",
        "location": getattr(c, "location", "") or "",
        "latitude": c.latitude,
        "longitude": c.longitude,
        "distance_km": c.distance_km,
        "phone": getattr(c, "phone", "Not available") or "Not available",
        "rating": c.rating,
        "review_count": c.review_count,
        "opening_hours": getattr(c, "opening_hours", "Not available") or "Not available",
        "pricing_model": getattr(c, "pricing_model", "Not available") or "Not available",
        "pricing_details": getattr(c, "pricing_details", "") or "",
        "target_audience": getattr(c, "target_audience", "") or "",
        "features": getattr(c, "features", "") or "",
        "similarity_score": float(c.similarity_score) if c.similarity_score is not None else 50.0,
        "relevance_score": float(getattr(c, "relevance_score", 50.0) or 50.0),
        "strengths": c.strengths or "",
        "weaknesses": c.weaknesses or "",
        "competitive_gap": c.competitive_gap or "",
        "usp": c.usp or "",
        "analysis_explanation": c.analysis_explanation or "",
        "source_urls": getattr(c, "source_urls", []) or [],
        "data_sources": getattr(c, "data_sources", []) or ["OpenStreetMap"],
        "data_freshness": getattr(c, "data_freshness", "Current") or "Current",
        "confidence_score": float(getattr(c, "confidence_score", 85.0) or 85.0),
        "evidence_status": getattr(c, "evidence_status", "AI inference") or "AI inference",
        "verified": bool(getattr(c, "verified", False)),
        "is_selected": bool(getattr(c, "is_selected", True))
    }
