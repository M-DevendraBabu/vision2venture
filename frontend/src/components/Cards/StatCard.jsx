import React from 'react';
import './Cards.css';

const StatCard = ({ icon, label, value, trend, trendLabel }) => {
  const isPositive = trend >= 0;
  
  return (
    <div className="stat-card glass-card">
      <div className="stat-icon-wrapper">
        {icon}
      </div>
      <div className="stat-content">
        <h3 className="stat-label">{label}</h3>
        <p className="stat-value">{value}</p>
        <div className={`stat-trend ${isPositive ? 'trend-up' : 'trend-down'}`}>
          <span>{isPositive ? '↑' : '↓'} {Math.abs(trend)}%</span>
          <span className="trend-label">{trendLabel}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
