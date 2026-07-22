from app.config import settings
import json
import re
import time

# --- AI Client Setup ---
_client = None
_provider = None

def _init_client():
    global _client, _provider
    
    # Try Groq first
    if settings.GROQ_API_KEY:
        try:
            from groq import Groq
            _client = Groq(api_key=settings.GROQ_API_KEY)
            _provider = "groq"
            print("[AI] OK - Using Groq API (llama-3.3-70b-versatile)")
            return
        except Exception as e:
            print(f"[AI] Groq init failed: {e}")
    
    # Fallback to Gemini
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            _client = genai.GenerativeModel('gemini-2.0-flash')
            _provider = "gemini"
            print("[AI] OK - Using Gemini API (gemini-2.0-flash)")
            return
        except Exception as e:
            print(f"[AI] Gemini init failed: {e}")
    
    print("[AI] WARNING - No AI API key configured. Set GROQ_API_KEY or GEMINI_API_KEY in .env")

_init_client()


def _call_llm(prompt: str, max_retries: int = 2) -> str:
    """Call the configured LLM and return raw text."""
    if _client is None:
        return ""
    
    for attempt in range(max_retries):
        try:
            if _provider == "groq":
                completion = _client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                    max_tokens=2500,
                )
                return completion.choices[0].message.content or ""
            elif _provider == "gemini":
                response = _client.generate_content(prompt)
                return response.text or ""
        except Exception as e:
            print(f"[AI] Attempt {attempt+1} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(1)
    
    return ""


def _parse_json(text: str) -> dict:
    """Extract JSON from LLM response text."""
    if not text:
        return {}
    try:
        # Try ```json ... ``` blocks first
        match = re.search(r'```(?:json)?\s*(.*?)```', text, re.DOTALL)
        if match:
            return json.loads(match.group(1).strip())
        # Try raw JSON object
        brace_match = re.search(r'\{.*\}', text, re.DOTALL)
        if brace_match:
            return json.loads(brace_match.group(0))
        return json.loads(text.strip())
    except json.JSONDecodeError as e:
        print(f"[AI] JSON parse error: {e}")
        return {}


class AIService:
    @staticmethod
    def _generate(prompt: str) -> dict:
        text = _call_llm(prompt)
        result = _parse_json(text)
        if not result:
            print(f"[AI] Empty result from LLM (text length: {len(text)})")
        return result

    @staticmethod
    def run_market_analysis(context: dict) -> dict:
        sector = context.get('sector', 'online')
        prompt = f"""You are a market research analyst. Analyze this startup idea.
Title: {context['title']}
Description: {context['description']}
Industry: {context['industry']}
Sector: {sector}
Country: {context.get('country', 'Global')}

For OFFLINE businesses: focus on local market, foot traffic, location factors.
For ONLINE businesses: focus on digital reach, user acquisition, scalability.

Return ONLY valid JSON (no extra text):
{{"market_size": "e.g. $5.2 Billion globally", "growth_rate": 15.5, "demand_level": "High", "opportunity_score": 72, "industry_trends": ["trend 1", "trend 2", "trend 3"], "primary_demo": "description of primary demographic", "key_pain_point": "the key pain point", "acquisition_channel": "recommended acquisition channel", "purchase_trigger": "trigger for purchase", "opportunity_explanation": "Why this score and market context", "market_analysis_explanation": "3-4 sentence detailed explanation of scores"}}"""
        return AIService._generate(prompt)

    @staticmethod
    def run_competitor_analysis(context: dict) -> dict:
        prompt = f"""You are a competitive intelligence analyst. Find competitors for:
Title: {context['title']}
Industry: {context['industry']}
Sector: {context.get('sector', 'online')}
Country: {context.get('country', 'Global')}
Description: {context['description']}

Return ONLY valid JSON:
{{"competitors": [{{"name": "Competitor Name", "similarity_score": 75, "strengths": "Their strengths", "weaknesses": "Their weaknesses", "competitive_gap": "Gap to exploit", "usp": "Your unique advantage", "analysis_explanation": "Why this competitor matters"}}]}}
List 3-5 realistic competitors."""
        return AIService._generate(prompt)

    @staticmethod
    def run_technology_recommendations(context: dict) -> dict:
        sector = context.get('sector', 'online')
        prompt = f"""You are a CTO advisor. Recommend tech stack for:
Title: {context['title']}
Industry: {context['industry']}
Sector: {sector}
Budget: ${context.get('budget', 0):,.0f}
Team Skills: {context.get('team_skills', 'General')}

For OFFLINE: recommend POS, inventory, accounting, marketing tools.
For ONLINE: recommend web/mobile stack.

Return ONLY valid JSON:
{{"frontend": "recommendation", "backend": "recommendation", "database_system": "recommendation", "cloud_platform": "recommendation", "ai_framework": "recommendation", "deployment": "recommendation", "reasoning": "2-3 sentence explanation"}}"""
        return AIService._generate(prompt)

    @staticmethod
    def run_business_model(context: dict) -> dict:
        prompt = f"""Design the business model for:
Title: {context['title']}
Industry: {context['industry']}
Sector: {context.get('sector', 'online')}
Pricing: {context.get('pricing_model', 'Not specified')}
Budget: ${context.get('budget', 0):,.0f}

Return ONLY valid JSON:
{{"customer_segments": "description", "value_proposition": "description", "revenue_streams": "description", "channels": "description", "key_partners": "description", "key_activities": "description", "key_resources": "description", "cost_structure": "description", "detailed_explanation": "3-4 sentence explanation"}}"""
        return AIService._generate(prompt)

    @staticmethod
    def run_swot_analysis(context: dict) -> dict:
        prompt = f"""Perform SWOT analysis for:
Title: {context['title']}
Industry: {context['industry']}
Sector: {context.get('sector', 'online')}
Budget: ${context.get('budget', 0):,.0f}
Team: {context.get('team_size', 1)} people, skills: {context.get('team_skills', 'General')}

Return ONLY valid JSON:
{{"strengths": ["specific strength 1", "strength 2", "strength 3"], "weaknesses": ["specific weakness 1", "weakness 2", "weakness 3"], "opportunities": ["specific opportunity 1", "opportunity 2", "opportunity 3"], "threats": ["specific threat 1", "threat 2", "threat 3"], "overall_assessment": "2-3 sentence assessment"}}
Make every point SPECIFIC to this business."""
        return AIService._generate(prompt)

    @staticmethod
    def run_financial_analysis(context: dict) -> dict:
        sector = context.get('sector', 'online')
        budget = context.get('budget', 0)
        revenue_goal = context.get('revenue_goal', 0)
        prompt = f"""Create financial projections for:
Title: {context['title']}
Industry: {context['industry']}
Sector: {sector}
Budget: ${budget:,.0f}
Revenue Goal: ${revenue_goal:,.0f}
Pricing: {context.get('pricing_model', 'Not specified')}

Return ONLY valid JSON with ALL numeric fields:
{{"subscription_revenue": 0, "freemium_conversion": 0, "monthly_recurring_revenue": 0, "customer_acquisition_cost": 0, "lifetime_value": 0, "churn_rate": 0, "daily_customers_estimate": 0, "average_order_value": 0, "monthly_revenue": 0, "rent_cost": 0, "staff_cost": 0, "raw_material_cost": 0, "utility_cost": 0, "marketing_cost": 0, "development_cost": 0, "monthly_operating_cost": 0, "break_even_analysis": "detailed analysis text", "roi": 0, "profit_margins": 0, "detailed_explanation": "financial outlook text"}}
Use realistic numbers based on the industry and sector."""
        return AIService._generate(prompt)

    @staticmethod
    def run_roadmap(context: dict) -> dict:
        prompt = f"""Create a 12-month roadmap for:
Title: {context['title']}
Industry: {context['industry']}
Sector: {context.get('sector', 'online')}
Budget: ${context.get('budget', 0):,.0f}
Team: {context.get('team_size', 1)} people
Stage: {context.get('business_stage', 'Idea')}

Return ONLY valid JSON:
{{"phase_1": {{"name": "Phase 1: ...", "duration": "Months 1-2", "tasks": ["task1", "task2"], "milestones": ["milestone1"], "success_metrics": ["metric1"], "estimated_cost": "$X,XXX"}}, "phase_2": {{"name": "Phase 2: ...", "duration": "Months 3-5", "tasks": ["task1"], "milestones": ["milestone1"], "success_metrics": ["metric1"], "estimated_cost": "$X,XXX"}}, "phase_3": {{"name": "Phase 3: ...", "duration": "Months 6-7", "tasks": ["task1"], "milestones": ["milestone1"], "success_metrics": ["metric1"], "estimated_cost": "$X,XXX"}}, "phase_4": {{"name": "Phase 4: ...", "duration": "Months 8-10", "tasks": ["task1"], "milestones": ["milestone1"], "success_metrics": ["metric1"], "estimated_cost": "$X,XXX"}}, "phase_5": {{"name": "Phase 5: ...", "duration": "Months 11-12", "tasks": ["task1"], "milestones": ["milestone1"], "success_metrics": ["metric1"], "estimated_cost": "$X,XXX"}}, "timeline": "12 months"}}"""
        return AIService._generate(prompt)

    @staticmethod
    def run_risk_analysis(context: dict) -> dict:
        prompt = f"""You are a risk analyst. Evaluate the risks for:
Title: {context['title']}
Description: {context['description']}
Industry: {context['industry']}
Sector: {context.get('sector', 'online')}
Budget: ${context.get('budget', 0):,.0f}
Funding Required: ${context.get('funding_required', 0):,.0f}
Team Size: {context.get('team_size', 1)}
Team Skills: {context.get('team_skills', 'None')}

Return ONLY valid JSON. Give scores from 0-100 (where 100 is highest risk) for each. Provide detailed explanations specific to this business:
{{"technical_risk": {{"score": 50, "severity": "Medium", "explanation": "Why this score", "mitigation_strategy": "How to mitigate"}}, "market_risk": {{"score": 50, "severity": "Medium", "explanation": "Why this score", "mitigation_strategy": "How to mitigate"}}, "competition_risk": {{"score": 50, "severity": "Medium", "explanation": "Why this score", "mitigation_strategy": "How to mitigate"}}, "financial_risk": {{"score": 50, "severity": "Medium", "explanation": "Why this score", "mitigation_strategy": "How to mitigate"}}, "operational_risk": {{"score": 50, "severity": "Medium", "explanation": "Why this score", "mitigation_strategy": "How to mitigate"}}, "overall_risk": 50}}"""
        return AIService._generate(prompt)

    @staticmethod
    def run_feasibility_analysis(context: dict) -> dict:
        prompt = f"""You are a business consultant. Evaluate feasibility for:
Title: {context['title']}
Description: {context['description']}
Industry: {context['industry']}
Sector: {context.get('sector', 'online')}
Budget: ${context.get('budget', 0):,.0f}
Revenue Goal: ${context.get('revenue_goal', 0):,.0f}

Return ONLY valid JSON. Provide scores from 0-100 (100 is most feasible) with detailed explanations:
{{"market_score": 70, "technical_score": 70, "financial_score": 70, "innovation_score": 70, "overall_feasibility": 70, "explanation": "Detailed overall explanation"}}"""
        return AIService._generate(prompt)

    @staticmethod
    def run_investor_readiness(context: dict) -> dict:
        prompt = f"""You are an angel investor. Evaluate investor readiness for:
Title: {context['title']}
Description: {context['description']}
Industry: {context['industry']}
Sector: {context.get('sector', 'online')}
Team Skills: {context.get('team_skills', 'None')}
Business Stage: {context.get('business_stage', 'Idea')}

Return ONLY valid JSON. Provide scores from 0-100 (100 is most ready) with detailed explanations and suggestions:
{{"scalability": 70, "innovation": 70, "business_model": 70, "market": 70, "investor_score": 70, "explanation": "Why this score", "suggestions": ["Suggestion 1", "Suggestion 2"]}}"""
        return AIService._generate(prompt)
