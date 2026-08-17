import React, { useState } from 'react';
import { FaBuilding, FaTable, FaProjectDiagram, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaShieldAlt, FaCoins, FaHandshake } from 'react-icons/fa';

const BusinessTab = ({ data }) => {
  const [activeSubTab, setActiveSubTab] = useState('canvas');

  if (!data) return <div className="text-center p-8 animate-fade-in">Loading business model...</div>;

  const bm = data.business_model || data || {};
  const swot = data.swot || data || {};

  const parseItems = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      const split = val.split(/(?:\r?\n|;|\. (?=[A-Z]))/).map(s => s.trim()).filter(Boolean);
      return split.length > 0 ? split : [val];
    }
    return [String(val)];
  };

  const renderContentList = (val, icon = null, defaultText = "Data being processed") => {
    const items = parseItems(val);
    if (!items || items.length === 0) {
      return <p className="text-sm text-secondary italic">{defaultText}</p>;
    }
    return (
      <ul className="user-list">
        {items.map((item, i) => (
          <li key={i} className="text-sm py-xs leading-relaxed" style={{ color: '#cbd5e1' }}>
            {icon && <span className="mr-xs">{icon}</span>}
            {item}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="business-tab animate-fade-in">
      <div className="section-heading mb-md"><FaBuilding /> Business Model Canvas & Strategic SWOT</div>
      
      <div className="explanation-box mb-xl" style={{ borderLeft: '4px solid #6366f1' }}>
        <strong>AI Business Strategy:</strong> {bm.detailed_explanation || swot.overall_assessment || 'Comprehensive business model strategy detailing value creation, revenue streams, cost structures, and strategic position.'}
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveSubTab('canvas')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'canvas' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'canvas' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaTable /> 1. Lean Business Canvas (8 Cells)
        </button>

        <button
          onClick={() => setActiveSubTab('swot')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'swot' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'swot' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaProjectDiagram /> 2. 4-Quadrant SWOT Matrix
        </button>

        <button
          onClick={() => setActiveSubTab('drivers')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'drivers' ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'drivers' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaCoins /> 3. Revenue Models & Key Partners
        </button>
      </div>

      {/* SUB-TAB 1: LEAN BUSINESS CANVAS */}
      {activeSubTab === 'canvas' && (
        <div className="animate-fade-in">
          <div className="bmc-grid mb-2xl" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div className="bmc-cell glass-card p-lg" style={{ borderTop: '3px solid #6366f1' }}>
              <h4 className="text-primary mb-sm font-semibold">Key Strategic Partners</h4>
              {renderContentList(bm.key_partners)}
            </div>
            <div className="bmc-cell glass-card p-lg" style={{ borderTop: '3px solid #8b5cf6' }}>
              <h4 className="text-primary mb-sm font-semibold">Key Core Activities</h4>
              {renderContentList(bm.key_activities)}
            </div>
            <div className="bmc-cell glass-card p-lg" style={{ background: 'rgba(99, 102, 241, 0.08)', borderTop: '3px solid #06b6d4' }}>
              <h4 className="text-accent mb-sm font-bold">Unique Value Proposition</h4>
              {renderContentList(bm.value_proposition)}
            </div>
            <div className="bmc-cell glass-card p-lg" style={{ borderTop: '3px solid #10b981' }}>
              <h4 className="text-primary mb-sm font-semibold">Channels & Acquisition</h4>
              {renderContentList(bm.channels)}
            </div>
            <div className="bmc-cell glass-card p-lg" style={{ borderTop: '3px solid #f59e0b' }}>
              <h4 className="text-primary mb-sm font-semibold">Target Customer Segments</h4>
              {renderContentList(bm.customer_segments)}
            </div>
            <div className="bmc-cell glass-card p-lg" style={{ borderTop: '3px solid #ec4899' }}>
              <h4 className="text-primary mb-sm font-semibold">Key Resources & Assets</h4>
              {renderContentList(bm.key_resources)}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SWOT MATRIX */}
      {activeSubTab === 'swot' && (
        <div className="animate-fade-in">
          <div className="swot-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div className="swot-card glass-card p-lg strengths" style={{ borderLeft: '4px solid #10b981' }}>
              <h4 className="text-success mb-sm flex align-center gap-xs"><FaCheckCircle /> Internal Strengths</h4>
              {renderContentList(swot.strengths)}
            </div>
            <div className="swot-card glass-card p-lg weaknesses" style={{ borderLeft: '4px solid #ef4444' }}>
              <h4 className="text-danger mb-sm flex align-center gap-xs"><FaExclamationTriangle /> Internal Weaknesses</h4>
              {renderContentList(swot.weaknesses)}
            </div>
            <div className="swot-card glass-card p-lg opportunities" style={{ borderLeft: '4px solid #06b6d4' }}>
              <h4 className="text-info mb-sm flex align-center gap-xs"><FaLightbulb /> External Opportunities</h4>
              {renderContentList(swot.opportunities)}
            </div>
            <div className="swot-card glass-card p-lg threats" style={{ borderLeft: '4px solid #f59e0b' }}>
              <h4 className="text-warning mb-sm flex align-center gap-xs"><FaShieldAlt /> External Threats</h4>
              {renderContentList(swot.threats)}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: REVENUE MODELS & PARTNERS */}
      {activeSubTab === 'drivers' && (
        <div className="animate-fade-in">
          <div className="metrics-grid mb-2xl">
            <div className="metric-card glass-card-accent" style={{ borderLeft: '4px solid #10b981' }}>
              <h4 className="text-success mb-sm font-semibold flex align-center gap-xs"><FaCoins /> Revenue Streams & Monetization</h4>
              {renderContentList(bm.revenue_streams)}
            </div>
            <div className="metric-card glass-card-accent" style={{ borderLeft: '4px solid #ef4444' }}>
              <h4 className="text-danger mb-sm font-semibold flex align-center gap-xs"><FaBuilding /> Main Cost Structure Drivers</h4>
              {renderContentList(bm.cost_structure)}
            </div>
            <div className="metric-card glass-card-accent" style={{ borderLeft: '4px solid #6366f1' }}>
              <h4 className="text-primary mb-sm font-semibold flex align-center gap-xs"><FaHandshake /> Key Ecosystem Partners</h4>
              {renderContentList(bm.key_partners)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessTab;
