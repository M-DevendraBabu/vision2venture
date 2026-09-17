"""
Multi-source offline competitor aggregation.
============================================
Queries every configured physical-competitor provider and merges the results
into one de-duplicated, distance-sorted list, so competitor coverage is as
complete and accurate as possible:

  - HERE Discover API     (commercial POI, free ~30k req/month, needs HERE_API_KEY)
  - TomTom Search API     (commercial POI, free ~2.5k req/month, needs TOMTOM_API_KEY)
  - OpenStreetMap/Overpass (always queried, free, no key — baseline + long tail)

Priority when the same place appears in more than one source (commercial data
wins over crowd-sourced OSM):  here > tomtom > osm

Providers are queried SEQUENTIALLY with `requests` — deliberately no asyncio, so
this stays safe inside the existing background analysis thread. Every provider
fails open: if HERE or TomTom is unconfigured or erroring, the result is exactly
what OpenStreetMap alone would have returned.
"""
import re
import logging
import unicodedata
from typing import List, Dict, Optional

from app.services.location_service import LocationService
from app.services.here_places_service import HerePlacesService
from app.services.tomtom_places_service import TomTomPlacesService

logger = logging.getLogger("vision2venture.competitor_sources")

# Higher rank wins when the same physical place is found by multiple providers.
SOURCE_RANK = {
    "here": 3,
    "tomtom": 2,
    "openstreetmap": 1,
    "osm": 1,
    "local_business_intelligence": 1,
}

# Fields backfilled from a lower-ranked duplicate when the winner is missing them.
BACKFILL_FIELDS = ("phone", "website_url", "location", "opening_hours", "address")

# Placeholder values that should be treated as "missing" when backfilling.
_EMPTY_VALUES = {"", "not available", "available on-site", "none"}


def _norm_name(name: str) -> str:
    """
    Normalise a business name for cross-source de-duplication.
    Strips accents (Café -> Cafe), lowercases, and collapses punctuation so the
    same business from different sources produces the same key.
    """
    text = unicodedata.normalize("NFKD", name or "")
    text = "".join(c for c in text if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def _dedupe_key(item: Dict) -> tuple:
    """Same normalised name + within ~110 m (3 decimals) = same place."""
    try:
        lat = round(float(item.get("latitude") or 0.0), 3)
        lng = round(float(item.get("longitude") or 0.0), 3)
    except (TypeError, ValueError):
        lat, lng = 0.0, 0.0
    return (_norm_name(item.get("name", "")), lat, lng)


def _is_missing(value) -> bool:
    return value is None or str(value).strip().lower() in _EMPTY_VALUES


def _merge_pair(winner: Dict, loser: Dict) -> Dict:
    """Backfill fields the winner is missing from the lower-ranked duplicate."""
    for field in BACKFILL_FIELDS:
        if _is_missing(winner.get(field)) and not _is_missing(loser.get(field)):
            winner[field] = loser[field]

    # Record every provider that saw this place, so the UI can show full provenance.
    merged_sources = list(winner.get("data_sources") or [])
    for src in (loser.get("data_sources") or []):
        if src not in merged_sources:
            merged_sources.append(src)
    winner["data_sources"] = merged_sources

    merged_urls = list(winner.get("source_urls") or [])
    for url in (loser.get("source_urls") or []):
        if url and url not in merged_urls:
            merged_urls.append(url)
    winner["source_urls"] = merged_urls

    # A place confirmed by more than one independent provider is more trustworthy.
    try:
        winner["confidence_score"] = round(min(98.0, float(winner.get("confidence_score") or 85.0) + 3.0), 1)
    except (TypeError, ValueError):
        pass

    return winner


def merge_competitor_sources(provider_results: List[List[Dict]]) -> List[Dict]:
    """
    Merge several providers' competitor lists into one de-duplicated,
    distance-sorted list. Commercial sources win over OSM; missing contact
    details are backfilled from whichever source has them.
    """
    merged: Dict[tuple, Dict] = {}

    for results in provider_results:
        for item in results or []:
            if not item.get("name"):
                continue
            key = _dedupe_key(item)
            existing = merged.get(key)
            if existing is None:
                merged[key] = item
                continue

            new_rank = SOURCE_RANK.get(item.get("source_type", ""), 0)
            old_rank = SOURCE_RANK.get(existing.get("source_type", ""), 0)
            if new_rank > old_rank:
                merged[key] = _merge_pair(item, existing)
            else:
                merged[key] = _merge_pair(existing, item)

    results = list(merged.values())
    # An unknown distance must sort LAST, not first: `or 0.0` would have promoted
    # every unverified lead above genuinely nearby verified competitors.
    results.sort(key=lambda x: (
        x.get("distance_km") is None,
        float(x.get("distance_km")) if x.get("distance_km") is not None else 0.0,
        -float(x.get("relevance_score") or 50.0),
    ))
    return results


def search_offline_competitors_multi(
    category: str,
    location_query: str,
    radius_km: float = 5.0,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    keywords: str = "",
    title: str = "",
    description: str = "",
    limit: int = 25
) -> Dict:
    """
    Drop-in replacement for LocationService.search_offline_competitors that also
    queries HERE and TomTom and merges all three sources.

    Returns the SAME dict shape (startup_location, radius_km, total_found,
    competitors, status_message, provider_status, debug_info), so every caller
    downstream — scoring, Wikipedia enrichment, DB saving — is unchanged.
    """
    # 1. OpenStreetMap baseline. This also resolves/geocodes the location, so the
    #    commercial providers reuse its coordinates instead of geocoding again.
    osm_res = LocationService.search_offline_competitors(
        category=category,
        location_query=location_query,
        radius_km=radius_km,
        lat=lat,
        lng=lng,
        keywords=keywords,
        title=title,
        description=description,
        limit=limit
    )

    osm_comps = osm_res.get("competitors", []) or []
    startup_loc = osm_res.get("startup_location", {}) or {}
    debug = osm_res.get("debug_info", {}) or {}

    res_lat = startup_loc.get("lat", debug.get("latitude"))
    res_lng = startup_loc.get("lng", debug.get("longitude"))
    display_name = startup_loc.get("display_name") or location_query
    eff_radius = float(osm_res.get("radius_km") or radius_km or 5.0)

    # 2. Commercial POI providers. Both return [] when their key is unset.
    here_comps, tomtom_comps = [], []
    if res_lat is not None and res_lng is not None and not (res_lat == 0.0 and res_lng == 0.0):
        try:
            here_comps = HerePlacesService.search(
                lat=float(res_lat),
                lon=float(res_lng),
                radius_km=eff_radius,
                business_type=category,
                keywords=keywords,
                display_name=display_name
            )
        except Exception as e:
            logger.warning(f"[CompetitorSources] HERE provider notice: {e}")

        try:
            tomtom_comps = TomTomPlacesService.search(
                lat=float(res_lat),
                lon=float(res_lng),
                radius_km=eff_radius,
                business_type=category,
                keywords=keywords,
                display_name=display_name
            )
        except Exception as e:
            logger.warning(f"[CompetitorSources] TomTom provider notice: {e}")

    # No commercial results at all -> nothing to merge, return OSM untouched.
    if not here_comps and not tomtom_comps:
        return osm_res

    # 3. Merge, de-duplicate and re-sort by distance.
    merged = merge_competitor_sources([here_comps, tomtom_comps, osm_comps])
    merged = merged[:limit]

    sources_used = []
    if here_comps:
        sources_used.append("HERE")
    if tomtom_comps:
        sources_used.append("TomTom")
    if osm_comps:
        sources_used.append("OpenStreetMap")

    logger.info(
        f"[CompetitorSources] Merged {len(here_comps)} HERE + {len(tomtom_comps)} TomTom + "
        f"{len(osm_comps)} OSM -> {len(merged)} unique competitors within {eff_radius} km of {display_name}"
    )

    if len(merged) == 0:
        status_note = osm_res.get("status_message", "")
    else:
        status_note = (
            f"Discovered {len(merged)} verified physical competitors within {eff_radius} km "
            f"of {display_name} across {', '.join(sources_used)}."
        )

    result = dict(osm_res)
    result["competitors"] = merged
    result["total_found"] = len(merged)
    result["status_message"] = status_note
    result["sources_used"] = sources_used
    result["debug_info"] = dict(debug)
    result["debug_info"]["source"] = " + ".join(sources_used) if sources_used else debug.get("source", "")
    result["debug_info"]["provider_counts"] = {
        "here": len(here_comps),
        "tomtom": len(tomtom_comps),
        "openstreetmap": len(osm_comps)
    }
    return result
