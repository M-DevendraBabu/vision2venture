import React from 'react';
import './Cards.css';

const StatCard = ({ icon, label, value, description, trend, trendLabel, accent = 'blue' }) => {
  return (
    <div className={`stat-card stat-card-${accent}`}>
      <div className="stat-card-header-row">
        <span className="stat-label">{label}</span>
        <div className={`stat-icon-wrapper stat-icon-${accent}`}>
          {icon}
        </div>
      </div>
      <div className="stat-content">
        <p className="stat-value">{value}</p>
        {description ? (
          <p className="stat-desc">{description}</p>
        ) : trend !== undefined && trendLabel ? (
          <div className="stat-trend">
            <span className="trend-label">{trendLabel}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default StatCard;
