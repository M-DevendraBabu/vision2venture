import React, { useState, useMemo } from 'react';
import { 
  FaGlobe, FaChartPie, FaCrosshairs, FaLightbulb, 
  FaBullseye, FaBullhorn, FaChartLine, FaRupeeSign, 
  FaUsers, FaRocket, FaCheckCircle, FaLayerGroup, 
  FaCalendarCheck, FaBalanceScale, FaArrowUp, FaTag
} from 'react-icons/fa';
import SourceBadge from './SourceBadge';

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
const cleanExplanationText = (text) => {
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

  const industryName = idea?.industry || 'Technology';
  const sectorType = (idea?.sector || 'online').toLowerCase();
  const isOffline = sectorType.includes('offline') || sectorType.includes('physical');
  const isHybrid = sectorType.includes('hybrid') || sectorType.includes('phygital');
  const countryName = idea?.country || 'India';
  const locationName = idea?.location || countryName;
  const startupTitle = idea?.title || 'This Venture';
  const targetCustomers = idea?.target_customers || data?.primary_demo || 'Target commercial buyers';
  const pricingModel = idea?.pricing_model || (isOffline ? 'Direct Retail & Point of Sale' : 'Subscription & Usage-Based');
  const budget = parseFloat(idea?.budget || 300000);

  // Compute TAM / SAM / SOM with dynamic venture economics
  const marketSizing = useMemo(() => {
    let tamCrores = isOffline ? 50.0 : 35000.0;
    let rawMarketStr = data?.market_size ? String(data.market_size).trim() : '';

    if (rawMarketStr) {
      const lakhCrMatch = rawMarketStr.match(/₹?\s*([\d,]+(?:\.\d+)?)\s*(?:Lakh\s+Cr|Lakh\s+Crore)/i);
      const crMatch = rawMarketStr.match(/₹?\s*([\d,]+(?:\.\d+)?)\s*(?:Cr|Crore)/i);
      const usdMatch = rawMarketStr.match(/\$?\s*([\d,]+(?:\.\d+)?)\s*(Billion|B|Million|M|Trillion|T)?/i);

      if (lakhCrMatch) {
        tamCrores = parseFloat(lakhCrMatch[1].replace(/,/g, '')) * 100000;
      } else if (crMatch) {
        tamCrores = parseFloat(crMatch[1].replace(/,/g, ''));
      } else if (usdMatch && usdMatch[1]) {
        const rawNum = parseFloat(usdMatch[1].replace(/,/g, ''));
        const unit = (usdMatch[2] || '').toUpperCase();
        if (!(rawNum === 5 && (!unit || unit.startsWith('B')))) {
          let usd = rawNum;
          if (unit.startsWith('T')) usd = rawNum * 1e12;
          else if (unit.startsWith('B')) usd = rawNum * 1e9;
          else if (unit.startsWith('M')) usd = rawNum * 1e6;
          tamCrores = (usd * 83.5) / 1e7;
        }
      }
    }

    // Dynamic SAM ratio based on delivery model
    let samRatio = isOffline ? 0.22 : (isHybrid ? 0.28 : 0.30);
    const samCrores = Math.max(0.5, Math.round(tamCrores * samRatio * 10) / 10);

    // Realistic Bottom-Up SOM scaled to budget and operational capacity
    const budgetFactor = Math.min(2.5, Math.max(0.5, Math.sqrt(budget / 300000)));
    let baseSom = isOffline ? Math.min(samCrores * 0.15, 3.5) : Math.min(samCrores * 0.08, 15.0);
    const somCrores = Math.max(0.2, Math.round(baseSom * budgetFactor * 10) / 10);
    const somPercentOfSam = ((somCrores / samCrores) * 100).toFixed(1);

    // Display string: keep backend catchment note if present (e.g. ₹61.6 Cr (Campus Catchment))
    let tamDisplay = formatCroresToINR(tamCrores);
    if (rawMarketStr && rawMarketStr.includes('(')) {
      const matchScope = rawMarketStr.match(/\(([^)]+)\)/);
      if (matchScope && matchScope[1]) {
        tamDisplay = `${formatCroresToINR(tamCrores)} (${matchScope[1]})`;
      }
    }

    return {
      tamStr: tamDisplay,
      samStr: formatCroresToINR(samCrores),
      somStr: formatCroresToINR(somCrores),
      tamCrores,
      samCrores,
      somCrores,
      samPercent: Math.round(samRatio * 100),
      somPercentOfSam: `${somPercentOfSam}%`
    };
  }, [data?.market_size, isOffline, isHybrid, budget]);

  if (!data) return <div className="text-center p-8 animate-fade-in">Loading market analysis...</div>;

  const opportunityScore = data.opportunity_score != null ? Math.round(data.opportunity_score) : null;
  const growthRate = data.growth_rate != null ? Number(data.growth_rate).toFixed(1) : null;
  const demandLevel = data.demand_level || (isOffline ? 'High Velocity' : 'Steady Demand');

  const cagrDisplay = growthRate !== null ? `a projected 5-year CAGR of ${growthRate}%` : `strong market tailwinds`;
  const oppScoreDisplay = opportunityScore !== null ? `${opportunityScore}/100` : `Estimate unavailable — re-run for AI analysis`;

  // Clean narrative explanations
  const cleanedMarketExp = cleanExplanationText(
    data.market_analysis_explanation || 
    `Addressable market capacity for ${startupTitle} in ${industryName} is evaluated at ${marketSizing.tamStr} with ${cagrDisplay}. Favorable market dynamics indicate ${demandLevel.toLowerCase()} and strong customer readiness in ${locationName}.`
  );

  const cleanedOpportunityExp = cleanExplanationText(
    data.opportunity_explanation || 
    `Market Opportunity Score for ${startupTitle} is evaluated at ${oppScoreDisplay} based on verified sector scale (${marketSizing.tamStr}) and customer adoption tailwinds in ${industryName}.`
  );

  // Dynamic Pricing Tiers based on sector & pricing model
  const pricingTiersDisplay = isOffline
    ? (industryName.toLowerCase().includes('food') || industryName.toLowerCase().includes('biryani')
      ? '₹120 – ₹260 Single Plate • ₹350 – ₹550 Family Pack • ₹1,200 Bulk Order'
      : (industryName.toLowerCase().includes('gym') || industryName.toLowerCase().includes('fitness')
        ? '₹1,499/mo Monthly Pass • ₹3,999 Quarterly • ₹11,999 Annual VIP'
        : '₹250 – ₹850 Average Order Value • Tiered Service Packages • Volume Discounts'))
    : '₹499/mo (Starter) • ₹1,999/mo (Professional) • ₹7,999/mo (Enterprise SLA)';

  // Dynamic CAC and Payback
  const cacEstimate = isOffline ? '₹80 – ₹250' : '₹1,200 – ₹3,500';
  const paybackEstimate = isOffline ? '1.5 – 3 Months' : '3 – 6 Months';

  // Dynamic Timing Reason
  const timingReason = isOffline
    ? `Surging local footfall and rising consumer preference for hygienic, transparent, and prompt ${industryName} in ${locationName} create an immediate beachhead opportunity.`
    : `Accelerating digital adoption, UPI automated recurring payments, and demand for modern automation in ${countryName} provide strong macro tailwinds for ${industryName}.`;

  // Dynamic Viral / Referral Loop
  const viralLoop = isOffline
    ? `Satisfied customer word-of-mouth, social media experience tags, and peer WhatsApp group recommendations driving organic walk-ins.`
    : `Built-in referral rewards, collaborative workspace invites, and social proof case studies driving organic user signups.`;

  // Dynamic Conversion Funnel
  const funnelTop = isOffline
    ? `Local visibility via Google Maps / Business Profile, high-visibility storefront signage, and campus/neighborhood flyers.`
    : `High-intent digital search (SEO/PPC), educational industry content, and targeted community outreach.`;

  const funnelMid = isOffline
    ? `Walk-in product/service trial, introductory combo specials, and frictionless UPI QR ordering.`
    : `Interactive live demo, instant self-serve onboarding, and transparent free trial tier.`;

  const funnelBot = isOffline
    ? `Digital customer loyalty stamp cards, repeat weekly visits, and order-ahead convenience.`
    : `Annual subscription commitments, team seat upgrades, and automated retention workflows.`;

  return (
    <div className="market-tab animate-fade-in">
      {/* ── Section Title & Meta Tags ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
        <div className="section-heading mb-0" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span><FaGlobe /> Market Intelligence &amp; Strategic TAM Opportunity</span>
          <SourceBadge source={data?.data_source || 'Google Trends, World Bank & AI'} />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span className="tag" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0284c7', borderColor: 'rgba(14, 165, 233, 0.3)' }}>
            <FaTag style={{ fontSize: '0.75rem' }} /> {industryName}
          </span>
          <span className="tag" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <FaLayerGroup style={{ fontSize: '0.75rem' }} /> {sectorType.toUpperCase()}
          </span>
          <span className="tag" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <FaGlobe style={{ fontSize: '0.75rem' }} /> {locationName}
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
        <div className="metric-card glass-card-success" style={{ borderLeft: '4px solid #0ea5e9' }}>
          <div className="metric-label flex align-center justify-center gap-xs">
            <FaRupeeSign /> Total Addressable Market (TAM)
          </div>
          <div className="metric-value text-success" style={{ color: '#0284c7', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)' }}>
            {marketSizing.tamStr}
          </div>
          <div className="text-secondary text-xs mt-xs">Total {industryName} Sector Capacity</div>
        </div>

        {/* 5-Year CAGR */}
        <div className="metric-card glass-card-accent" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="metric-label flex align-center justify-center gap-xs">
            <FaChartLine /> 5-Year CAGR Growth
          </div>
          <div className="metric-value text-primary" style={{ color: '#059669', fontSize: growthRate !== null ? 'clamp(1.2rem, 2.5vw, 1.6rem)' : '0.85rem' }}>
            {growthRate !== null ? (
              <>+{growthRate}% <span className="trend-indicator up text-xs ml-xs">↗ High Growth</span></>
            ) : (
              <span style={{ color: '#64748B', fontWeight: 500, fontStyle: 'italic', fontSize: '0.82rem' }}>
                Estimate unavailable — re-run for AI analysis
              </span>
            )}
          </div>
          <div className="text-secondary text-xs mt-xs">Annual Compounded Industry Growth</div>
        </div>

        {/* Consumer Demand */}
        <div className="metric-card glass-card-accent" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="metric-label flex align-center justify-center gap-xs">
            <FaBullseye /> Buyer Demand Intensity
          </div>
          <div className="metric-value text-info" style={{ color: '#d97706', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)' }}>
            {demandLevel}
          </div>
          <div className="text-secondary text-xs mt-xs">Market Receptivity &amp; Urgency</div>
        </div>

        {/* Opportunity Score */}
        <div className="metric-card glass-card" style={{ borderLeft: '4px solid #ec4899' }}>
          <div className="metric-label flex align-center justify-center gap-xs">
            <FaRocket /> Market Opportunity Index
          </div>
          <div className="metric-value" style={{ color: '#db2777', fontSize: opportunityScore !== null ? 'clamp(1.2rem, 2.5vw, 1.6rem)' : '0.85rem' }}>
            {opportunityScore !== null ? (
              <>{opportunityScore}<span style={{ fontSize: '1rem', color: '#64748B' }}>/100</span></>
            ) : (
              <span style={{ color: '#64748B', fontWeight: 500, fontStyle: 'italic', fontSize: '0.82rem' }}>
                Estimate unavailable — re-run for AI analysis
              </span>
            )}
          </div>
          <div className="text-secondary text-xs mt-xs">Venture Scale Viability Score</div>
        </div>
      </div>

      {/* ── Dimension Sub-Tabs Navigation Bar ── */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveSubTab('tam')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            background: activeSubTab === 'tam' ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : '#FFFFFF',
            border: activeSubTab === 'tam' ? 'none' : '1px solid #CBD5E1',
            color: activeSubTab === 'tam' ? '#fff' : '#334155',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'tam' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <FaChartPie /> 1. TAM / SAM / SOM Sizing
        </button>

        <button
          onClick={() => setActiveSubTab('demographics')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            background: activeSubTab === 'demographics' ? 'linear-gradient(135deg, #10b981, #059669)' : '#FFFFFF',
            border: activeSubTab === 'demographics' ? 'none' : '1px solid #CBD5E1',
            color: activeSubTab === 'demographics' ? '#fff' : '#334155',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'demographics' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <FaUsers /> 2. Buyer Persona &amp; Demographics
        </button>

        <button
          onClick={() => setActiveSubTab('channels')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            background: activeSubTab === 'channels' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#FFFFFF',
            border: activeSubTab === 'channels' ? 'none' : '1px solid #CBD5E1',
            color: activeSubTab === 'channels' ? '#fff' : '#334155',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'channels' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <FaBullhorn /> 3. Go-To-Market &amp; Channels
        </button>

        <button
          onClick={() => setActiveSubTab('trends')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            background: activeSubTab === 'trends' ? 'linear-gradient(135deg, #10b981, #059669)' : '#FFFFFF',
            border: activeSubTab === 'trends' ? 'none' : '1px solid #CBD5E1',
            color: activeSubTab === 'trends' ? '#fff' : '#334155',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'trends' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <FaLightbulb /> 4. Industry Trends &amp; Drivers
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
                <span className="dim-subtitle" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
                  Total Addressable Market
                </span>
                <span className="tam-badge" style={{ background: 'rgba(14, 165, 233, 0.2)', color: '#0284c7', border: '1px solid rgba(14, 165, 233, 0.4)' }}>
                  100% Sector Scope
                </span>
              </div>
              <div className="tam-val" style={{ color: '#0F172A' }}>
                {marketSizing.tamStr}
              </div>
              <div className="tam-sub">Total Sector Spending in {locationName}</div>
              <div className="tam-desc">
                Total annual expenditure across all buyers and providers in the <strong>{industryName}</strong> sector if {startupTitle} captured 100% monopoly market share.
              </div>
            </div>

            {/* SAM */}
            <div className="tam-card tam-sam">
              <div className="tam-header">
                <span className="dim-subtitle" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>
                  Serviceable Addressable Market
                </span>
                <span className="tam-badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#d8b4fe', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                  {marketSizing.samPercent}% Serviceable
                </span>
              </div>
              <div className="tam-val" style={{ color: '#0F172A' }}>
                {marketSizing.samStr}
              </div>
              <div className="tam-sub">Serviceable via {sectorType.toUpperCase()} Model</div>
              <div className="tam-desc">
                The targeted sub-segment of TAM serviceable by {startupTitle}'s <strong>{sectorType}</strong> delivery architecture and target buyer category in {locationName}.
              </div>
            </div>

            {/* SOM */}
            <div className="tam-card tam-som">
              <div className="tam-header">
                <span className="dim-subtitle" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                  Serviceable Obtainable Market
                </span>
                <span className="tam-badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                  Year 1–3 Target
                </span>
              </div>
              <div className="tam-val" style={{ color: '#0F172A' }}>
                {marketSizing.somStr}
              </div>
              <div className="tam-sub">Realistic Beachhead Capture ({marketSizing.somPercentOfSam} of SAM)</div>
              <div className="tam-desc">
                Realistic 1–3 year ARR target obtainable through focused customer acquisition, based on {startupTitle}'s <strong>{pricingModel}</strong> structure and operating budget.
              </div>
            </div>
          </div>

          {/* Market Opportunity Index & Timing Card */}
          <div className="dimension-cards-grid">
            {/* Opportunity Gauge Card */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#7c3aed' }}>
                    <FaChartPie />
                  </div>
                  <div>
                    <h4 className="dim-title">Market Opportunity Gauge</h4>
                    <div className="dim-subtitle">Viability &amp; Market Tailwinds Assessment</div>
                  </div>
                </div>
                <div className="dim-score-badge score-success" style={{ color: '#7c3aed', borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.15)', fontSize: opportunityScore !== null ? '0.85rem' : '0.72rem' }}>
                  {opportunityScore !== null ? `${opportunityScore}/100 Viability` : 'Estimate unavailable — re-run for AI analysis'}
                </div>
              </div>

              <div className="dim-progress-track">
                <div className="dim-progress-fill" style={{ width: `${opportunityScore || 0}%`, background: 'linear-gradient(90deg, #10b981, #10b981)' }}></div>
              </div>

              <div className="dim-body">
                <p className="dim-primary-text">{cleanedOpportunityExp}</p>
                <div className="dim-action-box" style={{ borderLeftColor: '#10b981' }}>
                  <span className="dim-action-label" style={{ color: '#7c3aed' }}>Venture Scale Perspective</span>
                  <span className="dim-action-content">
                    {isOffline
                      ? `${startupTitle} operates with a localized catchment TAM of ${marketSizing.tamStr}. Local store density and quick operational break-even are key to commanding strong unit economics.`
                      : `Institutional investors look for addressable depth (TAM > ₹10,000 Cr) and high compounding expansion (CAGR > 12%). ${startupTitle} qualifies with an addressable TAM of ${marketSizing.tamStr}${growthRate !== null ? ` and +${growthRate}% annual sector growth.` : '.'}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Strategic Timing Card */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
                    <FaCalendarCheck />
                  </div>
                  <div>
                    <h4 className="dim-title">Market Timing &amp; Inflection Window</h4>
                    <div className="dim-subtitle">Why This Venture Succeeds Right Now</div>
                  </div>
                </div>
                <div className="dim-score-badge score-info" style={{ color: '#059669', borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.15)' }}>
                  Prime Window
                </div>
              </div>

              <div className="dim-progress-track">
                <div className="dim-progress-fill" style={{ width: '88%', background: 'linear-gradient(90deg, #10b981, #06b6d4)' }}></div>
              </div>

              <div className="dim-body">
                <p className="dim-primary-text">
                  {timingReason}
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#10b981' }}>
                  <span className="dim-action-label" style={{ color: '#059669' }}>Execution Priority</span>
                  <span className="dim-action-content">
                    Rapidly capture early beachhead customers ({marketSizing.somStr} Year 1–3 target) through high product quality and focused local acquisition before slower incumbents adapt.
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
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #0ea5e9' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0284c7' }}>
                    <FaUsers />
                  </div>
                  <div>
                    <h4 className="dim-title">Ideal Customer Profile (ICP)</h4>
                    <div className="dim-subtitle">Target Buyer Segment Breakdown</div>
                  </div>
                </div>
                <div className="dim-score-badge score-info">Core ICP</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  {data.primary_demo || targetCustomers}
                </p>
                <p className="dim-detail-text">
                  <strong>Audience Fit:</strong> Specifically targeting {targetCustomers} seeking dedicated {industryName} capability with proven operational consistency.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#0ea5e9' }}>
                  <span className="dim-action-label">Target Milestone</span>
                  <span className="dim-action-content">
                    Validate product-market fit by securing initial 30–50 high-engagement customer accounts or repeat buyers matching this exact persona.
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
                  {data.key_pain_point || `Lack of reliable, high-quality, and transparently priced ${industryName} options in the immediate market.`}
                </p>
                <p className="dim-detail-text">
                  <strong>Impact of Inaction:</strong> Legacy alternatives force buyers into slow, inconsistent, or overpriced workarounds with poor service standards.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#ef4444' }}>
                  <span className="dim-action-label" style={{ color: '#dc2626' }}>Value Wedge</span>
                  <span className="dim-action-content">
                    Position {startupTitle} directly around superior quality, faster execution, and quantifiable cost transparency in Indian Rupees (₹).
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Purchase Triggers & Urgency Catalysts */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
                    <FaBullseye />
                  </div>
                  <div>
                    <h4 className="dim-title">Buying Triggers &amp; Decision Catalysts</h4>
                    <div className="dim-subtitle">What Motivates Immediate Purchase</div>
                  </div>
                </div>
                <div className="dim-score-badge score-success">High Urgency</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  {data.purchase_trigger || `Daily convenience, neighborhood recommendations, and immediate on-site satisfaction.`}
                </p>
                <p className="dim-detail-text">
                  <strong>Conversion Driver:</strong> Buyers convert when presented with immediate proof of satisfaction and seamless ordering without operational friction.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#10b981' }}>
                  <span className="dim-action-label" style={{ color: '#059669' }}>Conversion Playbook</span>
                  <span className="dim-action-content">
                    Anchor sales messaging and initial customer contact around rapid service delivery and transparent pricing in Indian Rupees (₹).
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
                    <h4 className="dim-title">Willingness to Pay &amp; Monetization</h4>
                    <div className="dim-subtitle">Unit Economics &amp; Budget Alignment</div>
                  </div>
                </div>
                <div className="dim-score-badge score-warning">Favorable WTP</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  Target buyers exhibit healthy willingness to pay under {startupTitle}'s <strong>{pricingModel}</strong> structure, calibrated to Indian purchasing power.
                </p>
                <p className="dim-detail-text">
                  <strong>Recommended Tiers:</strong> {pricingTiersDisplay}
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#f59e0b' }}>
                  <span className="dim-action-label" style={{ color: '#d97706' }}>Pricing Strategy</span>
                  <span className="dim-action-content">
                    Structure clear tiered pricing in ₹ to capture price-sensitive early customers while offering premium bundles for higher-margin retention.
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
                  <div className="dim-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }}>
                    <FaBullhorn />
                  </div>
                  <div>
                    <h4 className="dim-title">Primary Acquisition Channel</h4>
                    <div className="dim-subtitle">Highest Volume GTM Engine</div>
                  </div>
                </div>
                <div className="dim-score-badge score-warning">Primary Channel</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  {data.acquisition_channel || (isOffline ? 'Physical storefront footfall, Google Business Profile local SEO, hyperlocal reels, and customer referrals.' : 'Targeted search engine marketing, developer/user communities, and digital performance ads.')}
                </p>
                <p className="dim-detail-text">
                  <strong>Channel Efficiency:</strong> Focuses marketing budget directly where target buyers actively discover, evaluate, and purchase {industryName} solutions.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#f59e0b' }}>
                  <span className="dim-action-label" style={{ color: '#d97706' }}>Channel Execution</span>
                  <span className="dim-action-content">
                    Allocate 60% of initial marketing capital to this primary channel before diversifying into secondary experimental avenues.
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Viral Loop & Referral Dynamics */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
                    <FaRocket />
                  </div>
                  <div>
                    <h4 className="dim-title">Organic Viral &amp; Referral Loops</h4>
                    <div className="dim-subtitle">Self-Sustaining Growth Engine</div>
                  </div>
                </div>
                <div className="dim-score-badge score-success">Organic Loop</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  {viralLoop}
                </p>
                <p className="dim-detail-text">
                  <strong>Network Density:</strong> Every satisfied customer interaction generates organic word-of-mouth recommendations, steadily lowering blended Customer Acquisition Cost (CAC).
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#10b981' }}>
                  <span className="dim-action-label" style={{ color: '#059669' }}>Referral Incentive</span>
                  <span className="dim-action-content">
                    Implement built-in referral perks (such as discount vouchers or loyalty bonus points in ₹) whenever an existing buyer introduces a new customer.
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: 3-Stage Conversion Funnel */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #0ea5e9' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0284c7' }}>
                    <FaLayerGroup />
                  </div>
                  <div>
                    <h4 className="dim-title">Conversion Funnel Architecture</h4>
                    <div className="dim-subtitle">Top, Mid &amp; Bottom Funnel Flow</div>
                  </div>
                </div>
                <div className="dim-score-badge score-info">Funnel Flow</div>
              </div>
              <div className="dim-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', borderLeft: '4px solid #0284c7' }}>
                    <strong style={{ color: '#0284c7', fontSize: '0.85rem' }}>Top of Funnel (Awareness):</strong>
                    <div style={{ color: '#334155', fontSize: '0.86rem', marginTop: '2px' }}>{funnelTop}</div>
                  </div>
                  <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', borderLeft: '4px solid #059669' }}>
                    <strong style={{ color: '#059669', fontSize: '0.85rem' }}>Middle of Funnel (Trial/Consideration):</strong>
                    <div style={{ color: '#334155', fontSize: '0.86rem', marginTop: '2px' }}>{funnelMid}</div>
                  </div>
                  <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', borderLeft: '4px solid #d97706' }}>
                    <strong style={{ color: '#d97706', fontSize: '0.85rem' }}>Bottom of Funnel (Retention &amp; Close):</strong>
                    <div style={{ color: '#334155', fontSize: '0.86rem', marginTop: '2px' }}>{funnelBot}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: CAC & Payback Velocity */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #ec4899' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#db2777' }}>
                    <FaRupeeSign />
                  </div>
                  <div>
                    <h4 className="dim-title">Customer Acquisition Cost (CAC)</h4>
                    <div className="dim-subtitle">Unit Economics &amp; Payback Period</div>
                  </div>
                </div>
                <div className="dim-score-badge" style={{ color: '#db2777', borderColor: '#ec4899', background: 'rgba(236, 72, 153, 0.15)' }}>
                  Unit Economics
                </div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  Estimated Customer Acquisition Cost: <strong>{cacEstimate}</strong> with a capital payback velocity of <strong>{paybackEstimate}</strong>.
                </p>
                <p className="dim-detail-text">
                  <strong>LTV:CAC Ratio:</strong> Targeted at &gt;3.5x to preserve gross margins, enabling sustainable reinvestment of operational profits into expansion.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#ec4899' }}>
                  <span className="dim-action-label" style={{ color: '#db2777' }}>Efficiency Target</span>
                  <span className="dim-action-content">
                    Keep payback under 6 months so cash generated from early customer cohorts finances subsequent operating cycles.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SUB-TAB 4: INDUSTRY TRENDS & MACRO DRIVERS
          ============================================================ */}
      {activeSubTab === 'trends' && (
        <div className="animate-fade-in">
          <div className="dimension-cards-grid">
            {/* Trend 1: AI & Automation */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#7c3aed' }}>
                    <FaLightbulb />
                  </div>
                  <div>
                    <h4 className="dim-title">Modern Innovation &amp; Quality Standards</h4>
                    <div className="dim-subtitle">Core Industry Innovation Driver</div>
                  </div>
                </div>
                <div className="dim-score-badge score-success">Key Tailwind</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  {(data.industry_trends && data.industry_trends[0]) || `Rapid shift toward digital ordering, instant UPI payments, and contactless customer experience in ${industryName}.`}
                </p>
                <p className="dim-detail-text">
                  <strong>Strategic Advantage:</strong> Embeds modern operational efficiency into daily workflows, allowing {startupTitle} to operate with superior speed and lower overhead.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#10b981' }}>
                  <span className="dim-action-label" style={{ color: '#7c3aed' }}>Operational Focus</span>
                  <span className="dim-action-content">
                    Continually optimize daily service speed and quality consistency to widen defensibility against fragmented local competitors.
                  </span>
                </div>
              </div>
            </div>

            {/* Trend 2: Regulatory & Policy Tailwinds */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
                    <FaCheckCircle />
                  </div>
                  <div>
                    <h4 className="dim-title">Quality Standards &amp; Certifications</h4>
                    <div className="dim-subtitle">Compliance &amp; Trust Drivers</div>
                  </div>
                </div>
                <div className="dim-score-badge score-info">Macro Policy</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  {(data.industry_trends && data.industry_trends[1]) || `Increasing consumer preference for verified quality, hygiene compliance (FSSAI/certifications), and transparent pricing.`}
                </p>
                <p className="dim-detail-text">
                  <strong>Compliance Catalyst:</strong> Heightened regulatory and hygiene awareness in {countryName} compels buyers to choose certified and compliant establishments.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#10b981' }}>
                  <span className="dim-action-label" style={{ color: '#059669' }}>Compliance Moat</span>
                  <span className="dim-action-content">
                    Display certified hygiene and trade permits prominently on storefront and marketing collateral to build immediate buyer trust.
                  </span>
                </div>
              </div>
            </div>

            {/* Trend 3: Consumer & Buyer Shift */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }}>
                    <FaArrowUp />
                  </div>
                  <div>
                    <h4 className="dim-title">Buyer Preference for Speed &amp; Transparency</h4>
                    <div className="dim-subtitle">Cultural &amp; Commercial Shift</div>
                  </div>
                </div>
                <div className="dim-score-badge score-warning">High Urgency</div>
              </div>
              <div className="dim-body">
                <p className="dim-primary-text">
                  {(data.industry_trends && data.industry_trends[2]) || `Growing importance of hyperlocal community engagement, social media word-of-mouth, and customer retention programs.`}
                </p>
                <p className="dim-detail-text">
                  <strong>Market Receptivity:</strong> Modern buyers reject opaque pricing and poor service consistency, favoring transparent Indian Rupee (₹) pricing and immediate value.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#f59e0b' }}>
                  <span className="dim-action-label" style={{ color: '#d97706' }}>Differentiation</span>
                  <span className="dim-action-content">
                    Publish transparent pricing in ₹ with zero hidden costs to rapidly win over frustrated patrons of legacy competitors.
                  </span>
                </div>
              </div>
            </div>

            {/* Trend 4: Defensibility Moat & Unit Economics */}
            <div className="dimension-card-premium" style={{ borderLeft: '4px solid #0ea5e9' }}>
              <div className="dim-header">
                <div className="dim-title-group">
                  <div className="dim-icon" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0284c7' }}>
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
                  Capital in the {industryName} space is prioritizing disciplined cash burn, healthy gross margins, and rapid pathway to operating break-even over vanity volume.
                </p>
                <p className="dim-detail-text">
                  <strong>Execution Posture:</strong> By maintaining lean infrastructure and automated customer onboarding, {startupTitle} preserves cash while capturing local market share.
                </p>
                <div className="dim-action-box" style={{ borderLeftColor: '#0ea5e9' }}>
                  <span className="dim-action-label">Defensibility Milestone</span>
                  <span className="dim-action-content">
                    Achieve operational cash break-even within 6–10 months to establish solid self-sustaining unit economics.
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
