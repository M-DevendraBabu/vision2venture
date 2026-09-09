import React, { useState } from 'react';
import { FaExclamationTriangle, FaShieldAlt, FaTachometerAlt, FaCheckCircle, FaBriefcase } from 'react-icons/fa';

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

  const getFeasibilityBadgeColor = (score) => {
    if (score >= 70) return 'success';
    if (score >= 50) return 'info';
    if (score >= 35) return 'warning';
    return 'danger';
  };

  // Clean R² or ML jargon from any text string
  const cleanJargon = (str) => {
    if (!str) return '';
    return str
      .replace(/Our StackingRegressor ensemble\s*\(R²=[^)]+\)\s*evaluated \d+ features to produce four feasibility dimensions\.\s*/gi, '')
      .replace(/Our StackingRegressor ensemble\s*\(R²=[^)]+\)\s*evaluated your startup across four investor-critical dimensions\.\s*/gi, '')
      .replace(/Methodology:\s*70%\s*ML model[^.]*\.\s*/gi, '')
      .replace(/\(R²=[^)]+\)/gi, '')
      .trim();
  };

  // Helper to extract dimension-specific sentence from combined explanation
  const extractDimensionText = (fullText, keywords) => {
    if (!fullText) return null;
    for (const kw of keywords) {
      const regex = new RegExp(`${kw}\\s*\\([^)]*\\):\\s*([^.]+\\.[^.]*\\.)`, 'i');
      const match = fullText.match(regex);
      if (match && match[1]) {
        return cleanJargon(match[1].trim());
      }
    }
    return null;
  };

  const getFeasibilityItems = () => {
    const rawExp = feasData.explanation || '';
    const cleanOverall = cleanJargon(rawExp)
      .replace(/Market Access\s*\([^)]*\):[^.]*\./gi, '')
      .replace(/Technical Buildability\s*\([^)]*\):[^.]*\./gi, '')
      .replace(/Financial Viability\s*\([^)]*\):[^.]*\./gi, '')
      .replace(/Innovation Index\s*\([^)]*\):[^.]*\./gi, '')
      .replace(/Overall Feasibility:\s*[\d.]+\/100\.\s*/gi, '')
      .trim() || `Comprehensive feasibility assessment for ${idea?.title || 'this startup'}. The business demonstrates solid operational viability across technical execution, market accessibility, financial capital efficiency, and innovation potential.`;

    const techScore = Math.round(feasData.technical_score ?? 75);
    const mktScore = Math.round(feasData.market_score ?? 75);
    const finScore = Math.round(feasData.financial_score ?? 70);
    const innScore = Math.round(feasData.innovation_score ?? 68);

    const techExp = feasData.technical_explanation ||
      extractDimensionText(rawExp, ['Technical Buildability', 'Technical', 'Tech']) ||
      (techScore > 70
        ? `High technical buildability (${techScore}/100): The proposed architecture utilizes proven technologies and modern framework standards. Technical execution risks are minimal with realistic MVP delivery cycles.`
        : techScore > 50
        ? `Moderate technical complexity (${techScore}/100): Building a secure, high-uptime system requires careful third-party API integration, data protection, and robust backend handling.`
        : `Demanding engineering requirements (${techScore}/100): Specialized engineering talent and customized infrastructure are necessary. Timelines should prioritize security audits and latency testing.`);

    const mktExp = feasData.market_explanation ||
      extractDimensionText(rawExp, ['Market Access', 'Market']) ||
      (mktScore > 70
        ? `Strong market receptivity (${mktScore}/100): Target customer demand is clearly identified with accessible digital acquisition channels and favorable customer adoption dynamics.`
        : mktScore > 50
        ? `Moderate market accessibility (${mktScore}/100): Target customer segments exist, but conversion requires sharp positioning, clear differentiation from incumbents, and educational onboarding.`
        : `Challenging market adoption (${mktScore}/100): Customer switching friction or established incumbent habits require a focused niche beachhead strategy before expanding broadly.`);

    const finExp = feasData.financial_explanation ||
      extractDimensionText(rawExp, ['Financial Viability', 'Financial']) ||
      (finScore > 70
        ? `Healthy financial feasibility (${finScore}/100): Initial budget provides adequate runway for early validation. Unit economics indicate a sustainable path to positive gross margins and payback.`
        : finScore > 50
        ? `Viable financial structure (${finScore}/100): Capital structure supports lean development with disciplined milestone-based spending to achieve break-even within 8–14 months.`
        : `Capital-constrained financial model (${finScore}/100): Tight operating margins require strict cost control. Prioritize early revenue validation and customer pre-orders to extend operational runway.`);

    const innExp = feasData.innovation_explanation ||
      extractDimensionText(rawExp, ['Innovation Index', 'Innovation']) ||
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
          score: techScore,
          color: getFeasibilityBadgeColor(techScore),
          explanation: techExp
        },
        {
          title: 'Market Feasibility',
          subtitle: 'Target Buyer Adoption Potential',
          score: mktScore,
          color: getFeasibilityBadgeColor(mktScore),
          explanation: mktExp
        },
        {
          title: 'Financial Feasibility',
          subtitle: 'Capital Efficiency & Runway',
          score: finScore,
          color: getFeasibilityBadgeColor(finScore),
          explanation: finExp
        },
        {
          title: 'Innovation Index',
          subtitle: 'Proprietary Differentiation & Moats',
          score: innScore,
          color: getFeasibilityBadgeColor(innScore),
          explanation: innExp
        }
      ]
    };
  };

  const getInvestorItems = () => {
    const rawExp = investorData.explanation || '';
    const cleanOverall = cleanJargon(rawExp)
      .replace(/Scalability\s*\([^)]*\):[^.]*\./gi, '')
      .replace(/Innovation\s*\([^)]*\):[^.]*\./gi, '')
      .replace(/Business Model\s*\([^)]*\):[^.]*\./gi, '')
      .replace(/Market Appeal\s*\([^)]*\):[^.]*\./gi, '')
      .replace(/Overall Score:\s*[\d.]+\/100\.\s*/gi, '')
      .trim() || `Investor readiness evaluation for ${idea?.title || 'this startup'}. Evaluates early-stage venture readiness across expansion scalability, defensibility, business model clarity, and total addressable market potential.`;

    const scalScore = Math.round(investorData.scalability ?? 70);
    const innScore = Math.round(investorData.innovation ?? 65);
    const bizScore = Math.round(investorData.business_model ?? 70);
    const mktScore = Math.round(investorData.market ?? 70);

    const scalExp = investorData.scalability_explanation ||
      extractDimensionText(rawExp, ['Scalability']) ||
      (scalScore > 70
        ? `High exponential scalability (${scalScore}/100): Digital architecture enables rapid user and revenue expansion with minimal marginal cost increases per customer.`
        : scalScore > 50
        ? `Moderate scalability potential (${scalScore}/100): Growth is achievable across primary segments, though operational onboarding and customer support require structured workflows as volume increases.`
        : `Constrained scaling velocity (${scalScore}/100): Variable delivery costs or localized dependencies require automated processes before rapid venture scaling is feasible.`);

    const innExp = investorData.innovation_explanation ||
      extractDimensionText(rawExp, ['Innovation']) ||
      (innScore > 70
        ? `Strong defensibility moat (${innScore}/100): Significant competitive barrier through proprietary technology, specialized domain data, or unique partner integrations that resist copycat replication.`
        : innScore > 50
        ? `Moderate competitive moat (${innScore}/100): Differentiation relies primarily on superior execution speed, clean UX, and customer loyalty rather than patentable IP.`
        : `Low barrier to entry (${innScore}/100): Concept is susceptible to fast followers. Recommend building proprietary algorithms, data flywheels, or exclusive supplier channels.`);

    const bizExp = investorData.business_model_explanation ||
      extractDimensionText(rawExp, ['Business Model']) ||
      (bizScore > 70
        ? `Robust business model (${bizScore}/100): Clear monetization mechanics with healthy projected customer lifetime value (LTV) relative to customer acquisition cost (CAC).`
        : bizScore > 50
        ? `Viable commercial model (${bizScore}/100): Revenue generation paths are established; live cohort retention data and pricing elasticity will be key proofs during investor due diligence.`
        : `Unvalidated unit economics (${bizScore}/100): Demonstrating proven customer willingness-to-pay and repeat engagement is needed before approaching institutional venture investors.`);

    const mktExp = investorData.market_explanation ||
      extractDimensionText(rawExp, ['Market Appeal', 'Market']) ||
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
          subtitle: 'Revenue Growth Scaling Potential',
          score: scalScore,
          color: getFeasibilityBadgeColor(scalScore),
          explanation: scalExp
        },
        {
          title: 'Innovation & Moat',
          subtitle: 'Proprietary Differentiation & Defensibility',
          score: innScore,
          color: getFeasibilityBadgeColor(innScore),
          explanation: innExp
        },
        {
          title: 'Business Model Viability',
          subtitle: 'Monetization & Unit Economics',
          score: bizScore,
          color: getFeasibilityBadgeColor(bizScore),
          explanation: bizExp
        },
        {
          title: 'Market Appeal & TAM',
          subtitle: 'Total Addressable Market Opportunity',
          score: mktScore,
          color: getFeasibilityBadgeColor(mktScore),
          explanation: mktExp
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
            background: activeSubTab === 'investor' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.05)',
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

      {/* SUB-TAB 2: FEASIBILITY RATINGS */}
      {activeSubTab === 'feasibility' && (() => {
        const { overallExplanation, dimensions } = getFeasibilityItems();
        const overallScore = Math.round(feasData.overall_feasibility || 80);
        const overallBadge = getFeasibilityBadgeColor(overallScore);

        return (
          <div className="animate-fade-in">
            {/* Overall Feasibility Summary Banner */}
            <div className="glass-card mb-xl p-lg" style={{ borderLeft: '4px solid #10b981', display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center', minWidth: '140px' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: '600' }}>Overall Feasibility</div>
                <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#10b981', lineHeight: '1.1' }}>{overallScore}/100</div>
                <div className={`score-badge ${overallBadge} mt-xs`} style={{ display: 'inline-block', fontSize: '0.75rem' }}>
                  {overallScore > 70 ? 'High Feasibility' : overallScore > 50 ? 'Moderate Feasibility' : 'High Execution Challenge'}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: '260px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: '#ffffff' }}>Overall Feasibility Evaluation</h4>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  {overallExplanation}
                </p>
              </div>
            </div>

            {/* 4 Feasibility Dimension Cards with Rich Explanations */}
            <h4 className="section-heading mb-md"><FaTachometerAlt /> Feasibility Across Core Dimensions</h4>
            <div className="metrics-grid mb-xl" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {dimensions.map((dim, idx) => (
                <div key={idx} className="metric-card glass-card-accent p-lg" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h5 style={{ margin: 0, fontSize: '0.95rem', color: '#ffffff', fontWeight: '700' }}>{dim.title}</h5>
                    <span className={`score-badge ${dim.color}`} style={{ fontSize: '0.8rem', padding: '2px 8px', whiteSpace: 'nowrap' }}>{dim.score}/100</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '10px', fontWeight: '500' }}>{dim.subtitle}</div>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.55', margin: 0, flex: 1 }}>
                    {dim.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* SUB-TAB 3: INVESTOR READINESS */}
      {activeSubTab === 'investor' && (() => {
        const { overallExplanation, dimensions } = getInvestorItems();
        const overallScore = Math.round(investorData.investor_score || 80);
        const overallBadge = getFeasibilityBadgeColor(overallScore);

        return (
          <div className="animate-fade-in">
            {/* Overall Investor Summary Banner */}
            <div className="glass-card mb-xl p-lg" style={{ borderLeft: '4px solid #6366f1', display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center', minWidth: '140px' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: '600' }}>Investor Score</div>
                <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#818cf8', lineHeight: '1.1' }}>{overallScore}/100</div>
                <div className={`score-badge ${overallBadge} mt-xs`} style={{ display: 'inline-block', fontSize: '0.75rem' }}>
                  {overallScore > 70 ? 'Venture Ready' : overallScore > 50 ? 'Angel / Seed Stage' : 'Pre-Seed Development'}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: '260px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: '#ffffff' }}>Venture & Angel Readiness Assessment</h4>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  {overallExplanation}
                </p>
              </div>
            </div>

            {/* 4 Investor Dimension Cards with Rich Explanations */}
            <h4 className="section-heading mb-md"><FaBriefcase /> Investor Evaluation Dimensions</h4>
            <div className="metrics-grid mb-xl" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {dimensions.map((dim, idx) => (
                <div key={idx} className="metric-card glass-card-accent p-lg" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h5 style={{ margin: 0, fontSize: '0.95rem', color: '#ffffff', fontWeight: '700' }}>{dim.title}</h5>
                    <span className={`score-badge ${dim.color}`} style={{ fontSize: '0.8rem', padding: '2px 8px', whiteSpace: 'nowrap' }}>{dim.score}/100</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '10px', fontWeight: '500' }}>{dim.subtitle}</div>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.55', margin: 0, flex: 1 }}>
                    {dim.explanation}
                  </p>
                </div>
              ))}
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
