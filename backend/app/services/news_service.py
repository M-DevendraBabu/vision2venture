"""
Google News RSS Service
Fetches real, live market headlines and industry shifts from Google News RSS
without requiring an API key or credit card.
"""
import logging
import requests
import xml.etree.ElementTree as ET
from typing import List, Dict
from app.services.cache_service import disk_cache

logger = logging.getLogger("vision2venture.news")

class NewsService:
    @staticmethod
    @disk_cache(ttl_seconds=43200, namespace="news", cache_if=lambda r: isinstance(r, list) and len(r) > 0)
    def get_industry_news(industry: str, country: str = "India", limit: int = 4) -> List[Dict]:
        """
        Fetch real-world news headlines for an industry in India.
        """
        clean_ind = industry.replace("&", "and").strip()
        query = f"{clean_ind} startup market {country}"
        url = f"https://news.google.com/rss/search?q={requests.utils.quote(query)}&hl=en-IN&gl=IN&ceid=IN:en"

        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        news_items = []

        try:
            resp = requests.get(url, headers=headers, timeout=6)
            if resp.status_code == 200:
                root = ET.fromstring(resp.text)
                for item in root.findall('./channel/item')[:limit]:
                    title_elem = item.find('title')
                    source_elem = item.find('source')
                    pub_elem = item.find('pubDate')
                    link_elem = item.find('link')

                    title = title_elem.text.strip() if title_elem is not None and title_elem.text else ""
                    source = source_elem.text.strip() if source_elem is not None and source_elem.text else "Industry Press"
                    pub_date = pub_elem.text.strip() if pub_elem is not None and pub_elem.text else ""
                    link = link_elem.text.strip() if link_elem is not None and link_elem.text else ""

                    if title:
                        news_items.append({
                            "title": title,
                            "source": source,
                            "published": pub_date,
                            "link": link,
                            "data_source": "Google News RSS",
                            "data_freshness": "Live Published"
                        })
        except Exception as e:
            logger.info(f"[NewsService] Notice (fetching news fallback): {e}")

        return news_items
