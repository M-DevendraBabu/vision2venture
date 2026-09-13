"""
Wikipedia MediaWiki Service
Fetches verified company summaries and business profiles for established competitors
from Wikipedia's open MediaWiki API (no API key required).
"""
import logging
import requests
from typing import Dict

logger = logging.getLogger("vision2venture.wikipedia")

class WikipediaService:
    BASE_URL = "https://en.wikipedia.org/w/api.php"

    @staticmethod
    def get_company_info(company_name: str) -> Dict:
        """
        Query Wikipedia for a real-world company summary.
        """
        clean_name = company_name.strip()
        if not clean_name or len(clean_name) < 3:
            return {"found": False, "description": ""}

        headers = {"User-Agent": "Vision2VentureResearchBot/1.0 (academic project; contact: devendrababumotupalli@gmail.com)"}
        try:
            resp = requests.get(
                WikipediaService.BASE_URL,
                params={
                    "action": "query",
                    "titles": clean_name,
                    "prop": "extracts",
                    "exintro": True,
                    "explaintext": True,
                    "format": "json",
                    "redirects": 1
                },
                headers=headers,
                timeout=5
            )
            if resp.status_code == 200:
                pages = resp.json().get("query", {}).get("pages", {})
                for page_id, page in pages.items():
                    if page_id != "-1":
                        extract = page.get("extract", "").strip()
                        if extract:
                            first_para = extract.split('\n')[0]
                            return {
                                "found": True,
                                "title": page.get("title", clean_name),
                                "description": first_para[:400] + ("..." if len(first_para) > 400 else ""),
                                "data_source": "Wikipedia (MediaWiki API)",
                                "status": "verified"
                            }
        except Exception as e:
            logger.debug(f"[Wikipedia] Notice for '{company_name}': {e}")

        return {"found": False, "description": "", "status": "not_found"}
