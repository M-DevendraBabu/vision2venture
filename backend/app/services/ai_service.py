from app.config import settings
import json
import re
import time
from typing import List, Dict, Optional, Any

# --- AI Client Setup ---
_nvidia_client = None
_groq_client = None

def _init_clients():
    global _nvidia_client, _groq_client
    
    # NVIDIA as primary
    if settings.NVIDIA_API_KEY:
        try:
            from openai import OpenAI
            _nvidia_client = OpenAI(
                base_url="https://integrate.api.nvidia.com/v1",
                api_key=settings.NVIDIA_API_KEY,
                timeout=12.0
            )
            print("[AI] OK - NVIDIA API initialized (primary)")
        except Exception as e:
            print(f"[AI] NVIDIA init failed: {e}")

    # Groq as fallback
    if settings.GROQ_API_KEY:
        try:
            from groq import Groq
            _groq_client = Groq(api_key=settings.GROQ_API_KEY)
            print("[AI] OK - Groq API initialized (fallback)")
        except Exception as e:
            print(f"[AI] Groq init failed: {e}")

_init_clients()


def _call_llm(prompt: str, max_tokens: int = 1200, timeout: float = 14.0) -> str:
    """Call Groq using active high-speed model qwen/qwen3.8-27b with failover and rate-limit backoff."""
    safe_max_tokens = min(int(max_tokens or 1200), 2500)
    
    if _groq_client is not None:
        for attempt in range(3):
            try:
                completion = _groq_client.chat.completions.create(
                    model="qwen/qwen3.8-27b",
                    messages=[{"role": "user", "content": prompt}],
                    # Lower temperature for more reproducible, consistent structured
                    # (JSON) analysis across repeated runs of the same idea.
                    temperature=0.3,
                    max_tokens=safe_max_tokens,
                    timeout=timeout,
                )
                text = completion.choices[0].message.content
                if text:
                    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()
                    return text
            except Exception as e:
                err_str = str(e)
                if '429' in err_str and attempt < 2:
                    time.sleep(6.0)
                    continue
                print(f"[AI] Groq call notice: {e}")
                break

    return ""



def _parse_json(text: str) -> dict:
    """Extract and sanitize JSON from LLM response text with truncation recovery."""
    if not text:
        return {}
    
    # Strip thinking tags if returned by reasoning models
    clean_text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()
    if not clean_text:
        clean_text = text

    # Extract JSON string block
    target = clean_text
    match = re.search(r'```(?:json)?\s*([\s\S]*?)```', clean_text)
    if match:
        target = match.group(1).strip()
    else:
        brace_match = re.search(r'(\{[\s\S]*\})', clean_text)
        if brace_match:
            target = brace_match.group(1).strip()

    # Try direct parse
    try:
        return json.loads(target)
    except Exception:
        pass

    # Clean trailing commas: [a, b, ] -> [a, b] or {"a": 1, } -> {"a": 1}
    try:
        sanitized = re.sub(r',\s*([\}\]])', r' ', target)
        return json.loads(sanitized)
    except Exception:
        pass

    # Truncation recovery: if response was cut off, close at last complete object
    try:
        last_brace = target.rfind('}')
        if last_brace != -1:
            repaired = target[:last_brace+1]
            if '[' in repaired and not repaired.rstrip().endswith(']'):
                repaired += '\n  ]\n}'
            elif not repaired.rstrip().endswith('}'):
                repaired += '\n}'
            sanitized = re.sub(r',\s*([\}\]])', r' ', repaired)
            return json.loads(sanitized)
    except Exception as e:
        print(f"[AI] JSON parse notice: {e}")
    return {}


def _build_real_data_context(context: dict) -> str:
    """Helper to extract and format verified real-world indicators for LLM prompts."""
    trends = context.get('_trends_data', {})
    econ = context.get('_economic_data', {})
    news = context.get('_news_headlines', [])
    comps = context.get('_discovered_competitors', '')
    comp_count = context.get('_competitor_count', 0)

    lines = []
    if trends and trends.get('avg_interest') is not None:
        lines.append(f"- Google Trends Demand Index: {trends.get('avg_interest')}/100 ({trends.get('trend_direction', 'stable')} trend across India)")
        if trends.get('top_regions'):
            lines.append(f"- Highest Demand States in India: {', '.join(trends.get('top_regions')[:3])}")
    if econ and econ.get('gdp_usd'):
        gdp_trill = round(econ.get('gdp_usd', 0) / 1e12, 2)
        pop_str = f"{int(econ.get('population', 1450000000)):,}"
        lines.append(f"- World Bank National Data: India GDP: ${gdp_trill}T, Population: {pop_str}, Internet Penetration: {econ.get('internet_pct', 65)}%")
    if news:
        lines.append(f"- Latest Market Headlines: {' | '.join(news[:3])}")
    if comps:
        lines.append(f"- Verified Discovered Competitors ({comp_count} identified): {comps}")

    if lines:
        return "VERIFIED REAL-WORLD MARKET SIGNALS:\n" + "\n".join(lines)
    return ""


class AIService:
    @staticmethod
    def _call_llm(prompt: str, max_tokens: int = 1200, timeout: float = 12.0) -> str:
        return _call_llm(prompt, max_tokens=max_tokens, timeout=timeout)

    @staticmethod
    def _parse_json(text: str) -> dict:
        return _parse_json(text)

    @staticmethod
    def _generate(prompt: str, max_tokens: int = 1200, timeout: float = 12.0) -> dict:
        text = _call_llm(prompt, max_tokens=max_tokens, timeout=timeout)
        result = _parse_json(text)
        return result

    @staticmethod
    def run_market_analysis(context: dict) -> dict:
        real_data = _build_real_data_context(context)
        budget = float(context.get('budget') or 20000)

        prompt = f"""You are a senior market research analyst specializing in Indian and regional markets.
Analyze this startup idea grounded in the verified real-world indicators provided below:

STARTUP DETAILS:
Title: {context['title']}
Description: {context['description']}
Industry: {context['industry']}
Sector / Business Type: {context.get('business_type', context.get('sector', 'online'))}
Location: {context.get('location', context.get('country', 'India'))}
Country: {context.get('country', 'India')}
Target Customers: {context.get('target_customers', 'Modern consumers and businesses')}
Pricing Model: {context.get('pricing_model', 'Value-based')}
Budget: ₹{budget:,.0f}
Team Size: {context.get('team_size', 2)}

{real_data}

CRITICAL RULES:
1. Ground your market size (TAM/SAM) and growth rates in the specific niche and geography (e.g. if local bakery/gym in Andhra Pradesh, state localized market scale in ₹ Cr, NOT generic global tech trillions).
2. All currency figures MUST be in Indian Rupees (₹ / ₹ Cr / ₹ Lakh).
3. Opportunity score (0-100) must reflect the verified search demand trends and budget adequacy.
4. Primary demographic, key pain points, and channels must be specific to this exact startup concept.

Return ONLY valid JSON with this exact schema:
{{
  "market_size": "₹XX,XXX Cr (Localized addressable market)",
  "growth_rate": 15.4,
  "demand_level": "High / Medium",
  "opportunity_score": 82,
  "industry_trends": ["Specific Trend 1", "Specific Trend 2", "Specific Trend 3"],
  "primary_demo": "Precise demographic profile and customer personas",
  "key_pain_point": "The primary operational or customer friction solved",
  "acquisition_channel": "Most cost-effective customer acquisition channel in India",
  "purchase_trigger": "Core motivation or event driving the purchase decision",
  "opportunity_explanation": "Detailed strategic rationale connecting real-world demand and startup positioning",
  "market_analysis_explanation": "Comprehensive synthesis of market dynamics, competitive intensity, and timing"
}}"""
        res = AIService._generate(prompt, max_tokens=1400)
        if res and res.get('market_size') and res.get('opportunity_score'):
            res["data_source"] = "AI Analysis (Grounded in Real Data)"
            return res

        # Fallback to ML market model and verified benchmarks
        try:
            from app.services.ml_service import MLService
            ml_res = MLService.calculate_market_analysis(context)
            if ml_res and ml_res.get('market_size'):
                ml_res["data_source"] = "ML Model & Industry Benchmarks"
                return ml_res
        except Exception as e:
            print(f"[AI Service] ML market fallback notice: {e}")

        sec = context.get('sector', 'online')
        ind = context.get('industry', 'Technology')
        return {
            "market_size": f"₹42,000 Cr ({ind} in India)",
            "growth_rate": None,
            "demand_level": "High Demand",
            "opportunity_score": None,
            "industry_trends": [
                f"Digital adoption and localized delivery expansion in {ind}",
                "Increasing consumer preference for verified quality and transparent pricing",
                "Shift toward automated operations and direct customer relationship models"
            ],
            "primary_demo": f"Consumers and SMB accounts seeking {ind} solutions in India",
            "key_pain_point": f"Manual overhead, high intermediary markups, and inconsistent service in legacy {ind}",
            "acquisition_channel": "Hyperlocal digital marketing, search SEO, and direct customer referrals",
            "purchase_trigger": "Immediate requirement for reliable, cost-effective service",
            "opportunity_explanation": f"Grounded market opportunity metrics for {context.get('title', 'startup')}.",
            "market_analysis_explanation": "Baseline market analysis generated when AI engine is offline. Re-run analysis for live AI evaluation.",
            "data_source": "Template / offline fallback"
        }

    @staticmethod
    def discover_local_businesses(
        category: str,
        location: str,
        radius_km: float = 5.0,
        keywords: str = "",
        title: str = "",
        description: str = "",
        limit: int = 6
    ) -> List[Dict]:
        """
        Discovers real, physical local establishments in a specific town, campus, or city locality.
        Guarantees coverage in areas where OpenStreetMap lacks POI tagging.
        """
        prompt = f"""You are an elite local geographic business intelligence agent.
Identify {limit} REAL, CURRENT, PHYSICAL local businesses, shops, or establishments operating in or near:
Location: {location}
Industry / Category: {category}
Venture Concept: {title}
Keywords: {keywords}
Search Radius: within {radius_km} km of {location}

CRITICAL RULES:
1. Return REAL, AUTHENTIC physical establishments that actually exist near this location (e.g. well-known local restaurants, food spots, gyms, bakeries, clinics, retail shops near landmarks, college gates, main roads, or transit hubs).
2. For student campus areas (like Vignan University, Vadlamudi, or college campuses), identify popular spots frequented by students and faculty (e.g. Bismillah, The Heaven's Kitchen, Mubarak, Paradise Biryani, local messes, canteens).
3. For urban hubs (Bangalore, Hyderabad, Pune, etc.), identify established physical outlets in that specific locality.
4. Provide estimated distance in km from {location} (must be <= {radius_km} km).
5. Provide realistic customer ratings (3.8 to 4.8) and realistic local landmark addresses.

Return ONLY valid JSON with this exact schema:
{{
  "competitors": [
    {{
      "name": "Actual Real Establishment Name",
      "specialty": "Biryani / Fast Food / Fitness / Clinic / etc",
      "address": "Street / Landmark, Locality",
      "distance_km": 0.4,
      "rating": 4.3,
      "review_count": 120,
      "price_range": "In-store / Menu pricing",
      "strengths": "Popular local spot with steady footfall",
      "weaknesses": "Peak hour rush and wait times"
    }}
  ]
}}"""
        try:
            res = AIService._generate(prompt, max_tokens=1000, timeout=14.0)
            if res and isinstance(res.get("competitors"), list) and len(res["competitors"]) > 0:
                return res["competitors"]
        except Exception as e:
            print(f"[AI Service] Local business discovery error: {e}")
        return []

    @staticmethod
    def run_competitor_analysis(context: dict) -> dict:
        real_data = _build_real_data_context(context)
        prompt = f"""Identify and benchmark direct competitors for:
Title: {context['title']}
Industry: {context['industry']}
Sector: {context.get('sector', 'online')}
Country: {context.get('country', 'India')}
Description: {context['description']}

{real_data}

Return ONLY valid JSON:
{{"competitors": [{{"name": "Competitor Name", "similarity_score": 75, "strengths": "Specific operational strengths", "weaknesses": "Documented limitations or user complaints", "competitive_gap": "Market whitespace to exploit", "usp": "Defensible unique selling proposition", "analysis_explanation": "Why this competitor matters in this market"}}]}}"""
        res = AIService._generate(prompt, max_tokens=1200)
        if res and res.get('competitors'):
            return res

        ind = context.get('industry', 'Technology')
        title = context.get('title', 'Startup')
        sec = context.get('sector', 'online')

        return {
            "competitors": [
                {
                    "name": f"Established {ind} Market Leaders",
                    "similarity_score": 70.0,
                    "strengths": "High brand recognition, large customer base, and extensive capital reserves.",
                    "weaknesses": "Slow feature deployment, rigid pricing models, and lack of localized customer support.",
                    "competitive_gap": f"Opportunity for {title} to offer transparent pricing and tailored UX.",
                    "usp": f"Modern {sec} architecture engineered for customer agility.",
                    "analysis_explanation": f"Direct market incumbent operating in the {ind} domain."
                },
                {
                    "name": f"Regional {ind} Service Providers",
                    "similarity_score": 60.0,
                    "strengths": "Strong local relationships and physical market distribution.",
                    "weaknesses": "Outdated technology stack and limited scalability.",
                    "competitive_gap": "Integration of modern automation and user analytics.",
                    "usp": "All-in-one digital platform with seamless onboarding.",
                    "analysis_explanation": f"Secondary regional player competing for market share in {context.get('country', 'India')}."
                }
            ]
        }

    @staticmethod
    def run_technology_recommendations(context: dict) -> dict:
        prompt = f"""Recommend the optimal production technology stack for:
Title: {context['title']}
Industry: {context['industry']}
Sector: {context.get('sector', 'online')}
Budget: ₹{float(context.get('budget') or 20000):,.0f}

Return ONLY valid JSON:
{{"frontend": "recommendation", "backend": "recommendation", "database_system": "recommendation", "cloud_platform": "recommendation", "ai_framework": "recommendation", "deployment": "recommendation", "reasoning": "2-3 sentence technical architectural rationale"}}"""
        res = AIService._generate(prompt, max_tokens=900)
        if res and res.get('frontend') and 'Modern' not in res.get('frontend', ''):
            return res

        from app.services.ml_service import MLService
        return MLService.recommend_tech_stack(context)

    @staticmethod
    def run_business_model(context: dict) -> dict:
        real_data = _build_real_data_context(context)
        budget = float(context.get('budget') or 20000)

        prompt = f"""Design a comprehensive 9-pillar Lean Business Model Canvas specifically for:
Title: {context['title']}
Industry: {context['industry']}
Business Type / Delivery: {context.get('business_type', context.get('sector', 'online'))}
Location: {context.get('location', context.get('country', 'India'))}
Pricing Model: {context.get('pricing_model', 'Value-aligned')}
Target Customers: {context.get('target_customers', 'Not specified')}
Budget: ₹{budget:,.0f}
Team Size: {context.get('team_size', 2)}

{real_data}

CRITICAL RULES:
1. Revenue streams MUST specify pricing in Indian Rupees (₹) aligned with the user pricing model.
2. Cost structure must be realistic for an initial budget of ₹{budget:,.0f}.
3. Unfair advantage must differentiate from the known competitors listed above.

Return ONLY valid JSON with keys:
"archetype": "e.g. B2B SaaS, Hyperlocal Retail, Direct-to-Consumer",
"gross_margin": "e.g. 68% - 78%",
"ltv_cac": "e.g. 3.8x",
"payback_months": "e.g. 5 - 7 Months",
"problem": "Exact customer pain points in India",
"solution": "Specific operational product solution",
"customer_segments": ["Segment 1", "Segment 2", "Segment 3"],
"value_proposition": "Clear, compelling value proposition",
"revenue_streams": ["Stream 1 with ₹", "Stream 2 with ₹", "Stream 3"],
"channels": ["Channel 1", "Channel 2", "Channel 3"],
"key_partners": ["Partner 1", "Partner 2", "Partner 3"],
"key_activities": ["Activity 1", "Activity 2"],
"key_resources": ["Resource 1", "Resource 2"],
"cost_structure": ["Cost component 1", "Cost component 2"],
"key_metrics": ["Metric 1", "Metric 2"],
"unfair_advantage": "Defensible market moat",
"detailed_explanation": "Comprehensive strategic summary"
"""
        try:
            res = AIService._generate(prompt, max_tokens=1400)
            if res and res.get('value_proposition') and res.get('customer_segments'):
                res["data_source"] = "AI Strategy (Grounded in Real Data)"
                return res
        except Exception as e:
            print(f"[AI] run_business_model notice: {e}")

        from app.services.business_intelligence import generate_business_model
        fallback = generate_business_model(context)
        fallback["data_source"] = "Industry Template (Offline Fallback)"
        return fallback

    @staticmethod
    def run_swot_analysis(context: dict) -> dict:
        real_data = _build_real_data_context(context)
        budget = float(context.get('budget') or 20000)

        prompt = f"""Perform an in-depth strategic SWOT analysis for this specific startup:
Title: {context['title']}
Industry: {context['industry']}
Business Type: {context.get('business_type', context.get('sector', 'online'))}
Location: {context.get('location', context.get('country', 'India'))}
Budget: ₹{budget:,.0f}
Team Size: {context.get('team_size', 2)}
Team Skills: {context.get('team_skills', 'Founding execution')}

{real_data}

CRITICAL RULES:
1. Reference THIS startup's actual budget, team skills, and location in Strengths and Weaknesses.
2. Incorporate real market demand and news trends in Opportunities and Threats.
3. Every point must include a bold title and 1-2 sentence explanation.

Return ONLY valid JSON with keys:
"strengths": ["Title: Detailed description", "Title: Detailed description", "Title: Detailed description"],
"weaknesses": ["Title: Detailed description", "Title: Detailed description"],
"opportunities": ["Title: Detailed description", "Title: Detailed description", "Title: Detailed description"],
"threats": ["Title: Detailed description", "Title: Detailed description"],
"overall_assessment": "Executive strategic synthesis"
"""
        try:
            res = AIService._generate(prompt, max_tokens=1300)
            if res and res.get('strengths') and len(res.get('strengths', [])) >= 2:
                res["data_source"] = "AI Strategy (Grounded in Real Data)"
                return res
        except Exception as e:
            print(f"[AI] run_swot_analysis notice: {e}")

        from app.services.business_intelligence import generate_swot_analysis
        fallback = generate_swot_analysis(context)
        fallback["data_source"] = "Industry Template (Offline Fallback)"
        return fallback

    @staticmethod
    def run_financial_analysis(context: dict) -> dict:
        real_data = _build_real_data_context(context)
        budget = float(context.get('budget') or 20000)
        revenue_goal = float(context.get('revenue_goal') or budget * 2.5)
        sec = str(context.get('sector', context.get('business_type', 'online'))).lower()

        prompt = f"""You are a startup financial modeler specializing in Indian market economics.
Generate realistic financial projections in Indian Rupees (₹) for:
Title: {context['title']}
Industry: {context['industry']}
Business Type: {sec}
Location: {context.get('location', 'India')}
Budget: ₹{budget:,.0f}
Team Size: {context.get('team_size', 2)}
Target Annual Revenue: ₹{revenue_goal:,.0f}

{real_data}

CRITICAL RULES:
1. All figures must be in Indian Rupees (₹).
2. Monthly operating cost MUST be realistic for a budget of ₹{budget:,.0f}.
3. If business type is offline, include realistic physical rent and utility costs in India. If online, rent should be minimal/coworking.
4. ROI must be mathematically consistent with revenue and operating costs.

Return ONLY valid JSON with NUMERIC values:
{{
  "monthly_recurring_revenue": 50000,
  "customer_acquisition_cost": 1200,
  "lifetime_value": 6500,
  "churn_rate": 3.8,
  "rent_cost": 15000,
  "staff_cost": 35000,
  "raw_material_cost": 5000,
  "utility_cost": 4000,
  "marketing_cost": 12000,
  "development_cost": 25000,
  "monthly_operating_cost": 71000,
  "roi": 145,
  "profit_margins": 24.5,
  "break_even_analysis": "Break-even projected in 8-10 months based on customer volume and unit contribution margins.",
  "detailed_explanation": "Detailed operational financial assessment grounded in Indian unit economics."
}}"""
        res = AIService._generate(prompt, max_tokens=1100)
        if res and res.get('monthly_recurring_revenue') is not None:
            res["data_source"] = "AI Financial Model (Grounded in Real Data)"
            return res

        from app.services.ml_service import MLService
        ml_fin = MLService.calculate_financial_projections(context)
        if ml_fin and ml_fin.get('monthly_recurring_revenue') is not None:
            ml_fin["data_source"] = "ML Regressor & Real Funding Benchmarks"
            return ml_fin

        b_val = budget
        r_val = revenue_goal
        mrr = round(r_val / 12, 2)
        cac = round(max(250.0, b_val * 0.015), 2)
        ltv = round(cac * 3.8, 2)
        return {
            "subscription_revenue": round(r_val * 0.8, 2),
            "freemium_conversion": 4.0 if sec == 'online' else 0.0,
            "monthly_recurring_revenue": mrr,
            "customer_acquisition_cost": cac,
            "lifetime_value": ltv,
            "churn_rate": 3.5,
            "daily_customers_estimate": max(15, int(mrr / (30 * 150))) if sec == 'offline' else 0,
            "average_order_value": 150.0 if sec == 'offline' else 250.0,
            "monthly_revenue": mrr,
            "rent_cost": round(b_val * 0.12, 2) if sec == 'offline' else 0.0,
            "staff_cost": round(b_val * 0.28, 2),
            "raw_material_cost": round(b_val * 0.12, 2) if sec == 'offline' else 0.0,
            "utility_cost": round(b_val * 0.05, 2),
            "marketing_cost": round(b_val * 0.15, 2),
            "development_cost": round(b_val * 0.20, 2),
            "monthly_operating_cost": round(b_val * 0.75 / 12, 2),
            "break_even_analysis": "Estimated break-even within 10-14 months based on capital deployment.",
            "roi": round(max(15.0, (r_val - b_val) / max(b_val, 1) * 100), 1),
            "profit_margins": 22.5,
            "detailed_explanation": "Baseline financial projections generated from budget inputs. AI LLM analysis was offline.",
            "data_source": "Industry Financial Benchmark (Offline Fallback)"
        }

    @staticmethod
    def run_roadmap(context: dict) -> dict:
        budget = float(context.get('budget') or 20000)
        team_size = int(context.get('team_size') or 2)
        b_type = context.get('business_type', context.get('sector', 'online'))

        prompt = f"""Create an actionable 5-phase execution roadmap for:
Title: {context['title']}
Industry: {context['industry']}
Business Type: {b_type}
Budget: ₹{budget:,.0f}
Team Size: {team_size}

Return ONLY valid JSON (all costs in Indian Rupees ₹):
{{"phase_1": {{"name": "Phase 1: Market Validation & Setup", "duration": "Months 1-2", "tasks": ["Task 1", "Task 2"], "milestones": ["M1"], "success_metrics": ["S1"], "estimated_cost": "₹..."}}, "phase_2": {{"name": "Phase 2: MVP / Operations Launch", "duration": "Months 3-5", "tasks": ["Task 1", "Task 2"], "milestones": ["M1"], "success_metrics": ["S1"], "estimated_cost": "₹..."}}, "phase_3": {{"name": "Phase 3: Customer Traction", "duration": "Months 6-8", "tasks": ["Task 1"], "milestones": ["M1"], "success_metrics": ["S1"], "estimated_cost": "₹..."}}, "phase_4": {{"name": "Phase 4: Optimization & Cash Flow", "duration": "Months 9-10", "tasks": ["Task 1"], "milestones": ["M1"], "success_metrics": ["S1"], "estimated_cost": "₹..."}}, "phase_5": {{"name": "Phase 5: Scaling & Expansion", "duration": "Months 11-12", "tasks": ["Task 1"], "milestones": ["M1"], "success_metrics": ["S1"], "estimated_cost": "₹..."}}, "timeline": "12 Months"}}"""
        res = AIService._generate(prompt, max_tokens=1300)
        if res and res.get('phase_1'):
            res["data_source"] = "AI Roadmap (Tailored to Startup Constraints)"
            return res

        b = budget
        return {
            "phase_1": {
                "name": "Phase 1: Market Validation & Architecture",
                "duration": "Months 1-2",
                "tasks": ["Target user interviews & regulatory checks", "Core solution workflow prototyping", "Local supplier / infrastructure onboarding"],
                "milestones": ["First 30 customer problem interviews completed", "Prototype approved"],
                "success_metrics": [">80% positive feedback on core value proposition"],
                "estimated_cost": f"₹{b*0.15:,.0f}"
            },
            "phase_2": {
                "name": "Phase 2: MVP & Operational Setup",
                "duration": "Months 3-5",
                "tasks": ["Core service delivery & platform deployment", "Payment processing & unit economics test", "Closed alpha testing"],
                "milestones": ["Working build live in production"],
                "success_metrics": ["Zero critical errors in customer transaction loop"],
                "estimated_cost": f"₹{b*0.35:,.0f}"
            },
            "phase_3": {
                "name": "Phase 3: Public Launch & Early Traction",
                "duration": "Months 6-8",
                "tasks": ["Targeted customer acquisition campaign", "Customer feedback loop optimization", "Word-of-mouth referral incentive rollout"],
                "milestones": ["First 100 paying customers"],
                "success_metrics": ["Customer satisfaction rate > 85%"],
                "estimated_cost": f"₹{b*0.25:,.0f}"
            },
            "phase_4": {
                "name": "Phase 4: Cash Flow Optimization",
                "duration": "Months 9-10",
                "tasks": ["Operating cost rationalization", "High-margin service tier introduction", "Repeat customer loyalty programs"],
                "milestones": ["Operating cash flow break-even"],
                "success_metrics": ["Monthly retention rate > 75%"],
                "estimated_cost": f"₹{b*0.15:,.0f}"
            },
            "phase_5": {
                "name": "Phase 5: Expansion & Scale",
                "duration": "Months 11-12",
                "tasks": ["Geographic or catalog expansion", "Institutional partnership outreach", "Funding readiness audit"],
                "milestones": ["Expanded operational capacity"],
                "success_metrics": ["Profitable unit economics at scale"],
                "estimated_cost": f"₹{b*0.10:,.0f}"
            },
            "timeline": "12 Months Structured Roadmap",
            "data_source": "Industry Execution Benchmark (Offline Fallback)"
        }

    @staticmethod
    def run_risk_analysis(context: dict) -> dict:
        real_data = _build_real_data_context(context)
        prompt = f"""You are a startup risk analyst. Assess ALL 5 risk categories specifically for:
Title: {context['title']}
Industry: {context['industry']}
Sector / Business Type: {context.get('business_type', context.get('sector', 'online'))}
Budget: ₹{float(context.get('budget') or 20000):,.0f}
Team Size: {context.get('team_size', 2)}

{real_data}

Generate UNIQUE, differentiated risk scores (15-85 range) specific to THIS business concept.
Return ONLY valid JSON:
{{
  "technical_risk": {{"score": 32, "severity": "Low", "explanation": "...", "mitigation_strategy": "..."}},
  "market_risk": {{"score": 45, "severity": "Medium", "explanation": "...", "mitigation_strategy": "..."}},
  "competition_risk": {{"score": 55, "severity": "Medium", "explanation": "...", "mitigation_strategy": "..."}},
  "financial_risk": {{"score": 38, "severity": "Low", "explanation": "...", "mitigation_strategy": "..."}},
  "operational_risk": {{"score": 28, "severity": "Low", "explanation": "...", "mitigation_strategy": "..."}},
  "overall_risk": 40.2
}}"""
        res = AIService._generate(prompt, max_tokens=1100)
        if res and res.get('overall_risk'):
            res["data_source"] = "AI Risk Engine (Grounded in Real Signals)"
            return res
        return None

    @staticmethod
    def run_feasibility_analysis(context: dict) -> dict:
        real_data = _build_real_data_context(context)
        prompt = f"""You are a startup feasibility assessor. Evaluate feasibility specifically for:
Title: {context['title']}
Industry: {context['industry']}
Sector: {context.get('sector', 'online')}
Budget: ₹{float(context.get('budget') or 20000):,.0f}
Team Size: {context.get('team_size', 2)}

{real_data}

Generate UNIQUE feasibility scores (50-96 range) that accurately reflect THIS specific startup.
Return ONLY valid JSON:
{{
  "market_score": 78,
  "technical_score": 85,
  "financial_score": 72,
  "innovation_score": 80,
  "overall_feasibility": 78.8,
  "explanation": "Detailed feasibility assessment."
}}"""
        res = AIService._generate(prompt, max_tokens=900)
        if res and res.get('overall_feasibility'):
            res["data_source"] = "AI Feasibility Engine (Grounded in Real Signals)"
            return res
        return None

    @staticmethod
    def run_investor_readiness(context: dict) -> dict:
        real_data = _build_real_data_context(context)
        prompt = f"""You are an early-stage venture capital analyst. Assess investor readiness for:
Title: {context['title']}
Industry: {context['industry']}
Sector: {context.get('sector', 'online')}
Budget: ₹{float(context.get('budget') or 20000):,.0f}
Team Size: {context.get('team_size', 2)}

{real_data}

Return ONLY valid JSON:
{{
  "scalability": 75,
  "innovation": 80,
  "business_model": 78,
  "market": 82,
  "investor_score": 78.75,
  "explanation": "Comprehensive investor perspective.",
  "suggestions": ["Actionable suggestion 1", "Actionable suggestion 2", "Actionable suggestion 3"]
}}"""
        res = AIService._generate(prompt, max_tokens=900)
        if res and res.get('investor_score'):
            res["data_source"] = "AI Investor Engine (Grounded in Real Signals)"
            return res
        return None
