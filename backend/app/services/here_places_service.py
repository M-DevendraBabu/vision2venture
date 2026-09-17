"""
HERE Discover API — Commercial POI competitor discovery.
========================================================
HERE uses a COMMERCIAL points-of-interest database with far better business
coverage than OpenStreetMap (especially in India). The free "Base" plan gives
~30,000 requests/month and requires NO credit card.

Get a free key: https://platform.here.com/ -> create a project -> "REST" API key.
Put it in .env as  HERE_API_KEY=...

Returns competitor dicts in the SAME shape as
LocationService.search_offline_competitors, so scoring, Wikipedia enrichment,
the map and the DB layer are all unchanged. Synchronous (requests) to match the
rest of the analysis pipeline — no asyncio.
"""
import logging
import requests
from typing import List, Dict

from app.config import settings
from app.services.location_service import LocationService

logger = logging.getLogger("vision2venture.here")


class HerePlacesService:
    """Free commercial-POI competitor discovery via the HERE Discover API."""

    DISCOVER_URL = "https://discover.search.hereapi.com/v1/discover"
    TIMEOUT = 10

    @staticmethod
    def search(
        lat: float,
        lon: float,
        radius_km: float = 5.0,
        business_type: str = "",
        keywords: str = "",
        display_name: str = "",
        limit: int = 100
    ) -> List[Dict]:
        """
        Search HERE for businesses matching `business_type` within radius_km.
        Returns [] if no API key is configured or if the call fails — a missing
        or failing provider must NEVER break competitor analysis.
        """
        api_key = (settings.HERE_API_KEY or "").strip()
        if not api_key:
            return []

        query = (business_type or keywords or "").strip()
        if not query:
            return []

        radius_km = max(0.5, min(float(radius_km or 5.0), 50.0))
        radius_meters = int(radius_km * 1000)
        place_label = display_name or f"{lat:.4f}, {lon:.4f}"

        try:
            resp = requests.get(
                HerePlacesService.DISCOVER_URL,
                params={
                    "q": query,
                    "in": f"circle:{lat},{lon};r={radius_meters}",
                    "limit": min(int(limit or 100), 100),
                    "apiKey": api_key
                },
                timeout=HerePlacesService.TIMEOUT
            )
            resp.raise_for_status()
            items = resp.json().get("items", []) or []
        except Exception as e:
            logger.warning(f"[HERE] Discover API notice: {e}")
            return []

        discovered = []
        seen = set()

        for item in items:
            try:
                pos = item.get("position") or {}
                plat, plon = pos.get("lat"), pos.get("lng")
                if plat is None or plon is None:
                    continue
                plat, plon = float(plat), float(plon)

                # HERE returns straight-line distance in metres; fall back to Haversine.
                raw_dist = item.get("distance")
                if raw_dist is not None:
                    dist_km = round(float(raw_dist) / 1000.0, 2)
                else:
                    dist_km = LocationService.haversine_distance(lat, lon, plat, plon)
                if dist_km > radius_km:
                    continue

                name = (item.get("title") or "").strip()
                if not name:
                    continue

                key = (name.lower(), round(plat, 5), round(plon, 5))
                if key in seen:
                    continue
                seen.add(key)

                # Primary category
                cats = item.get("categories") or []
                primary = next((c for c in cats if c.get("primary")), cats[0] if cats else {})
                category = primary.get("name") or query

                # Phone + website live under contacts[]
                phone, website = "", ""
                for contact in item.get("contacts") or []:
                    if not phone and contact.get("phone"):
                        phone = (contact["phone"][0] or {}).get("value", "") or ""
                    if not website and contact.get("www"):
                        website = (contact["www"][0] or {}).get("value", "") or ""

                address = (item.get("address") or {}).get("label", "") or f"Near {place_label}"

                # Relevance: same proximity + category + completeness model as OSM,
                # with a small commercial-data confidence bonus.
                comp_type = "direct" if dist_km <= (radius_km * 0.5) else "indirect"
                prox_score = max(0.0, 45.0 * (1.0 - (dist_km / radius_km)))
                cat_score = 35.0 if comp_type == "direct" else 20.0
                completeness = 7.0
                if website:
                    completeness += 8.0
                if phone:
                    completeness += 4.0
                relevance = round(min(98.0, max(55.0, prox_score + cat_score + completeness)), 1)

                strengths_list = []
                if website:
                    strengths_list.append(f"Has a public website: {website}")
                if phone:
                    strengths_list.append(f"Listed contact phone: {phone}")
                strengths_list.append("Listed in the HERE commercial business directory (verified POI).")

                discovered.append({
                    "name": name,
                    "business_type": "offline",
                    "competitor_type": comp_type,
                    "description": f"Local {str(category).replace('_', ' ').title()} operating {dist_km} km from {place_label}.",
                    "website_url": website,
                    "app_url": "",
                    "location": address,
                    "latitude": plat,
                    "longitude": plon,
                    "distance_km": dist_km,
                    "phone": phone or "Not available",
                    "rating": None,
                    "review_count": None,
                    "customer_sentiment": "Rating data not available from HERE",
                    "opening_hours": "Not available",
                    "pricing_model": "In-store / Fixed Unit",
                    "pricing_details": "On-site inquiry required. Pricing not published online.",
                    "target_audience": f"Local residents within {round(radius_km, 1)} km radius of {place_label}.",
                    "features": f"Category: {category} | Physical Storefront",
                    "similarity_score": relevance,
                    "relevance_score": relevance,
                    "strengths": "\n".join([f"• {s}" for s in strengths_list]),
                    "weaknesses": "",
                    "competitive_gap": f"Capture demand with streamlined online ordering, faster fulfillment, and modern rewards compared to {name}.",
                    "usp": f"Hyper-localized service with transparent modern customer experience versus traditional {name}.",
                    "analysis_explanation": f"Discovered via the HERE Discover API centered at {place_label} within {dist_km} km. Rating data not available from HERE.",
                    "source_urls": [],
                    "data_sources": ["HERE"],
                    "data_freshness": "Live HERE Commercial POI Data",
                    "confidence_score": 90.0,
                    "evidence_status": "source_verified",
                    "source_type": "here",
                    "source_label": "HERE (Commercial POI)",
                    "verified": True,
                    "is_selected": True
                })
            except Exception as e:
                logger.debug(f"[HERE] Skipped malformed item: {e}")
                continue

        discovered.sort(key=lambda x: x["distance_km"])
        logger.info(f"[HERE] Found {len(discovered)} competitors within {radius_km} km of {place_label}")
        return discovered
