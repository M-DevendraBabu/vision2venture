import React from 'react';
import { FaBuilding, FaTable, FaProjectDiagram, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaShieldAlt } from 'react-icons/fa';

const BusinessTab = ({ data }) => {
  if (!data) return <div className="text-center p-8 animate-fade-in">Loading business model...</div>;

  const bm = data.business_model || data || {};
  const swot = data.swot || data || {};

  const parseItems = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      // Split by newline, semicolon, or period if long text
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
      <div className="section-heading mb-md"><FaBuilding /> Business Strategy</div>
      
      <div className="explanation-box mb-xl">
        <strong>AI Strategy Assessment:</strong> {bm.detailed_explanation || swot.overall_assessment || 'Your business model Canvas below maps out exactly how your venture will create, deliver, and capture value.'}
      </div>

      <h3 className="section-heading mt-xl mb-lg"><FaTable /> Business Model Canvas</h3>
      <div className="bmc-grid mb-2xl" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
        <div className="bmc-cell glass-card p-lg stagger-1" style={{ borderTop: '3px solid #6366f1' }}>
          <h4 className="text-primary mb-sm" style={{ fontSize: '1.05rem', fontWeight: 600 }}>Key Partners</h4>
          {renderContentList(bm.key_partners)}
        </div>
        <div className="bmc-cell glass-card p-lg stagger-2" style={{ borderTop: '3px solid #8b5cf6' }}>
          <h4 className="text-primary mb-sm" style={{ fontSize: '1.05rem', fontWeight: 600 }}>Key Activities</h4>
          {renderContentList(bm.key_activities)}
        </div>
        <div className="bmc-cell glass-card p-lg stagger-3" style={{ background: 'rgba(99, 102, 241, 0.08)', borderTop: '3px solid #06b6d4', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
          <h4 className="text-accent mb-sm" style={{ fontSize: '1.05rem', fontWeight: 700 }}>Value Proposition</h4>
          {renderContentList(bm.value_proposition)}
        </div>
        <div className="bmc-cell glass-card p-lg stagger-4" style={{ borderTop: '3px solid #10b981' }}>
          <h4 className="text-primary mb-sm" style={{ fontSize: '1.05rem', fontWeight: 600 }}>Channels & Acquisition</h4>
          {renderContentList(bm.channels)}
        </div>
        <div className="bmc-cell glass-card p-lg stagger-5" style={{ borderTop: '3px solid #f59e0b' }}>
          <h4 className="text-primary mb-sm" style={{ fontSize: '1.05rem', fontWeight: 600 }}>Customer Segments</h4>
          {renderContentList(bm.customer_segments)}
        </div>
        <div className="bmc-cell glass-card p-lg stagger-6" style={{ borderTop: '3px solid #ec4899' }}>
          <h4 className="text-primary mb-sm" style={{ fontSize: '1.05rem', fontWeight: 600 }}>Key Resources</h4>
          {renderContentList(bm.key_resources)}
        </div>
        <div className="bmc-cell glass-card p-lg stagger-7" style={{ borderTop: '3px solid #ef4444' }}>
          <h4 className="text-primary mb-sm" style={{ fontSize: '1.05rem', fontWeight: 600 }}>Cost Structure</h4>
          {renderContentList(bm.cost_structure)}
        </div>
        <div className="bmc-cell glass-card p-lg stagger-8" style={{ borderTop: '3px solid #14b8a6' }}>
          <h4 className="text-primary mb-sm" style={{ fontSize: '1.05rem', fontWeight: 600 }}>Revenue Streams</h4>
          {renderContentList(bm.revenue_streams)}
        </div>
      </div>

      <h3 className="section-heading mt-xl mb-lg"><FaProjectDiagram /> SWOT Matrix</h3>
      <div className="swot-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
        <div className="swot-card glass-card p-lg strengths stagger-1" style={{ borderLeft: '4px solid #10b981' }}>
          <h4 className="text-success mb-sm flex align-center gap-xs"><FaCheckCircle /> Strengths (Internal)</h4>
          {renderContentList(swot.strengths)}
        </div>
        <div className="swot-card glass-card p-lg weaknesses stagger-2" style={{ borderLeft: '4px solid #ef4444' }}>
          <h4 className="text-danger mb-sm flex align-center gap-xs"><FaExclamationTriangle /> Weaknesses (Internal)</h4>
          {renderContentList(swot.weaknesses)}
        </div>
        <div className="swot-card glass-card p-lg opportunities stagger-3" style={{ borderLeft: '4px solid #06b6d4' }}>
          <h4 className="text-info mb-sm flex align-center gap-xs"><FaLightbulb /> Opportunities (External)</h4>
          {renderContentList(swot.opportunities)}
        </div>
        <div className="swot-card glass-card p-lg threats stagger-4" style={{ borderLeft: '4px solid #f59e0b' }}>
          <h4 className="text-warning mb-sm flex align-center gap-xs"><FaShieldAlt /> Threats (External)</h4>
          {renderContentList(swot.threats)}
        </div>
      </div>
    </div>
  );
};

export default BusinessTab;
