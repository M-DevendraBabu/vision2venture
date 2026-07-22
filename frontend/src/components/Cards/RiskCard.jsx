import React from 'react';
import './Cards.css';

const RiskCard = ({ title, level, score, description }) => {
  const getColor = (level) => {
    if (level === 'High') return 'var(--danger)';
    if (level === 'Medium') return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <div className="risk-card glass-card">
      <div className="risk-header">
        <h3>{title}</h3>
        <span className="risk-level" style={{ color: getColor(level), borderColor: getColor(level) }}>
          {level}
        </span>
      </div>
      <p className="risk-desc">{description}</p>
      <div className="risk-gauge">
        <div className="gauge-label">Risk Score: {score}/100</div>
        <div className="gauge-bar">
          <div className="gauge-fill" style={{ width: `${score}%`, backgroundColor: getColor(level) }}></div>
        </div>
      </div>
    </div>
  );
};

export default RiskCard;
