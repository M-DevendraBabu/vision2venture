import React, { useState } from 'react';
import { FaMapSigns, FaCheckCircle, FaCalendarAlt, FaChevronDown, FaChevronUp, FaTrophy, FaTools, FaDollarSign, FaBullseye } from 'react-icons/fa';

const RoadmapTab = ({ data, idea }) => {
  // Allow multi-expansion; default to expanding all phases for immediate visual clarity
  const [collapsedPhases, setCollapsedPhases] = useState({});

  if (!data) return <div className="text-center p-8 animate-fade-in">Loading roadmap...</div>;

  // Parse phases from backend data
  const phases = [];
  for (let i = 1; i <= 5; i++) {
    const phase = data[`phase_${i}`];
    if (phase && typeof phase === 'object') {
      phases.push({
        name: phase.name || `Phase ${i}`,
        duration: phase.duration || 'TBD',
        tasks: phase.tasks || [],
        milestones: phase.milestones || [],
        success_metrics: phase.success_metrics || [],
        estimated_cost: phase.estimated_cost || 'N/A',
        cost_explanation: phase.cost_explanation || phase.estimated_cost_explanation || ''
      });
    }
  }

  // Fallback if no phases from backend
  if (phases.length === 0) {
    phases.push(
      { name: 'Phase 1: Validation & Research', duration: 'Months 1-2', tasks: ['Customer interviews', 'Legal registration', 'Landing page setup'], milestones: ['50 validated user leads'], success_metrics: ['80% problem validation'], estimated_cost: '15% of budget' },
      { name: 'Phase 2: MVP Development', duration: 'Months 3-5', tasks: ['Build core features', 'Payment integration', 'Beta testing'], milestones: ['Functional beta release'], success_metrics: ['20 active beta users'], estimated_cost: '35% of budget' },
      { name: 'Phase 3: Launch & Iterate', duration: 'Months 6-8', tasks: ['Public launch', 'First marketing campaign', 'Feedback collection'], milestones: ['First 50 paying users'], success_metrics: ['Positive user NPS score'], estimated_cost: '25% of budget' },
      { name: 'Phase 4: Growth & Scaling', duration: 'Months 9-10', tasks: ['Scale marketing channels', 'Team expansion', 'Operation tuning'], milestones: ['Hit monthly revenue target'], success_metrics: ['15% MoM revenue growth'], estimated_cost: '15% of budget' },
      { name: 'Phase 5: Market Expansion', duration: 'Months 11-12', tasks: ['Regional expansion', 'Partnerships', 'Fundraising prep'], milestones: ['Break-even or Series A ready'], success_metrics: ['Sustainable unit economics'], estimated_cost: '10% of budget' }
    );
  }

  const phaseColors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

  const togglePhase = (idx) => {
    setCollapsedPhases(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="roadmap-tab animate-fade-in">
      <div className="section-heading mb-md"><FaMapSigns /> Execution Roadmap</div>
      
      <div className="explanation-box mb-xl">
        <strong>AI Action Plan:</strong> We've translated your {idea?.sector || 'business'} profile into a concrete, actionable 5-phase execution timeline. 
        This roadmap optimizes your budget allocation and focuses on hitting validation milestones early to minimize risk.
        {data.timeline && <><br /><strong>Total Timeline:</strong> {data.timeline}</>}
      </div>

      {/* Timeline Container */}
      <div className="roadmap-timeline" style={{ position: 'relative', maxWidth: '900px', margin: '0 auto' }}>
        {phases.map((phase, idx) => {
          const isCollapsed = !!collapsedPhases[idx];
          const color = phaseColors[idx % phaseColors.length];
          
          return (
            <div key={idx} className={`timeline-item stagger-${idx + 1}`} style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
              
              {/* Left Timeline Indicator */}
              <div className="timeline-connector" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
                <div 
                  className="timeline-dot" 
                  style={{ 
                    width: '38px', 
                    height: '38px', 
                    borderRadius: '50%', 
                    background: color, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#fff', 
                    fontWeight: 800, 
                    fontSize: '0.9rem',
                    boxShadow: `0 0 16px ${color}60`,
                    flexShrink: 0
                  }}
                >
                  {idx + 1}
                </div>
                {idx < phases.length - 1 && (
                  <div 
                    className="timeline-line" 
                    style={{ 
                      flex: 1, 
                      width: '3px', 
                      background: `linear-gradient(to bottom, ${color}, ${phaseColors[(idx + 1) % phaseColors.length]})`, 
                      margin: '6px 0' 
                    }}
                  ></div>
                )}
              </div>

              {/* Main Phase Card */}
              <div 
                className="glass-card p-lg timeline-card" 
                style={{ 
                  flex: 1, 
                  borderLeft: `4px solid ${color}`,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
                }}
              >
                {/* Header (Click to toggle collapse) */}
                <div 
                  onClick={() => togglePhase(idx)} 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <div>
                    <h3 style={{ color: color, fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>{phase.name}</h3>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="text-secondary text-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaCalendarAlt style={{ color: color }} /> {phase.duration}
                      </span>
                      <span className="text-secondary text-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaDollarSign style={{ color: '#10b981' }} /> {phase.estimated_cost}
                        {phase.cost_explanation && <span className="opacity-70">({phase.cost_explanation})</span>}
                      </span>
                    </div>
                  </div>
                  <button type="button" style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.1rem', cursor: 'pointer' }}>
                    {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
                  </button>
                </div>

                {/* Expanded Content */}
                {!isCollapsed && (
                  <div className="mt-lg animate-fade-in" style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    
                    {/* Tasks Section */}
                    {phase.tasks && phase.tasks.length > 0 && (
                      <div className="mb-md">
                        <h4 className="flex align-center gap-xs mb-xs" style={{ fontSize: '0.95rem', color: '#f1f5f9', fontWeight: 600 }}>
                          <FaTools style={{ color: '#818cf8' }} /> Key Tasks
                        </h4>
                        <ul className="user-list">
                          {phase.tasks.map((task, i) => (
                            <li key={i} className="text-sm py-xs" style={{ color: '#cbd5e1' }}>{task}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Milestones Section */}
                    {phase.milestones && phase.milestones.length > 0 && (
                      <div className="mb-md">
                        <h4 className="flex align-center gap-xs mb-xs" style={{ fontSize: '0.95rem', color: '#34d399', fontWeight: 600 }}>
                          <FaTrophy style={{ color: '#34d399' }} /> Target Milestones
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                          {phase.milestones.map((m, i) => (
                            <span key={i} className="tag" style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', borderColor: 'rgba(16,185,129,0.2)' }}>
                              <FaCheckCircle /> {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Success Metrics Section */}
                    {phase.success_metrics && phase.success_metrics.length > 0 && (
                      <div>
                        <h4 className="flex align-center gap-xs mb-xs" style={{ fontSize: '0.95rem', color: '#60a5fa', fontWeight: 600 }}>
                          <FaBullseye style={{ color: '#60a5fa' }} /> Success Metrics
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                          {phase.success_metrics.map((m, i) => (
                            <span key={i} className="tag" style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', borderColor: 'rgba(59,130,246,0.2)' }}>
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoadmapTab;
