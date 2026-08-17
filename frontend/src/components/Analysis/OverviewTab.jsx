import React from 'react';
import { FiTarget, FiAlertCircle, FiCheckCircle, FiLayers, FiTag } from 'react-icons/fi';
import { FaHashtag, FaIndustry, FaUsers, FaCalculator, FaBullseye, FaChartLine } from 'react-icons/fa';

const OverviewTab = ({ data, idea }) => {
  if (!data || !idea) return <div className="text-center p-8 animate-fade-in">Loading overview...</div>;

  const score = data.overall_score || data.score || 78;

  // Extract keywords from API response (supports array, string, or fallback)
  let keywordsList = data.keywords || [];
  if (typeof keywordsList === 'string') {
    keywordsList = keywordsList.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (!Array.isArray(keywordsList) || keywordsList.length === 0) {
    keywordsList = [idea.industry || 'Technology', idea.sector || 'SaaS', 'Startup', 'Innovation'];
  }

  // Score color helper
  const getScoreColor = (s) => {
    if (s >= 80) return '#10b981';
    if (s >= 60) return '#6366f1';
    if (s >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="overview-tab animate-fade-in" style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '24px' }}>
      
      {/* ── Quick Summary Card ── */}
      <div className="glass-card-accent p-xl" style={{ borderLeft: '4px solid #6366f1', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff', margin: 0 }}>{idea.title}</h2>
          <span className={`sector-badge sector-badge-${idea.sector || 'hybrid'}`}>
            {idea.sector || 'hybrid'}
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
          {data.summary || idea.description}
        </p>
      </div>

      {/* ── V2V Overall Evaluation Score Card ── */}
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '24px', padding: '20px 28px',
        borderRadius: '12px', borderLeft: `4px solid ${getScoreColor(score)}`,
        background: 'rgba(16, 185, 129, 0.06)', flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
          <span style={{ fontSize: '2.8rem', fontWeight: 800, color: getScoreColor(score), lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
            / 100
          </span>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', fontWeight: 600, color: getScoreColor(score), margin: '0 0 6px 0' }}>
            <FaCalculator /> Vision2Venture Overall Evaluation Index
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
            <strong>Calculation:</strong> Feasibility (30%) + Market Fit (30%) + Investor Readiness (25%) + Risk Mitigation (15%).
            {score >= 80 ? ' Strong overall startup viability with favorable unit economics.' :
             score >= 60 ? ' Moderate viability — focus on strengthening weaker dimensions.' :
             ' Needs improvement across multiple dimensions before launch.'}
          </p>
        </div>
      </div>

      {/* ── Key Metrics Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {/* Target Industry */}
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            <FaIndustry /> Target Industry
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-color)' }}>
            {idea.industry || data.business_domain || 'Technology'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Sector Classification</div>
        </div>

        {/* Business Domain */}
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            <FiLayers /> Business Domain
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#a78bfa' }}>
            {data.business_domain || idea.business_type || 'General'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>NLP-Detected Category</div>
        </div>

        {/* Customer Demographic */}
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            <FaUsers /> Customer Demographic
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#38bdf8' }}>
            {data.target_users || idea.target_customers || 'General Audience'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Primary Target Buyer</div>
        </div>

        {/* Revenue Strategy */}
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            <FaBullseye /> Revenue Strategy
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#10b981' }}>
            {idea.pricing_model || 'Subscription'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Monetization Model</div>
        </div>

        {/* Business Category */}
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            <FiTag /> Business Category
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fb923c' }}>
            {data.business_category || idea.business_type || idea.sector || 'Online'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Operational Type</div>
        </div>
      </div>

      {/* ── Problem & Solution Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Core Problem Statement */}
        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #ef4444', borderRadius: '12px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem', fontWeight: 700, color: '#ef4444', margin: '0 0 12px 0' }}>
            <FiAlertCircle /> Core Problem Statement
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, margin: '0 0 16px 0' }}>
            {data.problem_statement || "High friction, manual overhead, or inefficient service delivery in the current market."}
          </p>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', paddingTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
            <strong>Analysis Explanation:</strong> Highlights the precise market friction your venture addresses to justify customer demand.
          </div>
        </div>

        {/* Value Proposition & Solution */}
        <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #10b981', borderRadius: '12px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem', fontWeight: 700, color: '#10b981', margin: '0 0 12px 0' }}>
            <FiCheckCircle /> Value Proposition & Solution
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, margin: '0 0 16px 0' }}>
            {data.solution || "Automated, scalable solution offering superior speed, lower cost, and enhanced customer convenience."}
          </p>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', paddingTop: '10px', borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
            <strong>Analysis Explanation:</strong> Details how your product directly solves customer pain points to drive conversion.
          </div>
        </div>
      </div>

      {/* ── Strategic Keywords & SEO Tags ── */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '12px', width: '100%', boxSizing: 'border-box' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-color)', margin: '0 0 8px 0' }}>
          <FaHashtag /> NLP Keyword Extraction & SEO Tags
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 16px 0' }}>
          Extracted using TF-IDF with bigram analysis, domain-specific boosting, and title word prioritization for marketing positioning and SEO copy.
        </p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {keywordsList.map((kw, i) => (
            <span 
              key={i} 
              style={{ 
                background: i < 5 ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)', 
                color: i < 5 ? '#a5b4fc' : '#94a3b8',
                border: `1px solid ${i < 5 ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.15)'}`,
                padding: '7px 16px', 
                borderRadius: '20px', 
                fontSize: '0.85rem', 
                fontWeight: i < 5 ? 600 : 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              #{kw}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};

export default OverviewTab;
