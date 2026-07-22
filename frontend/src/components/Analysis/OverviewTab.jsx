import React from 'react';
import { FiTarget, FiBriefcase, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { FaHashtag, FaIndustry, FaUsers } from 'react-icons/fa';

const OverviewTab = ({ data, idea }) => {
  if (!data || !idea) return <div className="text-center p-8 animate-fade-in">Loading overview...</div>;

  return (
    <div className="overview-tab animate-fade-in flex flex-column gap-xl">
      
      {/* Quick Summary Top Card */}
      <div className="glass-card-accent p-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex align-center gap-md mb-md">
            <h2 className="text-2xl font-bold">{idea.title}</h2>
            <span className={`sector-badge sector-badge-${idea.sector || 'hybrid'}`}>
              {idea.sector || 'hybrid'}
            </span>
          </div>
          <p className="text-lg text-secondary max-w-3xl leading-relaxed">
            {data.summary || idea.description}
          </p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card glass-card">
          <div className="metric-label flex align-center gap-xs justify-center"><FaIndustry /> Industry</div>
          <div className="metric-value text-primary text-xl mt-xs">{idea.industry || data.business_domain || 'Technology'}</div>
        </div>
        <div className="metric-card glass-card">
          <div className="metric-label flex align-center gap-xs justify-center"><FaUsers /> Target Market</div>
          <div className="metric-value text-info text-xl mt-xs">{idea.target_customers || data.target_users || 'General Audience'}</div>
        </div>
        <div className="metric-card glass-card">
          <div className="metric-label flex align-center gap-xs justify-center"><FiTarget /> Pricing Strategy</div>
          <div className="metric-value text-success text-xl mt-xs">{idea.pricing_model || 'Subscription'}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-xl mt-md">
        <div className="glass-card p-xl border-left-danger">
          <h3 className="section-heading"><FiAlertCircle className="text-danger" /> The Problem</h3>
          <p className="section-text text-lg">
            {data.problem_statement || "No specific problem statement generated."}
          </p>
        </div>

        <div className="glass-card p-xl border-left-success">
          <h3 className="section-heading"><FiCheckCircle className="text-success" /> The Solution</h3>
          <p className="section-text text-lg">
            {data.solution || "No specific solution generated."}
          </p>
        </div>
      </div>

      <div className="glass-card p-xl mt-md">
        <h3 className="section-heading"><FaHashtag /> Extracted Keywords</h3>
        <p className="text-secondary mb-md">These keywords represent the core themes of your venture and can be used for initial SEO and marketing copy.</p>
        <div className="tag-container">
          {data.keywords && data.keywords.length > 0 ? (
            data.keywords.map((kw, i) => (
              <span key={i} className={`tag stagger-${(i%5)+1}`}>
                {kw}
              </span>
            ))
          ) : (
            <span className="text-secondary italic">No keywords generated.</span>
          )}
        </div>
      </div>

    </div>
  );
};

export default OverviewTab;
