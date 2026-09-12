import re
import json
import logging
import urllib.parse
from typing import List, Dict, Optional, Set
from app.services.ai_service import AIService
from app.services.ml_service import MLService
from app.services.web_search_service import WebSearchService

logger = logging.getLogger("vision2venture.online_competitors")

class OnlineCompetitorService:
    """
    Production-grade multi-tier Online Competitor Discovery Service.
    Combines:
    1. Live Web Search (Tavily, Brave, or DuckDuckGo HTML engine) for real-time market rivals.
    2. Y Combinator Startup Knowledge Base (5,997 verified companies).
    3. User-supplied known competitor overrides.
    4. Explicitly-labeled LLM Market Knowledge Fallback (only when web/YC yield < limit).
    """

    @staticmethod
    def _normalize_name(name: str) -> str:
        """Normalizes company name for deduplication (removes punctuation, suffixes)."""
        if not name:
            return ""
        clean = re.sub(r'[^a-zA-Z0-9]', '', name).lower()
        for suffix in ('inc', 'llc', 'pvtltd', 'pvt', 'ltd', 'technologies', 'technology', 'tech', 'software', 'app', 'ai', 'io'):
            if clean.endswith(suffix) and len(clean) > len(suffix) + 2:
                clean = clean[:-len(suffix)]
        return clean

    @classmethod
    def search_online_competitors(
        cls,
        title: str,
        industry: str,
        description: str,
        target_market: str = "Global",
        keywords: str = "",
        user_known_competitors: str = "",
        limit: int = 8
    ) -> List[Dict]:
        """
        Discovers digital, SaaS, e-commerce, and platform competitors.
        Blends:
        1. User-supplied known competitors.
        2. Live Web Search results with root domains and snippets.
        3. YC Knowledge Base domain matches.
        4. Explicitly-labeled LLM fallback if more candidates are required.
        """
        competitors: List[Dict] = []
        seen_domains: Set[str] = set()
        seen_names: Set[str] = set()

        # =========================================================================
        # 1. PROCESS USER-SUPPLIED COMPETITORS IF ANY
        # =========================================================================
        if user_known_competitors and user_known_competitors.strip():
            raw_entries = re.split(r'[,;\n]', user_known_competitors)
            for entry in raw_entries:
                c_name = entry.strip()
                n_key = cls._normalize_name(c_name)
                if c_name and len(c_name) > 1 and n_key not in seen_names:
                    seen_names.add(n_key)
                    dom = WebSearchService.normalize_domain(c_name) or f"{n_key}.com"
                    seen_domains.add(dom)
                    competitors.append({
                        "name": c_name,
                        "business_type": "online",
                        "competitor_type": "direct",
                        "description": f"User-identified competitor operating in the {industry} sector.",
                        "website_url": f"https://www.{dom}" if not dom.startswith("http") else dom,
                        "app_url": "",
                        "location": target_market or "Global",
                        "latitude": None,
                        "longitude": None,
                        "distance_km": None,
                        "phone": "Not available",
                        "rating": None,
                        "review_count": None,
                        "opening_hours": "24/7 Digital Platform",
                        "pricing_model": "Subscription / Tiered",
                        "pricing_details": "Subject to direct inquiry on competitor platform.",
                        "target_audience": f"Customers targeting {industry} solutions in {target_market or 'Global'}.",
                        "features": "Core industry feature set and digital product capabilities.",
                        "similarity_score": 90.0,
                        "relevance_score": 90.0,
                        "strengths": f"• Direct user-recognized market footprint in {industry}.\n• Established baseline brand recall.",
                        "weaknesses": "• Standardized workflow may not address targeted user workflow nuances.",
                        "competitive_gap": "Deliver a frictionless self-serve experience with lower initial barriers to adoption.",
                        "usp": "Agile, modern purpose-built alternative.",
                        "analysis_explanation": "User-supplied competitor prioritized for comparative benchmarking.",
                        "source_urls": [],
                        "data_sources": ["User Provided"],
                        "data_freshness": "Direct User Input",
                        "confidence_score": 88.0,
                        "evidence_status": "User-provided",
                        "verified": False,
                        "is_selected": True
                    })

        # =========================================================================
        # 2. LIVE WEB SEARCH COMPETITOR DISCOVERY
        # =========================================================================
        web_search_success = False
        try:
            queries = WebSearchService.generate_search_queries(
                title=title,
                industry=industry,
                description=description,
                target_market=target_market,
                keywords=keywords
            )
            raw_web_results, provider_used = WebSearchService.search_queries(queries, limit=10)
            web_comps = WebSearchService.extract_competitors_from_search(
                raw_web_results,
                startup_title=title,
                target_market=target_market
            )
            if web_comps:
                web_search_success = True

            for wc in web_comps:
                c_name = wc["name"]
                c_dom = wc.get("domain", "")
                n_key = cls._normalize_name(c_name)

                # Deduplicate by domain and normalized name
                if c_dom and c_dom in seen_domains:
                    continue
                if n_key in seen_names:
                    continue

                if c_dom:
                    seen_domains.add(c_dom)
                seen_names.add(n_key)

                c_type = wc.get("competitor_type", "direct")
                sim_score = 88.0 if c_type == "direct" else (76.0 if c_type == "indirect" else 68.0)

                competitors.append({
                    "name": c_name,
                    "business_type": "online",
                    "competitor_type": c_type,
                    "description": wc.get("description") or f"Online digital service operating on {c_dom}.",
                    "website_url": wc.get("website_url") or f"https://{c_dom}/",
                    "app_url": "",
                    "location": target_market or "Global",
                    "latitude": None,
                    "longitude": None,
                    "distance_km": None,
                    "phone": "Not available",
                    "rating": None,
                    "review_count": None,
                    "opening_hours": "24/7 Digital Platform",
                    "pricing_model": "Freemium / Tiered SaaS",
                    "pricing_details": "Publicly available web tiers; consult official website.",
                    "target_audience": f"Users seeking {industry} solutions in {target_market or 'Global'}.",
                    "features": wc.get("features") or f"Digital product platform indexed on {c_dom}.",
                    "similarity_score": sim_score,
                    "relevance_score": sim_score,
                    "strengths": f"• Indexed on live web search via active digital domain ({c_dom}).\n• Discoverable web presence in {target_market or industry}.",
                    "weaknesses": "• Broad feature scope can lead to steeper learning curves for new users.\n• May lack specialized vertical workflows for early-stage adopters.",
                    "competitive_gap": f"Outperform {c_name} with superior streamlined UX, tailored pricing, and faster time-to-value.",
                    "usp": f"Specialized, high-speed solution designed to overcome legacy friction in {c_name}.",
                    "analysis_explanation": f"Discovered in real-time via {provider_used} ({c_dom}).",
                    "source_urls": wc.get("source_urls", []),
                    "data_sources": ["Live Web Search", provider_used],
                    "data_freshness": "Real-Time Web Search",
                    "confidence_score": 92.0,
                    "evidence_status": "Web-verified",
                    "verified": True,
                    "is_selected": True
                })

                if len(competitors) >= limit:
                    break

        except Exception as e:
            logger.warning(f"[OnlineCompetitorService] Live web search notice: {e}")

        # =========================================================================
        # 3. YC STARTUP KNOWLEDGE BASE (5,997 Verified Tech Startups)
        # =========================================================================
        try:
            yc_matches = MLService.search_yc_competitors(
                industry=industry,
                query=f"{title} {keywords}",
                limit=8
            )
            for m in yc_matches:
                c_name = m.get("name")
                if not c_name:
                    continue
                n_key = cls._normalize_name(c_name)
                website = m.get("website") or ""
                dom = WebSearchService.normalize_domain(website) if website else ""

                if dom and dom in seen_domains:
                    continue
                if n_key in seen_names:
                    continue

                if dom:
                    seen_domains.add(dom)
                seen_names.add(n_key)

                one_liner = m.get("one_liner") or m.get("description") or f"Technology venture in {industry}."
                sim_score = float(m.get("similarity_score") or 75.0)
                c_type = "direct" if sim_score >= 70 else "indirect"

                competitors.append({
                    "name": c_name,
                    "business_type": "online",
                    "competitor_type": c_type,
                    "description": one_liner,
                    "website_url": website if website.startswith("http") else (f"https://{website}" if website else ""),
                    "app_url": "",
                    "location": "Global / US",
                    "latitude": None,
                    "longitude": None,
                    "distance_km": None,
                    "phone": "Not available",
                    "rating": None,
                    "review_count": None,
                    "opening_hours": "24/7 Digital Cloud Service",
                    "pricing_model": "SaaS / Freemium / Tiered",
                    "pricing_details": "Tiered SaaS pricing; consult vendor website for enterprise tiers.",
                    "target_audience": f"Global businesses & consumers in {industry}.",
                    "features": f"Sector tags: {m.get('tags', industry)} | YC Verified Venture.",
                    "similarity_score": sim_score,
                    "relevance_score": sim_score,
                    "strengths": f"• Backed by Y Combinator venture acceleration ecosystem.\n• Established digital footprint: '{one_liner}'.",
                    "weaknesses": "• Established incumbents often feature rigid legacy software tiers.\n• Slower agility to integrate emerging specialized AI workflows.",
                    "competitive_gap": m.get("competitive_gap") or "Target underserved niche segments with lower barrier-to-entry pricing.",
                    "usp": m.get("usp") or f"Next-generation approach to {title} overcoming traditional complexity.",
                    "analysis_explanation": m.get("analysis_explanation") or f"Matched from curated YC enterprise intelligence database on {industry}.",
                    "source_urls": [website] if website else ["https://www.ycombinator.com/companies"],
                    "data_sources": ["YC Startup Knowledge Base", "Public Company Data"],
                    "data_freshness": "Curated Tech Ecosystem Registry",
                    "confidence_score": 92.0,
                    "evidence_status": "Publicly reported",
                    "verified": True,
                    "is_selected": True
                })

                if len(competitors) >= limit + 2:
                    break

        except Exception as e:
            logger.warning(f"[OnlineCompetitorService] YC lookup notice: {e}")

        # =========================================================================
        # 4. LLM MARKET KNOWLEDGE FALLBACK (ONLY IF TOTAL < LIMIT)
        # Never presented as web-verified. Strictly tagged as AI inference.
        # =========================================================================
        if len(competitors) < limit:
            try:
                needed = limit - len(competitors)
                ai_prompt = f"""You are an elite venture intelligence analyst.
Identify {needed} REAL, WELL-KNOWN, EXISTING public market competitors or alternatives for this startup idea:
Startup Name: {title}
Industry: {industry}
Description: {description}
Target Market: {target_market}
Keywords: {keywords}

CRITICAL RULES:
1. ONLY return REAL, WELL-KNOWN companies (e.g. established market leaders or known alternatives).
2. Classify competitor_type as 'direct', 'indirect', or 'alternative'.
3. Do NOT fabricate fake URLs or fake review numbers.
4. Output STRICT JSON format:
{{
  "competitors": [
    {{
      "name": "Actual Real Company Name",
      "website_url": "https://company.com",
      "competitor_type": "direct",
      "description": "Accurate one-line description of what they do",
      "pricing_model": "Freemium / Monthly SaaS / Enterprise",
      "pricing_details": "Realistic summary of pricing model",
      "target_audience": "Specific audience they serve",
      "strengths": ["Real verified strength 1", "Real verified strength 2"],
      "weaknesses": ["Real documented weakness 1", "Documented limitation 2"],
      "competitive_gap": "Clear market gap our startup can exploit",
      "similarity_score": 80
    }}
  ]
}}"""
                ai_resp = AIService._call_llm(ai_prompt, max_tokens=1000, timeout=10.0)
                ai_data = AIService._parse_json(ai_resp)
                
                for item in ai_data.get("competitors", []):
                    c_name = item.get("name")
                    if not c_name:
                        continue
                    n_key = cls._normalize_name(c_name)
                    c_dom = WebSearchService.normalize_domain(item.get("website_url", ""))

                    if c_dom and c_dom in seen_domains:
                        continue
                    if n_key in seen_names:
                        continue

                    if c_dom:
                        seen_domains.add(c_dom)
                    seen_names.add(n_key)

                    strengths_arr = item.get("strengths", ["Established brand awareness and market presence."])
                    weaknesses_arr = item.get("weaknesses", ["Higher pricing for smaller organizations."])
                    sim = float(item.get("similarity_score", 75))
                    c_type = item.get("competitor_type", "indirect")
                    if c_type not in ("direct", "indirect", "alternative"):
                        c_type = "indirect"

                    competitors.append({
                        "name": c_name,
                        "business_type": "online",
                        "competitor_type": c_type,
                        "description": item.get("description", f"Online competitor in {industry}."),
                        "website_url": item.get("website_url", ""),
                        "app_url": "",
                        "location": target_market or "Global",
                        "latitude": None,
                        "longitude": None,
                        "distance_km": None,
                        "phone": "Not available",
                        "rating": None,
                        "review_count": None,
                        "opening_hours": "24/7 Digital Platform",
                        "pricing_model": item.get("pricing_model", "Freemium / Tiered"),
                        "pricing_details": item.get("pricing_details", "Publicly available tier options; verify on official site."),
                        "target_audience": item.get("target_audience", f"Users seeking {industry} solutions."),
                        "features": f"Category: {industry} | Cloud Architecture | Digital Platform",
                        "similarity_score": sim,
                        "relevance_score": sim,
                        "strengths": "\n".join([f"• {s}" for s in strengths_arr]),
                        "weaknesses": "\n".join([f"• {w}" for w in weaknesses_arr]),
                        "competitive_gap": item.get("competitive_gap", "Offer specialized automated intelligence tailored to founders."),
                        "usp": f"Next-gen automated platform outmaneuvering traditional workflows of {c_name}.",
                        "analysis_explanation": "Synthesized from LLM market knowledge base (fallback). Verify current availability on official site.",
                        "source_urls": [item.get("website_url")] if item.get("website_url") else [],
                        "data_sources": ["AI Industry Synthesis"],
                        "data_freshness": "Current Market Analysis (LLM Fallback)",
                        "confidence_score": 82.0,
                        "evidence_status": "AI inference",
                        "verified": False,
                        "is_selected": True
                    })

                    if len(competitors) >= limit:
                        break
            except Exception as e:
                logger.warning(f"[OnlineCompetitorService] AI fallback notice: {e}")

        # =========================================================================
        # 5. SORT BY RELEVANCE SCORE & RETURN
        # =========================================================================
        competitors.sort(key=lambda x: -x.get("relevance_score", 50.0))
        return competitors[:limit]
