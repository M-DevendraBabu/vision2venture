import React from 'react';
import { FaGlobe, FaSearchDollar, FaChartPie, FaCrosshairs, FaLightbulb } from 'react-icons/fa';

const MarketTab = ({ data }) => {
  if (!data) return <div className="text-center p-8 animate-fade-in">Loading market data...</div>;

  return (
    <div className="market-tab animate-fade-in">
      <div className="section-heading mb-md"><FaGlobe /> Market Opportunity</div>
      
      <div className="explanation-box mb-xl">
        <strong>AI Market Analysis:</strong> {data.market_analysis_explanation || `Demand level for your market is evaluated as ${data.demand_level || 'High'}.`}
      </div>

      <div className="metrics-grid mb-2xl">
        <div className="metric-card glass-card">
          <div className="metric-label">Total Addressable Market</div>
          <div className="metric-value text-primary">{data.market_size || 'N/A'}</div>
          <div className="text-secondary text-sm mt-xs">Global/National Potential</div>
        </div>
        <div className="metric-card glass-card">
          <div className="metric-label">Compound Annual Growth</div>
          <div className="metric-value text-success">
            {data.growth_rate ? `${data.growth_rate}%` : 'N/A'} <span className="trend-indicator up text-sm ml-xs">↗</span>
          </div>
          <div className="text-secondary text-sm mt-xs">Projected over 5 years</div>
        </div>
        <div className="metric-card glass-card">
          <div className="metric-label">Demand Level</div>
          <div className="metric-value text-info">{data.demand_level || 'High'}</div>
          <div className="text-secondary text-sm mt-xs">Current consumer appetite</div>
        </div>
      </div>

      <div className="overview-grid mb-xl" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'stretch' }}>
        <div className="glass-card p-xl">
          <h3 className="section-heading mb-md"><FaCrosshairs /> Target Audience Precision</h3>
          <p className="text-secondary mb-md">Customer profile breakdown and acquisition strategy.</p>
          
          <div className="swot-grid">
            <div className="p-md bg-glass rounded">
              <h4 className="text-primary mb-xs">Primary Demo</h4>
              <p className="text-sm text-secondary">{data.primary_demo || data.target_audience_primary || 'Data not available'}</p>
            </div>
            <div className="p-md bg-glass rounded">
              <h4 className="text-primary mb-xs">Key Pain Point</h4>
              <p className="text-sm text-secondary">{data.key_pain_point || 'Data not available'}</p>
            </div>
            <div className="p-md bg-glass rounded">
              <h4 className="text-primary mb-xs">Acquisition Channel</h4>
              <p className="text-sm text-secondary">{data.acquisition_channel || 'Data not available'}</p>
            </div>
            <div className="p-md bg-glass rounded">
              <h4 className="text-primary mb-xs">Purchase Trigger</h4>
              <p className="text-sm text-secondary">{data.purchase_trigger || 'Data not available'}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-xl border-accent opportunity-card-wrap">
          <h3 className="section-heading text-center mb-lg"><FaChartPie /> Opportunity Score</h3>
          
          <div className="score-gauge-container">
            <svg className="score-gauge-svg" viewBox="0 0 100 100">
              <circle className="score-gauge-bg" cx="50" cy="50" r="45" />
              <circle 
                className="score-gauge-progress" 
                cx="50" cy="50" r="45" 
                stroke="var(--accent-color)"
                strokeDasharray={`${(data.opportunity_score || 75) * 2.4} 282`} 
              />
            </svg>
            <div className="score-gauge-text">
              <div className="val text-accent">{data.opportunity_score || 75}</div>
              <div className="lbl">/100</div>
            </div>
          </div>

          <div className="opportunity-text-block mt-md">
            <p className="text-center text-sm text-secondary leading-relaxed">
              {data.opportunity_explanation || 'Data not available'}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-xl">
        <h3 className="section-heading"><FaLightbulb /> Market Trends & Tailwinds</h3>
        <ul className="user-list mt-md">
          {data.industry_trends && data.industry_trends.length > 0 ? (
            data.industry_trends.map((trend, i) => (
              <li key={i}>{trend}</li>
            ))
          ) : (
            <li className="text-secondary italic">No trend data available.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default MarketTab;
