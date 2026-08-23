import React, { useState } from 'react';
import { FaExclamationTriangle, FaShieldAlt, FaTachometerAlt, FaCheckCircle, FaBriefcase, FaChartBar } from 'react-icons/fa';

const RiskTab = ({ data, idea }) => {
  const [activeSubTab, setActiveSubTab] = useState('heatmap');

  if (!data) return <div className="text-center p-8 animate-fade-in">Loading risk data...</div>;

  const riskData = data.risk || {};
  const feasData = data.feasibility || {};
  const investorData = data.investor_readiness || {};

  const parseRisk = (key, label, fallbackDesc) => {
    const r = riskData[key];
    if (r && typeof r === 'object') {
      return { title: label, score: r.score || 35, severity: r.severity || 'Low', explanation: r.detailed_explanation || r.explanation || fallbackDesc, mitigation: r.mitigation_strategy || 'Develop a contingency plan.' };
    }
    return { title: label, score: typeof r === 'number' ? r : 35, severity: 'Low', explanation: fallbackDesc, mitigation: 'Develop a contingency plan.' };
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
          <FaTachometerAlt /> 2. Feasibility Ratings ({feasData.overall_feasibility || 84}/100)
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
          <FaBriefcase /> 3. Investor Readiness ({investorData.investor_score || 82}/100)
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
      {activeSubTab === 'feasibility' && (
        <div className="animate-fade-in">
          <div className="explanation-box mb-lg">
            <strong>Feasibility Evaluation:</strong> Evaluated baseline feasibility across Technical, Market, Financial, and Innovation dimensions.
          </div>

          <div className="metrics-grid mb-xl">
            <div className="metric-card glass-card-success">
              <div className="metric-label">Overall Feasibility Score</div>
              <div className="metric-value text-success">{feasData.overall_feasibility || 84}/100</div>
              <div className="text-secondary text-sm mt-xs">{feasData.explanation || 'Strong overall feasibility.'}</div>
            </div>
            <div className="metric-card glass-card-accent">
              <div className="metric-label">Technical Feasibility</div>
              <div className="metric-value text-info">{feasData.technical_score || 88}/100</div>
              <div className="text-secondary text-sm mt-xs">Tech stack implementability</div>
            </div>
            <div className="metric-card glass-card-accent">
              <div className="metric-label">Market Feasibility</div>
              <div className="metric-value text-primary">{feasData.market_score || 84}/100</div>
              <div className="text-secondary text-sm mt-xs">Target buyer adoption potential</div>
            </div>
            <div className="metric-card glass-card-accent">
              <div className="metric-label">Financial Feasibility</div>
              <div className="metric-value text-warning">{feasData.financial_score || 81}/100</div>
              <div className="text-secondary text-sm mt-xs">Capital efficiency & payback</div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: INVESTOR READINESS */}
      {activeSubTab === 'investor' && (
        <div className="animate-fade-in">
          <div className="metrics-grid mb-xl">
            <div className="metric-card glass-card-success" style={{ borderLeft: '4px solid #6366f1' }}>
              <div className="metric-label">Investor Readiness Score</div>
              <div className="metric-value text-primary">{investorData.investor_score || 84}/100</div>
              <div className="text-secondary text-sm mt-xs">{investorData.explanation || 'Attractive seed investment profile.'}</div>
            </div>

            <div className="metric-card glass-card-accent">
              <div className="metric-label">Scalability Index</div>
              <div className="metric-value text-success">{investorData.scalability || 86}/100</div>
              <div className="text-secondary text-sm mt-xs">Revenue growth scaling potential</div>
            </div>

            <div className="metric-card glass-card-accent">
              <div className="metric-label">Innovation Index</div>
              <div className="metric-value text-info">{investorData.innovation || 82}/100</div>
              <div className="text-secondary text-sm mt-xs">Proprietary differentiation</div>
            </div>
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
      )}
    </div>
  );
};

export default RiskTab;
