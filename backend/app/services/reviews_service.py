"""
Real customer ratings and reviews for competitors.
==================================================
HERE, TomTom and OpenStreetMap all return business locations but NONE of them
return customer ratings. This module is the only place ratings may come from,
and it fetches them from providers that actually serve real user reviews:

  1. Google Places API (New)  — best coverage in India. Returns the real star
     rating, the real total rating count, and up to 5 real review texts with
     their author and time. Needs GOOGLE_PLACES_API_KEY (Google Cloud project
     with billing enabled; Places includes a monthly free allowance).
  2. Foursquare Places API    — fallback. Returns a real 0-10 rating (rescaled
     to 0-5 here), a real rating count, and user "tips" as review text.
     Needs FOURSQUARE_API_KEY.

Note on cost: BOTH providers put ratings behind billing. Google needs a Cloud
billing account even to use the free allowance, and on Foursquare `rating` is a
Premium field billed from the first request. There is no free source of real
star ratings, which is why the app runs correctly with neither configured.

Hard rule: if no provider is configured or a lookup fails, this returns None and
the competitor keeps `rating = None`. Ratings are NEVER estimated, defaulted or
derived — an earlier revision of this project synthesised them from hash(name)
and displayed them as "verified user reviews", which is exactly what this module
exists to prevent.

Synchronous (`requests`) to match the rest of the analysis pipeline, and cached
to disk so repeated analyses of the same idea do not burn API quota.
"""
import logging
import requests
from typing import Dict, List, Optional

from app.config import settings
from app.services.cache_service import disk_cache

logger = logging.getLogger("vision2venture.reviews")

TIMEOUT = 10
MAX_REVIEWS = 5


def _clean(text: str, limit: int = 400) -> str:
    return " ".join(str(text or "").split())[:limit]


class GooglePlacesReviews:
    """Real ratings + review text from the Google Places API (New)."""

    SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
    FIELDS = (
        "places.id,places.displayName,places.formattedAddress,places.rating,"
        "places.userRatingCount,places.googleMapsUri,places.reviews"
    )

    @staticmethod
    def lookup(name: str, lat: Optional[float], lon: Optional[float], address: str = "") -> Optional[Dict]:
        api_key = (settings.GOOGLE_PLACES_API_KEY or "").strip()
        if not api_key or not name:
            return None

        body = {"textQuery": f"{name} {address}".strip(), "maxResultCount": 1}
        if lat is not None and lon is not None:
            body["locationBias"] = {
                "circle": {"center": {"latitude": float(lat), "longitude": float(lon)}, "radius": 500.0}
            }

        try:
            resp = requests.post(
                GooglePlacesReviews.SEARCH_URL,
                json=body,
                headers={
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": api_key,
                    "X-Goog-FieldMask": GooglePlacesReviews.FIELDS,
                },
                timeout=TIMEOUT,
            )
            if resp.status_code != 200:
                logger.warning(f"[Reviews/Google] HTTP {resp.status_code}: {resp.text[:160]}")
                return None
            places = (resp.json() or {}).get("places") or []
        except Exception as e:
            logger.warning(f"[Reviews/Google] lookup notice: {e}")
            return None

        if not places:
            return None
        place = places[0]

        rating = place.get("rating")
        count = place.get("userRatingCount")
        if rating is None:
            return None  # a place with no rating contributes nothing

        reviews: List[Dict] = []
        for r in (place.get("reviews") or [])[:MAX_REVIEWS]:
            text = ((r.get("originalText") or r.get("text") or {}) or {}).get("text", "")
            if not text:
                continue
            reviews.append({
                "author": _clean((r.get("authorAttribution") or {}).get("displayName", "Google user"), 80),
                "rating": r.get("rating"),
                "text": _clean(text),
                "time": r.get("relativePublishTimeDescription") or r.get("publishTime") or "",
                "source": "Google",
            })

        return {
            "rating": round(float(rating), 1),
            "review_count": int(count) if count is not None else None,
            "reviews": reviews,
            "source": "Google Places",
            "source_url": place.get("googleMapsUri", ""),
            "matched_name": ((place.get("displayName") or {}) or {}).get("text", name),
        }


class FoursquareReviews:
    """
    Real ratings + user tips from the Foursquare Places API.

    This targets the CURRENT API on places-api.foursquare.com. The old
    api.foursquare.com/v3 endpoints this originally called were deprecated on
    15 May 2026 and no longer answer, so a v3-era key/URL will simply 404 here.

    Two things differ from v3 and matter:
      * auth is a bearer token from a Foursquare *Service API Key*, not the bare
        key in the Authorization header;
      * X-Places-Api-Version is mandatory and pins the response shape, so the
        date below is deliberately fixed rather than "today".

    `rating` is a Premium field: it must be named explicitly in `fields` and is
    billed from the first request. Without a Premium plan the search still
    succeeds but carries no rating, and this returns None like any other miss.
    """

    BASE_URL = "https://places-api.foursquare.com"
    SEARCH_URL = f"{BASE_URL}/places/search"
    TIPS_URL = BASE_URL + "/places/{fsq_id}/tips"
    API_VERSION = "2025-06-17"
    FIELDS = "fsq_place_id,name,location,link,rating,stats"

    @staticmethod
    def _headers(api_key: str) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {api_key}",
            "X-Places-Api-Version": FoursquareReviews.API_VERSION,
            "Accept": "application/json",
        }

    @staticmethod
    def lookup(name: str, lat: Optional[float], lon: Optional[float], address: str = "") -> Optional[Dict]:
        api_key = (settings.FOURSQUARE_API_KEY or "").strip()
        if not api_key or not name:
            return None

        params = {"query": name, "limit": 1, "fields": FoursquareReviews.FIELDS}
        if lat is not None and lon is not None:
            params["ll"] = f"{float(lat)},{float(lon)}"
            params["radius"] = 500

        headers = FoursquareReviews._headers(api_key)
        try:
            resp = requests.get(FoursquareReviews.SEARCH_URL, params=params, headers=headers, timeout=TIMEOUT)
            if resp.status_code != 200:
                logger.warning(f"[Reviews/Foursquare] HTTP {resp.status_code}: {resp.text[:160]}")
                return None
            results = (resp.json() or {}).get("results") or []
        except Exception as e:
            logger.warning(f"[Reviews/Foursquare] lookup notice: {e}")
            return None

        if not results:
            return None
        place = results[0]
        raw_rating = place.get("rating")
        if raw_rating is None:
            # Not an error: the plan in use does not include the Premium rating
            # field. A competitor with no rating keeps rating = None.
            return None

        # Foursquare rates 0-10; the rest of the app uses a 0-5 star scale.
        rating = round(float(raw_rating) / 2.0, 1)
        count = ((place.get("stats") or {}) or {}).get("total_ratings")

        reviews: List[Dict] = []
        # The current API returns fsq_place_id; v3 called it fsq_id.
        fsq_id = place.get("fsq_place_id") or place.get("fsq_id")
        if fsq_id:
            try:
                t = requests.get(
                    FoursquareReviews.TIPS_URL.format(fsq_id=fsq_id),
                    params={"limit": MAX_REVIEWS},
                    headers=headers, timeout=TIMEOUT,
                )
                if t.status_code == 200:
                    payload = t.json() or []
                    tips = payload if isinstance(payload, list) else (payload.get("results") or [])
                    for tip in tips:
                        if tip.get("text"):
                            reviews.append({
                                "author": "Foursquare user",
                                "rating": None,
                                "text": _clean(tip["text"]),
                                "time": tip.get("created_at", ""),
                                "source": "Foursquare",
                            })
            except Exception as e:
                logger.debug(f"[Reviews/Foursquare] tips notice: {e}")

        return {
            "rating": rating,
            "review_count": int(count) if count is not None else None,
            "reviews": reviews,
            "source": "Foursquare",
            "source_url": place.get("link", ""),
            "matched_name": place.get("name", name),
        }


class ReviewsService:
    """Fetches real ratings for a competitor, or returns None. Never invents."""

    @staticmethod
    def is_configured() -> bool:
        return bool((settings.GOOGLE_PLACES_API_KEY or "").strip()
                    or (settings.FOURSQUARE_API_KEY or "").strip())

    @staticmethod
    @disk_cache(
        ttl_seconds=604800,  # a week: ratings move slowly and quota is limited
        namespace="reviews",
        cache_if=lambda r: isinstance(r, dict) and r.get("rating") is not None,
    )
    def fetch(name: str, lat: Optional[float] = None, lon: Optional[float] = None,
              address: str = "") -> Optional[Dict]:
        """
        Return {rating, review_count, reviews[], source, source_url} for a real
        business, or None when no provider is configured, the business is not
        found, or it genuinely has no ratings.
        """
        for provider in (GooglePlacesReviews, FoursquareReviews):
            try:
                result = provider.lookup(name, lat, lon, address)
            except Exception as e:
                logger.warning(f"[Reviews] {provider.__name__} notice: {e}")
                result = None
            if result and result.get("rating") is not None:
                logger.info(f"[Reviews] {name}: {result['rating']}* from {result['source']} "
                            f"({result.get('review_count')} ratings, {len(result.get('reviews') or [])} texts)")
                return result
        return None

    @staticmethod
    def enrich(competitors: List[Dict], limit: int = 10) -> List[Dict]:
        """
        Attach real ratings to competitors, in place, highest-relevance first.

        Only verified physical competitors are looked up: an unverified AI
        suggestion has no confirmed identity or location, so any rating attached
        to it could belong to a different business entirely. Competitors without
        a rating keep `rating = None` and say so — they are never filled in.
        """
        if not ReviewsService.is_configured():
            return competitors

        looked_up = 0
        for comp in competitors:
            if looked_up >= limit:
                break
            if not comp.get("verified") or comp.get("source_type") == "ai_inferred":
                continue
            if comp.get("rating") is not None:
                continue

            data = ReviewsService.fetch(
                name=comp.get("name", ""),
                lat=comp.get("latitude"),
                lon=comp.get("longitude"),
                address=comp.get("location", "") or "",
            )
            looked_up += 1
            if not data:
                continue

            comp["rating"] = data["rating"]
            comp["review_count"] = data.get("review_count")
            comp["reviews"] = data.get("reviews") or []
            count = data.get("review_count")
            comp["customer_sentiment"] = (
                f"{data['rating']}/5 from {count:,} {data['source']} ratings"
                if count else f"{data['rating']}/5 on {data['source']}"
            )

            sources = list(comp.get("data_sources") or [])
            if data["source"] not in sources:
                sources.append(data["source"])
            comp["data_sources"] = sources

            urls = list(comp.get("source_urls") or [])
            if data.get("source_url") and data["source_url"] not in urls:
                urls.append(data["source_url"])
            comp["source_urls"] = urls

            comp["rating_source"] = data["source"]

        return competitors
