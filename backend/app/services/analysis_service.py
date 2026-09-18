import re
import time
import uuid
import concurrent.futures
from sqlalchemy.orm import Session
from app.models.startup_idea import StartupIdea
from app.models.analysis import (
    StartupAnalysis, MarketAnalysis, Competitor, CompetitorIntelligence, TechnologyRecommendation,
    BusinessModel, SwotAnalysis, FinancialAnalysis, RiskAnalysis,
    FeasibilityAnalysis, InvestorReadiness, ImplementationRoadmap
)
from app.services.nlp_service import NLPService
from app.services.ai_service import AIService
from app.services.ml_service import MLService
from app.services.competitor_intelligence_service import CompetitorIntelligenceService


def safe_float(val, default=0.0):
    if val is None:
        return float(default) if default is not None else None
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, dict):
        val = val.get('score', val.get('value', default))
    try:
        s = str(val).strip()
        s = re.sub(r'[^\d.-]', '', s)
        if not s or s == '-' or s == '.':
            return float(default) if default is not None else None
        return float(s)
    except Exception:
        return float(default) if default is not None else None

def safe_int(val, default=0):
    sf = safe_float(val, default)
    return int(sf) if sf is not None else default


def _as_suggestion_list(val):
    """
    Coerce investor suggestions to a list of strings.

    The column is JSON, so whatever shape arrives is what gets stored, and the AI path
    sometimes returns one string where the model path returns a list. A string survives
    the write, then breaks the Risk tab on render because a string has .length but no
    .map. Prose is split on sentence boundaries so it still reads as a list.
    """
    if not val:
        return ['Build MVP for early traction',
                'Focus on customer retention and repeat purchase rate']
    if isinstance(val, (list, tuple)):
        items = [str(v).strip() for v in val if v and str(v).strip()]
    elif isinstance(val, str):
        items = [s.strip() for s in re.split(r'(?<=\.)\s+(?=[A-Z])', val.strip()) if len(s.strip()) > 1]
    else:
        items = [str(val).strip()]
    return items or ['Build MVP for early traction',
                     'Focus on customer retention and repeat purchase rate']

class AnalysisService:
    @staticmethod
    def run_full_analysis(idea_id: str, db: Session):
        idea = db.query(StartupIdea).filter(StartupIdea.id == idea_id).first()
        if not idea:
            print(f"[Analysis] ERROR: Idea {idea_id} not found.")
            return

        print(f"[Analysis] Starting analysis for: '{idea.title}' ({idea.id})")
        idea.analysis_status = 'running'
        db.commit()

        context = {
            "title": idea.title,
            "description": idea.description,
            "industry": idea.industry,
            "business_type": idea.business_type or idea.sector,
            "budget": safe_float(idea.budget, 10000),
            "funding_required": safe_float(idea.funding_required, 0),
            "team_size": safe_int(idea.team_size, 1),
            "revenue_goal": safe_float(idea.revenue_goal, 50000),
            "team_skills": idea.team_skills,
            "sector": idea.sector or 'online',
            "country": idea.country or 'India',
            "location": idea.location or idea.country or 'India',
            "pricing_model": idea.pricing_model or 'Value-aligned'
        }

        budget = safe_float(idea.budget, 10000)
        sector = idea.sector or 'online'
        b_type = (idea.business_type or idea.sector or "online").lower()
        loc = idea.location or idea.country or "India"

        # Clear any existing partial analysis records for this idea
        try:
            db.query(StartupAnalysis).filter(StartupAnalysis.idea_id == idea_id).delete()
            db.query(MarketAnalysis).filter(MarketAnalysis.idea_id == idea_id).delete()
            db.query(Competitor).filter(Competitor.idea_id == idea_id).delete()
            db.query(CompetitorIntelligence).filter(CompetitorIntelligence.idea_id == idea_id).delete()
            db.query(TechnologyRecommendation).filter(TechnologyRecommendation.idea_id == idea_id).delete()
            db.query(BusinessModel).filter(BusinessModel.idea_id == idea_id).delete()
            db.query(SwotAnalysis).filter(SwotAnalysis.idea_id == idea_id).delete()
            db.query(FinancialAnalysis).filter(FinancialAnalysis.idea_id == idea_id).delete()
            db.query(RiskAnalysis).filter(RiskAnalysis.idea_id == idea_id).delete()
            db.query(FeasibilityAnalysis).filter(FeasibilityAnalysis.idea_id == idea_id).delete()
            db.query(InvestorReadiness).filter(InvestorReadiness.idea_id == idea_id).delete()
            db.query(ImplementationRoadmap).filter(ImplementationRoadmap.idea_id == idea_id).delete()
            db.commit()
        except Exception as e:
            print(f"[Analysis] Notice clearing old records: {e}")
            db.rollback()

        # ============ 0. REAL-WORLD DATA COLLECTION ============
        trends_data = {}
        economic_data = {}
        news_data = []
        try:
            print(f"[Analysis] 0/9 Collecting verified real-world indicators...")
            from app.services.google_trends_service import GoogleTrendsService
            from app.services.world_bank_service import WorldBankService
            from app.services.news_service import NewsService

            # 1. Google Trends
            trend_keywords = [idea.title.split()[0], idea.industry]
            if idea.target_customers:
                first_cust = idea.target_customers.split()[0]
                if len(first_cust) > 2:
                    trend_keywords.append(first_cust)
            trends_data = GoogleTrendsService.get_search_interest(trend_keywords[:3])

            # 2. World Bank National Economic Indicators
            country_code = 'IND' if (idea.country or '').lower() in ['india', 'in', ''] else 'USA'
            economic_data = WorldBankService.get_country_indicators(country_code)

            # 3. Google News Real Industry Headlines
            news_data = NewsService.get_industry_news(idea.industry, idea.country or 'India', limit=3)

            context['_trends_data'] = trends_data
            context['_economic_data'] = economic_data
            context['_news_headlines'] = [n.get('title', '') for n in news_data if n.get('title')]
            print(f"[Analysis] [OK] Real Data Connected: Trends ({trends_data.get('status')}), WorldBank ({economic_data.get('status')}), News ({len(news_data)} articles)")
        except Exception as e:
            print(f"[Analysis] Real data collection notice: {e}")

        # ============ 1. OVERVIEW / NLP ============
        try:
            print(f"[Analysis] 1/9 Running NLP overview...")
            keywords = NLPService.extract_keywords(
                text=idea.description,
                title=idea.title,
                industry=idea.industry,
                sector=idea.sector or 'online'
            )
            domain = NLPService.identify_domain(idea.description, idea.industry)
            ps = NLPService.parse_problem_solution(idea.description)
            summary = NLPService.summarize(idea.description, max_sentences=3)
            
            s_analysis = StartupAnalysis(
                idea_id=idea.id,
                business_domain=domain,
                target_users=idea.target_customers or f"Customers interested in {idea.industry}",
                problem_statement=ps.get('problem', idea.description),
                solution=ps.get('solution', idea.description),
                keywords=keywords or [idea.industry, sector, "Innovation"],
                business_category=idea.business_type or sector,
                summary=summary or idea.description[:500],
                overall_score=None
            )
            db.add(s_analysis)
            db.commit()
        except Exception as e:
            print(f"[Analysis] ERROR in Overview: {e}")
            db.rollback()

        # ============ 2. COMPETITOR INTELLIGENCE (DISCOVER FIRST SO OTHER MODULES CAN USE IT) ============
        discovered_comps = []
        try:
            print(f"[Analysis] 2/9 Running Competitor Intelligence Discovery...")
            radius = float(idea.radius_km or 5.0)
            kw_str = " ".join(keywords) if isinstance(keywords, list) else str(keywords or "")

            discovery_result = CompetitorIntelligenceService.discover(
                idea_title=idea.title,
                industry=idea.industry,
                description=idea.description,
                business_type=b_type,
                location=loc,
                radius_km=radius,
                lat=getattr(idea, 'latitude', None),
                lng=getattr(idea, 'longitude', None),
                keywords=kw_str,
                target_market=idea.country or "Global"
            )
            discovered_comps = discovery_result.get("competitors", [])

            # Enrich top competitors with Wikipedia if available
            try:
                from app.services.wikipedia_service import WikipediaService
                for c in discovered_comps[:3]:
                    wiki = WikipediaService.get_company_info(c.get("name", ""))
                    if wiki.get("found"):
                        c["description"] = wiki.get("description", c.get("description"))
                        c["data_sources"] = list(set(c.get("data_sources", []) + ["Wikipedia"]))
            except Exception as w_err:
                print(f"[Analysis] Wikipedia enrichment notice: {w_err}")

            for c in discovered_comps:
                db.add(Competitor(
                    id=str(uuid.uuid4()),
                    idea_id=idea.id,
                    name=c["name"],
                    business_type=c.get("business_type", b_type),
                    competitor_type=c.get("competitor_type", "direct"),
                    description=c.get("description", ""),
                    website_url=c.get("website_url", ""),
                    app_url=c.get("app_url", ""),
                    location=c.get("location", loc),
                    latitude=c.get("latitude"),
                    longitude=c.get("longitude"),
                    distance_km=c.get("distance_km"),
                    phone=c.get("phone", "Not available"),
                    rating=c.get("rating"),
                    review_count=c.get("review_count"),
                    reviews=c.get("reviews"),
                    customer_sentiment=c.get("customer_sentiment"),
                    rating_source=c.get("rating_source"),
                    opening_hours=c.get("opening_hours", "Not available"),
                    pricing_model=c.get("pricing_model", "Not available"),
                    pricing_details=c.get("pricing_details", ""),
                    target_audience=c.get("target_audience", ""),
                    features=c.get("features", ""),
                    similarity_score=float(c.get("similarity_score", 50.0)),
                    relevance_score=float(c.get("relevance_score", 50.0)),
                    strengths=c.get("strengths", ""),
                    weaknesses=c.get("weaknesses", ""),
                    competitive_gap=c.get("competitive_gap", ""),
                    usp=c.get("usp", ""),
                    analysis_explanation=c.get("analysis_explanation", ""),
                    source_urls=c.get("source_urls", []),
                    data_sources=c.get("data_sources", []),
                    data_freshness=c.get("data_freshness", "Current"),
                    confidence_score=float(c.get("confidence_score", 85.0)),
                    evidence_status=c.get("evidence_status", "not_web_verified"),
                    source_type=c.get("source_type"),
                    source_label=c.get("source_label"),
                    verified=bool(c.get("verified", False)),
                    is_selected=bool(c.get("is_selected", True))
                ))

            # Synthesize Intelligence
            idea_context = {
                "title": idea.title,
                "industry": idea.industry,
                "description": idea.description,
                "business_type": b_type,
                "location": loc,
                "country": idea.country
            }
            intel_data = CompetitorIntelligenceService.synthesize_intelligence(idea_context, discovered_comps)
            search_cfg = {
                "business_type": b_type,
                "location": loc,
                "radius_km": radius if b_type != "online" else None,
                "startup_location": discovery_result.get("startup_location") if b_type != "online" else None
            }
            intel_obj = CompetitorIntelligence(
                id=str(uuid.uuid4()),
                idea_id=idea.id,
                search_config=search_cfg,
                comparison_matrix=intel_data.get("comparison_matrix", []),
                startup_advantages=intel_data.get("startup_advantages", []),
                startup_gaps=intel_data.get("startup_gaps", []),
                market_opportunities=intel_data.get("market_opportunities", []),
                competitive_risks=intel_data.get("competitive_risks", []),
                recommendations=intel_data.get("recommendations", []),
                data_limitations=intel_data.get("data_limitations", [])
            )
            db.add(intel_obj)
            db.commit()

            # Attach discovered competitors to context for Market, SWOT, BM, Financial modules
            comp_names = [c["name"] for c in discovered_comps[:6]]
            context['_discovered_competitors'] = ", ".join(comp_names) if comp_names else "None identified"
            context['_competitor_count'] = len(discovered_comps)
        except Exception as e:
            print(f"[Analysis] ERROR in Competitor Analysis: {e}")
            db.rollback()

        # ============ 3. MARKET ANALYSIS (REAL DATA + AI / ML) ============
        market_data = {}
        market_source = "Google Trends, World Bank & AI"
        try:
            print(f"[Analysis] 3/9 Running Market Analysis (Grounded in Real Data)...")
            # The language model writes the narrative; the sourced tables supply the
            # numbers. It used to be the other way round - the model ran first and its
            # market size was kept whenever it produced one, so the sourced pipeline only
            # ever ran as a fallback. For a 30-seat tiffin centre in Vadlamudi that meant
            # a displayed market of "Rs 45,000 Cr (Andhra Pradesh & Telangana Regional
            # Tiffin/Cafeteria Market)" with no source and no confidence, against the
            # Rs 26.8 Cr catchment the HCES tables actually support for the 28,000 people
            # within reach. The model was inventing a figure roughly 1,680x too large and
            # it was overwriting a real one.
            #
            # A language model is good at describing a market and bad at sizing one. It
            # keeps the qualitative fields, where it is grounded in Google Trends, World
            # Bank indicators, live headlines and the competitors actually discovered.
            # Every number below now comes from MLService, with its provenance attached.
            llm_data = AIService.run_market_analysis(context) or {}
            ml_data = MLService.calculate_market_analysis(context) or {}

            market_data = dict(llm_data)
            if ml_data.get('market_size'):
                for field in ('market_size', 'market_size_source', 'market_size_confidence',
                              'growth_rate', 'opportunity_score'):
                    if ml_data.get(field) is not None:
                        market_data[field] = ml_data[field]
                market_source = 'Sourced market tables + AI narrative'
            elif llm_data.get('data_source'):
                market_source = llm_data['data_source']
            else:
                market_source = "Industry benchmark estimate"

            m_analysis = MarketAnalysis(
                idea_id=idea.id,
                market_size=str(market_data.get('market_size') or f'Estimated for {idea.industry} in {idea.country}'),
                growth_rate=safe_float(market_data.get('growth_rate'), None),
                demand_level=str(market_data.get('demand_level') or 'High'),
                opportunity_score=safe_float(market_data.get('opportunity_score'), None),
                industry_trends=market_data.get('industry_trends') or [
                    f'Increasing demand for {idea.industry} solutions',
                    'Digital transformation driving adoption',
                    'Consumer shift towards convenience and automation'
                ],
                market_analysis_explanation=str(market_data.get('market_analysis_explanation') or f'Market analysis for {idea.title} in {idea.industry}.'),
                primary_demo=str(market_data.get('primary_demo') or f'Target demographic in {idea.country}'),
                key_pain_point=str(market_data.get('key_pain_point') or f'High cost or friction in current {idea.industry} offerings'),
                acquisition_channel=str(market_data.get('acquisition_channel') or 'Digital Marketing, SEO, Direct Outreach'),
                purchase_trigger=str(market_data.get('purchase_trigger') or 'Immediate need for a scalable solution'),
                opportunity_explanation=str(market_data.get('opportunity_explanation') or 'Strong market fit and timing.'),
                data_source=market_source,
                # Provenance travels with the figure. VARCHAR(500) on a strict-mode
                # MySQL errors rather than truncates, so the source is trimmed here.
                market_size_source=(str(market_data['market_size_source'])[:500]
                                    if market_data.get('market_size_source') else None),
                market_size_confidence=(str(market_data['market_size_confidence'])[:20]
                                        if market_data.get('market_size_confidence') else None)
            )
            db.add(m_analysis)
            db.commit()
        except Exception as e:
            print(f"[Analysis] ERROR in Market Analysis: {e}")
            db.rollback()

        # ============ 4. TECHNOLOGY RECOMMENDATIONS (DATASET DRIVEN) ============
        try:
            print(f"[Analysis] 4/9 Running Technology Recommendations (Dataset)...")
            tech_data = MLService.recommend_tech_stack(context) or {}
            
            db.add(TechnologyRecommendation(
                idea_id=idea.id,
                frontend=str(tech_data.get('frontend') or 'React.js'),
                backend=str(tech_data.get('backend') or 'Python FastAPI'),
                database_system=str(tech_data.get('database_system') or 'PostgreSQL'),
                cloud_platform=str(tech_data.get('cloud_platform') or 'AWS'),
                ai_framework=str(tech_data.get('ai_framework') or 'PyTorch'),
                deployment=str(tech_data.get('deployment') or 'Docker / Vercel'),
                reasoning=str(tech_data.get('reasoning') or 'Recommended modern stack based on developer survey trends and scalability.')
            ))
            db.commit()
        except Exception as e:
            print(f"[Analysis] ERROR in Technology Recommendations: {e}")
            db.rollback()

        # ============ 5, 6, 7. AI MODULES (SEQUENTIAL WITH RATE-LIMIT SPACING) ============
        bm_data, swot_data, road_data = {}, {}, {}
        try:
            print(f"[Analysis] 5/9 Running Business Model...")
            bm_data = AIService.run_business_model(context) or {}
        except Exception as e:
            print(f"[Analysis] BM notice: {e}")

        time.sleep(1.2)

        try:
            print(f"[Analysis] 6/9 Running SWOT Analysis...")
            swot_data = AIService.run_swot_analysis(context) or {}
        except Exception as e:
            print(f"[Analysis] SWOT notice: {e}")

        time.sleep(1.2)

        try:
            print(f"[Analysis] 7/9 Running Roadmap...")
            road_data = AIService.run_roadmap(context) or {}
        except Exception as e:
            print(f"[Analysis] Roadmap notice: {e}")


        # Ensure Business Model data is high-fidelity
        if not bm_data or not bm_data.get('value_proposition'):
            from app.services.business_intelligence import generate_business_model
            bm_data = generate_business_model(context)

        def _fmt_field(val, default=''):
            if not val:
                return default
            if isinstance(val, list):
                return "\n• ".join([""] + [str(x) for x in val]).strip()
            return str(val)

        # Save Business Model
        # "AI-grounded analysis" overstated this. The model is grounded in real signals
        # for its reasoning, but the rupee figures it writes into the canvas - pricing
        # tiers, cost lines - are proposals, not researched values, and nothing else
        # says so. The label now distinguishes a suggestion from a measurement.
        bm_source = ("AI-proposed - figures illustrative, not researched"
                     if (bm_data and not bm_data.get('_is_fallback')) else "Industry benchmark estimate")
        try:
            db.add(BusinessModel(
                idea_id=idea.id,
                customer_segments=_fmt_field(bm_data.get('customer_segments') or bm_data.get('customer_segments_str'), f'Primary: Users seeking {idea.industry} solutions'),
                value_proposition=str(bm_data.get('value_proposition') or f'Solves key pain points in {idea.industry}'),
                revenue_streams=_fmt_field(bm_data.get('revenue_streams') or bm_data.get('revenue_streams_str'), f'Revenue model based on {idea.pricing_model or "Value pricing"}'),
                channels=_fmt_field(bm_data.get('channels') or bm_data.get('channels_str'), 'Digital Marketing, SEO, Social Media, Direct Sales'),
                key_partners=_fmt_field(bm_data.get('key_partners') or bm_data.get('key_partners_str'), 'Payment Processors, Cloud Providers, Industry Vendors'),
                key_activities=_fmt_field(bm_data.get('key_activities') or bm_data.get('key_activities_str'), 'Product Development, Marketing, Operations'),
                key_resources=_fmt_field(bm_data.get('key_resources') or bm_data.get('key_resources_str'), f'Founding Team, Initial Budget of ₹{budget:,.0f}'),
                cost_structure=_fmt_field(bm_data.get('cost_structure') or bm_data.get('cost_structure_str'), 'Development, Operations, Marketing, Personnel'),
                detailed_explanation=str(bm_data.get('detailed_explanation') or f'Comprehensive business strategy for {idea.title}.'),
                data_source=bm_source
            ))
            db.commit()
        except Exception as e:
            print(f"[Analysis] ERROR in Business Model save: {e}")
            db.rollback()

        # Ensure SWOT data is high-fidelity
        if not swot_data or not swot_data.get('strengths'):
            from app.services.business_intelligence import generate_swot_analysis
            swot_data = generate_swot_analysis(context)

        # Save SWOT Analysis
        swot_source = ("AI-generated from real market signals"
                       if (swot_data and not swot_data.get('_is_fallback')) else "Industry benchmark estimate")
        try:
            db.add(SwotAnalysis(
                idea_id=idea.id,
                strengths=swot_data.get('strengths') or [f'Innovative approach in {idea.industry}', f'Targeted {sector} execution'],
                weaknesses=swot_data.get('weaknesses') or ['Early stage brand awareness', 'Resource constraints'],
                opportunities=swot_data.get('opportunities') or [f'Expanding market in {idea.country}', 'Tech adoption trends'],
                threats=swot_data.get('threats') or ['Incumbent market position', 'Changing regulatory landscape'],
                overall_assessment=str(swot_data.get('overall_assessment') or f'Strong overall baseline for {idea.title}.'),
                data_source=swot_source
            ))
            db.commit()
        except Exception as e:
            print(f"[Analysis] ERROR in SWOT save: {e}")
            db.rollback()

        # ============ 7 & 8. FINANCIAL & ROADMAP INTELLIGENCE (SYNCHRONIZED IN INR) ============
        try:
            print(f"[Analysis] 7-8/9 Running Financial & Roadmap Intelligence (Synchronized in INR)...")
            from app.services.financial_intelligence import generate_financial_analysis
            from app.services.roadmap_intelligence import generate_roadmap_analysis

            fi_fin = generate_financial_analysis(context)
            rm_data = generate_roadmap_analysis(context, fi_fin)

            # Save Roadmap
            db.add(ImplementationRoadmap(
                idea_id=idea.id,
                phase_1=rm_data['phase_1'],
                phase_2=rm_data['phase_2'],
                phase_3=rm_data['phase_3'],
                phase_4=rm_data['phase_4'],
                phase_5=rm_data['phase_5'],
                timeline=str(rm_data.get('timeline') or '12 Months')
            ))
            db.commit()

            # Save Financial Analysis
            db.add(FinancialAnalysis(
                idea_id=idea.id,
                subscription_revenue=safe_float(fi_fin.get('subscription_revenue'), 0),
                freemium_conversion=safe_float(fi_fin.get('freemium_conversion'), 5.0 if sector == 'online' else 0),
                monthly_recurring_revenue=safe_float(fi_fin.get('monthly_recurring_revenue'), 50000),
                customer_acquisition_cost=safe_float(fi_fin.get('customer_acquisition_cost'), 1500),
                lifetime_value=safe_float(fi_fin.get('lifetime_value'), 6000),
                churn_rate=safe_float(fi_fin.get('churn_rate'), 4.5),
                daily_customers_estimate=safe_int(fi_fin.get('daily_customers_estimate'), 30),
                average_order_value=safe_float(fi_fin.get('average_order_value'), 500),
                monthly_revenue=safe_float(fi_fin.get('monthly_revenue'), 50000),
                rent_cost=safe_float(fi_fin.get('rent_cost'), 15000),
                staff_cost=safe_float(fi_fin.get('staff_cost'), 45000),
                raw_material_cost=safe_float(fi_fin.get('raw_material_cost'), 0),
                utility_cost=safe_float(fi_fin.get('utility_cost'), 5000),
                marketing_cost=safe_float(fi_fin.get('marketing_cost'), 15000),
                development_cost=safe_float(fi_fin.get('development_cost'), 120000),
                monthly_operating_cost=safe_float(fi_fin.get('monthly_operating_cost'), 80000),
                break_even_analysis=str(fi_fin.get('break_even_analysis') or f'Break-even estimated within 8-12 months.'),
                roi=safe_float(fi_fin.get('roi'), 145.0),
                profit_margins=safe_float(fi_fin.get('profit_margins'), 24.5),
                gross_margin_percent=safe_float(fi_fin.get('gross_margin_percent'), None),
                break_even_months=safe_int(fi_fin.get('break_even_months'), None) if fi_fin.get('break_even_months') else None,
                year1_revenue=safe_float(fi_fin.get('year1_revenue'), None),
                year2_revenue=safe_float(fi_fin.get('year2_revenue'), None),
                year3_revenue=safe_float(fi_fin.get('year3_revenue'), None),
                detailed_explanation=str(fi_fin.get('detailed_explanation') or f'Financial projections for {idea.title}.'),
                data_source="Industry Benchmark & Financial Model",
                # Provenance travels with the numbers. The engine already works all of
                # this out and it was being dropped here, so a reader had no way to tell
                # a figure anchored to NRAI or ChartMogul from one resting on an internal
                # assumption, or a ROI that was computed from one that hit its clamp.
                benchmark_source=(str((fi_fin.get('benchmark_provenance') or {}).get('source'))[:500]
                                  if (fi_fin.get('benchmark_provenance') or {}).get('source') else None),
                benchmark_confidence=(str((fi_fin.get('benchmark_provenance') or {}).get('confidence'))[:20]
                                      if (fi_fin.get('benchmark_provenance') or {}).get('confidence') else None),
                roi_basis=(str(fi_fin.get('roi_basis'))[:60] if fi_fin.get('roi_basis') else None),
                roi_was_capped=(bool(fi_fin.get('roi_was_capped'))
                                if fi_fin.get('roi_was_capped') is not None else None),
                volume_constraint=(str((fi_fin.get('volume_model') or {}).get('constraint'))[:20]
                                   if (fi_fin.get('volume_model') or {}).get('constraint') else None),
                growth_assumption_note=(str((fi_fin.get('growth_assumptions') or {}).get('basis'))[:500]
                                        if (fi_fin.get('growth_assumptions') or {}).get('basis') else None),
            ))
            db.commit()
        except Exception as e:
            print(f"[Analysis] ERROR in Financial/Roadmap save: {e}")
            db.rollback()

        # ============ 9. ML RISK, FEASIBILITY, INVESTOR READINESS (ON REAL RETRAINED MODELS) ============
        risk_data = {}
        feas_data = {}
        inv_data = {}
        try:
            print(f"[Analysis] 9/9 Running Risk & Feasibility Models (Retrained Real Data)...")
            risk_data = MLService.calculate_risk(context) or {}
            db.add(RiskAnalysis(
                idea_id=idea.id,
                technical_risk=risk_data.get('technical_risk') or {"score": 35, "severity": "Low", "explanation": "Low technical risk based on stack complexity", "mitigation_strategy": "Use proven architecture"},
                market_risk=risk_data.get('market_risk') or {"score": 40, "severity": "Medium", "explanation": "Market risk aligned with current sector trends", "mitigation_strategy": "Customer validation interviews"},
                competition_risk=risk_data.get('competition_risk') or {"score": 45, "severity": "Medium", "explanation": "Competitive intensity in geographic market", "mitigation_strategy": "Differentiation on speed and service"},
                financial_risk=risk_data.get('financial_risk') or {"score": 30, "severity": "Low", "explanation": "Initial runway adequate for validation", "mitigation_strategy": "Maintain strict unit economics"},
                operational_risk=risk_data.get('operational_risk') or {"score": 25, "severity": "Low", "explanation": "Lean operating model with minimal fixed overhead", "mitigation_strategy": "Standard operating procedures"},
                overall_risk=safe_float(risk_data.get('overall_risk'), 35.0)
            ))

            feas_data = MLService.calculate_feasibility(context) or {}
            db.add(FeasibilityAnalysis(
                idea_id=idea.id,
                market_score=safe_float(feas_data.get('market_score'), 80.0),
                technical_score=safe_float(feas_data.get('technical_score'), 85.0),
                financial_score=safe_float(feas_data.get('financial_score'), 75.0),
                innovation_score=safe_float(feas_data.get('innovation_score'), 80.0),
                overall_feasibility=safe_float(feas_data.get('overall_feasibility'), 80.0),
                explanation=str(feas_data.get('explanation') or 'Strong overall technical and market feasibility verified by model.')
            ))

            inv_data = MLService.calculate_investor_readiness(context) or {}
            db.add(InvestorReadiness(
                idea_id=idea.id,
                scalability=safe_float(inv_data.get('scalability'), 78.0),
                innovation=safe_float(inv_data.get('innovation'), 75.0),
                business_model=safe_float(inv_data.get('business_model'), 80.0),
                market=safe_float(inv_data.get('market'), 82.0),
                investor_score=safe_float(inv_data.get('investor_score'), 78.5),
                explanation=str(inv_data.get('explanation') or 'Investor readiness grounded in market demand and unit margins.'),
                # Always a list. When the AI path supplies this it is sometimes a single
                # string, and the column is JSON, so the string was stored as-is and the
                # Risk tab crashed on .map - every row currently in the database is that
                # shape. Normalising at the point of write stops new rows repeating it.
                suggestions=_as_suggestion_list(inv_data.get('suggestions'))
            ))
            db.commit()
        except Exception as e:
            print(f"[Analysis] ERROR in Risk & Feasibility: {e}")
            db.rollback()

        # Dynamic overall score calculation based on genuine outputs
        try:
            s_record = db.query(StartupAnalysis).filter(StartupAnalysis.idea_id == idea.id).first()
            m_record = db.query(MarketAnalysis).filter(MarketAnalysis.idea_id == idea.id).first()
            if s_record:
                feasibility_score = safe_float(feas_data.get('overall_feasibility'), 78.0)
                # When opportunity_score is None, use neutral default (75.0) ONLY inside composite calculation so stored field stays None
                opp_score_for_calc = float(m_record.opportunity_score) if (m_record and m_record.opportunity_score is not None) else 75.0
                market_fit_score = safe_float(opp_score_for_calc, 75.0)
                risk_score = safe_float(risk_data.get('overall_risk'), 38.0)
                inv_score = safe_float(inv_data.get('investor_score'), 76.0)

                s_record.overall_score = round(
                    (feasibility_score * 0.3) + 
                    (market_fit_score * 0.3) + 
                    (inv_score * 0.25) + 
                    (max(0, 100 - risk_score) * 0.15), 
                    1
                )
                db.commit()
        except Exception as e:
            print(f"[Analysis] Score calculation update notice: {e}")

        # Mark analysis as COMPLETED
        idea.analysis_status = 'completed'
        db.commit()
        print(f"[Analysis] COMPLETED SUCCESS for idea: '{idea.title}' ({idea.id})")
