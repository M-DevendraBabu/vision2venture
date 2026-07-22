import React from 'react';
import { FaExclamationTriangle, FaShieldAlt, FaTachometerAlt, FaCheckCircle } from 'react-icons/fa';

const RiskTab = ({ data, idea }) => {
  if (!data) return <div className="text-center p-8 animate-fade-in">Loading risk data...</div>;

  const riskData = data.risk || {};
  const feasData = data.feasibility || {};
  const investorData = data.investor_readiness || {};

  // Parse risk dimensions — backend returns {score, severity, explanation, mitigation_strategy}
  const parseRisk = (key, label, fallbackDesc) => {
    const r = riskData[key];
    if (r && typeof r === 'object') {
      return { title: label, score: r.score || 50, severity: r.severity || 'Medium', explanation: r.detailed_explanation || r.explanation || fallbackDesc, mitigation: r.mitigation_strategy || 'Develop a contingency plan.' };
    }
    return { title: label, score: typeof r === 'number' ? r : 50, severity: 'Medium', explanation: fallbackDesc, mitigation: 'Develop a contingency plan.' };
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
    if (score >= 75) return 'danger';
    if (score >= 50) return 'warning';
    if (score >= 25) return 'info';
    return 'success';
  };

  const overallRisk = riskData.overall_risk || Math.round(risks.reduce((acc, r) => acc + r.score, 0) / risks.length);
  const overallColor = getScoreColor(overallRisk);

  return (
    <div className="risk-tab animate-fade-in">
      <div className="section-heading mb-md"><FaExclamationTriangle /> Risk Assessment & Mitigation</div>
      
      <div className="explanation-box mb-xl">
        <strong>AI Risk Profiling:</strong> We've identified key vulnerabilities in your {idea?.sector || 'business'} model. 
        Every startup has risks — what matters is your mitigation strategy. Your overall risk profile is <strong>{overallRisk > 70 ? 'HIGH' : overallRisk > 40 ? 'MEDIUM' : 'LOW'}</strong>. 
        {overallRisk > 60 ? ' Focus immediately on the red and amber areas below.' : ' Your risk profile is manageable — follow the mitigation strategies to stay on track.'}
      </div>

      {/* Overall Risk Gauge */}
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
          <h3 className="mb-sm">Overall Risk: {overallRisk > 70 ? '🚨 HIGH' : overallRisk > 40 ? '⚠️ MEDIUM' : '✅ LOW'}</h3>
          <p className="text-secondary">Scale: 0 (Safest) to 100 (Extremely Risky)</p>
          <div className="mt-md">
            <span className={`score-badge ${overallColor}`}>
              {overallRisk > 60 ? 'Requires immediate mitigation plan' : 'Manageable risk profile'}
            </span>
          </div>
        </div>
      </div>

      {/* Individual Risk Dimensions */}
      <h3 className="section-heading mb-lg"><FaShieldAlt /> Detailed Risk Dimensions</h3>
      <div className="risk-grid">
        {risks.map((risk, idx) => {
          const sev = getSeverityStyle(risk.severity);
          const scoreColor = getScoreColor(risk.score);
          return (
            <div key={idx} className={`glass-card p-lg risk-card-enhanced stagger-${idx+1}`}>
              <div className="risk-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h4 className="risk-title">{risk.title}</h4>
                </div>
                <div className={`score-badge ${scoreColor}`}>{sev.icon} {risk.severity} ({risk.score}/100)</div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-sm mb-md">
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${risk.score}%`, background: `var(--${scoreColor})`, height: '100%', borderRadius: '3px', transition: 'width 1s ease' }}></div>
                </div>
              </div>

              {/* Explanation */}
              <div className="explanation-box mb-md" style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                <strong>Why this score:</strong> {risk.explanation}
              </div>

              {/* Mitigation Strategy */}
              <div className="mitigation-box">
                <h5>🛡️ Mitigation Strategy</h5>
                <p>{risk.mitigation}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feasibility Section */}
      {feasData.overall_feasibility && (
        <div className="glass-card p-xl mt-2xl" style={{ borderTop: `4px solid var(--info)` }}>
          <h3 className="section-heading mb-md"><FaTachometerAlt /> Feasibility Assessment</h3>
          
          {feasData.explanation && (
            <div className="explanation-box mb-lg">
              <strong>AI Assessment:</strong> {feasData.explanation}
            </div>
          )}

          <div className="metrics-grid">
            {[
              { label: 'Market Feasibility', value: feasData.market_score },
              { label: 'Technical Feasibility', value: feasData.technical_score },
              { label: 'Financial Feasibility', value: feasData.financial_score },
              { label: 'Innovation Score', value: feasData.innovation_score }
            ].map((item, idx) => (
              <div key={idx} className="metric-card glass-card-accent">
                <div className="metric-label">{item.label}</div>
                <div className={`metric-value text-${getScoreColor(100 - (item.value || 0))}`}>{Math.round(item.value || 0)}/100</div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '0.5rem' }}>
                  <div style={{ width: `${item.value || 0}%`, background: `var(--${getScoreColor(100 - (item.value || 0))})`, height: '100%', borderRadius: '2px' }}></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="glass-card-success p-lg mt-lg" style={{ textAlign: 'center' }}>
            <div className="metric-label">Overall Feasibility Score</div>
            <div className="metric-value text-success" style={{ fontSize: '2rem' }}>{Math.round(feasData.overall_feasibility)}/100</div>
          </div>
        </div>
      )}

      {/* Investor Readiness Section */}
      {investorData.investor_score && (
        <div className="glass-card p-xl mt-2xl" style={{ borderTop: `4px solid var(--secondary-color)` }}>
          <h3 className="section-heading mb-md"><FaCheckCircle /> Investor Readiness</h3>
          
          {investorData.explanation && (
            <div className="explanation-box mb-lg">
              <strong>Investor Perspective:</strong> {investorData.explanation}
            </div>
          )}

          <div className="metrics-grid mb-lg">
            {[
              { label: 'Scalability', value: investorData.scalability },
              { label: 'Innovation', value: investorData.innovation },
              { label: 'Business Model', value: investorData.business_model },
              { label: 'Market Opportunity', value: investorData.market }
            ].map((item, idx) => (
              <div key={idx} className="metric-card glass-card-accent">
                <div className="metric-label">{item.label}</div>
                <div className={`metric-value text-${getScoreColor(100 - (item.value || 0))}`}>{Math.round(item.value || 0)}/100</div>
              </div>
            ))}
          </div>

          <div className="glass-card-accent p-lg" style={{ textAlign: 'center' }}>
            <div className="metric-label">Investor Readiness Score</div>
            <div className="metric-value gradient-text" style={{ fontSize: '2rem' }}>{Math.round(investorData.investor_score)}/100</div>
          </div>

          {investorData.suggestions && investorData.suggestions.length > 0 && (
            <div className="mt-lg">
              <h4 className="mb-sm">💡 Key Recommendations</h4>
              <ul className="user-list">
                {investorData.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RiskTab;
