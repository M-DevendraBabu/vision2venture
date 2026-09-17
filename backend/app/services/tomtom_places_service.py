"""
TomTom Search API (POI Search) — Commercial POI competitor discovery.
=====================================================================
TomTom uses a COMMERCIAL POI database. The free tier gives ~2,500 requests/month
and requires NO credit card.

Get a free key: https://developer.tomtom.com -> Dashboard -> add a new App/Key.
Put it in .env as  TOMTOM_API_KEY=...

Returns competitor dicts in the SAME shape as
LocationService.search_offline_competitors. Synchronous (requests) to match the
rest of the analysis pipeline — no asyncio.
"""
import logging
import requests
import urllib.parse
from typing import List, Dict

from app.config import settings
from app.services.location_service import LocationService

logger = logging.getLogger("vision2venture.tomtom")


class TomTomPlacesService:
    """Free commercial-POI competitor discovery via the TomTom Search API."""

    BASE_URL = "https://api.tomtom.com/search/2/poiSearch"
    TIMEOUT = 10
    MAX_RADIUS_METERS = 50000  # TomTom caps the search radius at 50 km

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
        Search TomTom for POIs matching `business_type` within radius_km.
        Returns [] if no API key is configured or if the call fails — a missing
        or failing provider must NEVER break competitor analysis.
        """
        api_key = (settings.TOMTOM_API_KEY or "").strip()
        if not api_key:
            return []

        query = (business_type or keywords or "").strip()
        if not query:
            return []

        radius_km = max(0.5, min(float(radius_km or 5.0), 50.0))
        radius_meters = min(int(radius_km * 1000), TomTomPlacesService.MAX_RADIUS_METERS)
        place_label = display_name or f"{lat:.4f}, {lon:.4f}"

        try:
            url = f"{TomTomPlacesService.BASE_URL}/{urllib.parse.quote(query)}.json"
            resp = requests.get(
                url,
                params={
                    "key": api_key,
                    "lat": lat,
                    "lon": lon,
                    "radius": radius_meters,
                    "limit": min(int(limit or 100), 100)
                },
                timeout=TomTomPlacesService.TIMEOUT
            )
            resp.raise_for_status()
            results = resp.json().get("results", []) or []
        except Exception as e:
            logger.warning(f"[TomTom] POI Search API notice: {e}")
            return []

        discovered = []
        seen = set()

        for r in results:
            try:
                pos = r.get("position") or {}
                plat, plon = pos.get("lat"), pos.get("lon")
                if plat is None or plon is None:
                    continue
                plat, plon = float(plat), float(plon)

                # TomTom returns straight-line distance in metres; fall back to Haversine.
                raw_dist = r.get("dist")
                if raw_dist is not None:
                    dist_km = round(float(raw_dist) / 1000.0, 2)
                else:
                    dist_km = LocationService.haversine_distance(lat, lon, plat, plon)
                if dist_km > radius_km:
                    continue

                poi = r.get("poi") or {}
                name = (poi.get("name") or "").strip()
                if not name:
                    continue

                key = (name.lower(), round(plat, 5), round(plon, 5))
                if key in seen:
                    continue
                seen.add(key)

                categories = poi.get("categories") or []
                category = categories[0] if categories else query
                phone = (poi.get("phone") or "").strip()
                website = (poi.get("url") or "").strip()
                address = (r.get("address") or {}).get("freeformAddress", "") or f"Near {place_label}"

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
                strengths_list.append("Listed in the TomTom commercial business directory (verified POI).")

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
                    "customer_sentiment": "Rating data not available from TomTom",
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
                    "analysis_explanation": f"Discovered via the TomTom POI Search API centered at {place_label} within {dist_km} km. Rating data not available from TomTom.",
                    "source_urls": [],
                    "data_sources": ["TomTom"],
                    "data_freshness": "Live TomTom Commercial POI Data",
                    "confidence_score": 88.0,
                    "evidence_status": "source_verified",
                    "source_type": "tomtom",
                    "source_label": "TomTom (Commercial POI)",
                    "verified": True,
                    "is_selected": True
                })
            except Exception as e:
                logger.debug(f"[TomTom] Skipped malformed result: {e}")
                continue

        discovered.sort(key=lambda x: x["distance_km"])
        logger.info(f"[TomTom] Found {len(discovered)} competitors within {radius_km} km of {place_label}")
        return discovered
