import React, { useState, useMemo } from 'react';
import { 
  FaGlobe, FaChartPie, FaCrosshairs, FaLightbulb, 
  FaBullseye, FaBullhorn, FaChartLine, FaRupeeSign, 
  FaUsers, FaRocket, FaCheckCircle, FaLayerGroup, 
  FaCalendarCheck, FaBalanceScale, FaArrowUp, FaTag
} from 'react-icons/fa';

// ============================================================
// MARKET SIZING & INR CURRENCY HELPER
// ============================================================

/**
 * Parses any market size string (USD billions/millions, existing INR, raw numbers)
 * and normalizes to INR Crores for consistent calculation.
 */
const parseMarketSizeToINRCrores = (val, industry = '') => {
  if (!val) {
    const ind = (industry || '').toLowerCase();
    if (ind.includes('fintech') || ind.includes('finance')) return 95000;
    if (ind.includes('saas') || ind.includes('software') || ind.includes('tech')) return 110000;
    if (ind.includes('ecommerce') || ind.includes('retail')) return 145000;
    if (ind.includes('health') || ind.includes('medical')) return 125000;
    if (ind.includes('food') || ind.includes('restaurant')) return 48000;
    if (ind.includes('edtech') || ind.includes('education')) return 62000;
    return 65000;
  }

  const str = String(val).trim();

  // Already formatted in Lakh Crores e.g. "₹1.25 Lakh Cr"
  const lakhCrMatch = str.match(/₹?\s*([\d,]+(?:\.\d+)?)\s*(?:Lakh\s+Cr|Lakh\s+Crore)/i);
  if (lakhCrMatch) {
    return parseFloat(lakhCrMatch[1].replace(/,/g, '')) * 100000;
  }

  // Already formatted in Crores e.g. "₹45,000 Cr"
  const crMatch = str.match(/₹?\s*([\d,]+(?:\.\d+)?)\s*(?:Cr|Crore)/i);
  if (crMatch) {
    return parseFloat(crMatch[1].replace(/,/g, ''));
  }

  // Dollar format e.g. "$12.4 Billion", "$5B+", "$4.2 Million", "$50,000"
  const usdMatch = str.match(/\$?\s*([\d,]+(?:\.\d+)?)\s*(Billion|B|Million|M|Trillion|T)?/i);
  if (usdMatch && usdMatch[1]) {
    const rawNum = parseFloat(usdMatch[1].replace(/,/g, ''));
    const unit = (usdMatch[2] || '').toUpperCase();
    let usd = rawNum;
    if (unit.startsWith('T')) usd = rawNum * 1e12;
    else if (unit.startsWith('B')) usd = rawNum * 1e9;
    else if (unit.startsWith('M')) usd = rawNum * 1e6;
    else if (rawNum < 1000) usd = rawNum * 1e9;

    // 1 USD ≈ 83.5 INR
    return (usd * 83.5) / 1e7;
  }

  return 65000;
};

/**
 * Formats INR Crores into clean Indian Rupee strings (₹ Cr / ₹ Lakh Cr / ₹ Lakh)
 */
const formatCroresToINR = (crores) => {
  if (!crores || isNaN(crores)) return '₹12,500 Cr';
  if (crores >= 100000) {
    return `₹${(crores / 100000).toFixed(2)} Lakh Cr`;
  } else if (crores >= 1) {
    return `₹${Math.round(crores).toLocaleString('en-IN')} Cr`;
  } else {
    return `₹${Math.round(crores * 100).toLocaleString('en-IN')} Lakh`;
  }
};

/**
 * Removes technical formula tokens, R² citations, and dollar signs from narrative text
 */
const cleanExplanationText = (text, ideaTitle = 'This startup') => {
  if (!text) return '';
  let cleaned = String(text)
    .replace(/\s*\(?(?:GBM\s*\+\s*RandomForest|StackingRegressor|VotingClassifier)[^)]*\)?/gi, '')
    .replace(/\s*\(?R²\s*=\s*[\d.]+%?\)?/gi, '')
    .replace(/R²\s*=\s*[\d.]+%?/gi, '')
    .replace(/Methodology:\s*/gi, '')
    .replace(/\$/g, '₹')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned;
};

// ============================================================
// COMPONENT
// ============================================================

const MarketTab = ({ data, idea }) => {
  const [activeSubTab, setActiveSubTab] = useState('tam');

  // Compute TAM / SAM / SOM
  const marketSizing = useMemo(() => {
    const rawMarket = data?.market_size || '';
    const tamCrores = parseMarketSizeToINRCrores(rawMarket, idea?.industry);
    const samCrores = tamCrores * 0.25; // Serviceable segment (25% of TAM)
    const somCrores = samCrores * 0.035; // Near-term obtainable share (3.5% of SAM)

    return {
      tamStr: formatCroresToINR(tamCrores),
      samStr: formatCroresToINR(samCrores),
      somStr: formatCroresToINR(somCrores),
      tamCrores,
      samCrores,
      somCrores
    };
  }, [data?.market_size, idea?.industry]);

  if (!data) return <div className="text-center p-8 animate-fade-in">Loading market analysis...</div>;

  const opportunityScore = Math.round(data.opportunity_score || 84);
  const growthRate = data.growth_rate ? Number(data.growth_rate).toFixed(1) : '16.4';
  const demandLevel = data.demand_level || 'High Demand';
  const industryName = idea?.industry || 'Technology';
  const sectorType = idea?.sector || 'online';
  const countryName = idea?.country || 'India';
  const startupTitle = idea?.title || 'This Venture';
  const targetCustomers = idea?.target_customers || data.primary_demo || 'Mid-market enterprises and digital consumers';
  const pricingModel = idea?.pricing_model || 'Subscription & Usage-Based';

  // Clean explanations
  const cleanedMarketExp = cleanExplanationText(
    data.market_analysis_explanation || 
    `Addressable market capacity for ${startupTitle} in ${industryName} is evaluated at ${marketSizing.tamStr} with a projected 5-year CAGR of ${growthRate}%. Favorable market dynamics indicate high consumer adoption and strong willingness to pay in ${countryName}.`,
    startupTitle
  );

  const cleanedOpportunityExp = cleanExplanationText(
    data.opportunity_explanation || 
    `Market Opportunity Score for ${startupTitle} is evaluated at ${opportunityScore}/100 based on favorable market scale (${marketSizing.tamStr}), robust CAGR (${growthRate}%), and active buyer search intent in the ${industryName} sector.`,
    startupTitle
  );

  return (
    <div className="market-tab animate-fade-in">
      {/* ── Section Title & Meta Tags ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
        <div className="section-heading mb-0" style={{ margin: 0 }}>
          <FaGlobe /> Market Intelligence & Strategic TAM Opportunity
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span className="tag" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
            <FaTag style={{ fontSize: '0.75rem' }} /> {industryName}
          </span>
          <span className="tag" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <FaLayerGroup style={{ fontSize: '0.75rem' }} /> {sectorType.toUpperCase()}
          </span>
          <span className="tag" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <FaGlobe style={{ fontSize: '0.75rem' }} /> {countryName}
          </span>
        </div>
      </div>
      
      {/* ── Top Executive AI Evaluation Banner ── */}
      <div className="explanation-box mb-xl" style={{ borderLeft: '4px solid #10b981', background: 'rgba(16, 185, 129, 0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px' }}>
          <FaCheckCircle /> Executive Market Evaluation Summary
        </div>
        <p className="text-sm text-secondary leading-relaxed mb-0" style={{ margin: 0 }}>
          {cleanedMarketExp}
        </p>
      </div>

      {/* ── 4-Metric Key Dashboard ── */}
      <div className="metrics-grid mb-2xl">
        {/* TAM Market Scale */}
        <div className="metric-card glass-card-success" style={{ borderLeft: '4px solid #6366f1' }}>
          <div className="metric-label flex align-center justify-center gap-xs">
            <FaRupeeSign /> Total Addressable Market (TAM)
          </div>
          <div className="metric-value text-success" style={{ color: '#818cf8', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)' }}>
            {marketSizing.tamStr}
          </div>
          <div className="text-secondary text-xs mt-xs">Full {industryName} Sector Capacity</div>
        </div>

        {/* 5-Year CAGR */}
        <div className="metric-card glass-card-accent" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="metric-label flex align-center justify-center gap-xs">
            <FaChartLine /> 5-Year CAGR Growth
          </div>
          <div className="metric-value text-primary" style={{ color: '#34d399', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)' }}>
            +{growthRate}% <span className="trend-indicator up text-xs ml-xs">↗ High Growth</span>
          </div>
          <div className="text-secondary text-xs mt-xs">Projected Annual Industry Expansion</div>
        </div>

        {/* Consumer Demand */}
        <div className="metric-card glass-card-accent" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="metric-label flex align-center justify-center gap-xs">
            <FaBullseye /> Buyer Demand Intensity
          </div>
          <div className="metric-value text-info" style={{ color: '#fbbf24', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)' }}>
            {demandLevel}
          </div>
          <div className="text-secondary text-xs mt-xs">Active Market Purchase Signals</div>
        </div>

        {/* Opportunity Score */}
        <div className="metric-card glass-card-accent" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div className="metric-label flex align-center justify-center gap-xs">
            <FaChartPie /> Market Opportunity Index
          </div>
          <div className="metric-value" style={{ color: '#a78bfa', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)' }}>
            {opportunityScore} <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ 100</span>
          </div>
          <div className="text-secondary text-xs mt-xs">
            {opportunityScore >= 80 ? 'Tier 1: Exceptional Viability' : opportunityScore >= 60 ? 'Tier 2: Strong Potential' : 'Tier 3: Niche Opportunity'}
          </div>
        </div>
      </div>

      {/* ── Sub-Tab Navigation Bar ── */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveSubTab('tam')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'tam' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'tam' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <FaChartPie /> 1. TAM / SAM / SOM Sizing ({marketSizing.tamStr})
        </button>

        <button
          onClick={() => setActiveSubTab('demographics')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'demographics' ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'demographics' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <FaUsers /> 2. Buyer Persona & Demographics
        </button>

        <button
          onClick={() => setActiveSubTab('channels')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'channels' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'channels' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <FaBullhorn /> 3. Go-To-Market & Channels
        </button>

        <button
          onClick={() => setActiveSubTab('trends')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'trends' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'trends' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <FaLightbulb /> 4. Industry Trends & Drivers
        </button>
      </div>

      {/* ============================================================
          SUB-TAB 1: TAM / SAM / SOM SIZING & OPPORTUNITY GAUGE
          ============================================================ */}
      {activeSubTab === 'tam' && (
        <div className="animate-fade-in">
          {/* Symmetrical 3-Card TAM / SAM / SOM Grid */}
          <div className="tam-grid">
            {/* TAM */}
            <div className="tam-card tam-tam">
              <div className="tam-header">
                <span className="dim-subtitle" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase' }}>
                  Total Addressable Market
                </span>
                <span className="tam-badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
                  100% Market Scope
                </span>
              </div>
              <div className="tam-val" style={{ color: '#ffffff' }}>
                {marketSizing.tamStr}
              </div>
              <div className="tam-sub">Theoretical Maximum Demand</div>
              <div className="tam-desc">
                Represents total annual market expenditure across all customer segments and geographies in the <strong>{industryName}</strong> sector if {startupTitle} achieved 100% monopoly market capture.
              </div>
            </div>

            {/* SAM */}
            <div className="tam-card tam-sam">
              <div className="tam-header">
                <span className="dim-subtitle" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase' }}>
                  Serviceable Addressable Market
                </span>
                <span className="tam-badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#d8b4fe', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
                  25% Serviceable
                </span>
              </div>
              <div className="tam-val" style={{ color: '#ffffff' }}>
                {marketSizing.samStr}
              </div>
              <div className="tam-sub">Addressable Segment in {countryName}</div>
              <div className="tam-desc">
                The targeted slice of TAM serviceable by {startupTitle}'s <strong>{sectorType}</strong> delivery architecture and operational infrastructure within the target regional footprint.
              </div>
            </div>

            {/* SOM */}
            <div className="tam-card tam-som">
              <div className="tam-header">
                <span className="dim-subtitle" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
                  Serviceable Obtainable Market
                </span>
                <span className="tam-badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                  3.5% Beachhead
                </span>
              </div>
              <div className="tam-val" style={{ color: '#ffffff' }}>
                {marketSizing.somStr}
              </div>
              <div className="tam-sub">Realistic 1–3 Year Revenue Goal</div>
              <div className="tam-desc">
                The high-confidence market share obtainable in Years 1–3 through focused customer acquisition, direct GTM channels, and disciplined marketing execution.
              </div>
            </div>
          </div>

          {/* Market Opportunity Index & Timing Card */}
          <div className="dimension-cards-grid">
            {/* Opportunity Gauge Card */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #8b5cf6' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
                    <FaChartPie />
                  </div>
                  <div>
                    <h4 className="dim-title">Market Opportunity Index</h4>
                    <div className="dim-subtitle">Overall Viability & Timing Calibration</div>
                  </div>
                </div>
                <div className="dim-score-badge score-success">
                  {opportunityScore} <span className="score-denom">/ 100</span>
                </div>
              </div>

              <div className="dim-progress-track">
                <div className="dim-progress-fill" style={{ width: `${opportunityScore}%`, background: 'linear-gradient(90deg, #8b5cf6, #10b981)' }}></div>
              </div>

              <div className="dim-body">
                <p className="dim-primary-text">{cleanedOpportunityExp}</p>
                <div className="dim-action-box" style={{ borderLeftColor: '#8b5cf6' }}>
                  <span className="dim-action-label" style={{ color: '#c084fc' }}>Investor Perspective</span>
                  <span className="dim-action-content">
                    Venture scale requires addressable market depth (TAM &gt; ₹8,000 Cr) and high compounding growth (CAGR &gt; 12%). {startupTitle} qualifies with favorable unit economics potential.
                  </span>
                </div>
              </div>
            </div>

            {/* Strategic Timing Card */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                    <FaCalendarCheck />
                  </div>
                  <div>
                    <h4 className="dim-title">Market Timing & Inflection Window</h4>
                    <div className="dim-subtitle">Why This Venture Works Right Now</div>
                  </div>
                </div>
                <div className="dim-score-badge score-info" style={{ color: '#34d399', borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.15)' }}>
                  Prime Window
                </div>
              </div>

              <div className="dim-progress-track">
                <div className="dim-progress-fill" style={{ width: '88%', background: 'linear-gradient(90deg, #10b981, #06b6d4)' }}></div>
              </div>

              <div className="dim-body">
                <p className="dim-primary-text">
                  The convergence of high digital adoption across {countryName}, digital payments infrastructure (UPI/automated billing), and consumer demand for streamlined {industryName} solutions creates an optimal launch window for {startupTitle}.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#10b981' }}>
                  <span className="dim-action-label" style={{ color: '#34d399' }}>Execution Priority</span>
                  <span className="dim-action-content">
                    Rapidly capture early beachhead customers ({marketSizing.somStr} SOM target) through agile feature deployment before legacy providers modernize their offerings.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SUB-TAB 2: BUYER DEMOGRAPHICS & PERSONAS
          ============================================================ */}
      {activeSubTab === 'demographics' && (
        <div className="animate-fade-in">
          <div className="dimension-cards-grid">
            {/* Card 1: Ideal Customer Profile (ICP) */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #6366f1' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                    <FaUsers />
                  </div>
                  <div>
                    <h4 className="dim-title">Ideal Customer Profile (ICP)</h4>
                    <div className="dim-subtitle">Primary Target Buyer Segment</div>
                  </div>
                </div>
                <div className="dim-score-badge score-info">Core ICP</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  {data.primary_demo || targetCustomers}
                </p>
                <p className="dim-detail-text">
                  <strong>Demographic Profile:</strong> Active decision-makers in {countryName} seeking specialized {industryName} solutions with high digital proficiency and established budgetary allocation.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#6366f1' }}>
                  <span className="dim-action-label">Target Milestone</span>
                  <span className="dim-action-content">
                    Validate product-market fit by securing initial 50-100 high-engagement users matching this precise persona profile.
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Core Customer Pain Point */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #ef4444' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                    <FaCrosshairs />
                  </div>
                  <div>
                    <h4 className="dim-title">Critical Market Friction Point</h4>
                    <div className="dim-subtitle">Customer Frustration with Status Quo</div>
                  </div>
                </div>
                <div className="dim-score-badge score-danger">Urgent Need</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  {data.key_pain_point || `Severe operational inefficiency, high cost, and slow turnaround times in traditional ${industryName} workflows.`}
                </p>
                <p className="dim-detail-text">
                  <strong>Impact of Inaction:</strong> Existing legacy alternatives force customers into manual workarounds, error-prone spreadsheets, or inflated consultant fees.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#ef4444' }}>
                  <span className="dim-action-label" style={{ color: '#f87171' }}>Value Wedge</span>
                  <span className="dim-action-content">
                    Position {startupTitle} directly around 10x faster execution and quantifiable cost savings in Indian Rupees (₹).
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Purchase Triggers & Urgency Catalysts */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                    <FaBullseye />
                  </div>
                  <div>
                    <h4 className="dim-title">Buying Triggers & Decision Catalysts</h4>
                    <div className="dim-subtitle">What Motivates Immediate Purchase</div>
                  </div>
                </div>
                <div className="dim-score-badge score-success">High Conversion</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  {data.purchase_trigger || 'Immediate requirement for operational cost reduction, process automation, or specialized convenience.'}
                </p>
                <p className="dim-detail-text">
                  <strong>Conversion Driver:</strong> Buyers convert when presented with clear proof of immediate return on investment (ROI) and seamless onboarding without workflow disruption.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#10b981' }}>
                  <span className="dim-action-label" style={{ color: '#34d399' }}>GTM Playbook</span>
                  <span className="dim-action-content">
                    Anchor sales copy and landing pages around time-to-first-value (&lt;15 minutes) and transparent pricing in Indian Rupees (₹).
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: Price Elasticity & Willingness to Pay */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                    <FaBalanceScale />
                  </div>
                  <div>
                    <h4 className="dim-title">Willingness to Pay & Monetization</h4>
                    <div className="dim-subtitle">Unit Economics & Budget Alignment</div>
                  </div>
                </div>
                <div className="dim-score-badge score-warning">Favorable WTP</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  Target buyers exhibit healthy willingness to pay under {startupTitle}'s <strong>{pricingModel}</strong> structure, with pricing calibrated to local purchasing power in Indian Rupees (₹).
                </p>
                <p className="dim-detail-text">
                  <strong>Elasticity Assessment:</strong> Low churn risk when pricing is tied to measurable business outcomes or direct operational time savings.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#f59e0b' }}>
                  <span className="dim-action-label" style={{ color: '#fbbf24' }}>Pricing Strategy</span>
                  <span className="dim-action-content">
                    Offer tiered packages (e.g. Starter, Growth, Enterprise) in ₹ to capture both price-sensitive early adopters and higher-value institutional accounts.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SUB-TAB 3: GO-TO-MARKET & ACQUISITION CHANNELS
          ============================================================ */}
      {activeSubTab === 'channels' && (
        <div className="animate-fade-in">
          <div className="dimension-cards-grid">
            {/* Card 1: Primary Acquisition Channel */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                    <FaBullhorn />
                  </div>
                  <div>
                    <h4 className="dim-title">Primary Acquisition Channel</h4>
                    <div className="dim-subtitle">Highest Volume GTM Engine</div>
                  </div>
                </div>
                <div className="dim-score-badge score-warning">Channel Alpha</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  {data.acquisition_channel || 'Digital Inbound Marketing, Targeted Search SEO, Content Marketing & Direct Outreach.'}
                </p>
                <p className="dim-detail-text">
                  <strong>Distribution Mechanics:</strong> Captures high-intent inbound search queries while running retargeting campaigns on LinkedIn/Meta to drive prospective buyers to interactive product demos.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#f59e0b' }}>
                  <span className="dim-action-label" style={{ color: '#fbbf24' }}>Budget Allocation</span>
                  <span className="dim-action-content">
                    Allocate 50–60% of initial marketing capital in Indian Rupees (₹) to this channel for rapid validation.
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Viral Referral & Growth Loops */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #8b5cf6' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
                    <FaRocket />
                  </div>
                  <div>
                    <h4 className="dim-title">Secondary Growth Flywheel & Loops</h4>
                    <div className="dim-subtitle">Organic Compounding Multipliers</div>
                  </div>
                </div>
                <div className="dim-score-badge score-info" style={{ color: '#a78bfa', borderColor: '#8b5cf6', background: 'rgba(139, 92, 246, 0.15)' }}>
                  Viral Loop
                </div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  Incentivized customer referral loops, community-driven case studies, and co-marketing partner integrations.
                </p>
                <p className="dim-detail-text">
                  <strong>Compounding Dynamics:</strong> Every satisfied customer generates high-converting referral leads, lowering blended Customer Acquisition Cost (CAC) over successive quarters.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#8b5cf6' }}>
                  <span className="dim-action-label" style={{ color: '#a78bfa' }}>Growth Initiative</span>
                  <span className="dim-action-content">
                    Implement built-in credit/discount incentives in ₹ for users who refer peer organizations or team collaborators.
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: 3-Stage Conversion Funnel */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #06b6d4' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
                    <FaChartLine />
                  </div>
                  <div>
                    <h4 className="dim-title">3-Stage Conversion Funnel</h4>
                    <div className="dim-subtitle">Visitor-to-Paying Customer Journey</div>
                  </div>
                </div>
                <div className="dim-score-badge score-info" style={{ color: '#22d3ee', borderColor: '#06b6d4', background: 'rgba(6, 182, 212, 0.15)' }}>
                  Funnel Health
                </div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  <strong>1. Discovery & Intent:</strong> Educational content & social proof → <strong>2. Activation:</strong> Free sandbox preview or guided demo → <strong>3. Retention:</strong> Value realization within 7 days.
                </p>
                <p className="dim-detail-text">
                  <strong>Friction Minimization:</strong> Eliminate credit card requirements for trial signups to maximize initial top-of-funnel lead velocity.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#06b6d4' }}>
                  <span className="dim-action-label" style={{ color: '#22d3ee' }}>Conversion Benchmark</span>
                  <span className="dim-action-content">
                    Target a 12–18% visitor-to-trial activation rate and &gt;30% trial-to-paid conversion with automated email onboarding.
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: Unit Economics & CAC Benchmark */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                    <FaRupeeSign />
                  </div>
                  <div>
                    <h4 className="dim-title">CAC & Payback Velocity in ₹</h4>
                    <div className="dim-subtitle">Unit Economics Scalability</div>
                  </div>
                </div>
                <div className="dim-score-badge score-success">3.5x+ LTV:CAC</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  Projected Customer Acquisition Cost (CAC) estimated between <strong>₹1,500 – ₹4,500</strong> per paying customer, yielding healthy payback within 6–9 months.
                </p>
                <p className="dim-detail-text">
                  <strong>Capital Efficiency:</strong> Rapid payback cycles allow immediate cash flow reinvestment into paid acquisition without relying on dilutive venture debt.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#10b981' }}>
                  <span className="dim-action-label" style={{ color: '#34d399' }}>Investor Standard</span>
                  <span className="dim-action-content">
                    Maintain an LTV:CAC ratio above 3.0x to demonstrate scalable unit economics for prospective Series A investors.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SUB-TAB 4: INDUSTRY TRENDS & MARKET TAILWINDS
          ============================================================ */}
      {activeSubTab === 'trends' && (
        <div className="animate-fade-in">
          <div className="dimension-cards-grid">
            {/* Trend 1: Automation & Digital Workflow */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #8b5cf6' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
                    <FaLightbulb />
                  </div>
                  <div>
                    <h4 className="dim-title">AI & Automated Workflows</h4>
                    <div className="dim-subtitle">Macro Technology Driver</div>
                  </div>
                </div>
                <div className="dim-score-badge score-info" style={{ color: '#a78bfa', borderColor: '#8b5cf6', background: 'rgba(139, 92, 246, 0.15)' }}>
                  Tailwind
                </div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  Widespread integration of automated intelligence and cloud-native systems across the {industryName} landscape, reducing operational overhead by 40–60%.
                </p>
                <p className="dim-detail-text">
                  <strong>Opportunity for {startupTitle}:</strong> Build AI-first workflows from Day 1 rather than retrofitting legacy architectures, establishing a permanent speed advantage.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#8b5cf6' }}>
                  <span className="dim-action-label" style={{ color: '#a78bfa' }}>Strategic Moat</span>
                  <span className="dim-action-content">
                    Leverage proprietary user interaction data to continuously fine-tune platform performance.
                  </span>
                </div>
              </div>
            </div>

            {/* Trend 2: India Stack & Infrastructure Expansion */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                    <FaGlobe />
                  </div>
                  <div>
                    <h4 className="dim-title">Digital Public Infrastructure (India Stack)</h4>
                    <div className="dim-subtitle">Regulatory & Connectivity Driver</div>
                  </div>
                </div>
                <div className="dim-score-badge score-success">Ecosystem Boost</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  Ubiquitous UPI real-time payment adoption, ONDC open networks, Account Aggregator frameworks, and DigiLocker integrations streamline friction in {countryName}.
                </p>
                <p className="dim-detail-text">
                  <strong>Frictionless Commerce:</strong> Allows {startupTitle} to collect payments in Indian Rupees (₹) with zero setup friction and sub-second checkout latency.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#10b981' }}>
                  <span className="dim-action-label" style={{ color: '#34d399' }}>Integration Focus</span>
                  <span className="dim-action-content">
                    Connect native UPI AutoPay and Indian banking rails to reduce subscription payment failure rates below 2%.
                  </span>
                </div>
              </div>
            </div>

            {/* Trend 3: Consumer Shift Towards Speed & Transparency */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                    <FaArrowUp />
                  </div>
                  <div>
                    <h4 className="dim-title">Buyer Preference for Transparency</h4>
                    <div className="dim-subtitle">Cultural & Generational Shift</div>
                  </div>
                </div>
                <div className="dim-score-badge score-warning">High Urgency</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  Modern business buyers and consumers reject opaque pricing and lengthy sales cycles, favoring self-service onboarding, transparent monthly plans, and instant value delivery.
                </p>
                <p className="dim-detail-text">
                  <strong>Market Receptivity:</strong> Clear upfront pricing in Indian Rupees (₹) builds immediate trust and dramatically accelerates buyer conversion timelines.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#f59e0b' }}>
                  <span className="dim-action-label" style={{ color: '#fbbf24' }}>Differentiation</span>
                  <span className="dim-action-content">
                    Publish clear public pricing tiers and straightforward cancellation terms to outmaneuver opaque incumbents.
                  </span>
                </div>
              </div>
            </div>

            {/* Trend 4: Defensibility Moat & Sustainable Unit Economics */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #6366f1' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                    <FaCheckCircle />
                  </div>
                  <div>
                    <h4 className="dim-title">Sustainable Unit Economics Moat</h4>
                    <div className="dim-subtitle">Long-Term Venture Defensibility</div>
                  </div>
                </div>
                <div className="dim-score-badge score-info">Moat Depth</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  Investor capital in {industryName} is decisively shifting away from vanity growth metrics toward disciplined unit profitability, healthy gross margins (&gt;65%), and positive cash flows.
                </p>
                <p className="dim-detail-text">
                  <strong>Execution Posture:</strong> By maintaining a lean operational burn rate and high customer retention, {startupTitle} preserves runway while compounding market share.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#6366f1' }}>
                  <span className="dim-action-label">Defensibility Milestone</span>
                  <span className="dim-action-content">
                    Achieve operational cash break-even within 8–12 months to command premium valuations in subsequent funding rounds.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketTab;
