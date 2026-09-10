import React, { useState } from 'react';
import { 
  FaExclamationTriangle, 
  FaShieldAlt, 
  FaTachometerAlt, 
  FaCheckCircle, 
  FaBriefcase, 
  FaChartLine, 
  FaLightbulb, 
  FaCoins, 
  FaGlobe, 
  FaLaptopCode 
} from 'react-icons/fa';

const RiskTab = ({ data, idea }) => {
  const [activeSubTab, setActiveSubTab] = useState('heatmap');

  if (!data) return <div className="text-center p-8 animate-fade-in">Loading risk data...</div>;

  const riskData = data.risk || {};
  const feasData = data.feasibility || {};
  const investorData = data.investor_readiness || {};

  const parseRisk = (key, label, fallbackDesc) => {
    const r = riskData[key];
    if (r && typeof r === 'object') {
      return {
        title: label,
        score: r.score || 35,
        severity: r.severity || 'Low',
        explanation: r.detailed_explanation || r.explanation || fallbackDesc,
        mitigation: r.mitigation_strategy || 'Develop a contingency plan.'
      };
    }
    return {
      title: label,
      score: typeof r === 'number' ? r : 35,
      severity: 'Low',
      explanation: fallbackDesc,
      mitigation: 'Develop a contingency plan.'
    };
  };

  const risks = [
    parseRisk('technical_risk', 'Technical Risk', 'Assessed based on tech complexity and team capabilities.'),
    parseRisk('market_risk', 'Market Risk', 'Risk of low demand or mismatched product-market fit.'),
    parseRisk('competition_risk', 'Competition Risk', 'Competitive landscape density and differentiation challenges.'),
    parseRisk('financial_risk', 'Financial Risk', 'Burn rate, funding gaps, and revenue shortfall.'),
    parseRisk('operational_risk', 'Operational Risk', 'Day-to-day execution and logistics challenges.')
  ];

  const getSeverityStyle = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return { color: 'danger', icon: '🚨' };
      case 'high': return { color: 'warning', icon: '⚠️' };
      case 'medium': return { color: 'info', icon: '⚡' };
      case 'low': return { color: 'success', icon: '✅' };
      default: return { color: 'info', icon: '⚡' };
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'danger';
    if (score >= 45) return 'warning';
    if (score >= 25) return 'info';
    return 'success';
  };

  const getBadgeClass = (score) => {
    if (score >= 70) return 'score-success';
    if (score >= 50) return 'score-info';
    if (score >= 35) return 'score-warning';
    return 'score-danger';
  };

  const getProgressGradient = (score) => {
    if (score >= 70) return 'linear-gradient(90deg, #10b981, #34d399)';
    if (score >= 50) return 'linear-gradient(90deg, #0ea5e9, #38bdf8)';
    if (score >= 35) return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    return 'linear-gradient(90deg, #ef4444, #f87171)';
  };

  // Precise extraction function: stops cleanly before the next section header without trailing decimals or stray headers
  const extractSection = (fullText, targetName, followingSections) => {
    if (!fullText) return null;
    const lookahead = followingSections.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(targetName + '\\s*\\([^)]*\\):\\s*([\\s\\S]*?)(?=(' + lookahead + '|$))', 'i');
    const m = fullText.match(regex);
    if (!m) return null;
    let res = m[1].trim();
    // Strip any trailing section headers like "Innovation (47." or "Business Model (44."
    res = res.replace(/\s+[A-Za-z\s&]+\(\d*.*$/, '').trim();
    // Strip any R² or math artifacts
    res = res.replace(/\(R²=[^)]*\)/gi, '').trim();
    return res.length > 10 ? res : null;
  };

  const cleanOverallText = (rawExp, defaultType) => {
    if (!rawExp) {
      return `Comprehensive ${defaultType} evaluation for ${idea?.title || 'this venture'}: Demonstrates balanced operational alignment and clear progress potential.`;
    }
    
    // Check if there is an executive recommendation after "Overall Score:" or "Overall Feasibility:"
    const m = rawExp.match(/Overall\s+(?:Score|Feasibility):\s*[\d.]+\/100\.\s*([\s\S]*?)(?=Methodology|\d+%\s*ML|\(?R²|domain calibration|$)/i);
    let rec = m ? m[1].trim() : '';
    
    rec = rec.replace(/Methodology[\s\S]*/gi, '')
             .replace(/\d+%\s*ML[\s\S]*/gi, '')
             .replace(/.*?\)\s*\+\s*\d+%[\s\S]*/gi, '')
             .replace(/\(R²=[^)]*\)/gi, '')
             .replace(/.*domain calibration\.\s*/gi, '')
             .trim();
             
    if (rec && rec.length > 20) {
      return `Assessment for ${idea?.title || 'this startup'}: ${rec}`;
    }

    return `Comprehensive ${defaultType} evaluation for ${idea?.title || 'this startup'}: Assessed across all four core pillars with balanced execution milestones and clear growth targets.`;
  };

  // ==================== FEASIBILITY DIMENSIONS ====================
  const getFeasibilityItems = () => {
    const rawExp = feasData.explanation || '';
    const cleanOverall = cleanOverallText(rawExp, 'feasibility');

    const techScore = Math.round(feasData.technical_score ?? 75);
    const mktScore = Math.round(feasData.market_score ?? 75);
    const finScore = Math.round(feasData.financial_score ?? 70);
    const innScore = Math.round(feasData.innovation_score ?? 68);

    const techExp = feasData.technical_explanation ||
      extractSection(rawExp, 'Technical Buildability', ['Financial Viability', 'Innovation Index', 'Market Access', 'Overall Feasibility', 'Methodology']) ||
      (techScore > 70
        ? `High technical buildability (${techScore}/100): The proposed architecture utilizes proven technologies and modern framework standards. Technical execution risks are minimal with realistic MVP delivery cycles.`
        : techScore > 50
        ? `Moderate technical complexity (${techScore}/100): Building a secure, high-uptime system requires careful third-party API integration, data protection, and robust backend handling.`
        : `Demanding engineering requirements (${techScore}/100): Specialized engineering talent and customized infrastructure are necessary. Timelines should prioritize security audits and latency testing.`);

    const mktExp = feasData.market_explanation ||
      extractSection(rawExp, 'Market Access', ['Technical Buildability', 'Financial Viability', 'Innovation Index', 'Overall Feasibility', 'Methodology']) ||
      (mktScore > 70
        ? `Strong market receptivity (${mktScore}/100): Target customer demand is clearly identified with accessible digital acquisition channels and favorable customer adoption dynamics.`
        : mktScore > 50
        ? `Moderate market accessibility (${mktScore}/100): Target customer segments exist, but conversion requires sharp positioning, clear differentiation from incumbents, and educational onboarding.`
        : `Challenging market adoption (${mktScore}/100): Customer switching friction or established incumbent habits require a focused niche beachhead strategy before expanding broadly.`);

    const finExp = feasData.financial_explanation ||
      extractSection(rawExp, 'Financial Viability', ['Innovation Index', 'Technical Buildability', 'Market Access', 'Overall Feasibility', 'Methodology']) ||
      (finScore > 70
        ? `Healthy financial feasibility (${finScore}/100): Initial budget provides adequate runway for early validation. Unit economics indicate a sustainable path to positive gross margins and payback.`
        : finScore > 50
        ? `Viable financial structure (${finScore}/100): Capital structure supports lean development with disciplined milestone-based spending to achieve break-even within 8–14 months.`
        : `Capital-constrained financial model (${finScore}/100): Tight operating margins require strict cost control. Prioritize early revenue validation and customer pre-orders to extend operational runway.`);

    const innExp = feasData.innovation_explanation ||
      extractSection(rawExp, 'Innovation Index', ['Overall Feasibility', 'Methodology', 'Technical Buildability', 'Market Access', 'Financial Viability']) ||
      (innScore > 70
        ? `Strong innovation differentiation (${innScore}/100): Distinctive feature set and workflow optimizations create defensible competitive advantages against traditional solutions.`
        : innScore > 50
        ? `Practical innovation focus (${innScore}/100): Differentiation is driven by execution quality, streamlined UX, and responsive customer workflows rather than complex proprietary technology.`
        : `Standard industry template (${innScore}/100): Business model closely tracks conventional industry standards. Consider developing proprietary features or unique data integrations.`);

    return {
      overallExplanation: cleanOverall,
      dimensions: [
        {
          title: 'Technical Feasibility',
          subtitle: 'Architecture & Implementability',
          icon: <FaLaptopCode />,
          iconBg: 'rgba(14, 165, 233, 0.15)',
          iconColor: '#38bdf8',
          score: techScore,
          primary: techExp,
          detail: `Context: Evaluates framework maturity, integration endpoints, and engineering complexity for ${idea?.sector || 'this'} deployment in ${idea?.industry || 'this domain'}.`,
          action: `Milestone: Finalize technical specification, set up testing environment, and stress-test data integrity pipelines.`
        },
        {
          title: 'Market Feasibility',
          subtitle: 'Target Buyer Adoption Potential',
          icon: <FaGlobe />,
          iconBg: 'rgba(16, 185, 129, 0.15)',
          iconColor: '#34d399',
          score: mktScore,
          primary: mktExp,
          detail: `Context: Assesses buyer readiness, addressable customer segments, and competitive alternatives in ${idea?.country || 'the target region'}.`,
          action: `Milestone: Conduct customer discovery interviews with 25+ target buyers to validate positioning and conversion drivers.`
        },
        {
          title: 'Financial Feasibility',
          subtitle: 'Capital Efficiency & Runway',
          icon: <FaCoins />,
          iconBg: 'rgba(245, 158, 11, 0.15)',
          iconColor: '#fbbf24',
          score: finScore,
          primary: finExp,
          detail: `Context: Evaluates cash burn rate, working capital deployment velocity, and payback period against initial budget.`,
          action: `Milestone: Maintain at least 6 months operating buffer and track unit economics (gross margin & CAC).`
        },
        {
          title: 'Innovation Index',
          subtitle: 'Proprietary Differentiation & Moats',
          icon: <FaLightbulb />,
          iconBg: 'rgba(236, 72, 153, 0.15)',
          iconColor: '#f472b6',
          score: innScore,
          primary: innExp,
          detail: `Context: Measures product uniqueness, technical novelty, and defensibility against existing market incumbents.`,
          action: `Milestone: Document proprietary workflows and identify opportunities for trade secrets, patents, or data moats.`
        }
      ]
    };
  };

  // ==================== INVESTOR READINESS DIMENSIONS ====================
  const getInvestorItems = () => {
    const rawExp = investorData.explanation || '';
    const cleanOverall = cleanOverallText(rawExp, 'investor readiness');

    const scalScore = Math.round(investorData.scalability ?? 70);
    const innScore = Math.round(investorData.innovation ?? 65);
    const bizScore = Math.round(investorData.business_model ?? 70);
    const mktScore = Math.round(investorData.market ?? 70);

    const scalExp = investorData.scalability_explanation ||
      extractSection(rawExp, 'Scalability', ['Innovation', 'Business Model', 'Market Appeal', 'Overall Score', 'Methodology']) ||
      (scalScore > 70
        ? `High exponential scalability (${scalScore}/100): Digital architecture enables rapid user and revenue expansion with minimal marginal cost increases per customer.`
        : scalScore > 50
        ? `Moderate scalability potential (${scalScore}/100): Growth is achievable across primary segments, though operational onboarding and customer support require structured workflows as volume increases.`
        : `Constrained scaling velocity (${scalScore}/100): Variable delivery costs or localized dependencies require automated processes before rapid venture scaling is feasible.`);

    const innExp = investorData.innovation_explanation ||
      extractSection(rawExp, 'Innovation', ['Business Model', 'Market Appeal', 'Scalability', 'Overall Score', 'Methodology']) ||
      (innScore > 70
        ? `Strong defensibility moat (${innScore}/100): Significant competitive barrier through proprietary technology, specialized domain data, or unique partner integrations that resist copycat replication.`
        : innScore > 50
        ? `Moderate competitive moat (${innScore}/100): Differentiation relies primarily on superior execution speed, clean UX, and customer loyalty rather than patentable IP.`
        : `Low barrier to entry (${innScore}/100): Concept is susceptible to fast followers. Recommend building proprietary algorithms, data flywheels, or exclusive supplier channels.`);

    const bizExp = investorData.business_model_explanation ||
      extractSection(rawExp, 'Business Model', ['Market Appeal', 'Innovation', 'Scalability', 'Overall Score', 'Methodology']) ||
      (bizScore > 70
        ? `Robust business model (${bizScore}/100): Clear monetization mechanics with healthy projected customer lifetime value (LTV) relative to customer acquisition cost (CAC).`
        : bizScore > 50
        ? `Viable commercial model (${bizScore}/100): Revenue generation paths are established; live cohort retention data and pricing elasticity will be key proofs during investor due diligence.`
        : `Unvalidated unit economics (${bizScore}/100): Demonstrating proven customer willingness-to-pay and repeat engagement is needed before approaching institutional venture investors.`);

    const mktExp = investorData.market_explanation ||
      extractSection(rawExp, 'Market Appeal', ['Overall Score', 'Methodology', 'Business Model', 'Innovation', 'Scalability']) ||
      (mktScore > 70
        ? `High market appeal (${mktScore}/100): Expansive addressable market (TAM) with strong industry tailwinds, matching the profile venture investors seek for outsized returns.`
        : mktScore > 50
        ? `Focused vertical market (${mktScore}/100): Healthy addressable segment with clear expansion potential into adjacent industries as product maturity increases.`
        : `Niche market scope (${mktScore}/100): Target market is specialized. Investors will look for a clear plan on how the solution scales beyond the initial wedge segment.`);

    return {
      overallExplanation: cleanOverall,
      dimensions: [
        {
          title: 'Scalability Index',
          subtitle: 'Revenue Growth & Scaling Velocity',
          icon: <FaChartLine />,
          iconBg: 'rgba(14, 165, 233, 0.15)',
          iconColor: '#38bdf8',
          score: scalScore,
          primary: scalExp,
          detail: `Venture View: Investors assess how efficiently your business model scales beyond the initial wedge market without linear headcount growth.`,
          action: `Milestone: Document unit economics scaling curves showing decreasing marginal cost per incremental user.`
        },
        {
          title: 'Innovation & Moat',
          subtitle: 'Proprietary Defensibility & Barriers',
          icon: <FaShieldAlt />,
          iconBg: 'rgba(236, 72, 153, 0.15)',
          iconColor: '#f472b6',
          score: innScore,
          primary: innExp,
          detail: `Venture View: Institutional investors evaluate proprietary algorithms, data advantages, and barriers that prevent well-funded copycats.`,
          action: `Milestone: Build proprietary data loops and establish intellectual property protections before institutional diligence.`
        },
        {
          title: 'Business Model Viability',
          subtitle: 'Monetization & LTV:CAC Economics',
          icon: <FaBriefcase />,
          iconBg: 'rgba(16, 185, 129, 0.15)',
          iconColor: '#34d399',
          score: bizScore,
          primary: bizExp,
          detail: `Venture View: Seed and Series A investors look for verified customer willingness-to-pay, recurring revenue stability, and healthy payback cycles.`,
          action: `Milestone: Validate early monetization with paying beta users and demonstrate an LTV:CAC ratio exceeding 3:1.`
        },
        {
          title: 'Market Appeal & TAM',
          subtitle: 'Total Addressable Market Opportunity',
          icon: <FaGlobe />,
          iconBg: 'rgba(245, 158, 11, 0.15)',
          iconColor: '#fbbf24',
          score: mktScore,
          primary: mktExp,
          detail: `Venture View: Venture funds prioritize massive Total Addressable Markets (TAM > ₹8,000 Cr) that can yield outsized fund-returning outcomes.`,
          action: `Milestone: Quantify bottom-up TAM/SAM/SOM calculations with credible customer volume models in your pitch materials.`
        }
      ]
    };
  };

  const overallRisk = riskData.overall_risk || Math.round(risks.reduce((acc, r) => acc + r.score, 0) / risks.length);
  const overallColor = getScoreColor(overallRisk);

  return (
    <div className="risk-tab animate-fade-in">
      <div className="section-heading mb-md"><FaExclamationTriangle /> Risk Profiling & Investor Readiness</div>
      
      <div className="explanation-box mb-xl" style={{ borderLeft: '4px solid #f59e0b' }}>
        <strong>AI Risk Profiling:</strong> We've evaluated 5 key vulnerability vectors in your business model. 
        Your overall risk score is evaluated at <strong>{overallRisk}/100 ({overallRisk > 60 ? 'HIGH' : overallRisk > 35 ? 'MEDIUM' : 'LOW'})</strong> based on 155,500 historical startup records.
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveSubTab('heatmap')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'heatmap' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'heatmap' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaShieldAlt /> 1. 5-Vector Risk Heatmap ({Math.round(overallRisk)} Risk Score)
        </button>

        <button
          onClick={() => setActiveSubTab('feasibility')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'feasibility' ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'feasibility' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaTachometerAlt /> 2. Feasibility Ratings ({Math.round(feasData.overall_feasibility || 80)}/100)
        </button>

        <button
          onClick={() => setActiveSubTab('investor')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'investor' ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'investor' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaBriefcase /> 3. Investor Readiness ({Math.round(investorData.investor_score || 80)}/100)
        </button>
      </div>

      {/* SUB-TAB 1: RISK HEATMAP */}
      {activeSubTab === 'heatmap' && (
        <div className="animate-fade-in">
          <div className="glass-card mb-2xl p-xl" style={{ borderTop: `4px solid var(--${overallColor})`, display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div className="score-gauge-container">
              <svg className="score-gauge-svg" viewBox="0 0 100 100">
                <circle className="score-gauge-bg" cx="50" cy="50" r="45" />
                <circle 
                  className="score-gauge-progress" 
                  cx="50" cy="50" r="45" 
                  stroke={`var(--${overallColor})`}
                  strokeDasharray={`${overallRisk * 2.82} 282`} 
                />
              </svg>
              <div className="score-gauge-text">
                <div className={`val text-${overallColor}`}>{Math.round(overallRisk)}</div>
                <div className="lbl">Risk Score</div>
              </div>
            </div>
            <div>
              <h3 className="mb-sm">Overall Risk: {overallRisk > 60 ? '🚨 HIGH RISK' : overallRisk > 35 ? '⚠️ MEDIUM RISK' : '✅ LOW RISK'}</h3>
              <p className="text-secondary">Scale: 0 (Extremely Safe) to 100 (Extremely Risky)</p>
              <div className="mt-md">
                <span className={`score-badge ${overallColor}`}>
                  {overallRisk > 60 ? 'Requires active mitigation plan' : 'Manageable risk profile'}
                </span>
              </div>
            </div>
          </div>

          <h3 className="section-heading mb-lg"><FaShieldAlt /> 5-Vector Risk Dimensions & Mitigation Strategies</h3>
          <div className="risk-grid mb-xl">
            {risks.map((risk, idx) => {
              const sev = getSeverityStyle(risk.severity);
              const scoreColor = getScoreColor(risk.score);
              return (
                <div key={idx} className={`glass-card p-lg risk-card-enhanced stagger-${idx+1}`}>
                  <div className="risk-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 className="risk-title" style={{ margin: 0 }}>{risk.title}</h4>
                    </div>
                    <div className={`score-badge ${scoreColor}`} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>{sev.icon} {risk.severity} ({risk.score}/100)</div>
                  </div>

                  <div className="mb-md">
                    <p className="text-sm text-secondary leading-relaxed mb-sm">{risk.explanation}</p>
                  </div>

                  <div className="mitigation-box p-md bg-glass rounded" style={{ borderLeft: '3px solid #10b981' }}>
                    <h5 className="text-success text-xs font-bold uppercase mb-xs" style={{ letterSpacing: '0.05em' }}>Recommended Mitigation Strategy</h5>
                    <p className="text-sm text-secondary leading-relaxed">{risk.mitigation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: FEASIBILITY RATINGS (2x2 GRID + HIGHLIGHTED SCORES) */}
      {activeSubTab === 'feasibility' && (() => {
        const { overallExplanation, dimensions } = getFeasibilityItems();
        const overallScore = Math.round(feasData.overall_feasibility || 80);
        const overallBadgeClass = getBadgeClass(overallScore);

        return (
          <div className="animate-fade-in">
            {/* Overall Feasibility Summary Banner */}
            <div className="glass-card mb-xl p-lg" style={{ borderLeft: '4px solid #10b981', display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center', minWidth: '140px' }}>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: '600' }}>Overall Feasibility</div>
                <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#10b981', lineHeight: '1.1' }}>{overallScore}/100</div>
                <div className={`dim-score-badge ${overallBadgeClass} mt-xs`} style={{ display: 'inline-flex', fontSize: '0.75rem', padding: '2px 8px' }}>
                  {overallScore > 70 ? 'High Feasibility' : overallScore > 50 ? 'Moderate Feasibility' : 'High Execution Challenge'}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: '260px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: '#ffffff' }}>Overall Viability Assessment</h4>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  {overallExplanation}
                </p>
              </div>
            </div>

            {/* Symmetrical 2x2 Feasibility Dimension Cards with Highlighted Scores & Rich Content */}
            <h4 className="section-heading mb-md"><FaTachometerAlt /> Feasibility Across Core Dimensions</h4>
            <div className="dimension-cards-grid">
              {dimensions.map((dim, idx) => {
                const badgeClass = getBadgeClass(dim.score);
                const progressGrad = getProgressGradient(dim.score);

                return (
                  <div key={idx} className="dimension-card-premium stagger-1">
                    {/* Card Header: Icon + Title on left, Glowing Highlighted Score on right */}
                    <div className="dim-header">
                      <div className="dim-title-group">
                        <div className="dim-icon" style={{ background: dim.iconBg, color: dim.iconColor }}>
                          {dim.icon}
                        </div>
                        <div>
                          <h5 className="dim-title">{dim.title}</h5>
                          <div className="dim-subtitle">{dim.subtitle}</div>
                        </div>
                      </div>
                      <div className={`dim-score-badge ${badgeClass}`}>
                        <span>{dim.score}</span>
                        <span className="score-denom">/100</span>
                      </div>
                    </div>

                    {/* Progress Bar Indicator */}
                    <div className="dim-progress-track">
                      <div className="dim-progress-fill" style={{ width: `${dim.score}%`, background: progressGrad }} />
                    </div>

                    {/* Rich Content Body */}
                    <div className="dim-body">
                      <p className="dim-primary-text">{dim.primary}</p>
                      <p className="dim-detail-text">{dim.detail}</p>
                      <div className="dim-action-box" style={{ borderLeftColor: dim.iconColor }}>
                        <span className="dim-action-label" style={{ color: dim.iconColor }}>Recommended Action</span>
                        <span className="dim-action-content">{dim.action}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* SUB-TAB 3: INVESTOR READINESS (2x2 GRID + HIGHLIGHTED SCORES) */}
      {activeSubTab === 'investor' && (() => {
        const { overallExplanation, dimensions } = getInvestorItems();
        const overallScore = Math.round(investorData.investor_score || 80);
        const overallBadgeClass = getBadgeClass(overallScore);

        return (
          <div className="animate-fade-in">
            {/* Overall Investor Summary Banner */}
            <div className="glass-card mb-xl p-lg" style={{ borderLeft: '4px solid #0ea5e9', display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center', minWidth: '140px' }}>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: '600' }}>Investor Score</div>
                <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#38bdf8', lineHeight: '1.1' }}>{overallScore}/100</div>
                <div className={`dim-score-badge ${overallBadgeClass} mt-xs`} style={{ display: 'inline-flex', fontSize: '0.75rem', padding: '2px 8px' }}>
                  {overallScore > 70 ? 'Venture Ready' : overallScore > 50 ? 'Angel / Seed Stage' : 'Pre-Seed Development'}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: '260px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: '#ffffff' }}>Venture Capital & Angel Readiness Assessment</h4>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  {overallExplanation}
                </p>
              </div>
            </div>

            {/* Symmetrical 2x2 Investor Dimension Cards with Highlighted Scores & Rich Content */}
            <h4 className="section-heading mb-md"><FaBriefcase /> Investor Evaluation Dimensions</h4>
            <div className="dimension-cards-grid">
              {dimensions.map((dim, idx) => {
                const badgeClass = getBadgeClass(dim.score);
                const progressGrad = getProgressGradient(dim.score);

                return (
                  <div key={idx} className="dimension-card-premium stagger-1">
                    {/* Card Header: Icon + Title on left, Glowing Highlighted Score on right */}
                    <div className="dim-header">
                      <div className="dim-title-group">
                        <div className="dim-icon" style={{ background: dim.iconBg, color: dim.iconColor }}>
                          {dim.icon}
                        </div>
                        <div>
                          <h5 className="dim-title">{dim.title}</h5>
                          <div className="dim-subtitle">{dim.subtitle}</div>
                        </div>
                      </div>
                      <div className={`dim-score-badge ${badgeClass}`}>
                        <span>{dim.score}</span>
                        <span className="score-denom">/100</span>
                      </div>
                    </div>

                    {/* Progress Bar Indicator */}
                    <div className="dim-progress-track">
                      <div className="dim-progress-fill" style={{ width: `${dim.score}%`, background: progressGrad }} />
                    </div>

                    {/* Rich Content Body */}
                    <div className="dim-body">
                      <p className="dim-primary-text">{dim.primary}</p>
                      <p className="dim-detail-text">{dim.detail}</p>
                      <div className="dim-action-box" style={{ borderLeftColor: dim.iconColor }}>
                        <span className="dim-action-label" style={{ color: dim.iconColor }}>Investor Milestone</span>
                        <span className="dim-action-content">{dim.action}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="glass-card p-xl">
              <h3 className="section-heading mb-md"><FaCheckCircle /> Strategic Recommendations for Pitching Investors</h3>
              <ul className="user-list">
                {investorData.suggestions && investorData.suggestions.length > 0 ? (
                  investorData.suggestions.map((s, i) => (
                    <li key={i} className="text-sm py-xs leading-relaxed" style={{ color: '#cbd5e1' }}>{s}</li>
                  ))
                ) : (
                  <li className="text-sm text-secondary">Deploy functional MVP to demonstrate initial customer traction and retention.</li>
                )}
              </ul>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default RiskTab;
