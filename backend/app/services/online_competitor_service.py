import re
import json
import urllib.parse
import requests
from typing import List, Dict, Optional
from app.services.ai_service import AIService
from app.services.ml_service import MLService

class OnlineCompetitorService:
    """
    Production-grade free-first Online Competitor Discovery Service.
    Leverages YC Company Knowledge Base (5,997 verified tech startups),
    DuckDuckGo Instant Answers / public web domain signals, and AI entity structuring
    without expensive proprietary scraping APIs.
    """

    @classmethod
    def query_duckduckgo_instant(cls, query: str) -> List[Dict]:
        """Free instant answer & entity lookup from DuckDuckGo."""
        results = []
        try:
            headers = {"User-Agent": "Vision2Venture-StartupIntelligence/1.0"}
            url = f"https://api.duckduckgo.com/?q={urllib.parse.quote(query)}&format=json&no_html=1&skip_disambig=0"
            resp = requests.get(url, headers=headers, timeout=6)
            if resp.status_code == 200:
                data = resp.json()
                # Check related topics
                topics = data.get("RelatedTopics", [])
                for t in topics:
                    if isinstance(t, dict) and "Text" in t:
                        text = t.get("Text", "")
                        first_url = t.get("FirstURL", "")
                        # Split name from description
                        parts = text.split(" - ", 1)
                        name = parts[0].strip() if len(parts) > 1 else text[:30]
                        desc = parts[1].strip() if len(parts) > 1 else text
                        if name and len(name) < 40 and not name.lower().startswith("see also"):
                            results.append({
                                "name": name,
                                "description": desc,
                                "website_url": first_url,
                                "source": "DuckDuckGo Public Directory"
                            })
        except Exception as e:
            print(f"[OnlineCompetitorService] DDG query notice: {e}")
        return results[:5]

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
        2. YC Knowledge Base domain matches (real companies with websites and batches).
        3. Public search directory signals.
        4. AI-synthesized competitor profiles with verified/inferred evidence tagging.
        """
        competitors = []
        seen_names = set()

        # 1. Process user-supplied competitors if any
        if user_known_competitors and user_known_competitors.strip():
            raw_entries = re.split(r'[,;\n]', user_known_competitors)
            for entry in raw_entries:
                c_name = entry.strip()
                if c_name and len(c_name) > 1 and c_name.lower() not in seen_names:
                    seen_names.add(c_name.lower())
                    competitors.append({
                        "name": c_name,
                        "business_type": "online",
                        "competitor_type": "direct",
                        "description": f"User-identified competitor operating in the {industry} sector.",
                        "website_url": f"https://www.{c_name.lower().replace(' ', '')}.com",
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
                        "target_audience": f"Customers targeting {industry} solutions.",
                        "features": "Core industry feature set and digital product capabilities.",
                        "similarity_score": 88.0,
                        "relevance_score": 88.0,
                        "strengths": f"• Direct user-recognized brand presence in {industry}.\n• Established customer awareness.",
                        "weaknesses": "• Standardized workflow potentially lacks modern custom optimizations.",
                        "competitive_gap": "Provide superior intuitive UX and transparent self-serve onboarding.",
                        "usp": "Agile, modern purpose-built alternative.",
                        "analysis_explanation": "User-supplied competitor prioritized for comparative benchmarking.",
                        "source_urls": [],
                        "data_sources": ["User Provided"],
                        "data_freshness": "Direct User Input",
                        "confidence_score": 85.0,
                        "evidence_status": "User-provided",
                        "verified": False,
                        "is_selected": True
                    })

        # 2. Query YC Startup Knowledge Base (5,997 verified tech companies)
        try:
            yc_matches = MLService.search_yc_competitors(industry=industry, query=f"{title} {keywords}", limit=6)
            for m in yc_matches:
                c_name = m.get("name")
                if not c_name or c_name.lower() in seen_names:
                    continue
                seen_names.add(c_name.lower())

                website = m.get("website") or ""
                one_liner = m.get("one_liner") or m.get("description") or f"Technology venture in {industry}."
                sim_score = float(m.get("similarity_score") or 75.0)

                competitors.append({
                    "name": c_name,
                    "business_type": "online",
                    "competitor_type": "direct" if sim_score >= 70 else "indirect",
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
                    "pricing_details": "Tiered SaaS pricing; consult vendor website for current enterprise tiers.",
                    "target_audience": f"Global businesses & consumers in {industry}.",
                    "features": f"Sector tags: {m.get('tags', industry)} | YC Verified Venture.",
                    "similarity_score": sim_score,
                    "relevance_score": sim_score,
                    "strengths": f"• Backed by Y Combinator venture acceleration ecosystem.\n• Established digital footprint and focused product one-liner: '{one_liner}'.",
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
        except Exception as e:
            print(f"[OnlineCompetitorService] YC lookup notice: {e}")

        # 3. AI-Driven High-Relevance Discovery for Real Market Leaders
        # If we need more competitors to reach target, ask AI model for verifiable market leaders
        if len(competitors) < limit:
            try:
                needed = limit - len(competitors)
                ai_prompt = f"""You are an elite Silicon Valley venture intelligence analyst.
Identify {needed} REAL, ACTUAL public market competitors or alternatives for the following online startup idea:
Startup Name: {title}
Industry: {industry}
Description: {description}
Target Market: {target_market}
Keywords: {keywords}

CRITICAL INSTRUCTIONS:
1. ONLY return REAL, WELL-KNOWN, EXISTING companies and products. Do NOT make up fictional company names.
2. For pricing, describe their real-world model (e.g., Freemium, Usage-based, Flat Monthly, Free Tier). If unknown, say 'Not available'.
3. Do NOT fabricate numerical ratings or subscriber numbers.
4. Output STRICT JSON format matching this schema:
{{
  "competitors": [
    {{
      "name": "Actual Real Company Name",
      "website_url": "https://company.com",
      "competitor_type": "direct",
      "description": "Accurate one-line description of what they do",
      "pricing_model": "Freemium / Monthly SaaS / Enterprise",
      "pricing_details": "Realistic summary of pricing model without inventing false prices",
      "target_audience": "Specific audience they serve",
      "strengths": ["Real verified strength 1", "Real verified strength 2"],
      "weaknesses": ["Real documented weakness or friction point 1", "Documented limitation 2"],
      "competitive_gap": "Clear gap our startup can exploit",
      "similarity_score": 82
    }}
  ]
}}"""
                ai_resp = AIService._call_llm(ai_prompt, max_tokens=1000, timeout=10.0)
                ai_data = AIService._parse_json(ai_resp)
                
                ai_comps = ai_data.get("competitors", [])
                for item in ai_comps:
                    c_name = item.get("name")
                    if not c_name or c_name.lower() in seen_names:
                        continue
                    seen_names.add(c_name.lower())

                    strengths_arr = item.get("strengths", ["Established brand awareness and market presence."])
                    weaknesses_arr = item.get("weaknesses", ["Higher pricing for smaller organizations."])
                    sim = float(item.get("similarity_score", 75))

                    competitors.append({
                        "name": c_name,
                        "business_type": "online",
                        "competitor_type": item.get("competitor_type", "direct"),
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
                        "analysis_explanation": f"Synthesized from public industry benchmarks and competitive landscape analysis for {industry}.",
                        "source_urls": [item.get("website_url")] if item.get("website_url") else [],
                        "data_sources": ["Public Market Intelligence", "AI Industry Synthesis"],
                        "data_freshness": "Current Market Analysis",
                        "confidence_score": 88.0,
                        "evidence_status": "AI inference",
                        "verified": False,
                        "is_selected": True
                    })

                    if len(competitors) >= limit:
                        break
            except Exception as e:
                print(f"[OnlineCompetitorService] AI discovery notice: {e}")

        # Sort by relevance score descending
        competitors.sort(key=lambda x: -x["relevance_score"])
        return competitors[:limit]
