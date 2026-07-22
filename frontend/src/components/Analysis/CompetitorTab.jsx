import React from 'react';
import { FaUsers, FaLink, FaBolt, FaExclamationCircle } from 'react-icons/fa';

const CompetitorTab = ({ data }) => {
  if (!data) return <div className="text-center p-8 animate-fade-in">Loading competitor data...</div>;

  // Handles both array data and { competitors: [...] } object
  const competitors = Array.isArray(data) ? data : (data.competitors || []);

  return (
    <div className="competitor-tab animate-fade-in">
      <div className="section-heading mb-md"><FaUsers /> Competitive Landscape</div>
      
      <div className="explanation-box mb-xl">
        <strong>AI Competitor Intel:</strong> We analyzed {competitors.length} key competitor(s) operating in your industry and target market.
      </div>

      {competitors.length === 0 ? (
        <div className="text-center p-8 text-secondary glass-card">No competitor data available.</div>
      ) : (
        <div className="competitors-grid">
          {competitors.map((comp, idx) => (
            <div key={idx} className={`competitor-card glass-card p-lg stagger-${(idx%5)+1}`}>
              <div className="comp-header">
                <h4>{comp.name || 'Competitor'}</h4>
                {comp.url && (
                  <a href={comp.url.startsWith('http') ? comp.url : `https://${comp.url}`} target="_blank" rel="noreferrer" className="comp-url flex align-center gap-xs">
                    <FaLink /> {comp.url}
                  </a>
                )}
              </div>
              
              <div className="mb-md">
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
                
                <div className="comp-section mb-sm">
                  <h5 className="flex align-center gap-xs text-success mb-xs"><FaBolt /> Strengths</h5>
                  <p className="text-sm text-secondary leading-relaxed">{typeof comp.strengths === 'string' ? comp.strengths : JSON.stringify(comp.strengths)}</p>
                </div>
                
                <div className="comp-section mb-sm">
                  <h5 className="flex align-center gap-xs text-danger mb-xs"><FaExclamationCircle /> Weaknesses</h5>
                  <p className="text-sm text-secondary leading-relaxed">{typeof comp.weaknesses === 'string' ? comp.weaknesses : JSON.stringify(comp.weaknesses)}</p>
                </div>

                {comp.competitive_gap && (
                  <div className="comp-section mt-sm">
                    <h5 className="text-primary mb-xs">Competitive Gap</h5>
                    <p className="text-sm text-secondary leading-relaxed">{comp.competitive_gap}</p>
                  </div>
                )}

                {comp.usp && (
                  <div className="comp-section mt-sm">
                    <h5 className="text-primary mb-xs">Your Advantage / USP</h5>
                    <p className="text-sm text-secondary leading-relaxed">{comp.usp}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompetitorTab;
