import React, { useState } from 'react';
import { FaUsers, FaLink, FaBolt, FaExclamationCircle, FaTrophy, FaLayerGroup, FaLightbulb } from 'react-icons/fa';

const CompetitorTab = ({ data }) => {
  const [activeSubTab, setActiveSubTab] = useState('matches');

  if (!data) return <div className="text-center p-8 animate-fade-in">Loading competitor data...</div>;

  const competitors = Array.isArray(data) ? data : (data.competitors || []);

  return (
    <div className="competitor-tab animate-fade-in">
      <div className="section-heading mb-md"><FaUsers /> Competitive Intelligence & Market Benchmarking</div>
      
      <div className="explanation-box mb-xl" style={{ borderLeft: '4px solid #6366f1' }}>
        <strong>AI Competitor Intelligence:</strong> Analyzed {competitors.length} key competitor(s) matched against our dataset of 5,997 Y Combinator companies and global market leaders.
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveSubTab('matches')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'matches' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'matches' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaTrophy /> 1. YC Portfolio Competitor Matches ({competitors.length})
        </button>

        <button
          onClick={() => setActiveSubTab('matrix')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'matrix' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'matrix' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaLayerGroup /> 2. Strengths vs Weaknesses Matrix
        </button>

        <button
          onClick={() => setActiveSubTab('gaps')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'gaps' ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'gaps' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaLightbulb /> 3. Market Gap & USP Differentiation
        </button>
      </div>

      {competitors.length === 0 ? (
        <div className="text-center p-8 text-secondary glass-card">No competitor data available.</div>
      ) : (
        <>
          {/* SUB-TAB 1: COMPETITOR MATCHES */}
          {activeSubTab === 'matches' && (
            <div className="competitors-grid animate-fade-in">
              {competitors.map((comp, idx) => (
                <div key={idx} className={`competitor-card glass-card p-lg stagger-${(idx%5)+1}`} style={{ borderTop: '4px solid #6366f1' }}>
                  <div className="comp-header">
                    <h4>{comp.name || 'Competitor'}</h4>
                    {comp.url && (
                      <a href={comp.url.startsWith('http') ? comp.url : `https://${comp.url}`} target="_blank" rel="noreferrer" className="comp-url flex align-center gap-xs">
                        <FaLink /> {comp.url}
                      </a>
                    )}
                  </div>
                  
                  <div className="mb-md mt-xs">
                    <div className="flex-between mb-xs">
                      <span className="text-sm text-secondary">Similarity Score</span>
                      <span className="text-sm font-bold text-primary">{comp.similarity_score || comp.similarity || 50}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${comp.similarity_score || comp.similarity || 50}%`, background: 'linear-gradient(90deg, #6366f1, #06b6d4)', height: '100%' }}></div>
                    </div>
                  </div>
                  
                  <div className="comp-body">
                    {comp.analysis_explanation && (
                      <div className="comp-section mb-sm">
                        <p className="text-sm text-secondary leading-relaxed">{comp.analysis_explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SUB-TAB 2: STRENGTHS VS WEAKNESSES MATRIX */}
          {activeSubTab === 'matrix' && (
            <div className="animate-fade-in">
              <div className="competitors-grid">
                {competitors.map((comp, idx) => (
                  <div key={idx} className="glass-card p-lg" style={{ borderTop: '4px solid #8b5cf6' }}>
                    <h4 className="text-primary mb-md">{comp.name}</h4>
                    <div className="comp-section mb-md">
                      <h5 className="flex align-center gap-xs text-success mb-xs"><FaBolt /> Key Strengths</h5>
                      <p className="text-sm text-secondary leading-relaxed">{typeof comp.strengths === 'string' ? comp.strengths : JSON.stringify(comp.strengths)}</p>
                    </div>
                    
                    <div className="comp-section">
                      <h5 className="flex align-center gap-xs text-danger mb-xs"><FaExclamationCircle /> Key Vulnerabilities & Weaknesses</h5>
                      <p className="text-sm text-secondary leading-relaxed">{typeof comp.weaknesses === 'string' ? comp.weaknesses : JSON.stringify(comp.weaknesses)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB 3: MARKET GAP & USP DIFFERENTIATION */}
          {activeSubTab === 'gaps' && (
            <div className="animate-fade-in">
              <div className="competitors-grid">
                {competitors.map((comp, idx) => (
                  <div key={idx} className="glass-card p-lg" style={{ borderTop: '4px solid #10b981' }}>
                    <h4 className="text-success mb-md">{comp.name}</h4>
                    {comp.competitive_gap && (
                      <div className="comp-section mb-md">
                        <h5 className="text-warning mb-xs">Unexploited Market Gap</h5>
                        <p className="text-sm text-secondary leading-relaxed">{comp.competitive_gap}</p>
                      </div>
                    )}
                    {comp.usp && (
                      <div className="comp-section">
                        <h5 className="text-info mb-xs">Your Unique Differentiation (USP)</h5>
                        <p className="text-sm text-secondary leading-relaxed">{comp.usp}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CompetitorTab;
