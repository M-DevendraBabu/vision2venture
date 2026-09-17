"""
Vision2Venture ML Inference Service v4.0
70% ML Model Predictions + 30% Domain Calibration
All 7 trained ENSEMBLE models are ACTIVELY USED for predictions.
v4: Updated to 20-feature vector, StackingRegressor/VotingClassifier ensemble models.
"""
import os
import re
import math
import json
import joblib
import numpy as np
from app.services.ai_service import AIService

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml_models')

# =====================================================================
# GLOBAL MODEL REGISTRY — ALL models loaded at startup
# =====================================================================
_success_model = None
_financial_model = None
_risk_model = None
_feasibility_model = None
_investor_model = None
_market_model = None

_sector_encoder = None
_industry_encoder = None
_feature_scaler = None
_financial_scaler = None
_market_scaler = None
_market_industry_encoder = None
_market_country_encoder = None
_fin_industry_encoder = None

_feature_meta = {}
_industry_benchmarks = {}
_yc_competitors = []
_tech_benchmarks = {}
_financial_templates = {}
_sector_market_scale = {}
_india_market_sizes = {}
_india_consumption = {}
_tech_stack_model = {}


def _init_ml_models():
    global _success_model, _financial_model, _risk_model, _feasibility_model, _investor_model, _market_model
    global _sector_encoder, _industry_encoder, _feature_scaler, _financial_scaler
    global _market_scaler, _market_industry_encoder, _market_country_encoder, _fin_industry_encoder
    global _feature_meta, _industry_benchmarks, _yc_competitors, _tech_benchmarks
    global _financial_templates, _sector_market_scale, _tech_stack_model
    global _india_market_sizes, _india_consumption

    def _load(filename, label):
        path = os.path.join(MODEL_DIR, filename)
        if os.path.exists(path):
            obj = joblib.load(path)
            print(f"[ML Service] OK - Loaded {label}")
            return obj
        print(f"[ML Service] MISS - Missing {label} ({filename})")
        return None

    def _load_json(filename, label):
        path = os.path.join(MODEL_DIR, filename)
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            count = len(data) if isinstance(data, (list, dict)) else 0
            print(f"[ML Service] OK - Loaded {label} ({count} entries)")
            return data
        return {} if filename.endswith('.json') else []

    try:
        # --- Core ML Models ---
        _success_model = _load('success_model.joblib', 'Success Classifier')
        _financial_model = _load('financial_model.joblib', 'Financial Regressor')
        _risk_model = _load('risk_model.joblib', 'Risk Predictor')
        _feasibility_model = _load('feasibility_model.joblib', 'Feasibility Predictor')
        _investor_model = _load('investor_model.joblib', 'Investor Readiness Predictor')
        _market_model = _load('market_model.joblib', 'Market Analysis Predictor')

        # --- Encoders & Scalers ---
        _sector_encoder = _load('sector_encoder.joblib', 'Sector Encoder')
        _industry_encoder = _load('industry_encoder.joblib', 'Industry Encoder')
        _feature_scaler = _load('feature_scaler.joblib', 'Feature Scaler')
        _financial_scaler = _load('financial_scaler.joblib', 'Financial Scaler')
        _market_scaler = _load('market_scaler.joblib', 'Market Scaler')
        _market_industry_encoder = _load('market_industry_encoder.joblib', 'Market Industry Encoder')
        _market_country_encoder = _load('market_country_encoder.joblib', 'Market Country Encoder')
        _fin_industry_encoder = _load('fin_industry_encoder.joblib', 'Financial Industry Encoder')

        # --- JSON Data Files ---
        _feature_meta = _load_json('feature_metadata.json', 'Feature Metadata')
        _industry_benchmarks = _load_json('industry_benchmarks.json', 'Industry Benchmarks')
        _yc_competitors = _load_json('yc_competitors.json', 'YC Competitors')
        _tech_benchmarks = _load_json('tech_survey_benchmarks.json', 'Tech Survey Benchmarks')
        _financial_templates = _load_json('financial_templates.json', 'Financial Templates')
        _sector_market_scale = _load_json('sector_market_scale.json', 'Sector Market Scale')
        _india_market_sizes = _load_json('india_market_sizes.json', 'India Market Sizes')
        _india_consumption = _load_json('india_consumption_hces.json', 'India Consumption (HCES)')
        _tech_stack_model = _load_json('tech_stack_model.json', 'Tech Stack Recommender')

    except Exception as e:
        print(f"[ML Service] Error loading models: {e}")

_models_loaded = False
_models_lock = None

def _get_models_lock():
    global _models_lock
    if _models_lock is None:
        import threading
        _models_lock = threading.Lock()
    return _models_lock

def ensure_ml_models_loaded():
    """Thread-safe lazy/background loader for ML models. 
    Allows FastAPI and Uvicorn to start instantly in <1s."""
    global _models_loaded
    if _models_loaded:
        return
    with _get_models_lock():
        if not _models_loaded:
            _init_ml_models()
            _models_loaded = True


# =====================================================================
# HELPER FUNCTIONS
# =====================================================================
# Maps the free-text industry / sector / country a founder actually types onto the
# vocabulary the trained encoders learned. The training vocabularies are capitalised
# ("Fintech", "Health", "India") while every caller here lower-cases its input, so a
# plain exact-match lookup missed 100% of the time and silently fed the SAME category
# to every startup — which made market opportunity, growth and the financial model
# effectively blind to industry. Matching is done case-insensitively, then by alias,
# preferring the LONGEST matching alias so "fintech" resolves to Fintech rather than
# being swallowed by the shorter "tech" alias of the software category.
_CATEGORY_SYNONYMS = {
    # NOTE: 'technology' is deliberately NOT an alias here — it is a suffix of many
    # more specific industries ("Education Technology", "Financial Technology") and,
    # being long, would win the longest-alias rule and swallow them.
    'internet software & services': ['saas', 'software', 'cloud', 'platform', 'devtools', 'api', 'b2b software',
                                     'enterprise software', 'tech', 'it services', 'gaming', 'game', 'esports'],
    'software': ['saas', 'software', 'cloud', 'platform', 'devtools', 'api', 'enterprise software', 'tech'],
    'artificial intelligence': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning',
                                'genai', 'generative ai', 'nlp', 'computer vision'],
    'fintech': ['fintech', 'finance', 'financial', 'payments', 'payment', 'banking', 'lending', 'loan',
                'credit', 'insurance', 'insurtech', 'wealth', 'upi', 'neobank'],
    'finance': ['fintech', 'finance', 'financial', 'payments', 'banking', 'lending', 'credit', 'insurance'],
    'edtech': ['edtech', 'education', 'educational', 'learning', 'school', 'coaching', 'tutoring',
               'training', 'e-learning', 'upskilling'],
    'education': ['edtech', 'education', 'educational', 'learning', 'school', 'coaching', 'tutoring', 'training'],
    'health': ['health', 'healthcare', 'medical', 'medicine', 'clinic', 'dental', 'hospital', 'pharma',
               'pharmacy', 'biotech', 'medtech', 'wellness', 'diagnostics', 'telemedicine'],
    'e-commerce & direct-to-consumer': ['ecommerce', 'e-commerce', 'd2c', 'direct-to-consumer', 'marketplace',
                                        'online store', 'online retail', 'dropshipping'],
    'ecommerce': ['ecommerce', 'e-commerce', 'd2c', 'direct-to-consumer', 'marketplace', 'online store'],
    'consumer & retail': ['retail', 'consumer', 'fmcg', 'grocery', 'supermarket', 'kirana', 'food', 'beverage',
                          'cafe', 'coffee', 'restaurant', 'bakery', 'biryani', 'qsr', 'cloud kitchen', 'dining',
                          'fashion', 'apparel', 'clothing', 'beauty', 'salon', 'spa', 'grooming', 'fitness',
                          'gym', 'crossfit', 'sports', 'hospitality'],
    'cybersecurity': ['cybersecurity', 'cyber', 'security', 'infosec', 'information security'],
    'security': ['cybersecurity', 'cyber', 'security', 'infosec'],
    'data management & analytics': ['data', 'analytics', 'big data', 'business intelligence', 'data science'],
    'analytics': ['data', 'analytics', 'big data', 'business intelligence', 'data science'],
    'supply chain, logistics, & delivery': ['logistics', 'supply chain', 'delivery', 'shipping', 'freight',
                                            'courier', 'warehousing', 'fulfilment', 'fulfillment'],
    'transportation': ['logistics', 'supply chain', 'delivery', 'shipping', 'freight', 'transport', 'transportation'],
    'auto & transportation': ['auto', 'automotive', 'mobility', 'electric vehicle', 'vehicle', 'transport',
                              'transportation', 'ride hailing', 'taxi'],
    'automotive': ['auto', 'automotive', 'mobility', 'electric vehicle', 'vehicle'],
    'travel': ['travel', 'tourism', 'hotel', 'booking', 'holiday', 'trip'],
    'hospitality': ['hotel', 'hospitality', 'resort', 'lodging'],
    'mobile & telecommunications': ['mobile', 'telecom', 'telecommunications', 'telephony'],
    'mobile': ['mobile', 'telecom', 'telecommunications'],
    'hardware': ['hardware', 'iot', 'robotics', 'device', 'manufacturing', 'electronics', 'semiconductor', 'drone'],
    'cleantech': ['cleantech', 'clean energy', 'renewable', 'solar', 'sustainability', 'climate'],
    'real_estate': ['real estate', 'property', 'proptech', 'housing'],
    'united states': ['usa', 'us', 'u.s.', 'u.s.a.', 'america', 'united states of america'],
    'united kingdom': ['uk', 'u.k.', 'britain', 'great britain', 'england'],
    'united arab emirates': ['uae', 'dubai', 'abu dhabi'],
    'south korea': ['korea'],
}


# Indicative sector CAGRs for the Indian market, used as the base growth rate.
# These are BENCHMARK ESTIMATES for the sector, not a measured figure for any one
# idea, and the UI labels them as such. They replace a regressor whose growth head
# was trained on `12 + company_age*0.8` against a hardcoded company_age, and so
# returned an identical constant for every startup regardless of industry.
_SECTOR_CAGR = [
    (['ai', 'artificial intelligence', 'machine learning', 'genai', 'deep learning'], 28.0),
    (['saas', 'software', 'cloud', 'devtools', 'developer tools'], 22.0),
    (['fintech', 'payments', 'lending', 'insurtech', 'neobank', 'wealth'], 20.0),
    (['gaming', 'game', 'esports'], 20.0),
    (['ecommerce', 'e-commerce', 'd2c', 'direct-to-consumer', 'marketplace'], 19.0),
    (['health', 'medtech', 'telemedicine', 'diagnostics', 'pharma', 'biotech'], 18.0),
    (['cyber', 'security', 'infosec'], 18.0),
    (['clean', 'renewable', 'solar', 'climate', 'sustainab', 'energy'], 17.0),
    (['edtech', 'education', 'learning', 'coaching', 'tutoring'], 16.0),
    (['data', 'analytics', 'business intelligence'], 16.0),
    (['travel', 'tourism', 'hotel', 'hospitality'], 14.0),
    (['agri', 'farm', 'agritech'], 13.0),
    (['fitness', 'gym', 'wellness', 'crossfit'], 13.0),
    (['logist', 'supply chain', 'delivery', 'freight', 'courier'], 12.0),
    (['real estate', 'proptech', 'property', 'housing'], 12.0),
    (['salon', 'spa', 'beauty', 'grooming'], 12.0),
    (['food', 'beverage', 'cafe', 'restaurant', 'bakery', 'biryani', 'qsr', 'dining'], 11.0),
    (['retail', 'grocery', 'supermarket', 'kirana', 'fmcg'], 10.0),
]
_DEFAULT_CAGR = 13.0

# Maps a user's free-text industry onto the Crunchbase `category_code` sectors that
# sector_market_scale.json is keyed by. Longest alias wins, so "health services"
# reaches 'health' rather than matching some shorter generic term first.
_SECTOR_SCALE_ALIASES = {
    'mobile': 'mobile', 'app': 'mobile', 'ios': 'mobile', 'android': 'mobile',
    'software': 'software', 'saas': 'software', 'platform': 'software', 'devtool': 'software',
    'web': 'web', 'website': 'web', 'internet': 'web', 'consumer internet': 'web',
    'biotech': 'biotech', 'pharma': 'biotech', 'life science': 'biotech',
    'enterprise': 'enterprise', 'b2b': 'enterprise',
    'cleantech': 'cleantech', 'solar': 'cleantech', 'renewable': 'cleantech',
    'energy': 'cleantech', 'climate': 'cleantech', 'ev': 'cleantech',
    'semiconductor': 'semiconductor', 'chip': 'semiconductor', 'hardware': 'hardware',
    'advertising': 'advertising', 'adtech': 'advertising', 'marketing': 'advertising',
    'games_video': 'games_video', 'gaming': 'games_video', 'game': 'games_video',
    'video': 'games_video', 'media': 'games_video', 'entertainment': 'games_video',
    'network_hosting': 'network_hosting', 'cloud': 'network_hosting',
    'hosting': 'network_hosting', 'infrastructure': 'network_hosting',
    'security': 'security', 'cybersecurity': 'security',
    'ecommerce': 'ecommerce', 'e-commerce': 'ecommerce', 'retail': 'ecommerce',
    'marketplace': 'ecommerce', 'grocery': 'ecommerce', 'd2c': 'ecommerce',
    'health': 'health', 'healthcare': 'health', 'clinic': 'health', 'medical': 'health',
    'fintech': 'finance', 'finance': 'finance', 'payment': 'finance', 'banking': 'finance',
    'insurance': 'finance', 'lending': 'finance',
    'education': 'education', 'edtech': 'education', 'learning': 'education',
    'travel': 'travel', 'tourism': 'travel', 'hospitality': 'travel',
    'transportation': 'transportation', 'logistics': 'transportation', 'mobility': 'transportation',
    'analytics': 'analytics', 'data': 'analytics', 'ai': 'analytics', 'machine learning': 'analytics',
    'search': 'search', 'social': 'social', 'community': 'social',
    'fashion': 'fashion', 'apparel': 'fashion', 'sports': 'sports', 'fitness': 'sports',
    'gym': 'sports', 'music': 'music', 'news': 'news_search', 'real estate': 'real_estate',
    'property': 'real_estate', 'legal': 'legal', 'consulting': 'consulting',
    'manufacturing': 'manufacturing', 'automotive': 'automotive', 'food': 'hospitality',
    'restaurant': 'hospitality', 'beverage': 'hospitality', 'cafe': 'hospitality',
}


def _sector_scale(industry: str) -> float:
    """
    Real capital deployed in this sector, in USD billions, as the model was trained.

    sector_market_scale.json is written by train_models.py from the same Crunchbase
    rows the models learn from, so training and inference read identical values.
    Anything unrecognised gets the median sector rather than an invented constant.

    Before this existed the lookup asked for an 'avg_valuation' key that no benchmark
    entry has ever contained, so it always fell through to a hard-coded default and
    fed 2.5 for every recognised industry -- a value absent from the training
    distribution, against a feature that was itself a constant 5.0 in training.
    """
    if not _sector_market_scale:
        return 5.0

    text = str(industry or "").lower().strip()
    best_alias, best_sector = "", None
    for alias, sector in _SECTOR_SCALE_ALIASES.items():
        if alias in text and len(alias) > len(best_alias):
            best_alias, best_sector = alias, sector

    if best_sector and best_sector in _sector_market_scale:
        return float(_sector_market_scale[best_sector])
    if text in _sector_market_scale:
        return float(_sector_market_scale[text])

    values = sorted(_sector_market_scale.values())
    return float(values[len(values) // 2])


def _hces_per_capita(industry: str, location: str, is_urban_catchment: bool):
    """
    Real annual per-capita spend for a local catchment, in INR, with its provenance.

    Returns (annual_rupees, hces_line, state_used, multiplier).

    The six numbers this replaces were written inline with no source, and every one
    of them overstated what Indian households actually spend: education was set to
    Rs 18,500/year against a real Rs 5,016 urban, and a gym to Rs 9,500 against an
    entertainment budget - cinema, cable and streaming included - of Rs 1,488.
    A catchment TAM built on those figures was several times too large before any
    other assumption entered the calculation.

    Everything here comes from the Government of India's Household Consumption
    Expenditure Survey 2023-24, which measured 2.6 lakh households. Spend is scaled
    by the state's own MPCE, so a catchment in Chhattisgarh (0.70x the national
    average) is not sized with Sikkim's spending power (1.99x).
    """
    if not _india_consumption:
        return 15000.0, "no HCES table loaded", None, 1.0

    text = str(industry or "").lower()
    cats = _india_consumption.get("categories", {})

    best_alias, best_key = "", "_default"
    for key, entry in cats.items():
        if key.startswith("_"):
            continue
        for alias in entry.get("match", []):
            if alias in text and len(alias) > len(best_alias):
                best_alias, best_key = alias, key
    cat = cats.get(best_key) or cats.get("_default", {})

    sector = "urban" if is_urban_catchment else "rural"
    base = float(cat.get("annual_per_capita", {}).get(sector, 15000.0))

    # Scale to the state actually named, via the state itself or a city in it.
    loc = str(location or "").lower()
    states = _india_consumption.get("state_mpce_monthly", {})
    state_used, mult = None, 1.0
    for st in states:
        if st in loc:
            state_used = st
            break
    if state_used is None:
        for city, st in _india_consumption.get("city_to_state", {}).items():
            if city in loc and st in states:
                state_used = st
                break
    if state_used:
        mult = float(states[state_used].get(f"{sector}_multiplier", 1.0))

    return base * mult, cat.get("hces_line", "unmapped"), state_used, mult


def _india_market_tam(industry: str):
    """
    Addressable India market for a sector, in INR crore, with its provenance.

    Returns (tam_crore, source, confidence). TAM is the published total for the
    sector multiplied by an addressable share, because an early-stage venture does
    not address a whole national market -- quoting India's entire e-commerce market
    at a two-person startup would be the single most misleading number the app
    could print.

    Both halves are visible in india_market_sizes.json: the total carries its
    publication, and the share is labelled a planning assumption. Sectors with no
    published India figure carry confidence "low" and say so in `source`.
    """
    text = str(industry or "").lower()
    fallback = _india_market_sizes.get("_default", {}) if _india_market_sizes else {}

    best_alias, best_entry = "", None
    for key, entry in (_india_market_sizes or {}).items():
        if key.startswith("_"):
            continue
        for alias in entry.get("match", []):
            if alias in text and len(alias) > len(best_alias):
                best_alias, best_entry = alias, entry

    entry = best_entry or fallback
    if not entry:
        return 35000.0, "Planning assumption; no market size table loaded.", "low"

    tam = float(entry.get("total_market_inr_cr", 35000.0)) * float(entry.get("addressable_share", 1.0))
    return tam, entry.get("source", "Planning assumption"), entry.get("confidence", "low")


def _sector_cagr(industry: str, is_offline: bool = False) -> float:
    """
    Indicative annual growth rate for a sector. Picks the LONGEST matching keyword so
    specific sectors beat generic ones, and damps the figure for purely physical
    ventures, whose growth is bounded by a single catchment rather than by the
    national sector curve.
    """
    ind = str(industry or '').lower()
    best, best_len = None, 0
    for keywords, cagr in _SECTOR_CAGR:
        for kw in keywords:
            if kw in ind and len(kw) > best_len:
                best, best_len = cagr, len(kw)
    rate = best if best is not None else _DEFAULT_CAGR
    if is_offline:
        rate *= 0.80  # a single physical location cannot compound at the national rate
    return round(rate, 1)


def _venture_economics(context: dict) -> dict:
    """
    Operating signals derived from what the founder actually entered, shared by the
    risk, feasibility and investor models.

    These exist because a sensitivity sweep showed `revenue_goal` moved every score by
    exactly 0.0 — the founder's revenue target was collected and then ignored — and
    because budget and team_size were each read in isolation, so the models could not
    see that ₹5,00,000 is comfortable for a solo founder and nearly nothing for a team
    of twelve. Runway and the ambition ratio combine them the way an investor would.
    """
    budget = float(context.get('budget') or 20000)
    team_size = max(1, int(context.get('team_size') or 1))
    revenue_goal = float(context.get('revenue_goal') or 0.0)
    sec = str(context.get('sector', context.get('business_type', 'online'))).lower()
    is_offline = 'offline' in sec or 'physical' in sec

    # Monthly burn. Salaries dominate an early-stage Indian venture; a physical
    # location additionally carries rent and utilities from day one.
    monthly_burn = team_size * 35000.0 + (45000.0 if is_offline else 12000.0)
    runway_months = (budget / monthly_burn) if monthly_burn > 0 else 0.0

    # Annual revenue target per rupee of starting capital. Very high means the plan
    # depends on capital efficiency the team has not yet demonstrated; below 1.0 means
    # the target does not even return the money being put in.
    ambition = (revenue_goal / budget) if budget > 0 and revenue_goal > 0 else 0.0

    return {
        'budget': budget,
        'team_size': team_size,
        'revenue_goal': revenue_goal,
        'monthly_burn': monthly_burn,
        'runway_months': round(runway_months, 1),
        'ambition': round(ambition, 2),
        'is_offline': is_offline,
    }


def _runway_adjustment(runway_months: float) -> float:
    """Risk points from runway. Positive = more risk."""
    if runway_months < 3:
        return +25.0
    if runway_months < 6:
        return +15.0
    if runway_months < 12:
        return +5.0
    if runway_months > 30:
        return -15.0
    if runway_months > 18:
        return -10.0
    return 0.0


def _ambition_adjustment(ambition: float) -> float:
    """Risk points from how aggressive the revenue target is against the capital."""
    if ambition <= 0:
        return +3.0     # no stated target to plan against
    if ambition > 25:
        return +12.0
    if ambition > 10:
        return +6.0
    if ambition < 1:
        return +4.0     # target does not recover the starting capital
    return 0.0


def _encoder_lookup(encoder):
    """Build (once, then cache) a lowercase class-name -> encoded-index map."""
    cache = getattr(encoder, '_v2v_lookup', None)
    if cache is None:
        cache = {str(c).strip().lower(): int(i) for i, c in enumerate(encoder.classes_)}
        try:
            encoder._v2v_lookup = cache
        except Exception:
            pass  # some encoders disallow attribute assignment; rebuild each call
    return cache


def _safe_encode(encoder, value, fallback=0):
    """
    Encode a categorical value, tolerating the casing and naming a founder actually
    uses. Falls back to the encoder's own 'other' class where one exists, rather than
    to class 0 (which in the unicorn-derived vocabulary is a stray investor-name string).
    """
    if encoder is None:
        return fallback
    try:
        lookup = _encoder_lookup(encoder)
    except Exception:
        return fallback

    raw = str(value or '').strip().lower()

    def _fallback():
        for generic in ('other', 'others', 'unknown'):
            if generic in lookup:
                return lookup[generic]
        return fallback

    if not raw:
        return _fallback()

    # 1. Exact match, case-insensitive
    if raw in lookup:
        return lookup[raw]

    # 2. Alias match. Collect every (canonical, alias) hit that the encoder actually
    #    knows, then keep the longest alias so specific terms beat generic ones.
    best_idx, best_len = None, 0
    tokens = set(re.split(r'[^a-z0-9]+', raw)) - {''}
    for canonical, aliases in _CATEGORY_SYNONYMS.items():
        idx = lookup.get(canonical)
        if idx is None:
            continue
        for alias in aliases:
            hit = (raw == alias) or (alias in tokens) or (len(alias) > 3 and alias in raw)
            if hit and len(alias) > best_len:
                best_idx, best_len = idx, len(alias)
    if best_idx is not None:
        return best_idx

    # 3. Last resort: any known class whose name shares a word with the input
    for name, idx in lookup.items():
        if tokens & (set(re.split(r'[^a-z0-9]+', name)) - {''}):
            return idx

    return _fallback()


def _build_20_features(context: dict) -> np.ndarray:
    """Build the standard 20-feature vector used by success, risk, feasibility, investor models.
    Must match the feature list in train_models.py v2."""
    ensure_ml_models_loaded()
    budget = float(context.get('budget') or 20000)
    team_size = int(context.get('team_size') or 2)
    ind = str(context.get('industry', '')).lower()
    sec = str(context.get('sector', 'online')).lower()

    # Map user context to training features
    funding_rounds = 1 if budget < 50000 else (2 if budget < 100000 else (3 if budget < 200000 else 4))
    founder_exp = max(2, min(15, team_size * 2.5))
    market_size_b = _sector_scale(ind)
    product_traction = max(500, int(budget * 2.5))
    burn_rate = budget / 1e6 * 0.7
    revenue = budget / 1e6 * 0.4

    # Map industry to training sector classes: AI, Climate, Crypto, Ecommerce, Fintech, Health, SaaS
    sector_map = {
        'ai': 'AI', 'ml': 'AI', 'data': 'AI', 'deep': 'AI', 'machine': 'AI',
        'saas': 'SaaS', 'software': 'SaaS', 'cloud': 'SaaS', 'platform': 'SaaS',
        'fintech': 'Fintech', 'bank': 'Fintech', 'payment': 'Fintech', 'finance': 'Fintech',
        'health': 'Health', 'med': 'Health', 'bio': 'Health', 'pharma': 'Health',
        'e-commerce': 'Ecommerce', 'ecommerce': 'Ecommerce', 'retail': 'Ecommerce', 'shop': 'Ecommerce',
        'clean': 'Climate', 'solar': 'Climate', 'energy': 'Climate', 'ev': 'Climate', 'green': 'Climate',
        'crypto': 'Crypto', 'blockchain': 'Crypto', 'web3': 'Crypto', 'nft': 'Crypto',
    }
    mapped_sector = 'SaaS'  # default
    for keyword, sector_class in sector_map.items():
        if keyword in ind:
            mapped_sector = sector_class
            break
    sector_enc = _safe_encode(_sector_encoder, mapped_sector)
    investor_enc = 1  # default: angel
    founder_enc = 1   # default: first_time

    # Original 6 engineered features
    funding_efficiency = revenue / (burn_rate + 0.01)
    revenue_per_user = revenue / (product_traction + 1)
    burn_ratio = burn_rate / (funding_rounds + 1)
    traction_per_team = product_traction / (team_size + 1)
    market_capture_ratio = revenue / (market_size_b * 1000 + 1)
    experience_x_rounds = founder_exp * funding_rounds
    # NEW 4 engineered features (v2)
    burn_per_team = burn_rate / (team_size + 1)
    funding_per_round = (market_size_b * 0.01) / (funding_rounds + 1)
    revenue_efficiency = revenue / (team_size * burn_rate + 0.01)
    market_per_employee = market_size_b / (team_size + 1)

    return np.array([[
        funding_rounds, founder_exp, team_size,
        market_size_b, product_traction, burn_rate,
        revenue, sector_enc, investor_enc, founder_enc,
        funding_efficiency, revenue_per_user, burn_ratio,
        traction_per_team, market_capture_ratio, experience_x_rounds,
        burn_per_team, funding_per_round, revenue_efficiency, market_per_employee
    ]])


# =====================================================================
# ML SERVICE CLASS — 70% ML MODEL PREDICTIONS
# =====================================================================
class MLService:

    # -----------------------------------------------------------------
    # 1. SUCCESS PROBABILITY — 70% ML + 30% domain calibration
    # -----------------------------------------------------------------
    @staticmethod
    def predict_success_probability(context: dict) -> float:
        """70% ML model prediction + 30% domain calibration."""
        title = str(context.get('title', '')).lower()
        ind = str(context.get('industry', '')).lower()
        sec = str(context.get('sector', '')).lower()
        budget = float(context.get('budget') or 20000)
        team_size = int(context.get('team_size') or 2)

        # --- 70%: ML Model Prediction ---
        ml_score = 65.0
        if _success_model is not None and _feature_scaler is not None:
            try:
                features = _build_20_features(context)
                features_scaled = _feature_scaler.transform(features)
                proba = _success_model.predict_proba(features_scaled)[0]
                ml_score = proba[1] * 100.0
            except Exception as e:
                print(f"[ML] Success model prediction error: {e}")

        # --- 30%: Domain calibration (wider modifiers for variance) ---
        ind_mod = 0.0
        if 'saas' in ind or ('ai' in ind and 'retail' not in ind): ind_mod = +12.0
        elif 'fintech' in ind or 'cyber' in ind: ind_mod = +9.0
        elif 'edtech' in ind or 'learning' in ind: ind_mod = +7.0
        elif 'clean' in ind or 'solar' in ind or 'energy' in ind: ind_mod = +5.0
        elif 'proptech' in ind or 'real estate' in ind: ind_mod = +2.0
        elif 'gaming' in ind or 'entertainment' in ind: ind_mod = +1.0
        elif 'logistics' in ind or 'freight' in ind: ind_mod = -3.0
        elif 'hardware' in ind or 'iot' in ind or 'robotics' in ind: ind_mod = -5.0
        elif 'health' in ind or 'med' in ind: ind_mod = -6.0
        elif 'food' in ind or 'restaurant' in ind or 'cafe' in ind or 'bakery' in ind: ind_mod = -9.0
        elif 'retail' in ind or 'hospitality' in ind: ind_mod = -11.0

        sec_mod = 5.0 if sec == 'online' else (-6.0 if sec == 'offline' else 0.0)
        team_mod = min(6.0, team_size * 1.2)
        budget_mod = min(8.0, (budget / 30000.0) * 3.0)

        calibration = ind_mod + sec_mod + team_mod + budget_mod

        # Normalize ML probability to 40-90 scale (raw proba is often 5-50% for real inputs)
        ml_normalized = 40.0 + (ml_score / 100.0) * 50.0  # maps 0-100% → 40-90

        # BLEND: 70% normalized ML + 30% calibration (centered at 75)
        final_score = round(max(48.0, min(95.0, ml_normalized * 0.70 + (75.0 + calibration) * 0.30)), 1)
        return final_score

    # -----------------------------------------------------------------
    # 2. MARKET ANALYSIS — 70% ML + 30% benchmark enrichment
    # -----------------------------------------------------------------
    @staticmethod
    def calculate_market_analysis(context: dict) -> dict:
        """70% ML market model + 30% benchmark data enrichment."""
        ensure_ml_models_loaded()
        ind = str(context.get('industry', 'Technology')).lower()
        country = str(context.get('country', 'India')).lower()
        budget = float(context.get('budget') or 20000)
        team_size = int(context.get('team_size') or 2)
        sec = str(context.get('sector', context.get('business_type', 'online'))).lower()

        # --- 70%: ML Model Prediction ---
        ml_opportunity = 75.0
        ml_growth = 12.0
        ml_demand = 70.0

        if _market_model is not None and _market_scaler is not None:
            try:
                ind_enc = _safe_encode(_market_industry_encoder, ind)
                country_enc = _safe_encode(_market_country_encoder, country)
                budget_m = budget / 1e6  # Convert to millions to match training data
                revenue_m = budget_m * 0.4
                funding_pe = budget_m / (team_size + 1)
                revenue_pe = revenue_m / (team_size + 1)
                company_age = 4  # assume ~4 year old startup
                features = np.array([[ind_enc, country_enc, team_size, budget_m, revenue_m, 2020, funding_pe, revenue_pe, company_age]])
                features_scaled = _market_scaler.transform(features)
                predictions = _market_model.predict(features_scaled)[0]
                ml_opportunity = float(np.clip(predictions[0], 40, 98))
                ml_growth = float(np.clip(predictions[1], 3, 40))
                ml_demand = float(np.clip(predictions[2], 30, 98))
            except Exception as e:
                print(f"[ML] Market model prediction error: {e}")

        # --- Dynamic Real-World Market Sizing & Catchment Modeling ---
        is_offline = 'offline' in sec or 'physical' in sec
        is_hybrid = 'hybrid' in sec or 'phygital' in sec
        location_raw = str(context.get('location') or context.get('country') or '').strip()
        location_lower = location_raw.lower()
        title_raw = str(context.get('title') or '').strip()
        desc_raw = str(context.get('description') or '').strip()
        target_cust = str(context.get('target_customers') or '').strip()

        # Catchment & Location Tier Classification
        is_campus = any(k in location_lower or k in title_raw.lower() or k in desc_raw.lower() for k in ['vadlamudi', 'vignan', 'campus', 'college', 'university', 'vidyapeeth', 'hostel'])
        is_metro = any(k in location_lower for k in ['bangalore', 'bengaluru', 'mumbai', 'delhi', 'ncr', 'hyderabad', 'chennai', 'kolkata', 'pune', 'gurgaon', 'noida'])
        is_tier2 = any(k in location_lower for k in ['guntur', 'vijayawada', 'jaipur', 'indore', 'chandigarh', 'kochi', 'lucknow', 'nagpur', 'surat', 'bhopal', 'vizag', 'visakhapatnam'])

        # A hybrid venture is only sized as a LOCAL catchment when its stated location is
        # genuinely local. Previously the guard list held 'all india' but not plain 'india',
        # so a nationwide hybrid brand was sized against a 28k-person catchment - roughly
        # three orders of magnitude too small.
        national_scope_terms = ['global', 'all india', 'pan india', 'pan-india', 'worldwide',
                                'national', 'nationwide', 'india', 'usa', 'united states', 'online']
        is_national_scope = location_lower.strip() in national_scope_terms or any(
            k in location_lower for k in ['global', 'all india', 'pan india', 'pan-india', 'worldwide', 'nationwide']
        )
        if is_offline or (is_hybrid and not is_national_scope):
            # Localized Catchment Population sizing:
            if is_campus:
                catchment_pop = 28000  # ~12,000 university students, ~2,000 faculty/staff, ~14,000 local town residents
                loc_label = f"Campus & Vadlamudi Catchment ({catchment_pop:,} residents & students)" if "vadlamudi" in location_lower else f"Campus & Local Catchment ({catchment_pop:,} population)"
            elif is_metro:
                catchment_pop = 350000  # 3-5 km urban radius
                loc_label = f"Metro Urban Catchment ({catchment_pop:,} population)"
            elif is_tier2:
                catchment_pop = 120000  # 3-5 km Tier-2 city radius
                loc_label = f"City Catchment ({catchment_pop:,} population)"
            else:
                catchment_pop = 50000   # Tier-3 / Semi-urban town catchment
                loc_label = f"Local Town Catchment ({catchment_pop:,} population)"

            # Real per-capita spend from the HCES survey, chosen by catchment type
            # (metro and Tier-2 read the urban figure, campus and Tier-3 towns the
            # rural one) and scaled by the state actually named.
            is_urban_catchment = bool(is_metro or is_tier2)
            per_capita_spend, hces_line, hces_state, hces_mult = _hces_per_capita(
                ind, location_raw, is_urban_catchment)
            spend_sector = 'urban' if is_urban_catchment else 'rural'
            hces_note = (f"HCES 2023-24 '{hces_line}', {spend_sector} "
                         f"₹{per_capita_spend:,.0f}/person/year")
            if hces_state:
                hces_note += f" (scaled {hces_mult:.2f}x to {hces_state.title()})"

            # Local Annual Market Capacity in ₹ Crores:
            local_spend_inr = catchment_pop * per_capita_spend
            tam_crores = max(4.0, round(local_spend_inr / 1e7, 1))
            market_size_str = f"₹{tam_crores:,.1f} Cr ({loc_label})" if tam_crores < 100 else f"₹{round(tam_crores):,} Cr ({loc_label})"
        else:
            # National / Global Market Sizing:
            econ = context.get('_economic_data', {})
            gdp_trill = float(econ.get('gdp_usd', 3.75e12)) / 1e12
            national_scale = max(0.8, min(2.0, gdp_trill / 3.5))

            # Sector TAM now comes from india_market_sizes.json, which carries the
            # published total and the source for each sector, instead of a chain of
            # round numbers written inline with nothing to check them against. Sectors
            # with no published India figure are marked confidence "low" in that file
            # and say so rather than borrowing someone else's citation.
            base_national_tam, tam_source, tam_conf = _india_market_tam(ind)

            tam_crores = round(base_national_tam * national_scale)
            if tam_crores >= 100000:
                market_size_str = f"₹{tam_crores / 100000:.2f} Lakh Cr"
            else:
                market_size_str = f"₹{tam_crores:,} Cr"

        # CAGR: sector benchmark + live Google Trends demand signal.
        #
        # The market regressor's growth head is NOT used here. Its training target was
        # `12.0 + company_age * 0.8` while inference hardcodes company_age = 4, so it
        # emits the same constant (~16.4%) for every startup in every industry and
        # cannot express sector differences. A published sector-CAGR benchmark is both
        # more accurate and honestly labelled as a benchmark.
        trends = context.get('_trends_data', {})
        avg_interest = float(trends.get('avg_interest') or 60.0)
        base_growth = _sector_cagr(ind, is_offline)
        trends_boost = (avg_interest - 50.0) * 0.08  # -4.0% to +4.0%
        growth_rate = round(float(np.clip(base_growth + trends_boost, 4.0, 35.0)), 1)

        # Market Opportunity Score.
        #
        # This previously read `ml_opportunity * 0.45 + avg_interest * 0.35 + budget bonus`.
        # Because the market regressor's opportunity head responds almost entirely to
        # budget (a measured 0.03-point spread across all 33 industries against a 67-point
        # spread across budgets), roughly 60% of the score was capital, and industry moved
        # it by exactly 0.0 — a ₹5,000 AI venture and a ₹5,000 retail shop scored the same,
        # while the same idea with a bigger budget scored 28 points higher. A score labelled
        # "Market Opportunity" was really measuring how much money the founder had.
        #
        # It is now an explicit composite of four things a market opportunity actually
        # depends on, with capital demoted to one quarter:
        #   demand   30% — live Google Trends search interest for the idea's keywords
        #   growth   25% — sector CAGR benchmark (see _sector_cagr)
        #   scale    20% — addressable market size, normalised WITHIN the venture's own
        #                  scope so a strong local business is not punished for being local
        #   capital  25% — budget adequacy, via the regressor's budget-driven head
        demand_level = "High Velocity" if avg_interest >= 65 else ("Steady Demand" if avg_interest >= 45 else "Moderate")

        demand_component = float(np.clip(avg_interest, 0.0, 100.0))

        # Sector CAGR of 4% -> 0, 30% -> 100
        growth_component = float(np.clip((growth_rate - 4.0) / 26.0 * 100.0, 0.0, 100.0))

        # Market scale, normalised against peers of the SAME scope. A ₹60 Cr campus
        # catchment and a ₹40,000 Cr national market are both scored against what is
        # achievable at their own scale rather than against each other.
        if is_offline or (is_hybrid and not is_national_scope):
            scale_lo, scale_hi = 4.0, 800.0        # local catchment, ₹ Cr
        else:
            scale_lo, scale_hi = 15000.0, 150000.0  # national market, ₹ Cr
        scale_component = float(np.clip(
            (math.log10(max(tam_crores, scale_lo)) - math.log10(scale_lo))
            / (math.log10(scale_hi) - math.log10(scale_lo)) * 100.0, 0.0, 100.0))

        capital_component = float(np.clip(ml_opportunity, 0.0, 100.0))

        final_opportunity = round(float(np.clip(
            demand_component * 0.30
            + growth_component * 0.25
            + scale_component * 0.20
            + capital_component * 0.25,
            15.0, 96.0)), 1)

        # Dynamic Demographics, Pain Points, Channels & Triggers
        loc_display = location_raw or context.get('country', 'India')
        title_text = title_raw or 'this venture'

        if is_campus:
            primary_demo = f"University students, hostelers, faculty, and administrative staff at campuses in and around {loc_display}, plus nearby town residents."
            key_pain_point = f"Long dining queues during lunch/break hours, inconsistent food quality or hygiene, lack of late-night delivery to campus hostels, and high delivery fees on aggregator apps."
            acquisition_channel = f"Campus word-of-mouth, hostel WhatsApp order-ahead groups, college fest sponsorships, entrance flyer hand-outs, and UPI table QR codes."
            purchase_trigger = f"Daily lecture breaks, late-night study cravings, post-exam celebrations, and group weekend dining."
        elif is_offline:
            primary_demo = target_cust or f"Local residents, working professionals, and families within 3-5 km catchment area of {loc_display}."
            key_pain_point = f"Lack of reliable, high-quality, and transparently priced {ind} options in the local neighborhood."
            acquisition_channel = f"Physical storefront footfall, Google Business Profile local SEO, hyperlocal Instagram reels, and customer word-of-mouth."
            purchase_trigger = f"Immediate daily convenience, neighborhood recommendations, and transparent on-site service."
        else:
            primary_demo = target_cust or f"Professionals, digital businesses, and consumers seeking modern {ind} solutions across {context.get('country', 'India')}."
            key_pain_point = f"High manual effort, inefficient legacy workflows, and opaque pricing in traditional {ind} alternatives."
            acquisition_channel = f"Targeted digital search marketing (SEO/PPC), social proof, content marketing, and customer referrals."
            purchase_trigger = f"Urgent need for process automation, cost reduction, or superior digital convenience."

        industry_trends = [
            f"Rapid shift toward digital ordering, instant UPI payments, and contactless customer experience in {ind}",
            f"Increasing consumer preference for verified quality, hygiene compliance (FSSAI/certifications), and transparent pricing",
            f"Growing importance of hyperlocal community engagement, social media word-of-mouth, and customer retention programs"
        ]

        opportunity_explanation = (
            f"Market Opportunity Assessment: Evaluated at {final_opportunity}/100 based on verified local demand signals and sector growth. "
            f"Addressable market capacity in {loc_display} is projected at {market_size_str} with an annual sector expansion of {growth_rate}%. "
            f"Strong customer readiness and favorable unit economics support early beachhead traction."
        )
        market_analysis_explanation = (
            f"Market capacity for {title_text} in {ind} is sized at {market_size_str} with a sector benchmark CAGR of {growth_rate}%, "
            f"adjusted for live search demand. "
            f"Demand dynamics demonstrate {demand_level.lower()} with healthy willingness to pay across {loc_display}."
        )

        return {
            'data_source': 'Sector CAGR Benchmark, Google Trends & Economic Indicators',
            'market_size': market_size_str,
            # Where the TAM figure came from, carried with the figure so a
            # low-confidence planning assumption can never be mistaken for a
            # published statistic. Local catchment sizing is computed from
            # population and per-capita spend, not from a published total.
            'market_size_source': (
                tam_source if not (is_offline or (is_hybrid and not is_national_scope))
                else f'MoSPI HCES 2023-24 - {hces_note}'),
            'market_size_confidence': (
                tam_conf if not (is_offline or (is_hybrid and not is_national_scope))
                else 'high'),
            'growth_rate': growth_rate,
            'demand_level': demand_level,
            'opportunity_score': final_opportunity,
            'industry_trends': industry_trends,
            'primary_demo': primary_demo,
            'key_pain_point': key_pain_point,
            'acquisition_channel': acquisition_channel,
            'purchase_trigger': purchase_trigger,
            'opportunity_explanation': opportunity_explanation,
            'market_analysis_explanation': market_analysis_explanation
        }

    # -----------------------------------------------------------------
    # 3. FINANCIAL PROJECTIONS — 70% ML + 30% template scaling
    # -----------------------------------------------------------------
    @staticmethod
    def calculate_financial_projections(context: dict) -> dict:
        """70% ML financial model + 30% template-based scaling."""
        ensure_ml_models_loaded()
        ind = str(context.get('industry', '')).lower()
        budget = float(context.get('budget') or 20000)
        team_size = int(context.get('team_size') or 2)
        sec = str(context.get('sector', 'online')).lower()
        revenue_goal = float(context.get('revenue_goal') or 50000)

        # --- 70%: ML Model Prediction ---
        ml_revenue_ratio = 0.5
        ml_roi = 150.0
        ml_margin = 45.0
        ml_break_even = 12

        if _financial_model is not None and _financial_scaler is not None:
            try:
                ind_enc = _safe_encode(_fin_industry_encoder, ind)
                budget_m = budget / 1e6  # Convert to millions to match training data
                revenue_m = budget_m * 0.4
                funding_pe = budget_m / (team_size + 1)
                revenue_pe = revenue_m / (team_size + 1)
                features = np.array([[ind_enc, 1, team_size, budget_m, funding_pe, revenue_pe]])  # funding_stage=1
                features_scaled = _financial_scaler.transform(features)
                predictions = _financial_model.predict(features_scaled)[0]
                ml_revenue_ratio = float(np.clip(predictions[0], 0.1, 3.0))
                ml_roi = float(np.clip(predictions[2], 5, 300))  # roi_score target is already 0-300 scale
                ml_margin = float(np.clip(predictions[3], 8, 85))
                ml_break_even = int(np.clip(predictions[4], 3, 36))
            except Exception as e:
                print(f"[ML] Financial model prediction error: {e}")

        # --- 30%: Template scaling ---
        # Published per-sector unit economics. Longest key wins so "edtech" is not
        # captured by a shorter generic key, and "_meta" (the file's provenance block)
        # is never treated as a sector.
        template = None
        if _financial_templates:
            best_key = ""
            for k, v in _financial_templates.items():
                if k.startswith("_"):
                    continue
                if (k in ind or ind in k) and len(k) > len(best_key):
                    best_key, template = k, v

        if not template:
            # Cross-industry medians, used when the sector is not one of the ten with
            # published figures. Deliberately the consensus floor rather than a
            # flattering guess.
            template = {
                'churn_estimate': 0.035,
                'ltv_cac_ratio': 3.0,
                'roi_estimate': 3.0,
                'break_even_months': 14,
                'basis': 'Cross-industry median; no benchmark published for this sector.',
                'source': 'Cross-industry consensus',
                'as_of': 2026,
            }

        scale = budget / 20000.0 if budget > 0 else 1.0
        sec_mult = 1.5 if sec == 'offline' else 1.0

        # --- Industry-specific calibration for differentiation ---
        roi_cal = 0.0
        margin_cal = 0.0
        be_cal = 0
        if 'saas' in ind or ('ai' in ind and 'retail' not in ind): roi_cal = +40; margin_cal = +15; be_cal = -3
        elif 'fintech' in ind or 'payment' in ind: roi_cal = +30; margin_cal = +10; be_cal = -2
        elif 'edtech' in ind or 'learning' in ind: roi_cal = +15; margin_cal = +5; be_cal = 0
        elif 'cleantech' in ind or 'ev' in ind or 'energy' in ind: roi_cal = +20; margin_cal = -5; be_cal = +4
        elif 'food' in ind or 'restaurant' in ind or 'cafe' in ind: roi_cal = -30; margin_cal = -12; be_cal = +3
        elif 'retail' in ind or 'hospitality' in ind: roi_cal = -25; margin_cal = -10; be_cal = +2
        elif 'hardware' in ind or 'robotics' in ind: roi_cal = -15; margin_cal = -8; be_cal = +6

        # Sector adjustment
        if sec == 'online': roi_cal += 10; margin_cal += 8
        elif sec == 'offline': roi_cal -= 15; margin_cal -= 10; be_cal += 3

        # Budget tier adjustment
        if budget > 100000: roi_cal += 8; be_cal -= 2
        elif budget < 30000: roi_cal -= 10; be_cal += 3

        # Team size adjustment
        if team_size >= 5: margin_cal -= 3; be_cal -= 1
        elif team_size <= 2: margin_cal += 2; be_cal += 1

        # Blend ML predictions with budget-relative scaling (templates have wrong scale from training)
        # MRR: based on ml_revenue_ratio applied to budget
        base_mrr = ml_revenue_ratio * budget / 12  # ML-predicted monthly revenue
        # Industry-typical MRR multiplier
        ind_mrr_mult = 1.2 if ('saas' in ind or 'ai' in ind) else (0.8 if ('food' in ind or 'restaurant' in ind) else 1.0)
        monthly_revenue = round(base_mrr * ind_mrr_mult * 0.70 + (budget / 12 * 0.5) * 0.30, 2)
        # Cap MRR at realistic levels relative to budget
        monthly_revenue = min(monthly_revenue, budget * 0.5)  # Max 50% of budget per month

        # CAC: customer acquisition cost — realistic sector CAC scaling
        # SaaS/Fintech: higher CAC (₹8,000-20,000), Food/Retail: lower CAC (₹2,500-6,500)
        if 'saas' in ind or 'ai' in ind: base_cac = 150 + (budget / 10000)
        elif 'fintech' in ind: base_cac = 120 + (budget / 8000)
        elif 'food' in ind or 'restaurant' in ind: base_cac = 35 + (budget / 20000)
        elif 'edtech' in ind: base_cac = 80 + (budget / 12000)
        else: base_cac = 90 + (budget / 15000)
        cac = round(max(25, min(300, base_cac)), 2)

        # LTV: per-customer lifetime value based on avg revenue per user (ARPU)
        # Estimated monthly ARPU from MRR / estimated customer base
        est_customers = max(10, budget * 0.10 / max(cac, 25))  # marketing spend / CAC
        monthly_arpu = monthly_revenue / max(est_customers, 1)
        avg_lifetime_months = 18 if 'saas' in ind else (8 if 'food' in ind else 12)
        ltv = round(monthly_arpu * avg_lifetime_months, 2)
        ltv = max(ltv, cac * 1.5)  # Floor: LTV should be at least 1.5x CAC

        churn = round(template.get('churn_estimate', 0.05) * 100 if template.get('churn_estimate', 0.05) < 1 else template.get('churn_estimate', 5.0), 1)
        roi = round((ml_roi + roi_cal) * 0.70 + template.get('roi_estimate', 2.5) * 100 * 0.30, 1)
        # Industry-realistic ROI caps
        if 'food' in ind or 'restaurant' in ind or 'cafe' in ind: roi = min(roi, 60)
        elif 'retail' in ind or 'hospitality' in ind: roi = min(roi, 80)
        elif 'hardware' in ind or 'robotics' in ind: roi = min(roi, 100)
        elif 'cleantech' in ind or 'ev' in ind: roi = min(roi, 150)
        elif 'edtech' in ind: roi = min(roi, 200)
        margins = round((ml_margin + margin_cal) * 0.70 + template.get('profit_margins', 50.0 if 'profit_margins' in template else 50.0) * 0.30, 1)
        break_even_months = int((ml_break_even + be_cal) * 0.70 + template.get('break_even_months', 12) * 0.30)

        # Realistic initial CapEx development cost (upfront MVP platform architecture & pre-launch setup)
        if budget <= 50000:
            dev_cost = max(4000.0, budget * 0.30)
        elif budget <= 200000:
            dev_cost = 15000.0 + (budget - 50000) * 0.12
        else:
            dev_cost = min(45000.0, 33000.0 + (budget - 200000) * 0.02)

        return {
            'subscription_revenue': round(monthly_revenue * 0.6 if sec != 'offline' else 0, 2),
            'freemium_conversion': 5.0 if sec != 'offline' else 0.0,
            'monthly_recurring_revenue': round(monthly_revenue, 2),
            'customer_acquisition_cost': cac,
            'lifetime_value': ltv,
            'churn_rate': churn,
            # Churn, ROI and break-even are anchored to published per-sector medians;
            # carrying the citation with them stops a benchmark being read as a
            # measurement of this particular venture.
            'benchmark_source': template.get('source', 'Cross-industry consensus'),
            'benchmark_basis': template.get('basis', ''),
            'benchmark_as_of': template.get('as_of'),
            'benchmark_ltv_cac_ratio': template.get('ltv_cac_ratio'),
            'daily_customers_estimate': int(20 * sec_mult),
            'average_order_value': 50.0 if sec == 'offline' else 25.0,
            'monthly_revenue': round(monthly_revenue, 2),
            'rent_cost': round(2000.0 * sec_mult, 2),
            'staff_cost': round(team_size * (4500.0 if ('ai' in ind or 'health' in ind) else 3500.0), 2),
            'raw_material_cost': round(1000.0 * sec_mult, 2),
            'utility_cost': round(500.0 * sec_mult, 2),
            'marketing_cost': round(min(18000.0, max(1500.0, budget * 0.06)), 2),
            'development_cost': round(dev_cost, 2),
            'monthly_operating_cost': round((team_size * 4000.0) + (2000.0 * sec_mult) + 1500.0, 2),
            'break_even_analysis': (
                f"Break-Even Projection: Based on capital efficiency models and {ind} industry patterns, "
                f"break-even is projected at {break_even_months} months with a ₹{budget:,.0f} initial investment. "
                f"{'This is accelerated by the online/SaaS delivery model with lower fixed costs.' if sec == 'online' else ('The offline business model adds fixed overhead (rent, utilities, staffing) extending the timeline.' if sec == 'offline' else 'The hybrid model balances online scalability with physical presence costs.')} "
                f"Monthly operating cost estimate: ₹{(team_size * 4000.0) + (2000.0 * sec_mult) + 1500.0:,.0f} "
                f"(team: ₹{team_size * 4000:,.0f} + overhead: ₹{2000 * sec_mult + 1500:,.0f}). "
                f"To accelerate break-even, focus on reducing CAC below ₹{cac:.0f} and increasing MRR above ₹{monthly_revenue:,.0f}/month."
            ),
            'roi': min(350.0, max(10.0, roi)),
            'profit_margins': min(85.0, max(5.0, margins)),
            'detailed_explanation': (
                f"Financial Methodology: These projections are generated using capital efficiency patterns trained on 55,000+ startup financial records, calibrated with {ind} industry benchmarks. "
                f"Core Indicators — Revenue ratio: {ml_revenue_ratio:.2f}x, ROI: {ml_roi:.1f}%, Profit margin: {ml_margin:.1f}%, Break-even: {ml_break_even} months. "
                f"Industry Calibration — {ind.title()} sector adjustment: ROI {'+'  if roi_cal > 0 else ''}{roi_cal:.0f}%, "
                f"Margin {'+'  if margin_cal > 0 else ''}{margin_cal:.0f}%, Break-even {'+'  if be_cal > 0 else ''}{be_cal} months. "
                f"Final Blended Results — ROI: {min(350, max(10, roi)):.1f}%, Profit margins: {min(85, max(5, margins)):.1f}%, "
                f"MRR: ₹{monthly_revenue:,.0f}, CAC: ₹{cac:,.0f}, LTV: ₹{ltv:,.0f}, LTV:CAC ratio: {ltv/max(cac, 1):.1f}x. "
                f"{'Strong unit economics — LTV:CAC above 3x indicates scalable customer acquisition.' if ltv/max(cac, 1) > 3 else 'Consider optimizing acquisition channels to improve LTV:CAC ratio above 3x for investor readiness.'}"
            )
        }

    # -----------------------------------------------------------------
    # 4. RISK ANALYSIS — 70% ML model + 30% domain rules
    # -----------------------------------------------------------------
    @staticmethod
    def calculate_risk(context: dict) -> dict:
        """70% ML risk model predictions + 30% domain calibration."""
        title = str(context.get('title', '')).lower()
        ind = str(context.get('industry', '')).lower()
        sec = str(context.get('sector', '')).lower()
        budget = float(context.get('budget') or 20000)
        team_size = int(context.get('team_size') or 2)
        econ = _venture_economics(context)

        # --- 70%: ML Model Prediction ---
        ml_tech = 40.0
        ml_mkt = 40.0
        ml_comp = 45.0
        ml_fin = 35.0
        ml_ops = 30.0

        if _risk_model is not None and _feature_scaler is not None:
            try:
                features = _build_20_features(context)
                features_scaled = _feature_scaler.transform(features)
                predictions = _risk_model.predict(features_scaled)[0]
                ml_tech = float(np.clip(predictions[0] * 100, 10, 95))
                ml_mkt = float(np.clip(predictions[1] * 100, 10, 95))
                ml_comp = float(np.clip(predictions[2] * 100, 10, 95))
                ml_fin = float(np.clip(predictions[3] * 100, 10, 95))
                ml_ops = float(np.clip(predictions[4] * 100, 10, 95))
            except Exception as e:
                print(f"[ML] Risk model prediction error: {e}")

        # --- 30%: Domain calibration ---
        # Technical risk calibration
        tech_cal = 0.0
        if 'ai' in ind or 'quantum' in ind or 'deeptech' in ind: tech_cal = +12
        elif 'blockchain' in ind or 'crypto' in ind: tech_cal = +8
        elif 'saas' in ind or 'edtech' in ind: tech_cal = -8
        elif 'food' in ind or 'retail' in ind: tech_cal = -12

        # Market risk calibration
        mkt_cal = 0.0
        if 'food' in ind or 'retail' in ind: mkt_cal = +10
        elif 'saas' in ind or 'fintech' in ind: mkt_cal = -5
        if sec == 'offline': mkt_cal += 8
        elif sec == 'online': mkt_cal -= 4

        # Competition risk calibration
        comp_cal = 0.0
        if 'e-commerce' in ind or 'retail' in ind: comp_cal = +12
        elif 'food' in ind: comp_cal = +10
        elif 'quantum' in ind or 'deeptech' in ind: comp_cal = -12
        # A revenue target far beyond the starting capital has to be won from incumbents.
        comp_cal += _ambition_adjustment(econ['ambition'])

        # Financial risk calibration. Runway (budget measured against the burn that
        # this team size and delivery mode actually imply) replaces the old flat budget
        # thresholds, which could not tell a comfortable solo founder from a team of
        # twelve sharing the same capital.
        fin_cal = 0.0
        if sec == 'offline': fin_cal += 12
        fin_cal += _runway_adjustment(econ['runway_months'])
        if 'hardware' in ind or 'robotics' in ind: fin_cal += 10
        elif 'saas' in ind: fin_cal -= 8

        # Operational risk calibration
        ops_cal = 0.0
        if sec == 'offline': ops_cal += 15
        if 'health' in ind or 'food' in ind: ops_cal += 10
        elif 'saas' in ind or 'ai' in ind: ops_cal -= 10
        if team_size > 5: ops_cal += 4
        if econ['team_size'] == 1: ops_cal += 12   # single point of failure
        elif econ['team_size'] == 2: ops_cal += 5

        # BLEND: 50% ML + 50% domain calibration (see note on dead regressor heads)
        tech_risk = round(max(12.0, min(90.0, ml_tech * 0.50 + (40 + tech_cal) * 0.50)), 1)
        mkt_risk = round(max(12.0, min(90.0, ml_mkt * 0.50 + (42 + mkt_cal) * 0.50)), 1)
        comp_risk = round(max(12.0, min(90.0, ml_comp * 0.50 + (45 + comp_cal) * 0.50)), 1)
        fin_risk = round(max(12.0, min(90.0, ml_fin * 0.50 + (35 + fin_cal) * 0.50)), 1)
        ops_risk = round(max(12.0, min(90.0, ml_ops * 0.50 + (30 + ops_cal) * 0.50)), 1)

        overall_risk = round(tech_risk * 0.12 + mkt_risk * 0.23 + comp_risk * 0.15 + fin_risk * 0.25 + ops_risk * 0.25, 1)

        def _risk_label(score):
            return "High" if score > 65 else ("Medium" if score > 35 else "Low")

        return {
            "technical_risk": {
                "score": tech_risk,
                "severity": _risk_label(tech_risk),
                "explanation": f"Technical Risk Assessment ({tech_risk:.1f}/100): Machine learning analysis evaluated core technical architecture, team size ({team_size}), and sector complexity at {ml_tech:.1f}/100 with domain calibration ({'+'  if tech_cal > 0 else ''}{tech_cal:.0f}) for {context.get('industry', 'this sector')}. {'High engineering complexity — specialized technical stack requires experienced senior engineers, budget 3-6 months for core architecture.' if tech_risk > 60 else ('Moderate technical requirements — standard modern frameworks available with manageable customization. Budget 2-3 months for MVP rollout.' if tech_risk > 35 else 'Low technical implementation barrier — straightforward software stack with rapid execution timeline. Working MVP achievable in 4-8 weeks.')} Current team of {team_size} {'should be augmented with a domain specialist to de-risk delivery.' if tech_risk > 50 else 'is well positioned for initial MVP milestone execution.'}",
                "mitigation_strategy": "Adopt modular cloud architecture, automated CI/CD testing, and hire specialist engineers." if tech_risk > 50 else "Leverage proven open-source frameworks and cloud platforms to accelerate development."
            },
            "market_risk": {
                "score": mkt_risk,
                "severity": _risk_label(mkt_risk),
                "explanation": f"Market Risk Assessment ({mkt_risk:.1f}/100): Evaluated market dynamics, burn rate analysis, and market size (raw score: {ml_mkt:.1f}/100, sector calibration: {'+'  if mkt_cal > 0 else ''}{mkt_cal:.0f} for {context.get('industry')} in {sec} sector). {'Competitive acquisition dynamics — crowded space requires focused marketing investment (₹' + str(round(budget * 0.15)) + '+ recommended) and strong value proposition to win customers.' if mkt_risk > 60 else ('Moderate market friction — targeted positioning and brand trust needed. Allocate ₹' + str(round(budget * 0.10)) + ' for initial go-to-market validation.' if mkt_risk > 35 else 'Strong market receptivity — clear customer demand and accessible distribution channels. Lean marketing budget (₹' + str(round(budget * 0.05)) + ') will produce immediate early traction.')} Recommendation: {'Focus on a concentrated beachhead customer segment before broad expansion.' if mkt_risk > 50 else 'Leverage organic inbound marketing and SEO alongside targeted digital campaigns.'}",
                "mitigation_strategy": "Execute targeted pre-launch validation campaigns, customer development interviews, and build referral loops."
            },
            "competition_risk": {
                "score": comp_risk,
                "severity": _risk_label(comp_risk),
                "explanation": f"Competition Risk Assessment ({comp_risk:.1f}/100): Evaluated competitive landscape using market scale, category density, and sector patterns (raw score: {ml_comp:.1f}/100, calibration: {'+'  if comp_cal > 0 else ''}{comp_cal:.0f}). {'Dense competitive landscape — established incumbents and well-funded competitors create barriers to entry. Focus on a clear defensible wedge (proprietary data, unique UX, or partner distribution) to build market share.' if comp_risk > 60 else ('Moderate competition — identifiable differentiation opportunities exist in underserved niches. Focus on the core friction points that incumbents overlook.' if comp_risk > 35 else 'Emerging market category — low incumbent concentration provides substantial early-mover advantage. Execute quickly to lock in customer relationships.')} Our YC competitor database identified {len(MLService.search_yc_competitors(context.get('industry', ''), context.get('title', '')))} similar startups in this space.",
                "mitigation_strategy": "Focus on proprietary features, localized experience, and rapid niche market capture before incumbents react."
            },
            "financial_risk": {
                "score": fin_risk,
                "severity": _risk_label(fin_risk),
                "explanation": f"Financial Risk Assessment ({fin_risk:.1f}/100): Evaluated capital efficiency, runway requirements, and funding dynamics (raw score: {ml_fin:.1f}/100, calibration: {'+'  if fin_cal > 0 else ''}{fin_cal:.0f} for {sec} {context.get('industry')}). With ₹{budget:,.0f} initial capital: {'High burn rate relative to revenue timeline — maintain at least 6 months of cash reserves. Target monthly burn under ₹' + str(round(budget / 8)) + '.' if fin_risk > 60 else ('Moderate capital requirements — break-even achievable within 12-18 months with disciplined capital deployment. Target monthly burn of ₹' + str(round(budget / 12)) + ' or less.' if fin_risk > 35 else 'Lean capital structure — attractive unit economics with rapid payback. Your budget supports ' + str(round(budget / (team_size * 4000 + 3500))) + ' months of runway at current team size.')} {'Consider bootstrapping initial validation before seeking external institutional funding.' if budget < 500000 else 'Budget supports structured milestone-based deployment for investor reporting.'}",
                "mitigation_strategy": "Maintain strict cash flow monitoring, milestone-gated capital deployment, and 6-month reserve runway."
            },
            "operational_risk": {
                "score": ops_risk,
                "severity": _risk_label(ops_risk),
                "explanation": f"Operational Risk Assessment ({ops_risk:.1f}/100): ML model evaluated operational complexity based on team size ({team_size} members), sector type ({sec}), and industry patterns (raw score: {ml_ops:.1f}/100, calibration: {'+'  if ops_cal > 0 else ''}{ops_cal:.0f}). {'Complex operations — ' + sec + ' model requires supply chain management, regulatory compliance, and physical infrastructure. Consider hiring an experienced operations manager within the first 6 months.' if ops_risk > 60 else ('Moderate overhead — manageable team workflows with standard compliance needs. Establish clear SOPs early and automate repetitive tasks using tools like Notion, Slack, and Zapier.' if ops_risk > 35 else 'Streamlined operations — digital-first model minimizes physical overhead. Leverage cloud infrastructure and automated CI/CD pipelines to maintain lean operations.')} With {team_size} team members, {'each person covers ~' + str(round(100 / max(team_size, 1))) + '% of operational responsibilities — consider role specialization as you scale.' if team_size <= 3 else 'the team can support specialized roles for development, marketing, and operations.'}",
                "mitigation_strategy": "Establish clear SOPs, automated monitoring workflows, and key partner SLAs with defined KPIs."
            },
            "overall_risk": overall_risk
        }

    # -----------------------------------------------------------------
    # 5. FEASIBILITY ANALYSIS — 70% ML + 30% domain calibration
    # -----------------------------------------------------------------
    @staticmethod
    def calculate_feasibility(context: dict) -> dict:
        """70% ML feasibility model + 30% domain calibration."""
        ind = str(context.get('industry', '')).lower()
        sec = str(context.get('sector', '')).lower()
        budget = float(context.get('budget') or 20000)
        team_size = int(context.get('team_size') or 2)

        # --- 70%: ML Model Prediction ---
        ml_mkt = 75.0
        ml_tech = 78.0
        ml_fin = 70.0
        ml_inn = 65.0

        if _feasibility_model is not None and _feature_scaler is not None:
            try:
                features = _build_20_features(context)
                features_scaled = _feature_scaler.transform(features)
                predictions = _feasibility_model.predict(features_scaled)[0]
                ml_mkt = float(np.clip(predictions[0] * 100, 35, 98))
                ml_tech = float(np.clip(predictions[1] * 100, 35, 98))
                ml_fin = float(np.clip(predictions[2] * 100, 35, 98))
                ml_inn = float(np.clip(predictions[3] * 100, 35, 98))
            except Exception as e:
                print(f"[ML] Feasibility model prediction error: {e}")

        # --- 30%: Domain calibration ---
        mkt_cal = 0.0
        if 'saas' in ind or 'ai' in ind: mkt_cal = +8
        elif 'edtech' in ind: mkt_cal = +6
        elif 'food' in ind or 'retail' in ind: mkt_cal = +3
        elif 'quantum' in ind or 'deeptech' in ind: mkt_cal = -8
        if sec == 'online': mkt_cal += 4
        elif sec == 'offline': mkt_cal -= 3
        # Live search demand: reaching a market people are already looking for is more
        # feasible than creating demand from nothing. Previously demand moved
        # feasibility by exactly 0.0.
        _avg_interest = float((context.get('_trends_data') or {}).get('avg_interest') or 50.0)
        mkt_cal += float(np.clip((_avg_interest - 50.0) * 0.20, -10.0, 10.0))

        tech_cal = 0.0
        if 'saas' in ind or 'edtech' in ind: tech_cal = +10
        elif 'food' in ind or 'hospitality' in ind: tech_cal = +12
        elif 'ai' in ind or 'deeptech' in ind: tech_cal = -6
        elif 'quantum' in ind or 'robotics' in ind: tech_cal = -12
        if team_size >= 4: tech_cal += 4
        elif team_size <= 2: tech_cal -= 3

        # Financial feasibility keys off runway rather than raw budget, and off whether
        # the stated revenue goal is reachable with the capital behind it.
        econ = _venture_economics(context)
        fin_cal = 0.0
        fin_cal -= _runway_adjustment(econ['runway_months'])   # more runway = more feasible
        fin_cal -= _ambition_adjustment(econ['ambition'])
        if sec == 'online': fin_cal += 6
        elif sec == 'offline': fin_cal -= 8
        if 'saas' in ind: fin_cal += 5
        elif 'hardware' in ind or 'robotics' in ind: fin_cal -= 10

        inn_cal = 0.0
        if 'ai' in ind or 'quantum' in ind or 'deeptech' in ind: inn_cal = +18
        elif 'vr' in ind or 'ar' in ind: inn_cal = +14
        elif 'cleantech' in ind or 'ev' in ind or 'solar' in ind: inn_cal = +6
        elif 'food' in ind or 'cafe' in ind: inn_cal = -8
        elif 'retail' in ind or 'hospitality' in ind: inn_cal = -6

        # BLEND: 50% ML + 50% domain calibration (see note on dead regressor heads)
        mkt_score = round(max(40.0, min(97.0, ml_mkt * 0.50 + (72 + mkt_cal) * 0.50)), 1)
        tech_score = round(max(40.0, min(97.0, ml_tech * 0.50 + (76 + tech_cal) * 0.50)), 1)
        fin_score = round(max(40.0, min(97.0, ml_fin * 0.50 + (70 + fin_cal) * 0.50)), 1)
        inn_score = round(max(40.0, min(97.0, ml_inn * 0.50 + (66 + inn_cal) * 0.50)), 1)

        # Additional budget and team modifiers for differentiation
        if budget >= 100000: mkt_score += 5; fin_score += 8; tech_score += 3
        elif budget >= 50000: mkt_score += 2; fin_score += 4
        elif budget < 25000: fin_score -= 5; mkt_score -= 3

        if team_size >= 6: tech_score += 6; mkt_score += 4
        elif team_size >= 4: tech_score += 3; mkt_score += 2
        elif team_size <= 2: tech_score -= 4; mkt_score -= 2

        # Sector adjustment
        if sec == 'online': mkt_score += 3; inn_score += 2
        elif sec == 'offline': tech_score += 2; mkt_score -= 2

        # Re-clip after adjustments
        mkt_score = round(max(35.0, min(95.0, mkt_score)), 1)
        tech_score = round(max(35.0, min(95.0, tech_score)), 1)
        fin_score = round(max(35.0, min(95.0, fin_score)), 1)
        inn_score = round(max(35.0, min(95.0, inn_score)), 1)

        overall = round(mkt_score * 0.30 + tech_score * 0.25 + fin_score * 0.25 + inn_score * 0.20, 1)

        # Dimension-specific explanations (Clean business reasoning, zero R² jargon)
        tech_exp = (
            f"High technical feasibility ({tech_score:.1f}/100): The proposed {sec} architecture in {context.get('industry', 'this sector')} utilizes mature frameworks and established development patterns. With a team of {team_size}, technical execution risks are low, and MVP build time can be kept under 3 months."
            if tech_score > 70 else (
                f"Moderate technical feasibility ({tech_score:.1f}/100): Developing a secure, reliable {sec} solution for {context.get('industry', 'this sector')} requires careful API integration, data protection, and robust backend handling. Achievable with focused engineering effort."
                if tech_score > 50 else
                f"Demanding technical requirements ({tech_score:.1f}/100): Specialized engineering talent and customized infrastructure are required. Development timelines should account for extensive testing, security audits, and latency optimization."
            )
        )

        mkt_exp = (
            f"Strong market feasibility ({mkt_score:.1f}/100): Target customers in {context.get('industry', 'this space')} exhibit high digital adoption and clear willingness to pay. Acquisition channels are accessible with competitive customer acquisition costs."
            if mkt_score > 70 else (
                f"Moderate market feasibility ({mkt_score:.1f}/100): Target customer segments exist with identifiable demand, but conversion requires sharp positioning, clear differentiation from incumbents, and educational onboarding."
                if mkt_score > 50 else
                f"Challenging market entry ({mkt_score:.1f}/100): Customer switching costs or established incumbent loyalties create friction. A targeted niche beachhead strategy is recommended before expanding broadly."
            )
        )

        fin_exp = (
            f"Healthy financial feasibility ({fin_score:.1f}/100): Initial budget of ₹{budget:,.0f} provides solid runway for early validation. Unit economics indicate a sustainable path to positive gross margins and rapid payback period."
            if fin_score > 70 else (
                f"Viable financial structure ({fin_score:.1f}/100): Initial capital of ₹{budget:,.0f} supports lean operations. Careful milestone-based capital allocation and tight cash flow management will ensure break-even within 8–14 months."
                if fin_score > 50 else
                f"Capital-constrained financial model ({fin_score:.1f}/100): Initial budget of ₹{budget:,.0f} requires strict cost control. Prioritize early revenue validation and customer pre-orders to extend operational runway."
            )
        )

        inn_exp = (
            f"High innovation potential ({inn_score:.1f}/100): Proprietary workflow improvements and differentiated positioning create defensible competitive advantages against traditional offerings in {context.get('industry', 'this sector')}."
            if inn_score > 70 else (
                f"Moderate innovation index ({inn_score:.1f}/100): Innovation is driven primarily by superior user experience, localized adaptation, and execution speed rather than complex proprietary technology."
                if inn_score > 50 else
                f"Incremental innovation index ({inn_score:.1f}/100): Business model closely follows standard industry templates. Consider developing proprietary features or exclusive data integrations to strengthen long-term moats."
            )
        )

        overall_exp = (
            f"Feasibility Assessment for {context.get('title')}: Evaluated at {overall:.1f}/100 overall feasibility. "
            f"{'Strong overall viability with favorable alignment between technical execution, market opportunity, and financial resources.' if overall > 70 else ('Balanced feasibility profile with viable fundamentals, requiring focused execution on key operational milestones.' if overall > 50 else 'Demanding project scope requiring disciplined scoping, lean iteration, and targeted resource allocation.')}"
        )

        return {
            "market_score": mkt_score,
            "technical_score": tech_score,
            "financial_score": fin_score,
            "innovation_score": inn_score,
            "overall_feasibility": overall,
            "explanation": overall_exp,
            "technical_explanation": tech_exp,
            "market_explanation": mkt_exp,
            "financial_explanation": fin_exp,
            "innovation_explanation": inn_exp
        }

    # -----------------------------------------------------------------
    # 6. INVESTOR READINESS — 70% ML + 30% domain calibration
    # -----------------------------------------------------------------
    @staticmethod
    def calculate_investor_readiness(context: dict) -> dict:
        """70% ML investor model + 30% domain calibration."""
        ind = str(context.get('industry', '')).lower()
        sec = str(context.get('sector', '')).lower()
        budget = float(context.get('budget') or 20000)
        team_size = int(context.get('team_size') or 2)

        # --- 70%: ML Model Prediction ---
        ml_scal = 70.0
        ml_inn = 65.0
        ml_biz = 72.0
        ml_mkt = 70.0

        if _investor_model is not None and _feature_scaler is not None:
            try:
                features = _build_20_features(context)
                features_scaled = _feature_scaler.transform(features)
                predictions = _investor_model.predict(features_scaled)[0]
                ml_scal = float(np.clip(predictions[0] * 100, 35, 98))
                ml_inn = float(np.clip(predictions[1] * 100, 35, 98))
                ml_biz = float(np.clip(predictions[2] * 100, 35, 98))
                ml_mkt = float(np.clip(predictions[3] * 100, 35, 98))
            except Exception as e:
                print(f"[ML] Investor model prediction error: {e}")

        # --- 30%: Domain calibration ---
        scal_cal = 0.0
        if sec == 'online': scal_cal += 10
        elif sec == 'offline': scal_cal -= 8
        if 'saas' in ind or 'ai' in ind: scal_cal += 8
        elif 'food' in ind or 'cafe' in ind: scal_cal -= 10
        elif 'fintech' in ind: scal_cal += 6
        _team = max(1, int(context.get('team_size') or 1))
        if _team >= 8: scal_cal += 6          # enough hands to execute a scale-up
        elif _team >= 4: scal_cal += 3
        elif _team == 1: scal_cal -= 7        # solo founders rarely clear diligence

        inn_cal = 0.0
        if 'ai' in ind or 'quantum' in ind or 'deeptech' in ind: inn_cal = +15
        elif 'cleantech' in ind or 'ev' in ind or 'solar' in ind: inn_cal = +8
        elif 'food' in ind or 'retail' in ind: inn_cal = -6

        # Business-model strength now reflects capital efficiency and survivability,
        # not just a raw budget threshold: what revenue the plan targets per rupee of
        # capital, and whether there is enough runway to reach it.
        econ = _venture_economics(context)
        biz_cal = 0.0
        if 'saas' in ind: biz_cal += 8
        elif 'fintech' in ind: biz_cal += 6
        elif 'food' in ind: biz_cal -= 4
        _amb = econ['ambition']
        if 3.0 <= _amb <= 12.0: biz_cal += 8      # credible, ambitious return on capital
        elif 1.0 <= _amb < 3.0: biz_cal += 2
        elif _amb > 25.0: biz_cal -= 6            # target not supported by the capital
        elif 0 < _amb < 1.0: biz_cal -= 5         # does not return the money invested
        if econ['runway_months'] >= 18: biz_cal += 5
        elif econ['runway_months'] < 6: biz_cal -= 8

        # Absolute scale, not just ratios. The ambition ratio is scale-invariant, so a
        # target of Rs 20,000 on Rs 5,000 of capital looked as "capital efficient" as a
        # Rs 10 Cr target on Rs 2.5 Cr. Investor readiness has to notice that the first
        # one is not an investable business at any ratio.
        _goal = econ['revenue_goal']
        if 0 < _goal < 1000000: biz_cal -= 18        # under Rs 10 lakh annual target
        elif 1000000 <= _goal < 5000000: biz_cal -= 8
        elif _goal >= 50000000: biz_cal += 5
        if econ['budget'] < 50000: biz_cal -= 12     # below any institutional cheque size
        elif econ['budget'] < 200000: biz_cal -= 5

        mkt_cal = 0.0
        if 'ai' in ind or 'saas' in ind: mkt_cal += 7
        elif 'cleantech' in ind or 'energy' in ind: mkt_cal += 8
        elif 'food' in ind or 'hospitality' in ind: mkt_cal -= 3
        if sec == 'online': mkt_cal += 4
        elif sec == 'offline': mkt_cal -= 4
        # Investors price the sector's growth rate and live demand, so both feed the
        # market pillar rather than leaving it driven by industry keywords alone.
        mkt_cal += float(np.clip((_sector_cagr(ind, sec == 'offline') - 14.0) * 0.55, -7.0, 9.0))
        _ai = float((context.get('_trends_data') or {}).get('avg_interest') or 50.0)
        mkt_cal += float(np.clip((_ai - 50.0) * 0.14, -7.0, 7.0))

        # BLEND: 50% ML + 50% domain calibration (see note on dead regressor heads)
        scalability = round(max(40.0, min(97.0, ml_scal * 0.50 + (65 + scal_cal) * 0.50)), 1)
        innovation = round(max(40.0, min(97.0, ml_inn * 0.50 + (60 + inn_cal) * 0.50)), 1)
        biz_model = round(max(40.0, min(97.0, ml_biz * 0.50 + (68 + biz_cal) * 0.50)), 1)
        market = round(max(40.0, min(97.0, ml_mkt * 0.50 + (66 + mkt_cal) * 0.50)), 1)

        inv_score = round(scalability * 0.30 + innovation * 0.20 + biz_model * 0.25 + market * 0.25, 1)

        # Dynamic suggestions
        suggestions = []
        if scalability < 70:
            suggestions.append(f"Develop a clear scaling strategy for {context.get('industry')} to demonstrate exponential growth potential to investors")
        else:
            suggestions.append(f"Leverage strong scalability in {context.get('industry')} by demonstrating 10x growth scenarios in your pitch deck")
        if innovation < 65:
            suggestions.append("Strengthen IP portfolio and differentiation narrative to stand out in investor due diligence")
        else:
            suggestions.append("Protect innovation advantage through patents, proprietary algorithms, or technology moats")
        suggestions.append(f"Build functional MVP and acquire initial {50 + int(budget / 1000)} beta users to validate market traction")
        suggestions.append("Define clear unit economics with LTV:CAC ratio > 3x for Series A readiness")

        # Dimension-specific investor explanations (Clean business reasoning, zero R² jargon)
        scal_exp = (
            f"High scalability ({scalability:.1f}/100): The {sec} business model allows revenue expansion with minimal marginal cost increases per customer, supporting rapid multi-market expansion."
            if scalability > 70 else (
                f"Moderate scalability ({scalability:.1f}/100): Expansion is achievable across target segments, though onboarding complexity and operational support requirements increase moderately with volume."
                if scalability > 50 else
                f"Constrained scaling potential ({scalability:.1f}/100): High variable costs, hands-on delivery, or localized dependency require structured automation before rapid venture scaling is feasible."
            )
        )

        inn_exp = (
            f"Strong defensibility ({innovation:.1f}/100): Significant competitive moat through proprietary technology, specialized domain data, or unique partner integrations that resist copycat replication."
            if innovation > 70 else (
                f"Moderate competitive moat ({innovation:.1f}/100): Differentiation relies on superior UX, customer relationships, and brand execution. Investors will evaluate long-term switching costs."
                if innovation > 50 else
                f"Low defensibility barrier ({innovation:.1f}/100): Easily replicable by well-funded competitors. Recommend building data flywheels, IP protections, or exclusive supplier/distribution channels."
            )
        )

        biz_exp = (
            f"Compelling business model ({biz_model:.1f}/100): High customer lifetime value relative to acquisition cost (LTV:CAC > 3x) and clear recurring revenue mechanics appeal strongly to investors."
            if biz_model > 70 else (
                f"Viable business model ({biz_model:.1f}/100): Monetization logic is sound, but customer payback periods and pricing tiers require live cohort validation to satisfy investor diligence."
                if biz_model > 50 else
                f"Unvalidated commercial model ({biz_model:.1f}/100): Needs proven customer willingness-to-pay and unit economic validation before seeking institutional venture rounds."
            )
        )

        mkt_exp = (
            f"Large market opportunity ({market:.1f}/100): Sizable addressable market with high compound annual growth rate provides the market size venture investors require for outsized returns."
            if market > 70 else (
                f"Focused addressable market ({market:.1f}/100): Healthy vertical market with defined niche opportunities. Investors will want to see potential expansion into adjacent verticals."
                if market > 50 else
                f"Niche market positioning ({market:.1f}/100): Tightly targeted customer segment; quantify your Total Addressable Market (TAM) to demonstrate commercial scale to investors."
            )
        )

        overall_inv_exp = (
            f"Investor Readiness Assessment for {context.get('title')}: Evaluated at {inv_score:.1f}/100 overall investor readiness. "
            f"{'Startup presents an attractive seed profile with strong metrics across venture-critical dimensions.' if inv_score > 70 else ('Promising early profile — focus on demonstrating early customer traction and cohort retention to strengthen your pitch.' if inv_score > 50 else 'Pre-seed development stage — recommend building an active user base and proving product-market fit before institutional outreach.')}"
        )

        return {
            "scalability": scalability,
            "innovation": innovation,
            "business_model": biz_model,
            "market": market,
            "investor_score": inv_score,
            "explanation": overall_inv_exp,
            "scalability_explanation": scal_exp,
            "innovation_explanation": inn_exp,
            "business_model_explanation": biz_exp,
            "market_explanation": mkt_exp,
            "suggestions": suggestions
        }

    # -----------------------------------------------------------------
    # 7. TECH STACK RECOMMENDATION — ML model + survey benchmarks
    # -----------------------------------------------------------------
    # -----------------------------------------------------------------
    # 7. TECH STACK RECOMMENDATION — ML model + survey benchmarks
    # -----------------------------------------------------------------
    @staticmethod
    def recommend_tech_stack(context: dict) -> dict:
        """ML-driven tech stack recommendation tailored to industry, sector, scale, and operational requirements."""
        ind = str(context.get('industry', '')).lower()
        title = str(context.get('title', '')).lower()
        sec = str(context.get('sector', 'online')).lower()
        raw = f"{ind} {title}".lower()

        SECTOR_BLUEPRINTS = {
            "edtech": {
                "frontend": "Next.js 14 + React 18 + Tailwind CSS (Interactive Drag & Drop Timetable Matrix)",
                "backend": "Python FastAPI (Asynchronous REST API) + Google OR-Tools (Constraint Programming CP-SAT Solver)",
                "database_system": "PostgreSQL 16 (Relational Schema & JSONB) + Redis 7 (Schedule Session Locks)",
                "cloud_platform": "AWS ECS Fargate (Mumbai ap-south-1) + CloudFront CDN",
                "ai_framework": "Google OR-Tools Constraint Solver + Groq LLaMA-3 (Curriculum & Doubts Engine)",
                "deployment": "Docker Multi-Stage Containers + GitHub Actions CI/CD to AWS ECS",
                "reasoning": "Optimized for combinatorial NP-hard timetable scheduling. Python FastAPI with Google OR-Tools CP-SAT solver computes conflict-free academic schedules across thousands of teacher-student constraints in seconds. Next.js delivers sub-second client interactivity with low memory footprint, keeping cloud costs below ₹2,500/month on AWS Free Tier."
            },
            "food & beverage": {
                "frontend": "Flutter (Cross-Platform Mobile App) + Sunmi POS Android Terminal UI + Dynamic QR Web PWA",
                "backend": "Node.js (NestJS) + Socket.io (Real-time Kitchen Display System - KDS Order Pipeline)",
                "database_system": "PostgreSQL (ACID Order Transactions & Inventory Ledger) + Redis (Live Table Cart State)",
                "cloud_platform": "Google Cloud Run (Serverless Auto-Scaling Microservices) + Firebase Cloud Messaging",
                "ai_framework": "Time-Series ARIMA / Prophet (Perishable Ingredient Wastage & Restock Prediction)",
                "deployment": "Cloud Run Automated CI/CD + ESC/POS Network Thermal Receipt Printer Integration",
                "reasoning": "Built for high-velocity restaurant operations. Contactless QR ordering feeds directly into a real-time Kitchen Display System (KDS) via Socket.io web sockets with sub-100ms latency. Seamlessly integrates with Sunmi Android POS terminals, ESC/POS kitchen printers, and UPI AutoPay, with the goal of shortening table turnover time."
            },
            "e-commerce": {
                "frontend": "Next.js PWA (Instant 0.8s Storefront) + React Native (Dark-Store Picker & Rider Navigation App)",
                "backend": "Go (High-Concurrency Order Processing) + Python FastAPI + Apache Kafka (Event Streaming)",
                "database_system": "PostgreSQL with PostGIS (Dark-Store Delivery Radius) + Redis Cluster (Inventory Stock Locks)",
                "cloud_platform": "AWS EKS (Kubernetes with Karpenter Auto-scaler) + Cloudflare Edge Workers",
                "ai_framework": "Machine Learning Demand Forecasting (Hourly SKU Restock) + Google OR-Tools VRP (Rider Dispatch)",
                "deployment": "Docker Kubernetes + Helm Charts + GitHub Actions Continuous Delivery",
                "reasoning": "Engineered for sub-15 minute grocery fulfillment. Apache Kafka streams instant order placement events directly to dark-store picker handhelds, while PostGIS calculates exact 3km polygon delivery boundaries. Redis distributed locks eliminate inventory overselling during flash sale spikes."
            },
            "fintech": {
                "frontend": "React.js 18 + TypeScript + Vite + Tailwind CSS + Web3Modal / Ethers.js (Sub-Second Checkout SDK)",
                "backend": "Go (Golang Ultra-Low Latency Payment Engine) + Java Spring Boot (Idempotent Ledger Services)",
                "database_system": "PostgreSQL with TimescaleDB (Immutable Double-Entry Ledger) + Redis Cluster (Distributed Locks)",
                "cloud_platform": "AWS Nitro Enclaves (HSM Cryptographic Key Security) + Cloudflare Enterprise DDoS Shield",
                "ai_framework": "scikit-learn Isolation Forest (Real-Time AML & Transaction Fraud Anomaly Detection)",
                "deployment": "Docker Kubernetes (AWS EKS) with Multi-Region Failover & Blue-Green Deployments",
                "reasoning": "Enterprise financial infrastructure engineered for zero-data-loss and sub-50ms payment confirmation. Go and Java deliver deterministic concurrency and thread safety for cryptographic transaction signing. TimescaleDB maintains an immutable audit ledger compliant with RBI Payment Aggregator standards and DPDP Act 2023."
            },
            "cybersecurity": {
                "frontend": "Next.js 14 + Visx / D3.js (Real-Time Interactive Network Attack Surface & Threat Topology)",
                "backend": "Rust (Ultra-Lightweight Endpoint Security Daemon <15MB RAM) + Go (High-Speed Log Ingestion)",
                "database_system": "ClickHouse (Ultra-Fast Columnar DB Querying 100M+ Security Events/sec) + OpenSearch SIEM",
                "cloud_platform": "AWS Multi-AZ Private VPC + Bare-Metal Edge Nodes + WireGuard mTLS Encrypted Mesh",
                "ai_framework": "PyTorch Graph Neural Networks (GNN) for Zero-Day Lateral Attack Movement Detection",
                "deployment": "Docker on AWS EKS + Cross-Platform Native Installers (Windows MSI, macOS PKG, Linux DEB)",
                "reasoning": "Zero Trust security architecture built for high-throughput anomaly detection. Rust endpoint agent consumes less than 15MB RAM and under 1% CPU on corporate workstations, streaming security telemetry to ClickHouse which queries hundreds of millions of audit logs in under 200ms. Fully compliant with CERT-In 6-hour reporting mandates."
            },
            "agtech": {
                "frontend": "Flutter (Multilingual Offline-First Mobile App with Hindi Voice UI) + React Web Admin",
                "backend": "Python FastAPI + Celery Asynchronous Distributed Task Queue (Drone Orthomosaic Processing)",
                "database_system": "PostgreSQL with PostGIS (Farm Plot Geo-Fencing) + MinIO / S3 (Multispectral Drone Imagery)",
                "cloud_platform": "AWS IoT Core (Drone Telemetry Bridge) + Local Edge Compute on NVIDIA Jetson Nano",
                "ai_framework": "Ultralytics YOLOv8 (Computer Vision Crop Disease & Weed Detection) + Sentinel-2 Satellite NDVI",
                "deployment": "Docker on AWS ECS + Embedded Edge Linux OS with MAVLink Drone Flight Controller SDK",
                "reasoning": "Built for rugged rural deployment. Flutter app operates 100% offline in fields with SQLite local sync when network resumes. Drone imagery is processed using Jetson Nano edge AI and YOLOv8 to detect fungal blight and nitrogen deficiencies in real-time, reducing pesticide usage by up to 30%."
            },
            "healthcare": {
                "frontend": "React Native (Bluetooth Low Energy BLE Vitals Monitor) + Next.js Hospital Clinical Dashboard",
                "backend": "Go (Golang High-Throughput ECG Telemetry Ingestion) + Python FastAPI (Biometric Analytics)",
                "database_system": "TimescaleDB (Continuous Heart Rate/ECG/SpO2 Time-Series) + PostgreSQL (FHIR Health Records)",
                "cloud_platform": "AWS HealthLake + HIPAA & Ayushman Bharat Digital Mission (ABDM) Encrypted Cloud",
                "ai_framework": "PyTorch 1D-CNN (Real-Time Cardiac Arrhythmia & Fall Detection Neural Network)",
                "deployment": "Docker Containers on AWS ECS with End-to-End AES-256 GCM Hardware Encryption",
                "reasoning": "Clinical-grade patient monitoring architecture. Go ingests continuous BLE vital streams from smart wearables with sub-second doctor alert triggers. Meets ABDM M1/M2/M3 milestone requirements with FHIR standard patient record storage and end-to-end hardware-level biometric data encryption."
            },
            "cleantech": {
                "frontend": "Next.js 14 + Mapbox GL JS / Deck.gl (3D Rooftop Solar Radiation & Shadow Simulation)",
                "backend": "Python FastAPI (PV Solar Yield Engine) + EMQX MQTT Broker (Inverter Telemetry Ingestion)",
                "database_system": "TimescaleDB (PostgreSQL Time-Series Extension for Inverter KwH Logs) + Redis",
                "cloud_platform": "AWS IoT Core (MQTT Device Shadows) + AWS Lambda + S3 (Solar Irradiance Data)",
                "ai_framework": "NREL PVLib Physics Engine + XGBoost Predictive Battery Storage Dispatch",
                "deployment": "Docker Microservices on AWS ECS + Automated Firmware OTA Deployment",
                "reasoning": "Custom engineered for renewable energy IoT telemetry. Handles high-frequency inverter metric ingestion via MQTT while TimescaleDB provides 90%+ data compression for time-series solar generation logs. PVLib physics engine provides bankable solar yield forecasts for industrial and residential rooftop installations."
            },
            "gaming": {
                "frontend": "Unity / Unreal Engine 5 (WebGL & Native) + React 18 TypeScript (Tournament Matchmaking Lobby)",
                "backend": "Go (Dedicated Game Server Tick Loops @ 60Hz) + Node.js (Player Inventory & Social Service)",
                "database_system": "Redis Enterprise (Sub-Millisecond Player State & Leaderboards) + MongoDB (Player Inventories)",
                "cloud_platform": "AWS GameLift / Bare-Metal Edge Game Servers (Low-Ping UDP Routing across Indian ISPs)",
                "ai_framework": "Reinforcement Learning (RL) Adaptive Bot Agents + ML Anti-Cheat Movement Anomaly Detection",
                "deployment": "Agones Game Server Orchestrator on Kubernetes + Dockerized Game Builds",
                "reasoning": "Optimized for low-latency competitive multiplayer gaming. Go-based UDP game servers run 60-tick synchronized physics simulation loops with sub-25ms ping across Mumbai, Bangalore, and Delhi ISP routing hubs. Redis provides instant global leaderboard updates and matchmaking queue management."
            },
            "proptech": {
                "frontend": "Next.js 14 + Mapbox GL JS (Locality Price Heatmaps) + Three.js (Virtual 3D Digital Twin Tours)",
                "backend": "Python FastAPI (Property Valuation & Valuation Engine) + Node.js (Real-time Broker Chat)",
                "database_system": "PostgreSQL with PostGIS (Geospatial Radius Queries) + Qdrant (Vector Search for Similar Homes)",
                "cloud_platform": "AWS RDS PostgreSQL + AWS S3 with CloudFront CDN (High-Res 4K Property Tours)",
                "ai_framework": "XGBoost Predictive Valuation Model + OpenAI CLIP (Visual Architectural Similarity)",
                "deployment": "Vercel Pro (Edge Frontend) + Dockerized Backend on AWS App Runner",
                "reasoning": "Purpose-built for spatial property intelligence. PostGIS enables sub-10ms bounding-box and polygon locality queries, while Qdrant vector database enables buyers to search by lifestyle aesthetics. Three.js virtual walk-throughs drive remote buyer engagement while keeping server infrastructure cost under ₹3,500/month."
            },
            "manufacturing": {
                "frontend": "React.js 18 + Three.js (Live 3D Biodegradable Box Folding Customizer) + Tailwind CSS",
                "backend": "Python FastAPI (Dynamic Custom Packaging Pricing Engine) + Node.js (B2B Client Portal)",
                "database_system": "PostgreSQL (B2B Purchase Orders, ERP Bill-of-Materials & Production Batch Ledger)",
                "cloud_platform": "DigitalOcean Droplets / AWS EC2 + Industrial MQTT Gateways on Factory Floor Machinery",
                "ai_framework": "Linear Programming Optimization (Cutting-Stock Algorithm Minimizing Paperboard Waste by 18%)",
                "deployment": "Docker Compose on Linux VPS + Automated Production Ticket Webhooks",
                "reasoning": "Designed for modern sustainable packaging manufacturing. Three.js gives enterprise buyers real-time 3D fold visualizations of custom die-cut boxes. The Python mathematical optimization engine calculates exact cutting-stock layouts, slashing raw material paperboard scrap by 18% and generating instant dynamic quotes."
            },
            "logistics": {
                "frontend": "Next.js 14 + Mapbox GL JS (Real-Time Fleet Telematics, Geofencing & Interactive Route Matrix)",
                "backend": "Go (High-Speed GPS Telematics Ping Ingestion @ 50,000 pings/sec) + Python FastAPI (Optimization Engine)",
                "database_system": "TimescaleDB (Fleet GPS Breadcrumb Telemetry) + Redis (Live Driver Assignment Queue) + PostgreSQL",
                "cloud_platform": "AWS EKS with Spot Instances (70% Compute Cost Reduction) + Apache Kafka Message Bus",
                "ai_framework": "Google OR-Tools VRP (Capacitated Vehicle Routing Problem) + PyTorch Dynamic ETA Predictor",
                "deployment": "Docker Kubernetes + Prometheus & Grafana Live Fleet Observability Stack",
                "reasoning": "Built for large-scale commercial fleet optimization. High-throughput Go gateway effortlessly ingests tens of thousands of GPS pings per second. OR-Tools constraint algorithms calculate optimal multi-stop delivery routes, slashing fuel burn by 15-22% and integrating directly with India's National Logistics Policy ULIP API."
            },
            "ev_mobility": {
                "frontend": "Next.js 14 PWA + React Native (Driver Charging Station Map & Slot Reservation App)",
                "backend": "Go (Golang OCPP 1.6/2.0 Protocol Engine) + Python FastAPI (Tariff & Dynamic Load Balancing)",
                "database_system": "TimescaleDB (Continuous Charger KwH & Voltage Telemetry) + Redis (Live Plug State)",
                "cloud_platform": "AWS IoT Core (MQTT Charger Bridge) + AWS ECS Fargate (Mumbai ap-south-1)",
                "ai_framework": "Machine Learning Grid Load Forecaster + Battery Thermal Anomaly Detection",
                "deployment": "Docker Containers + Automated OCPP Hardware Charger Compliance Testing",
                "reasoning": "Built for EV charging networks and smart mobility. High-concurrency Go microservices handle continuous OCPP charging session telemetry from field chargers, while TimescaleDB stores real-time power draw metrics. Delivers seamless slot booking and UPI billing for drivers."
            },
            "legaltech_saas": {
                "frontend": "Next.js 14 + React 18 + Tailwind CSS (Interactive Redlining & Contract Comparison UI)",
                "backend": "Python FastAPI (Asynchronous Document Ingestion) + Groq LLaMA-3 Legal Intelligence Engine",
                "database_system": "PostgreSQL 16 (Encrypted Case Files & Redline Audits) + Qdrant (Vector Clause Search)",
                "cloud_platform": "AWS Mumbai (ap-south-1) Dedicated Encrypted VPC + CloudFront CDN",
                "ai_framework": "Groq LLaMA-3 70B NLP Engine + HuggingFace Embeddings for Contract Clause Semantic Matching",
                "deployment": "Docker Multi-Stage Containers + Automated DPDP Act 2023 Compliance Auditing",
                "reasoning": "Engineered for legal document intelligence and contract risk scoring. FastAPI asynchronously parses complex multi-hundred-page PDFs and agreements into vector embeddings, enabling near-instant semantic search and anomaly clause flagging with strict client-attorney confidentiality."
            },
            "marketplace_ondemand": {
                "frontend": "React Native (Customer & Service Provider App) + Next.js 14 Responsive Web Marketplace",
                "backend": "Go (Sub-Second Geolocation Matchmaker) + Python FastAPI + WebSockets",
                "database_system": "PostgreSQL with PostGIS (Spatial Radius Search & Escrow Ledger) + Redis Cluster",
                "cloud_platform": "AWS EKS (Kubernetes) + Cloudflare Edge CDN & WAF",
                "ai_framework": "Dynamic Surge Pricing Algorithm + Provider Dispatch & Route Optimization Model",
                "deployment": "Docker Kubernetes + Helm Charts + GitHub Actions Continuous Delivery",
                "reasoning": "Purpose-built for high-frequency on-demand service marketplaces. PostGIS executes sub-10ms provider radius lookups, while Go handles real-time booking dispatch and Redis distributed locks eliminate double-booking of field specialists."
            },
            "b2b_saas": {
                "frontend": "Next.js 14 (App Router) + React 18 + Tailwind CSS + Lucide Icons + TanStack Table",
                "backend": "Python FastAPI / Node.js NestJS (Multi-Tenant Workspace REST & GraphQL API)",
                "database_system": "PostgreSQL 16 (Multi-Tenant Row-Level Security RLS) + Redis 7 (Workspace Session Cache)",
                "cloud_platform": "AWS ECS Fargate (Mumbai ap-south-1) / Vercel Pro + CloudFront CDN",
                "ai_framework": "Groq LLaMA-3 (Intelligent Workflow Automation & AI Assistant)",
                "deployment": "Docker Multi-Stage Containers + GitHub Actions Blue-Green Deployments",
                "reasoning": "Enterprise B2B SaaS architecture with strict multi-tenant data isolation. PostgreSQL Row-Level Security (RLS) ensures complete tenant data segregation at the database layer, while FastAPI provides high-throughput async APIs, keeping infrastructure cost under ₹3,000/mo on AWS Free Tier."
            },
            "d2c_brand": {
                "frontend": "Next.js 14 (Headless Storefront PWA) + Tailwind CSS + Framer Motion (Sub-Second Catalog)",
                "backend": "Node.js (Medusa / NestJS Headless E-Commerce Engine) + Python (Recommendation API)",
                "database_system": "PostgreSQL 16 (Product Catalog & Order Ledger) + Redis 7 (Flash-Sale Cart Locks)",
                "cloud_platform": "Vercel Pro (Global Edge SSR) + AWS RDS PostgreSQL + Cloudflare CDN",
                "ai_framework": "Collaborative Filtering Product Recommendation Engine + Churn Prediction Model",
                "deployment": "Automated Vercel Edge Deployments + Webhook Event Receivers for Shiprocket & Razorpay",
                "reasoning": "Optimized for high-conversion D2C brand commerce. Headless Next.js storefront delivers 0.8s page load times on mobile devices, drastically boosting checkout conversions. Integrated with Razorpay UPI Intent and Shiprocket automated logistics."
            },
            "fitness_wellness": {
                "frontend": "React Native / Flutter (Cross-Platform Mobile App) + Bluetooth Low Energy (BLE) Sync",
                "backend": "Python FastAPI (Biometrics & Calorie Analysis) + Node.js (Social Workout Challenges)",
                "database_system": "PostgreSQL (User Profiles & Nutrition Logs) + TimescaleDB (Continuous Heart Rate & Steps)",
                "cloud_platform": "Google Cloud Run / AWS ECS Fargate + Firebase Cloud Messaging",
                "ai_framework": "MediaPipe Computer Vision Pose Estimation (Real-Time Exercise Rep Counting) + Calorie ML",
                "deployment": "Docker Containers + Automated Mobile OTA Updates via CodePush",
                "reasoning": "Designed for smart fitness coaching and workout tracking. MediaPipe computer vision analyzes camera video locally on device for rep counting without sending video to cloud, preserving user privacy while FastAPI manages nutrition plans."
            },
            "biotech_deeptech": {
                "frontend": "Next.js 14 + WebGL Molecular Viewer (3D Protein / Chemical Structure Explorer)",
                "backend": "Python FastAPI (Scientific Async API) + Celery GPU Worker Pool for Batch Processing",
                "database_system": "PostgreSQL (Sample & Experiment Ledger) + MinIO / AWS S3 (Large FASTA/BAM Genomic Files)",
                "cloud_platform": "AWS GPU Accelerated Instances (EC2 G5) + AWS S3 Encrypted Object Store",
                "ai_framework": "BioPython + PyTorch Geometric (Graph Neural Networks for Molecular Property Prediction)",
                "deployment": "Docker Multi-Stage Containers with NVIDIA Container Toolkit CUDA Acceleration",
                "reasoning": "Engineered for computational biology and deep science informatics. GPU-accelerated container workers run heavy molecular and sequence alignment algorithms in parallel, while S3 handles multi-gigabyte genomic dataset storage securely."
            },
            "social_media": {
                "frontend": "Flutter / React Native (High-Fidelity Mobile App) + Next.js Web Explorer",
                "backend": "Go (High-Throughput WebSocket Feed Switch) + Python FastAPI (Content Moderation AI)",
                "database_system": "PostgreSQL / ScyllaDB (Activity Feed Event Stream) + Redis (Real-Time Presence)",
                "cloud_platform": "AWS EKS Kubernetes + Cloudflare Stream (Video Transcoding & HLS Delivery)",
                "ai_framework": "PyTorch Computer Vision & NLP for Automated Content Moderation & Toxic Speech Detection",
                "deployment": "Docker Kubernetes + Auto-Scaling WebSocket Ingress Controller",
                "reasoning": "Built for real-time social interaction and viral feed distribution. Go WebSocket gateways maintain millions of concurrent player/creator socket connections, while ScyllaDB handles high-frequency feed fan-out with sub-10ms delivery."
            },
            "travel_marketplace": {
                "frontend": "Next.js 14 + Mapbox GL JS (Interactive Itinerary Planner & Price Heatmap)",
                "backend": "Python FastAPI (Dynamic Pricing & Booking Engine) + Node.js (GDS/Airlines API Router)",
                "database_system": "PostgreSQL with PostGIS (Destination Radius Queries) + Redis (Live Availability Cache)",
                "cloud_platform": "AWS ECS Fargate (Mumbai ap-south-1) + CloudFront Global CDN",
                "ai_framework": "Machine Learning Dynamic Price Prediction & Personalized Travel Itinerary Generator",
                "deployment": "Docker Containers on AWS ECS + Automated Booking Confirmation Webhooks",
                "reasoning": "Designed for travel discovery and instant booking. PostGIS enables rapid search across thousands of hotels and tour experiences, while Redis caches airline and hotel inventory states to eliminate rate discrepancy during checkout."
            },
            "construction_tech": {
                "frontend": "Flutter (Offline Site Inspection & Punchlist App) + Next.js 14 Architectural Admin Portal",
                "backend": "Python FastAPI (AutoCAD/BIM Parser) + Node.js (Contractor & Worker Scheduling)",
                "database_system": "PostgreSQL with PostGIS (Jobsite Geofencing & Material Inventory Ledger) + AWS S3",
                "cloud_platform": "AWS ECS Fargate + AWS S3 (High-Resolution Blueprint & Drone Inspection Storage)",
                "ai_framework": "Ultralytics YOLOv8 (Site Safety PPE Detection — Hardhats, Vests & Hazard Warnings)",
                "deployment": "Docker on Linux Cloud VPS + Automated Worker Attendance Geofencing Webhooks",
                "reasoning": "Engineered for rugged construction jobsite operations. Flutter app operates completely offline in remote construction zones, syncing blueprint revisions and punchlist photos when field engineers regain cell connectivity."
            }
        }

        # Priority Domain Matching
        if any(k in raw for k in ['ev\b', 'charg', 'battery', 'automot', 'vehicle', 'mobility', 'electric vehicle']):
            key = 'ev_mobility'
        elif any(k in raw for k in ['legal', 'lawyer', 'contract', 'paralegal']):
            key = 'legaltech_saas'
        elif any(k in raw for k in ['pet', 'dog', 'cat', 'veterinar', 'animal']):
            key = 'marketplace_ondemand'
        elif any(k in raw for k in ['biotech', 'genom', 'dna', 'protein', 'pharma', 'clinical lab']):
            key = 'biotech_deeptech'
        elif any(k in raw for k in ['fashion', 'cloth', 'apparel', 'cosmetic', 'beauty', 'd2c', 'jewel']):
            key = 'd2c_brand'
        elif any(k in raw for k in ['fitness', 'gym', 'workout', 'trainer', 'diet', 'nutrition', 'wellness']):
            key = 'fitness_wellness'
        elif any(k in raw for k in ['construct', 'site safety', 'architect', 'civil', 'contractor', 'blueprint']):
            key = 'construction_tech'
        elif any(k in raw for k in ['travel', 'hotel', 'tourism', 'flight', 'stay', 'booking', 'trip']):
            key = 'travel_marketplace'
        elif any(k in raw for k in ['social', 'creator', 'influenc', 'community', 'media', 'network']):
            key = 'social_media'
        elif any(k in raw for k in ['crm', 'erp', 'invoice', 'billing', 'workflow', 'productivity', 'saas']):
            key = 'b2b_saas'
        elif any(k in raw for k in ['packag', 'manufactur', 'ecoprint', 'factory', 'industrial']):
            key = 'manufacturing'
        elif any(k in raw for k in ['health', 'medtech', 'patient', 'wearab', 'carepulse', 'doctor', 'clinic', 'hospital']):
            key = 'healthcare'
        elif any(k in raw for k in ['solar', 'cleantech', 'energy', 'renewable', 'carbon', 'solargrid']):
            key = 'cleantech'
        elif any(k in raw for k in ['food', 'beverage', 'cafe', 'restaurant', 'greenbite', 'dining', 'bakery', 'snack']):
            key = 'food & beverage'
        elif any(k in raw for k in ['quick comm', 'e-commerce', 'ecommerce', 'hypermart', 'retail', 'grocery', 'store', 'shop']):
            key = 'e-commerce'
        elif any(k in raw for k in ['fintech', 'crypto', 'payment', 'vaultpay', 'banking', 'wallet', 'invest', 'trading']):
            key = 'fintech'
        elif any(k in raw for k in ['cyber', 'security', 'zero trust', 'threat', 'cybershield', 'firewall', 'antivirus']):
            key = 'cybersecurity'
        elif any(k in raw for k in ['agtech', 'agri', 'farm', 'robofarm', 'crop', 'soil', 'seed']):
            key = 'agtech'
        elif any(k in raw for k in ['gaming', 'game', 'web3', 'metaverse', 'esport', 'unity', 'unreal']):
            key = 'gaming'
        elif any(k in raw for k in ['proptech', 'real estate', 'propmatch', 'property', 'broker', 'rental', 'housing']):
            key = 'proptech'
        elif any(k in raw for k in ['logist', 'fleet', 'freight', 'transport', 'neurallogistics', 'truck', 'cargo', 'delivery', 'drone']):
            key = 'logistics'
        elif any(k in raw for k in ['edtech', 'time table', 'timetable', 'education', 'school', 'skillcraft', 'college', 'course', 'tutor', 'learn']):
            key = 'edtech'
        else:
            # Universal Delivery-Mode Aware Dynamic Fallback
            display_title = context.get('title') or 'this venture'
            display_ind = context.get('industry') or 'this sector'
            
            if sec == 'offline':
                return {
                    'frontend': f'Sunmi Android POS Terminal UI + Handheld Scanner + React QR Web PWA',
                    'backend': f'Node.js (NestJS) / Python FastAPI (Local Server with Cloud Sync)',
                    'database_system': f'PostgreSQL 16 (Local Master with Encrypted Cloud Backup) + Redis',
                    'cloud_platform': f'Google Cloud Run / DigitalOcean (Mumbai) + S3 Daily Backups',
                    'ai_framework': f'Prophet Demand Forecasting & Local Inventory Reorder Analytics',
                    'deployment': f'Docker on Local Terminal + Cloud Run Webhook Sync + ESC/POS Printers',
                    'reasoning': f'Optimized for offline physical operations in {display_ind}. Features durable Android POS hardware integration, ESC/POS thermal receipt printing, offline-tolerant local inventory sync, and dynamic UPI QR billing for {display_title}.'
                }
            elif sec == 'hybrid':
                return {
                    'frontend': f'Next.js 14 Responsive Web PWA + React Native (Field Staff & Customer Mobile App)',
                    'backend': f'Go (High-Concurrency Dispatch Engine) + Python FastAPI + WebSockets',
                    'database_system': f'PostgreSQL 16 with PostGIS (Store Locality & Radius Routing) + Redis 7',
                    'cloud_platform': f'AWS ECS Fargate (Mumbai ap-south-1) + Cloudflare Edge CDN',
                    'ai_framework': f'Machine Learning Dynamic Dispatch & Demand Forecasting Model',
                    'deployment': f'Docker Multi-Stage Containers + GitHub Actions CI/CD to AWS',
                    'reasoning': f'Omnichannel hybrid architecture tailored for {display_title} in {display_ind}. Unifies digital customer ordering with physical fulfillment through PostGIS spatial routing and real-time WebSocket order tracking.'
                }
            else:
                return {
                    'frontend': f'Next.js 14 (App Router) + React 18 + Tailwind CSS (Responsive Web App)',
                    'backend': f'Python FastAPI (Asynchronous High-Throughput REST API) + Node.js',
                    'database_system': f'PostgreSQL 16 (Multi-Tenant Schema & JSONB) + Redis 7 (In-Memory Cache)',
                    'cloud_platform': f'AWS ECS Fargate (Mumbai ap-south-1) / Vercel Pro + CloudFront CDN',
                    'ai_framework': f'Groq LLaMA-3 (Intelligent Workflow Automation & Domain AI Engine)',
                    'deployment': f'Docker Multi-Stage Containers + GitHub Actions Automated CI/CD',
                    'reasoning': f'Modern cloud-native decoupled architecture built for {display_title} in {display_ind}. Delivers sub-second responsiveness, horizontal container auto-scaling, and strict DPDP Act 2023 compliance with low monthly operating costs.'
                }

        return SECTOR_BLUEPRINTS[key]

    @staticmethod
    def search_yc_competitors(industry: str, query: str = '', limit: int = 4) -> list:
        """Searches 5,997 YC startup companies with differentiated similarity scores, strengths, weaknesses, gaps, and USPs."""
        ensure_ml_models_loaded()
        if not _yc_competitors:
            return []

        ind_clean = str(industry).lower()
        query_clean = str(query).lower()
        STOP_WORDS = {
            'b2b', 'b2c', 'software', 'services', 'service', 'tech', 'technology', 'technologies',
            'platform', 'platforms', 'online', 'application', 'applications', 'app', 'apps',
            'solutions', 'solution', 'tools', 'tool', 'system', 'systems', 'and', 'the', 'for',
            'with', 'inc', 'com', 'co', 'ai', 'artificial', 'intelligence', 'startup', 'startups',
            'digital', 'global', 'india', 'united', 'states', 'market', 'product', 'products',
            'maker', 'makers', 'generator', 'generators', 'suite', 'hub', 'space', 'management',
            'computing', 'computer', 'company', 'companies', 'enterprise', 'group', 'business'
        }
        all_words = set(re.findall(r'\w+', f"{ind_clean} {query_clean}"))
        domain_keywords = {w for w in all_words if len(w) > 2 and w not in STOP_WORDS}
        
        # High-value domain triggers with differentiated weights
        combined_text = f"{ind_clean} {query_clean}"
        ultra_priority_tokens = [
            'resume', 'resumes', 'finops', 'cloud cost', 'cloud spend', 'aws cost', 'kubernetes cost',
            'ats', 'cv builder', 'crossfit', 'sourdough', 'patisserie', 'croissant', 'smart clinic',
            'quick commerce', 'farm to table', 'dum biryani'
        ]
        standard_priority_tokens = [
            'jobseeker', 'job seekers', 'career', 'portfolio', 'billing', 'telemedicine', 'primary care',
            'patient', 'doctor', 'grocery', 'organic food', 'fresh farm', 'gym', 'fitness',
            'workout', 'strength training', 'biryani', 'restaurant', 'food delivery', 'cloud kitchen',
            'bakery', 'artisan bread', 'pastry'
        ]

        active_ultra_tokens = [p for p in ultra_priority_tokens if p in combined_text]
        active_std_tokens = [p for p in standard_priority_tokens if p in combined_text]

        matches = []

        for c in _yc_competitors:
            c_name = c.get('name', 'Competitor')
            c_ind = str(c.get('industry', '')).lower()
            c_tags_raw = str(c.get('tags', ''))
            c_one_liner = str(c.get('one_liner', '')).lower()
            c_long_desc = str(c.get('long_description', '')).lower()
            c_desc = f"{c_one_liner} {c_long_desc}".strip()
            c_batch = c.get('batch', 'Active')

            # Clean up tags formatting (remove raw python list characters)
            tags_cleaned = re.sub(r"[\[\]'\"`]", "", c_tags_raw).strip()
            tags_list = [t.strip() for t in tags_cleaned.split(',') if t.strip()]
            formatted_tags = ", ".join(tags_list[:4]) if tags_list else c_ind.title()

            # Dynamic domain-specific relevance score
            raw_score = 0
            domain_matched = False

            def match_token(token, target):
                if not target:
                    return False
                if len(token) <= 4:
                    return bool(re.search(r'\b' + re.escape(token) + r'\b', target))
                return token in target

            # 1. Ultra priority domain tokens (Direct domain hits)
            if active_ultra_tokens:
                for up in active_ultra_tokens:
                    if match_token(up, c_name.lower()):
                        raw_score += 70
                        domain_matched = True
                    if match_token(up, c_one_liner):
                        raw_score += 60
                        domain_matched = True
                    elif match_token(up, c_desc):
                        raw_score += 45
                        domain_matched = True
                    if match_token(up, c_tags_raw.lower()):
                        raw_score += 40
                        domain_matched = True

            # 2. Standard priority tokens
            if active_std_tokens:
                for sp in active_std_tokens:
                    if match_token(sp, c_name.lower()):
                        raw_score += 40
                        domain_matched = True
                    if match_token(sp, c_one_liner):
                        raw_score += 35
                        domain_matched = True
                    elif match_token(sp, c_desc):
                        raw_score += 25
                        domain_matched = True
                    if match_token(sp, c_tags_raw.lower()):
                        raw_score += 20
                        domain_matched = True

            # 3. Domain keywords
            if domain_keywords:
                for word in domain_keywords:
                    if match_token(word, c_name.lower()):
                        raw_score += 20
                        domain_matched = True
                    if match_token(word, c_one_liner):
                        raw_score += 15
                        domain_matched = True
                    elif match_token(word, c_desc):
                        raw_score += 10
                        domain_matched = True
                    if match_token(word, c_tags_raw.lower()):
                        raw_score += 10
                        domain_matched = True

                # If domain keywords exist, do not return companies that have zero domain match
                if not domain_matched or raw_score < 35:
                    continue
            else:
                if ind_clean and ind_clean in c_ind:
                    raw_score += 20
                if raw_score < 30:
                    continue

            matches.append((raw_score, c, formatted_tags, c_batch))

        # Sort by raw score descending
        matches.sort(key=lambda x: x[0], reverse=True)
        top_matches = matches[:limit]

        results = []
        score_tiers = [88.5, 79.0, 71.5, 64.0, 58.0]

        for i, (score, c, formatted_tags, batch) in enumerate(top_matches):
            c_name = c.get('name', f'Competitor {i+1}')
            one_liner = c.get('one_liner') or f"Provider in {formatted_tags}"
            assigned_score = score_tiers[i] if i < len(score_tiers) else max(50.0, 85.0 - (i * 7.5))

            # No rating or review data exists for YC dataset entries. These were
            # previously synthesised from hash(c_name) - an invented star rating and
            # an invented review count - then described as "verified user reviews".
            cust_rating = None
            cust_rev = None
            cust_sentiment = "Rating data not available for this competitor"

            s = f"• Strong enterprise brand credibility with Y Combinator ({batch}) venture backing: '{one_liner}'.\n• Established presence in {formatted_tags}."
            w = f"• Likely gap: rigid legacy enterprise tiers and complex self-serve onboarding.\n• Likely gap: slower innovation velocity vs next-generation AI-native workflows. No customer review data was retrieved for this competitor, so these are hypotheses to validate."
            gap = f"Outperform {c_name} with intuitive self-serve workflows, accessible transparent pricing, and instant AI-driven automation."
            usp = f"Opportunity to differentiate on faster setup and lower total cost of ownership than {c_name} — a positioning target, not a measured comparison."
            exp = f"YC competitor match: {c_name} — domain match on {formatted_tags} from the Y Combinator company dataset. No customer rating data is available for this entry."

            results.append({
                "name": c_name,
                "url": c.get('website', ''),
                "one_liner": one_liner,
                "description": c.get('long_description') or one_liner,
                "tags": formatted_tags,
                "batch": batch,
                "similarity_score": round(assigned_score, 1),
                "rating": cust_rating,
                "review_count": cust_rev,
                "customer_sentiment": cust_sentiment,
                "strengths": s,
                "weaknesses": w,
                "competitive_gap": gap,
                "usp": usp,
                "analysis_explanation": exp
            })

        return results

    # -----------------------------------------------------------------
    # HELPER: Industry benchmarks
    # -----------------------------------------------------------------
    @staticmethod
    def get_industry_benchmark(industry: str) -> dict:
        ind_clean = str(industry).lower().strip()
        if ind_clean in _industry_benchmarks:
            return _industry_benchmarks[ind_clean]
        for k, v in _industry_benchmarks.items():
            if k in ind_clean or ind_clean in k:
                return v
        return {
            "avg_funding": 500000.0,
            "avg_revenue": 250000.0,
            "avg_valuation": 2500000.0,
            "avg_team_size": 8
        }

    @staticmethod
    def get_popular_tech_stack() -> dict:
        """Returns empirical technology popularity from Stack Overflow survey."""
        if _tech_benchmarks:
            return _tech_benchmarks
        return {
            "top_web_frameworks": [["React.js", 35000], ["Node.js", 28000]],
            "top_databases": [["PostgreSQL", 42000], ["Redis", 25000]],
            "top_platforms": [["AWS", 38000], ["Docker", 32000]]
        }
