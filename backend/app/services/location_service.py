import requests
import json
import urllib.parse
from typing import List, Dict

class LocationService:
    @staticmethod
    def search_competitors(business_type: str, location: str) -> List[Dict]:
        """
        Uses Nominatim to geocode the location and Overpass API to find nearby businesses.
        """
        try:
            # 1. Geocode location using Nominatim
            headers = {"User-Agent": "Vision2Venture/1.0"}
            nominatim_url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(location)}&format=json&limit=1"
            geo_resp = requests.get(nominatim_url, headers=headers, timeout=10)
            geo_resp.raise_for_status()
            geo_data = geo_resp.json()
            
            if not geo_data:
                return []
                
            lat = float(geo_data[0]["lat"])
            lng = float(geo_data[0]["lon"])
            
            # 2. Search businesses using Overpass API
            # Simple mapping from business type to OSM tags
            business_type_lower = business_type.lower()
            osm_tag = "shop"
            osm_value = ""
            
            if "restaurant" in business_type_lower or "food" in business_type_lower or "cafe" in business_type_lower:
                osm_tag = "amenity"
                osm_value = "restaurant" if "restaurant" in business_type_lower else ("cafe" if "cafe" in business_type_lower else "fast_food")
            elif "hospital" in business_type_lower or "clinic" in business_type_lower or "health" in business_type_lower:
                osm_tag = "amenity"
                osm_value = "hospital|clinic|doctors"
            elif "gym" in business_type_lower or "fitness" in business_type_lower:
                osm_tag = "leisure"
                osm_value = "fitness_centre"
            else:
                osm_tag = "shop"
                osm_value = ""
                
            # Radius in meters (e.g., 5000m = 5km)
            radius = 5000
            
            # Build Overpass QL query
            if osm_value and "|" not in osm_value:
                query = f"""
                [out:json];
                node["{osm_tag}"="{osm_value}"](around:{radius},{lat},{lng});
                out center 20;
                """
            elif osm_value and "|" in osm_value:
                query = f"""
                [out:json];
                node["{osm_tag}"~"^{osm_value}$"](around:{radius},{lat},{lng});
                out center 20;
                """
            else:
                # Fallback to general amenities/shops if not mapped specifically
                query = f"""
                [out:json];
                node["shop"](around:{radius},{lat},{lng});
                out center 20;
                """

            overpass_url = "https://overpass-api.de/api/interpreter"
            op_resp = requests.post(overpass_url, data={"data": query}, timeout=15)
            op_resp.raise_for_status()
            op_data = op_resp.json()
            
            competitors = []
            for element in op_data.get("elements", []):
                tags = element.get("tags", {})
                name = tags.get("name")
                if not name:
                    continue
                
                # Try to build address
                address_parts = []
                if "addr:street" in tags:
                    address_parts.append(tags["addr:street"])
                if "addr:city" in tags:
                    address_parts.append(tags["addr:city"])
                    
                competitors.append({
                    "name": name,
                    "address": ", ".join(address_parts) if address_parts else location,
                    "lat": element.get("lat"),
                    "lng": element.get("lon"),
                    "type": business_type
                })
                
                if len(competitors) >= 20:
                    break
                    
            return competitors
            
        except Exception as e:
            print(f"[LocationService] Error searching competitors: {e}")
            return []
