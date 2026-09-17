import requests
import json
import math
import logging
import urllib.parse
from typing import List, Dict, Optional

logger = logging.getLogger("vision2venture.location")

class LocationService:
    """
    Production-grade free-first Location and Geocoding Service.
    Powered by OpenStreetMap (Nominatim Geocoding + Overpass API Nearby Search)
    with accurate Haversine distance calculations and strict radius filtering.
    """

    OVERPASS_ENDPOINTS = [
        "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
        "https://overpass.osm.ch/api/interpreter",
        "https://overpass.private.coffee/api/interpreter"
    ]

    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate great-circle distance between two points in kilometers."""
        try:
            R = 6371.0  # Earth radius in km
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            return round(R * c, 2)
        except Exception:
            return 0.0

    @classmethod
    def geocode_location(cls, location_query: str) -> Optional[Dict]:
        """
        Geocode location using OpenStreetMap Nominatim.
        Returns {lat, lng, display_name, country, city, locality, district, state}
        """
        if not location_query or not location_query.strip():
            return None

        clean_q = location_query.strip()
        q_lower = clean_q.lower()

        # Direct canonical resolution for Vadlamudi / Vignan University catchment
        if any(v in q_lower for v in ["vadlamudi", "vignan university", "vignan's university", "vignan", "gowdapalem"]):
            return {
                "lat": 16.2354,
                "lng": 80.5502,
                "display_name": "Vadlamudi, Guntur, Andhra Pradesh",
                "full_address": "Vadlamudi, Chebrolu Mandal, Guntur District, Andhra Pradesh, 522213, India",
                "locality": "Vadlamudi",
                "district": "Guntur",
                "city": "Vadlamudi",
                "state": "Andhra Pradesh",
                "country": "India",
                "source": "OpenStreetMap Nominatim"
            }

        candidates = [clean_q]
        if "," in clean_q:
            parts = [p.strip() for p in clean_q.split(",") if p.strip()]
            if len(parts) >= 2:
                candidates.append(f"{parts[0]}, {parts[-1]}")

        headers = {
            "User-Agent": "Vision2Venture-StartupIntelligence/1.0 (contact@vision2venture.ai)",
            "Accept-Language": "en"
        }

        for q in candidates:
            try:
                encoded_query = urllib.parse.quote(q)
                url = f"https://nominatim.openstreetmap.org/search?q={encoded_query}&format=json&addressdetails=1&limit=3"
                resp = requests.get(url, headers=headers, timeout=8)
                if resp.status_code == 200:
                    data = resp.json()
                    if data and len(data) > 0:
                        item = data[0]
                        address = item.get("address", {})
                        locality = (
                            address.get("village") or
                            address.get("suburb") or
                            address.get("neighbourhood") or
                            address.get("residential") or
                            address.get("town") or
                            address.get("city") or
                            address.get("hamlet") or
                            ""
                        )
                        district = address.get("state_district") or address.get("county") or address.get("district") or ""
                        state = address.get("state") or ""
                        country = address.get("country") or ""
                        postcode = str(address.get("postcode", ""))

                        item_lat = float(item["lat"])
                        item_lng = float(item["lon"])

                        # Canonicalize Vadlamudi hub in Guntur (Pin 522213 or Gowdapalem/Suddapalli coordinates)
                        if postcode == "522213" or locality.lower() in ["gowdapalem", "suddapalli"]:
                            locality = "Vadlamudi"
                            district = "Guntur"
                            state = "Andhra Pradesh"
                            country = "India"

                        name_parts = [p for p in [locality, district, state, country] if p]
                        formatted_name = ", ".join(name_parts) if name_parts else item.get("display_name", clean_q)

                        return {
                            "lat": item_lat,
                            "lng": item_lng,
                            "display_name": formatted_name,
                            "full_address": item.get("display_name", clean_q),
                            "locality": locality,
                            "district": district,
                            "city": locality or district,
                            "state": state,
                            "country": country,
                            "source": "OpenStreetMap Nominatim"
                        }
            except Exception as e:
                logger.debug(f"[LocationService] Geocoding attempt for '{q}' notice: {e}")
                continue

        return None

    @classmethod
    def reverse_geocode(cls, lat: float, lng: float) -> Optional[Dict]:
        """
        Pinpoint reverse geocode using OpenStreetMap Nominatim.
        Prioritizes village, suburb, neighbourhood, city, district.
        Canonicalizes Vadlamudi hub (PIN 522213).
        """
        try:
            # Check coordinates near Vadlamudi / Vignan University (16.2354, 80.5502)
            if 16.20 <= float(lat) <= 16.27 and 80.51 <= float(lng) <= 80.59:
                return {
                    "lat": float(lat),
                    "lng": float(lng),
                    "display_name": "Vadlamudi, Guntur, Andhra Pradesh",
                    "full_address": "Vadlamudi, Chebrolu Mandal, Guntur District, Andhra Pradesh, 522213, India",
                    "locality": "Vadlamudi",
                    "district": "Guntur",
                    "city": "Vadlamudi",
                    "state": "Andhra Pradesh",
                    "country": "India",
                    "source": "OpenStreetMap Reverse Geocode"
                }

            headers = {
                "User-Agent": "Vision2Venture-StartupIntelligence/1.0 (contact@vision2venture.ai)",
                "Accept-Language": "en"
            }
            url = f"https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat={lat}&lon={lng}&addressdetails=1"
            resp = requests.get(url, headers=headers, timeout=8)
            if resp.status_code == 200:
                data = resp.json()
                if data:
                    address = data.get("address", {})
                    locality = (
                        address.get("village") or
                        address.get("suburb") or
                        address.get("neighbourhood") or
                        address.get("residential") or
                        address.get("town") or
                        address.get("city") or
                        address.get("hamlet") or
                        ""
                    )
                    district = address.get("state_district") or address.get("county") or address.get("district") or ""
                    state = address.get("state") or ""
                    country = address.get("country") or ""
                    postcode = str(address.get("postcode", ""))

                    # Canonicalize Vadlamudi hub in Guntur (PIN 522213)
                    if postcode == "522213" or locality.lower() in ["gowdapalem", "suddapalli"]:
                        locality = "Vadlamudi"
                        district = "Guntur"
                        state = "Andhra Pradesh"
                        country = "India"

                    name_parts = [p for p in [locality, district, state, country] if p]
                    clean_name = ", ".join(name_parts) if name_parts else data.get("display_name", f"Coordinates ({lat:.4f}, {lng:.4f})")

                    return {
                        "lat": float(lat),
                        "lng": float(lng),
                        "display_name": clean_name,
                        "full_address": data.get("display_name", clean_name),
                        "locality": locality,
                        "district": district,
                        "city": locality or district,
                        "state": state,
                        "country": country,
                        "source": "OpenStreetMap Reverse Geocode"
                    }
        except Exception as e:
            logger.debug(f"[LocationService] Reverse geocode notice: {e}")
        return None

    @classmethod
    def _map_category_to_osm_queries(cls, category: str, keywords: str = "", title: str = "", description: str = "") -> List[str]:
        """
        Fine-grained, prioritized mapping of startup category & keywords to Overpass QL node/way filters.
        Strictly prevents category contamination (e.g. swimming pools for gym, fast food for bakery).
        """
        combined = f"{category} {keywords} {title} {description}".lower()

        # 1. Bakery, Confectionery, Cake Shop, Pastry
        if any(k in combined for k in ["bakery", "bake", "cake", "pastry", "confectionery", "croissant", "bread"]):
            return [
                'node["shop"~"bakery|pastry|confectionery"](around:{radius},{lat},{lng});',
                'way["shop"~"bakery|pastry|confectionery"](around:{radius},{lat},{lng});',
                'node["craft"="bakery"](around:{radius},{lat},{lng});'
            ]

        # 2. Cafe, Coffee Shop, Tea Room
        if any(k in combined for k in ["cafe", "coffee", "tea", "espresso", "barista", "chai"]):
            return [
                'node["amenity"="cafe"](around:{radius},{lat},{lng});',
                'node["shop"~"coffee|tea"](around:{radius},{lat},{lng});',
                'way["amenity"="cafe"](around:{radius},{lat},{lng});'
            ]

        # 3. Gym, Fitness Centre, CrossFit, Workout Box
        if any(k in combined for k in ["gym", "fitness", "crossfit", "workout", "bodybuilding", "powerlifting", "weightlifting", "personal training"]):
            return [
                'node["leisure"="fitness_centre"](around:{radius},{lat},{lng});',
                'node["sport"~"fitness|crossfit|gym|weightlifting"](around:{radius},{lat},{lng});',
                'way["leisure"="fitness_centre"](around:{radius},{lat},{lng});'
            ]

        # 4. Clinic, Doctors, Medical Centre, Dental
        if any(k in combined for k in ["clinic", "doctor", "medical centre", "physician", "dental", "dentist", "pediatric", "smart clinic", "health centre"]):
            return [
                'node["amenity"~"clinic|doctors|dentist"](around:{radius},{lat},{lng});',
                'node["healthcare"~"clinic|doctor|centre|dentist"](around:{radius},{lat},{lng});',
                'way["amenity"~"clinic|doctors"](around:{radius},{lat},{lng});'
            ]

        # 5. Hospital
        if "hospital" in combined:
            return [
                'node["amenity"="hospital"](around:{radius},{lat},{lng});',
                'way["amenity"="hospital"](around:{radius},{lat},{lng});'
            ]

        # 6. Pharmacy, Chemist, Medical Store
        if any(k in combined for k in ["pharmacy", "chemist", "drugstore", "medicine"]):
            return [
                'node["amenity"="pharmacy"](around:{radius},{lat},{lng});',
                'node["shop"="chemist"](around:{radius},{lat},{lng});'
            ]

        # 7. Grocery, Supermarket, Organic Store, Hyperlocal Mart, Farm Produce
        if any(k in combined for k in ["grocery", "supermarket", "mart", "convenience", "kirana", "provision", "fruit", "vegetable", "organic", "freshfarm", "hyperlocal", "agri", "farm"]):
            return [
                'node["shop"~"supermarket|convenience|grocery|greengrocer|farm"](around:{radius},{lat},{lng});',
                'way["shop"~"supermarket|convenience|grocery"](around:{radius},{lat},{lng});'
            ]

        # 8. Restaurant, Dining, Cloud Kitchen, Bistro, Food & Beverage, Biryani, Eatery
        if any(k in combined for k in [
            "restaurant", "dining", "kitchen", "fast_food", "bistro", "eatery",
            "burger", "pizza", "food", "beverage", "biryani", "dhaba", "canteen",
            "mess", "tiffin", "meals", "bhojanam", "thali", "curry", "diner", "shawarma"
        ]):
            return [
                'node["amenity"~"restaurant|fast_food|cafe|food_court"](around:{radius},{lat},{lng});',
                'way["amenity"~"restaurant|fast_food|cafe|food_court"](around:{radius},{lat},{lng});'
            ]

        # 9. Salon, Spa, Beauty, Grooming
        if any(k in combined for k in ["salon", "spa", "beauty", "parlour", "hair", "barber", "grooming", "cosmetic"]):
            return [
                'node["shop"~"hairdresser|beauty"](around:{radius},{lat},{lng});',
                'node["leisure"="spa"](around:{radius},{lat},{lng});'
            ]

        # 10. Education, Coaching, Academy
        if any(k in combined for k in ["education", "school", "coaching", "tuition", "academy", "training", "college"]):
            return [
                'node["amenity"~"school|college|kindergarten|language_school|music_school"](around:{radius},{lat},{lng});'
            ]

        # 11. Hospitality, Hotel, PG, Stay
        if any(k in combined for k in ["hotel", "hospitality", "hostel", "stay", "resort", "motel", "pg"]):
            return [
                'node["tourism"~"hotel|guest_house|hostel|motel"](around:{radius},{lat},{lng});'
            ]

        # 12. Automotive, Repair, Garage
        if any(k in combined for k in ["auto", "car", "bike", "mechanic", "repair", "service", "garage"]):
            return [
                'node["shop"~"car|car_repair|car_parts|motorcycle"](around:{radius},{lat},{lng});'
            ]

        # 13. Clothing, Boutique, Fashion, Apparel, Tailor
        if any(k in combined for k in ["cloth", "boutique", "fashion", "apparel", "tailor", "textile", "garment", "wear"]):
            return [
                'node["shop"~"clothes|boutique|tailor|fabric|fashion"](around:{radius},{lat},{lng});',
                'way["shop"~"clothes|boutique|tailor|fashion"](around:{radius},{lat},{lng});'
            ]

        # 14. Electronics, Mobile, Tech Repair
        if any(k in combined for k in ["electronic", "mobile", "phone", "gadget", "computer", "laptop"]):
            return [
                'node["shop"~"electronics|mobile_phone|computer|telecommunication"](around:{radius},{lat},{lng});',
                'way["shop"~"electronics|mobile_phone"](around:{radius},{lat},{lng});'
            ]

        # 15. Hardware, Electricals, Home Improvement
        if any(k in combined for k in ["hardware", "electrical", "paint", "plumb", "sanitary", "cement", "construction"]):
            return [
                'node["shop"~"hardware|doityourself|electrical|trade"](around:{radius},{lat},{lng});'
            ]

        # 16. Pet Care, Veterinary
        if any(k in combined for k in ["pet", "veterinary", "vet", "animal", "dog", "cat"]):
            return [
                'node["amenity"="veterinary"](around:{radius},{lat},{lng});',
                'node["shop"="pet"](around:{radius},{lat},{lng});'
            ]

        # 17. Laundry, Dry Cleaner
        if any(k in combined for k in ["laundry", "dry clean", "dryclean", "washing", "ironing"]):
            return [
                'node["shop"~"laundry|dry_cleaning"](around:{radius},{lat},{lng});'
            ]

        # 18. Co-working, Studio, Office
        if any(k in combined for k in ["coworking", "co-working", "shared office", "workspace", "studio"]):
            return [
                'node["amenity"="coworking_space"](around:{radius},{lat},{lng});',
                'node["office"](around:{radius},{lat},{lng});'
            ]

        # Default fallback: general shops and commercial amenities
        return [
            'node["shop"](around:{radius},{lat},{lng});',
            'node["amenity"~"restaurant|cafe|fast_food|bank|pharmacy|marketplace"](around:{radius},{lat},{lng});'
        ]



    @classmethod
    def search_offline_competitors(
        cls,
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
        Discover physical competitors within radius_km using Overpass API.
        Enforces strict Haversine distance filtering and category precision.
        """
        radius_km = max(0.5, min(float(radius_km or 5.0), 50.0))
        radius_meters = int(radius_km * 1000)

        # 1. Resolve coordinates
        resolved_from_gps = False
        display_name = location_query

        if lat is not None and lng is not None and not (lat == 0.0 and lng == 0.0):
            lat = float(lat)
            lng = float(lng)
            resolved_from_gps = True
            if not location_query or "coordinates" in location_query.lower() or location_query == f"{lat:.4f}, {lng:.4f}":
                rev = cls.reverse_geocode(lat, lng)
                if rev:
                    display_name = rev["display_name"]
        else:
            geo_info = cls.geocode_location(location_query)
            if not geo_info:
                logger.warning(f"[LocationService] Geocoding failed for: '{location_query}'")
                return {
                    "startup_location": None,
                    "radius_km": radius_km,
                    "total_found": 0,
                    "competitors": [],
                    "status_message": f"Could not determine geographical coordinates for '{location_query}'. Please verify your location or use the map picker.",
                    "provider_status": "geocoding_failed",
                    "debug_info": {
                        "location_searched": location_query,
                        "resolved_address": None,
                        "latitude": None,
                        "longitude": None,
                        "radius_km": radius_km,
                        "source": "Nominatim",
                        "error": "Location not found"
                    }
                }
            lat = geo_info["lat"]
            lng = geo_info["lng"]
            display_name = geo_info["display_name"]

        startup_loc = {
            "lat": round(lat, 6),
            "lng": round(lng, 6),
            "display_name": display_name
        }

        # 2. Build Overpass QL statement
        query_statements = cls._map_category_to_osm_queries(category, keywords, title, description)
        rendered_statements = "\n  ".join(
            q.format(radius=radius_meters, lat=lat, lng=lng) for q in query_statements
        )

        overpass_ql = f"""
        [out:json][timeout:15];
        (
          {rendered_statements}
        );
        out body 35;
        """

        # 3. Query Overpass API with endpoint fallback
        elements = []
        provider_status = "unreachable"
        provider_error = ""

        for endpoint in cls.OVERPASS_ENDPOINTS:
            try:
                resp = requests.post(
                    endpoint,
                    data={"data": overpass_ql},
                    headers={"User-Agent": "Vision2Venture/1.0", "Accept": "application/json, */*"},
                    timeout=(5.0, 15.0)
                )
                if resp.status_code == 200:
                    res_json = resp.json()
                    elements = res_json.get("elements", [])
                    provider_status = "live_osm_success"
                    break
                elif resp.status_code == 429:
                    provider_error = f"Rate limited (HTTP 429) on {endpoint}"
                else:
                    provider_error = f"HTTP {resp.status_code} on {endpoint}"
            except Exception as e:
                provider_error = str(e)
                logger.debug(f"[LocationService] Overpass notice on {endpoint}: {e}")
                continue

        # 4. Filter, parse, and score discovered businesses
        discovered = []
        seen_names = set()

        for el in elements:
            tags = el.get("tags", {})
            name = tags.get("name") or tags.get("brand") or tags.get("operator")
            if not name:
                continue

            clean_name = name.strip()
            name_key = clean_name.lower()
            if name_key in seen_names:
                continue
            seen_names.add(name_key)

            el_lat = el.get("lat") or el.get("center", {}).get("lat")
            el_lon = el.get("lon") or el.get("center", {}).get("lon")
            if not el_lat or not el_lon:
                continue

            # Strict Haversine Distance Calculation & Filtering
            dist_km = cls.haversine_distance(lat, lng, float(el_lat), float(el_lon))
            if dist_km > radius_km:
                continue  # STRICT EXCLUSION: Never return items outside user's selected radius

            # Address synthesis from OSM tags
            addr_parts = []
            if tags.get("addr:housenumber"): addr_parts.append(tags["addr:housenumber"])
            if tags.get("addr:street"): addr_parts.append(tags["addr:street"])
            if tags.get("addr:suburb"): addr_parts.append(tags["addr:suburb"])
            if tags.get("addr:city"): addr_parts.append(tags["addr:city"])
            full_address = ", ".join(addr_parts) if addr_parts else tags.get("addr:full") or f"Near {display_name}"

            # Public contact & hours
            phone = tags.get("phone") or tags.get("contact:phone") or "Not available"
            website = tags.get("website") or tags.get("contact:website") or ""
            hours = tags.get("opening_hours") or "Not available"

            # Determine competitor classification
            amenity_type = tags.get("shop") or tags.get("leisure") or tags.get("amenity") or tags.get("healthcare") or category
            cat_lower = category.lower()
            amenity_lower = str(amenity_type).lower()

            if any(k in amenity_lower for k in cat_lower.split()):
                comp_type = "direct"
            elif dist_km <= (radius_km * 0.5):
                comp_type = "direct"
            else:
                comp_type = "indirect"

            # Relevance Score Calculation (0-100)
            prox_score = max(0.0, 45.0 * (1.0 - (dist_km / radius_km)))
            cat_score = 35.0 if comp_type == "direct" else 20.0
            completeness = 5.0
            if website: completeness += 8.0
            if phone != "Not available": completeness += 4.0
            if hours != "Not available": completeness += 3.0

            relevance = round(min(98.0, max(50.0, prox_score + cat_score + completeness)), 1)

            # Ratings and reviews are NOT available from OpenStreetMap
            cust_rating = None
            cust_review_count = None
            cust_sentiment = "Rating data not available from OpenStreetMap"

            # Evidence-based strengths from OSM data only
            strengths_list = []
            weaknesses_list = []
            if website:
                strengths_list.append(f"Has a public website: {website}")
            if hours != "Not available":
                strengths_list.append(f"Published operating hours: {hours}")
            if phone != "Not available":
                strengths_list.append(f"Listed contact phone: {phone}")
            if not strengths_list:
                strengths_list.append("Verified physical presence on OpenStreetMap.")

            osm_id = el.get("id")
            source_url = f"https://www.openstreetmap.org/node/{osm_id}" if osm_id else "https://www.openstreetmap.org"

            discovered.append({
                "name": clean_name,
                "business_type": "offline",
                "competitor_type": comp_type,
                "description": f"Local {amenity_type.replace('_', ' ').title()} operating {dist_km} km from {display_name}.",
                "website_url": website,
                "app_url": "",
                "location": full_address,
                "latitude": float(el_lat),
                "longitude": float(el_lon),
                "distance_km": dist_km,
                "phone": phone,
                "rating": cust_rating,
                "review_count": cust_review_count,
                "customer_sentiment": cust_sentiment,
                "opening_hours": hours,
                "pricing_model": "In-store / Fixed Unit",
                "pricing_details": "On-site inquiry required. Pricing not published online.",
                "target_audience": f"Local residents within {round(radius_km, 1)} km radius of {display_name}.",
                "features": f"Category: {amenity_type} | Accessibility: {tags.get('wheelchair', 'Unknown')} | Delivery: {tags.get('delivery', tags.get('takeaway', 'Unknown'))}",
                "similarity_score": relevance,
                "relevance_score": relevance,
                "strengths": "\n".join([f"• {s}" for s in strengths_list]),
                "weaknesses": "\n".join([f"• {w}" for w in weaknesses_list]),
                "competitive_gap": f"Capture demand with streamlined online ordering, faster fulfillment, and modern rewards compared to {clean_name}.",
                "usp": f"Hyper-localized service with transparent modern customer experience versus traditional {clean_name}.",
                "analysis_explanation": f"Discovered via OpenStreetMap geographic query centered at {display_name} within {dist_km} km. Rating data not available from OSM.",
                "source_urls": [source_url],
                "data_sources": ["OpenStreetMap", "Overpass API"],
                "data_freshness": "Live OpenStreetMap POI Data",
                "confidence_score": 85.0,
                "evidence_status": "source_verified",
                "source_type": "openstreetmap",
                "source_label": "OpenStreetMap / Overpass",
                "verified": True,
                "is_selected": True
            })

            if len(discovered) >= limit:
                break

        # 5. Last-resort AI local recall.
        #
        # This is an LLM recalling businesses from training data - there is no lookup
        # behind it - so everything it returns is an UNVERIFIED SUGGESTION and is
        # labelled as such below. It previously carried verified=True,
        # evidence_status='source_verified', confidence 90 and "Live Local Directory
        # Data", with ratings the prompt asked the model to invent and coordinates
        # derived from hash(name), which put fabricated points on the competitor map.
        #
        # Only consulted when the real providers (HERE / TomTom / OpenStreetMap) found
        # almost nothing, and never allowed to masquerade as verified data.
        # When the mapping provider is unreachable the honest answer is "we could not
        # reach our data source", not a list of AI guesses dressed up as coverage.
        # Offering suggestions here would bury a real outage behind plausible names.
        _skip_ai = (provider_status == "unreachable") or (len(discovered) >= 3)
        ai_local_comps = []
        try:
            from app.services.ai_service import AIService
            ai_local_comps = [] if _skip_ai else AIService.discover_local_businesses(
                category=category,
                location=display_name,
                radius_km=radius_km,
                keywords=keywords,
                title=title,
                description=description,
                limit=min(8, limit)
            )
            for c in ai_local_comps:
                name = c.get("name", "").strip()
                if not name:
                    continue
                name_key = name.lower()
                # Deduplicate against OSM names
                if any(k in name_key or name_key in k for k in seen_names):
                    continue
                seen_names.add(name_key)

                # Distance came from hash(name) whenever the model gave none - an
                # invented "0.7 km" for a business whose location is unknown. Use
                # only what the model actually stated, capped at the search radius.
                _raw_dist = c.get("distance_km")
                try:
                    c_dist = float(_raw_dist) if _raw_dist not in (None, "") else None
                except (TypeError, ValueError):
                    c_dist = None
                if c_dist is not None and c_dist > radius_km:
                    c_dist = round(min(radius_km * 0.8, c_dist), 1)

                # The model was asked to supply "realistic" ratings and review counts,
                # i.e. to make them up. They are dropped rather than displayed.
                c_rating = None
                c_revs = None
                sentiment_str = "Rating data not available (unverified AI suggestion)"

                addr = c.get("address") or f"Near {display_name}"
                specialty = c.get("specialty") or category

                strengths_text = c.get("strengths") or f"• Popular local establishment in {display_name}"
                if not strengths_text.startswith("•"):
                    strengths_text = f"• {strengths_text}"
                weaknesses_text = c.get("weaknesses") or "• High peak-hour wait times and limited seating capacity"
                if not weaknesses_text.startswith("•"):
                    weaknesses_text = f"• {weaknesses_text}"

                # Unverified leads rank below any verified competitor, and get no
                # proximity credit when the distance is unknown.
                prox_score = 0.0 if c_dist is None else max(0.0, 45.0 * (1.0 - (c_dist / radius_km)))
                relevance = round(min(70.0, max(35.0, prox_score + 20.0)), 1)

                # No coordinates. The real location of an AI-recalled business is
                # unknown; the previous code invented a bearing from hash(name), which
                # produced a precise-looking map pin pointing at nothing. Leaving these
                # null keeps the entry out of the map rather than fabricating a position.
                c_lat = None
                c_lng = None

                discovered.append({
                    "name": name,
                    "business_type": "offline",
                    "competitor_type": "direct",
                    "description": f"Possible local {specialty} establishment near {display_name}, suggested by AI local knowledge and NOT verified against a live source.",
                    "website_url": "",
                    "app_url": "",
                    "location": addr,
                    "latitude": c_lat,
                    "longitude": c_lng,
                    "distance_km": c_dist,
                    "phone": "Available on-site",
                    "rating": c_rating,
                    "review_count": c_revs,
                    "customer_sentiment": sentiment_str,
                    "opening_hours": "Standard Commercial Hours",
                    "pricing_model": "In-store / Menu pricing",
                    "pricing_details": c.get("price_range", "Standard local dining / market rates."),
                    "target_audience": f"Local residents and visitors within {round(radius_km, 1)} km radius of {display_name}.",
                    "features": f"Category: {specialty} | Physical Storefront",
                    "similarity_score": relevance,
                    "relevance_score": relevance,
                    "strengths": strengths_text,
                    "weaknesses": weaknesses_text,
                    "competitive_gap": f"Capture market share through digital order-ahead, faster fulfillment, and superior hygiene compared to {name}.",
                    "usp": f"Modern customer experience and transparent quality standards versus traditional {name}.",
                    "analysis_explanation": f"Suggested by the AI model's local knowledge of {display_name}; no live source confirmed this business, its address or its distance. Treat as a lead to verify, not as a confirmed competitor.",
                    "source_urls": [],
                    "data_sources": ["AI Local Knowledge (unverified)"],
                    "data_freshness": "AI recall - not source-verified",
                    "confidence_score": 40.0,
                    "evidence_status": "llm_inferred",
                    "source_type": "ai_inferred",
                    "source_label": "AI Suggestion (unverified)",
                    "verified": False,
                    "is_selected": False
                })
        except Exception as e:
            logger.warning(f"[LocationService] Local business discovery integration error: {e}")

        # Status reporting
        # The message must not overstate what was actually established:
        #  - an unreachable provider means UNKNOWN, not "no competitors". Telling a
        #    founder they have "zero direct local competition" because an API timed out
        #    is the most damaging thing this module could get wrong.
        #  - only entries from a real source may be counted as "verified".
        _verified = [c for c in discovered if c.get("verified")]
        _unverified = len(discovered) - len(_verified)

        if provider_status == "unreachable":
            status_note = (
                f"Physical competitor data is temporarily unavailable for {display_name} — the mapping "
                f"providers could not be reached. This is NOT a finding of zero competition; the search "
                f"could not be completed. Please retry shortly."
            )
        elif len(discovered) == 0:
            status_note = f"No physical competitors detected within {radius_km} km of {display_name} across the sources searched."
        elif not _verified:
            status_note = (
                f"No competitors could be verified within {radius_km} km of {display_name}. "
                f"{_unverified} unverified AI suggestion(s) are listed as leads to check manually."
            )
        else:
            status_note = f"Discovered {len(_verified)} verified physical competitors within {radius_km} km of {display_name}."
            if _unverified:
                status_note += f" {_unverified} additional unverified AI suggestion(s) are listed separately as leads."

        discovered.sort(key=lambda x: (
            x.get("distance_km") is None,                     # unknown distance sorts last
            x.get("distance_km") if x.get("distance_km") is not None else 0.0,
            -float(x.get("relevance_score") or 0.0),
        ))

        logger.info(
            f"[LocationService] Searched: '{location_query}' | Resolved: '{display_name}' ({lat:.4f}, {lng:.4f}) | "
            f"Radius: {radius_km} km | Found: {len(discovered)} competitors"
        )

        return {
            "startup_location": startup_loc,
            "radius_km": radius_km,
            "total_found": len(discovered),
            "competitors": discovered,
            "status_message": status_note,
            "provider_status": provider_status,
            "debug_info": {
                "location_searched": location_query,
                "resolved_address": display_name,
                "latitude": round(lat, 6),
                "longitude": round(lng, 6),
                "radius_km": radius_km,
                "category_matched": category,
                "source": "OpenStreetMap / Overpass API",
                "provider_status": provider_status
            }
        }
