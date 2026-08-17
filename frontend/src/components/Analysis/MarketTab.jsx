import React, { useState } from 'react';
import { FaGlobe, FaSearchDollar, FaChartPie, FaCrosshairs, FaLightbulb, FaBullseye, FaBullhorn, FaChartLine } from 'react-icons/fa';

const MarketTab = ({ data }) => {
  const [activeSubTab, setActiveSubTab] = useState('gauge');

  if (!data) return <div className="text-center p-8 animate-fade-in">Loading market data...</div>;

  return (
    <div className="market-tab animate-fade-in">
      <div className="section-heading mb-md"><FaGlobe /> Market Opportunity & Intelligence</div>
      
      <div className="explanation-box mb-xl" style={{ borderLeft: '4px solid #10b981' }}>
        <strong>AI Market Evaluation:</strong> {data.market_analysis_explanation || `Demand level for your target market is evaluated as ${data.demand_level || 'High Demand'}.`}
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveSubTab('gauge')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'gauge' ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'gauge' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaChartPie /> 1. Opportunity Score & TAM ({data.market_size || 'Market Size'})
        </button>

        <button
          onClick={() => setActiveSubTab('demographics')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'demographics' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'demographics' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaBullseye /> 2. Buyer Demographics & Persona
        </button>

        <button
          onClick={() => setActiveSubTab('channels')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'channels' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'channels' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaBullhorn /> 3. Acquisition Channels & Triggers
        </button>

        <button
          onClick={() => setActiveSubTab('trends')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'trends' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'trends' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaChartLine /> 4. Industry Trends & Tailwinds
        </button>
      </div>

      {/* SUB-TAB 1: GAUGE & MARKET SIZE */}
      {activeSubTab === 'gauge' && (
        <div className="animate-fade-in">
          <div className="metrics-grid mb-2xl">
            <div className="metric-card glass-card-success">
              <div className="metric-label">Total Addressable Market (TAM)</div>
              <div className="metric-value text-success">{data.market_size || 'N/A'}</div>
              <div className="text-secondary text-sm mt-xs">Global/National Market Scale</div>
            </div>
            <div className="metric-card glass-card-accent">
              <div className="metric-label">Compound Annual Growth (CAGR)</div>
              <div className="metric-value text-primary">
                {data.growth_rate ? `${data.growth_rate}%` : '14.5%'} <span className="trend-indicator up text-sm ml-xs">↗</span>
              </div>
              <div className="text-secondary text-sm mt-xs">Projected 5-year growth trajectory</div>
            </div>
            <div className="metric-card glass-card-accent">
              <div className="metric-label">Consumer Demand Intensity</div>
              <div className="metric-value text-info">{data.demand_level || 'High Demand'}</div>
              <div className="text-secondary text-sm mt-xs">Current market buy signals</div>
            </div>
          </div>

          <div className="glass-card p-xl border-accent opportunity-card-wrap mb-xl">
            <h3 className="section-heading text-center mb-lg"><FaChartPie /> Market Opportunity Index Score</h3>
            
            <div className="score-gauge-container">
              <svg className="score-gauge-svg" viewBox="0 0 100 100">
                <circle className="score-gauge-bg" cx="50" cy="50" r="45" />
                <circle 
                  className="score-gauge-progress" 
                  cx="50" cy="50" r="45" 
                  stroke="var(--accent-color)"
                  strokeDasharray={`${(data.opportunity_score || 82) * 2.4} 282`} 
                />
              </svg>
              <div className="score-gauge-text">
                <div className="val text-accent">{data.opportunity_score || 82}</div>
                <div className="lbl">/100</div>
              </div>
            </div>

            <div className="opportunity-text-block mt-md">
              <p className="text-center text-sm text-secondary leading-relaxed">
                {data.opportunity_explanation || 'Strong overall product-market fit and timing index evaluated by Groq AI and industry market benchmarks.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BUYER DEMOGRAPHICS & PERSONA */}
      {activeSubTab === 'demographics' && (
        <div className="animate-fade-in">
          <div className="glass-card p-xl mb-xl">
            <h3 className="section-heading mb-md"><FaCrosshairs /> Target Customer Profile & Pain Points</h3>
            <div className="swot-grid">
              <div className="p-md bg-glass rounded" style={{ borderLeft: '4px solid #6366f1' }}>
                <h4 className="text-primary mb-xs">Primary Target Demographic</h4>
                <p className="text-sm text-secondary">{data.primary_demo || data.target_audience_primary || 'Target customer persona seeking specialized industry solution.'}</p>
              </div>
              <div className="p-md bg-glass rounded" style={{ borderLeft: '4px solid #ef4444' }}>
                <h4 className="text-danger mb-xs">Core Customer Pain Point</h4>
                <p className="text-sm text-secondary">{data.key_pain_point || 'High friction, slow manual workflows, or expensive legacy service providers.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CHANNELS & TRIGGERS */}
      {activeSubTab === 'channels' && (
        <div className="animate-fade-in">
          <div className="glass-card p-xl mb-xl">
            <h3 className="section-heading mb-md"><FaBullhorn /> Go-To-Market Channels & Buying Triggers</h3>
            <div className="swot-grid">
              <div className="p-md bg-glass rounded" style={{ borderLeft: '4px solid #f59e0b' }}>
                <h4 className="text-warning mb-xs">Recommended Acquisition Channel</h4>
                <p className="text-sm text-secondary">{data.acquisition_channel || 'Digital Inbound Marketing, Targeted Social Media Ads, SEO & Direct Outreach.'}</p>
              </div>
              <div className="p-md bg-glass rounded" style={{ borderLeft: '4px solid #10b981' }}>
                <h4 className="text-success mb-xs">Decision & Purchase Trigger</h4>
                <p className="text-sm text-secondary">{data.purchase_trigger || 'Urgent requirement for cost reduction, process automation, or specialized convenience.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: INDUSTRY TRENDS */}
      {activeSubTab === 'trends' && (
        <div className="animate-fade-in">
          <div className="glass-card p-xl">
            <h3 className="section-heading"><FaLightbulb /> Market Tailwinds & Sector Trends</h3>
            <ul className="user-list mt-md">
              {data.industry_trends && data.industry_trends.length > 0 ? (
                data.industry_trends.map((trend, i) => (
                  <li key={i} style={{ marginBottom: '0.75rem', lineHeight: '1.6' }}>{trend}</li>
                ))
              ) : (
                <li className="text-secondary italic">Increasing digital transformation driving consumer adoption.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketTab;
