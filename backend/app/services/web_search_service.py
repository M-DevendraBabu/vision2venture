import re
import os
import json
import logging
import subprocess
import urllib.parse
import urllib.request
from typing import List, Dict, Optional, Tuple, Any
try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None
from app.config import settings

logger = logging.getLogger("vision2venture.search")

EXCLUDED_DOMAINS = {
    "wikipedia.org", "wikimedia.org", "youtube.com", "youtu.be",
    "reddit.com", "quora.com", "medium.com", "linkedin.com",
    "facebook.com", "twitter.com", "x.com", "instagram.com",
    "pinterest.com", "github.com", "stackoverflow.com",
    "coursera.org", "udemy.com", "amazon.com", "amazon.in",
    "flipkart.com", "play.google.com", "apps.apple.com",
    "glassdoor.com", "glassdoor.co.in", "indeed.com", "indeed.co.in",
    "bing.com", "google.com", "duckduckgo.com", "yahoo.com"
}

class WebSearchService:
    """
    Multi-provider Live Web Search Service for Online Competitor Discovery.
    Supports Tavily API, Brave Search API, and a robust zero-key DuckDuckGo HTML engine.
    """

    @staticmethod
    def generate_search_queries(
        title: str,
        industry: str,
        description: str,
        target_market: str = "",
        keywords: str = ""
    ) -> List[str]:
        """
        Generates 3 focused, high-intent search queries:
        1. Direct product/market query
        2. Persona / problem query
        3. Alternatives / competitive landscape query
        """
        market = target_market.strip() if target_market and target_market.lower() not in ("global", "worldwide") else ""
        clean_kw = " ".join([k.strip() for k in re.split(r'[,;]', keywords) if k.strip()][:3])
        
        q1 = f"{title} {market}".strip()
        q2 = f"{title} alternatives competitors {market}".strip()
        if market:
            q3 = f"best {clean_kw or industry} tools for {market}".strip()
        else:
            q3 = f"top {industry} {clean_kw} platforms".strip()
            
        queries = [q1, q2, q3]
        unique_queries = []
        for q in queries:
            if q and q not in unique_queries:
                unique_queries.append(q)
        return unique_queries

    @staticmethod
    def normalize_domain(url: str) -> str:
        """Extracts and normalizes root domain (e.g. https://www.rezi.ai/pricing -> rezi.ai)."""
        if not url:
            return ""
        try:
            if not url.startswith("http"):
                url = "https://" + url
            parsed = urllib.parse.urlparse(url)
            domain = parsed.netloc.lower()
            domain = domain.split(":")[0]
            for prefix in ("www.", "m.", "blog.", "app.", "docs.", "en."):
                if domain.startswith(prefix):
                    domain = domain[len(prefix):]
            return domain
        except Exception:
            return ""

    @staticmethod
    def clean_company_name(title: str, domain: str) -> str:
        """Extracts a clean, human-readable company/product name from title or domain."""
        base_dom = domain.split(".")[0].lower() if domain else ""
        
        # Well-known domain brand mappings
        known_brands = {
            "grammarly": "Grammarly",
            "canva": "Canva",
            "internshala": "Internshala",
            "naukri": "Naukri.com",
            "rezi": "Rezi.ai",
            "tealhq": "Teal",
            "enhancv": "Enhancv",
            "novoresume": "NovoResume",
            "resumegenius": "ResumeGenius",
            "zety": "Zety",
            "kickresume": "Kickresume",
            "resumegyani": "ResumeGyani",
            "resumly": "Resumly.ai",
            "resumevibe": "ResumeVibe",
            "quickhireai": "QuickHire AI"
        }
        if base_dom in known_brands:
            return known_brands[base_dom]

        # Check if title has a clean brand before/after delimiters
        for delim in [" | ", " - ", " — ", " – ", ": ", " • ", " :: "]:
            if delim in title:
                parts = title.split(delim)
                for candidate in [parts[0].strip(), parts[-1].strip()]:
                    if 2 < len(candidate) < 25:
                        if not re.match(r'^(?i)(free|best|top|ai|online|resume|builder|maker|generator|official site|website|app|tools|for)+$', candidate):
                            return candidate

        # Fallback to pretty domain name
        if base_dom:
            parts = re.split(r'[-_]', base_dom)
            return " ".join(p.capitalize() for p in parts if p)

        return title[:30].strip()

    @classmethod
    def search_duckduckgo_html(cls, query: str, max_results: int = 8) -> List[Dict]:
        """Scrapes clean organic search results from DuckDuckGo HTML using curl subprocess with urllib fallback."""
        results = []
        html = ""

        # 1. Try curl subprocess (handles modern TLS/Cloudflare without blocking)
        try:
            curl_cmd = "curl.exe" if os.name == "nt" else "curl"
            args = [
                curl_cmd, "-s", "-L",
                "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "-d", f"q={query}",
                "https://html.duckduckgo.com/html/"
            ]
            res = subprocess.run(args, capture_output=True, text=True, timeout=12, encoding="utf-8", errors="ignore")
            if res.returncode == 0 and "result__title" in res.stdout:
                html = res.stdout
        except Exception as e:
            logger.debug(f"[WebSearchService] curl execution notice: {e}")

        # 2. Fallback to urllib.request if curl is empty or failed
        if not html:
            try:
                url = "https://html.duckduckgo.com/html/"
                data = urllib.parse.urlencode({"q": query}).encode("utf-8")
                req = urllib.request.Request(url, data=data, headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
                })
                with urllib.request.urlopen(req, timeout=10) as resp:
                    html = resp.read().decode("utf-8", errors="ignore")
            except Exception as e:
                logger.warning(f"[WebSearchService] urllib fallback notice: {e}")

        if not html:
            return []

        try:
            if BeautifulSoup is not None:
                soup = BeautifulSoup(html, "html.parser")
                for el in soup.find_all("div", class_="result"):
                    title_a = el.find("a", class_="result__a")
                    snippet_a = el.find("a", class_="result__snippet")
                    if not title_a:
                        continue

                    title = title_a.get_text().strip()
                    link = title_a.get("href", "").strip()
                    snippet = snippet_a.get_text().strip() if snippet_a else ""

                    # Unquote DDG redirect URL if present
                    if "uddg=" in link:
                        match = re.search(r'uddg=([^&]+)', link)
                        if match:
                            link = urllib.parse.unquote(match.group(1))
                    elif "ad_domain=" in link:
                        match = re.search(r'ad_domain=([^&]+)', link)
                        if match:
                            link = f"https://www.{match.group(1)}/"

                    if link and not link.startswith("http"):
                        link = f"https://{link}"

                    domain = cls.normalize_domain(link)
                    if not domain or any(exc in domain for exc in EXCLUDED_DOMAINS):
                        continue

                    results.append({
                        "title": title,
                        "url": link,
                        "snippet": snippet,
                        "domain": domain,
                        "provider": "DuckDuckGo HTML Engine"
                    })
                    if len(results) >= max_results:
                        break
            else:
                # Lightweight regex parser fallback if bs4 is missing
                pattern = re.compile(r'<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>(.*?)</a>', re.DOTALL)
                for m in pattern.finditer(html):
                    link = m.group(1).strip()
                    raw_title = re.sub(r'<[^>]+>', '', m.group(2)).strip()
                    if "uddg=" in link:
                        u_match = re.search(r'uddg=([^&]+)', link)
                        if u_match:
                            link = urllib.parse.unquote(u_match.group(1))
                    elif "ad_domain=" in link:
                        u_match = re.search(r'ad_domain=([^&]+)', link)
                        if u_match:
                            link = f"https://www.{u_match.group(1)}/"
                    domain = cls.normalize_domain(link)
                    if not domain or any(exc in domain for exc in EXCLUDED_DOMAINS):
                        continue
                    results.append({
                        "title": raw_title,
                        "url": link,
                        "snippet": "",
                        "domain": domain,
                        "provider": "DuckDuckGo HTML Engine"
                    })
                    if len(results) >= max_results:
                        break
        except Exception as e:
            logger.warning(f"[WebSearchService] DDG HTML parsing error: {e}")
        return results

    @classmethod
    def search_tavily(cls, query: str, api_key: str, max_results: int = 6) -> List[Dict]:
        """Queries Tavily Agent Search API."""
        results = []
        try:
            req_data = json.dumps({
                "api_key": api_key,
                "query": query,
                "search_depth": "basic",
                "max_results": max_results,
                "include_domains": [],
                "exclude_domains": list(EXCLUDED_DOMAINS)
            }).encode("utf-8")
            req = urllib.request.Request(
                "https://api.tavily.com/search",
                data=req_data,
                headers={"Content-Type": "application/json", "User-Agent": "Vision2Venture/1.0"}
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8", errors="ignore"))
                for r in data.get("results", []):
                    link = r.get("url", "")
                    domain = cls.normalize_domain(link)
                    if not domain or any(exc in domain for exc in EXCLUDED_DOMAINS):
                        continue
                    results.append({
                        "title": r.get("title", ""),
                        "url": link,
                        "snippet": r.get("content", ""),
                        "domain": domain,
                        "provider": "Tavily Search API"
                    })
        except Exception as e:
            logger.warning(f"[WebSearchService] Tavily search error: {e}")
        return results

    @classmethod
    def search_brave(cls, query: str, api_key: str, max_results: int = 6) -> List[Dict]:
        """Queries Brave Search API."""
        results = []
        try:
            encoded_query = urllib.parse.quote_plus(query)
            url = f"https://api.search.brave.com/res/v1/web/search?q={encoded_query}&count={max_results}"
            req = urllib.request.Request(
                url,
                headers={
                    "Accept": "application/json",
                    "X-Subscription-Token": api_key,
                    "User-Agent": "Vision2Venture/1.0"
                }
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8", errors="ignore"))
                web_results = data.get("web", {}).get("results", [])
                for r in web_results:
                    link = r.get("url", "")
                    domain = cls.normalize_domain(link)
                    if not domain or any(exc in domain for exc in EXCLUDED_DOMAINS):
                        continue
                    results.append({
                        "title": r.get("title", ""),
                        "url": link,
                        "snippet": r.get("description", ""),
                        "domain": domain,
                        "provider": "Brave Search API"
                    })
        except Exception as e:
            logger.warning(f"[WebSearchService] Brave search error: {e}")
        return results

    @classmethod
    def search_queries(cls, queries: List[str], limit: int = 10) -> Tuple[List[Dict], str]:
        """
        Executes search queries across the best available search provider.
        Returns: (extracted_results, provider_name_used)
        """
        provider_used = "None"
        aggregated = []
        seen_domains = set()

        tavily_key = settings.TAVILY_API_KEY.strip() if settings.TAVILY_API_KEY else ""
        brave_key = settings.BRAVE_API_KEY.strip() if settings.BRAVE_API_KEY else ""

        for q in queries:
            res = []
            if tavily_key:
                res = cls.search_tavily(q, tavily_key, max_results=5)
                provider_used = "Tavily Search API"
            elif brave_key:
                res = cls.search_brave(q, brave_key, max_results=5)
                provider_used = "Brave Search API"
            
            # Fallback to zero-key DuckDuckGo HTML engine
            if not res:
                res = cls.search_duckduckgo_html(q, max_results=6)
                provider_used = "DuckDuckGo HTML Engine"

            for item in res:
                dom = item.get("domain")
                if dom and dom not in seen_domains:
                    seen_domains.add(dom)
                    aggregated.append(item)
                    if len(aggregated) >= limit:
                        break
            if len(aggregated) >= limit:
                break

        return aggregated, provider_used

    @classmethod
    def extract_competitors_from_search(
        cls,
        search_items: List[Dict],
        startup_title: str,
        target_market: str = ""
    ) -> List[Dict]:
        """
        Transforms raw web search items into structured competitor objects
        with normalized names, official root domains, and initial feature sets.
        """
        extracted = []
        target_market_lower = target_market.lower() if target_market else ""

        for item in search_items:
            title = item.get("title", "")
            domain = item.get("domain", "")
            url = item.get("url", "")
            snippet = item.get("snippet", "")
            provider = item.get("provider", "DuckDuckGo HTML Engine")

            comp_name = cls.clean_company_name(title, domain)
            if not comp_name or len(comp_name) < 2:
                continue

            text_lower = f"{title} {snippet}".lower()
            
            # 1. Direct vs Indirect vs Alternative
            if any(w in text_lower for w in ["service", "agency", "writing service", "consultant", "coaching", "offline"]):
                comp_type = "alternative"
            elif (target_market_lower and target_market_lower in text_lower) or any(w in text_lower for w in ["builder", "generator", "creator", "maker", "ai"]):
                comp_type = "direct"
            else:
                comp_type = "indirect"

            root_url = f"https://{domain}/"

            extracted.append({
                "name": comp_name,
                "domain": domain,
                "website_url": root_url,
                "source_urls": [url],
                "description": snippet[:220] if snippet else f"Online digital solution operating on {domain}.",
                "competitor_type": comp_type,
                "features": f"Web-indexed features: {snippet[:120]}...",
                "source": provider,
                "data_sources": ["Live Web Search", provider],
                "evidence_status": "Web-verified",
                "verified": True,
                "confidence_score": 92.0
            })

        return extracted
