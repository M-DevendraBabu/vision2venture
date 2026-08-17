import React, { useState } from 'react';
import { FaMapSigns, FaCheckCircle, FaCalendarAlt, FaTrophy, FaTools, FaDollarSign, FaBullseye, FaFlag } from 'react-icons/fa';

const RoadmapTab = ({ data, idea }) => {
  const [activeSubTab, setActiveSubTab] = useState('timeline');

  if (!data) return <div className="text-center p-8 animate-fade-in">Loading roadmap...</div>;

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
        estimated_cost: phase.estimated_cost || 'N/A'
      });
    }
  }

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

  return (
    <div className="roadmap-tab animate-fade-in">
      <div className="section-heading mb-md"><FaMapSigns /> Implementation Roadmap & Milestones</div>
      
      <div className="explanation-box mb-xl" style={{ borderLeft: '4px solid #10b981' }}>
        <strong>AI Execution Action Plan:</strong> Concrete 5-phase execution timeline mapping capital allocation, operational tasks, and key success metrics.
        {data.timeline && <><br /><strong>Total Execution Horizon:</strong> {data.timeline}</>}
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveSubTab('timeline')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'timeline' ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'timeline' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaCalendarAlt /> 1. 5-Phase Execution Timeline
        </button>

        <button
          onClick={() => setActiveSubTab('milestones')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'milestones' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'milestones' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaFlag /> 2. Key Milestones & Metrics
        </button>

        <button
          onClick={() => setActiveSubTab('costs')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'costs' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'costs' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaDollarSign /> 3. Phase Cost & Budget Allocation
        </button>
      </div>

      {/* SUB-TAB 1: 5-PHASE TIMELINE */}
      {activeSubTab === 'timeline' && (
        <div className="roadmap-timeline animate-fade-in" style={{ position: 'relative', maxWidth: '900px', margin: '0 auto' }}>
          {phases.map((phase, idx) => {
            const color = phaseColors[idx % phaseColors.length];
            return (
              <div key={idx} style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
                    {idx + 1}
                  </div>
                  {idx < phases.length - 1 && (
                    <div style={{ flex: 1, width: '3px', background: `linear-gradient(to bottom, ${color}, ${phaseColors[(idx + 1) % phaseColors.length]})`, margin: '6px 0' }}></div>
                  )}
                </div>

                <div className="glass-card p-lg" style={{ flex: 1, borderTop: `4px solid ${color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ color: color, fontSize: '1.1rem', fontWeight: 700 }}>{phase.name}</h4>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '0.3rem 0.75rem', borderRadius: '20px' }}>
                      <FaCalendarAlt style={{ marginRight: '4px' }} /> {phase.duration}
                    </span>
                  </div>

                  {phase.tasks && phase.tasks.length > 0 && (
                    <div>
                      <h5 style={{ fontSize: '0.9rem', color: '#e2e8f0', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FaTools style={{ color: color }} /> Action Items & Operational Tasks
                      </h5>
                      <ul className="user-list">
                        {phase.tasks.map((task, tIdx) => (
                          <li key={tIdx} style={{ fontSize: '0.88rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>{task}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-TAB 2: MILESTONES & METRICS */}
      {activeSubTab === 'milestones' && (
        <div className="animate-fade-in">
          <div className="metrics-grid mb-xl">
            {phases.map((phase, idx) => (
              <div key={idx} className="glass-card p-lg" style={{ borderTop: `4px solid ${phaseColors[idx % phaseColors.length]}` }}>
                <h4 style={{ color: phaseColors[idx % phaseColors.length], fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>{phase.name}</h4>
                
                {phase.milestones && phase.milestones.length > 0 && (
                  <div className="mb-md">
                    <h5 className="text-success text-xs font-bold uppercase mb-xs" style={{ letterSpacing: '0.05em' }}><FaTrophy /> Core Milestone</h5>
                    <p className="text-sm text-secondary">{phase.milestones.join(', ')}</p>
                  </div>
                )}

                {phase.success_metrics && phase.success_metrics.length > 0 && (
                  <div>
                    <h5 className="text-info text-xs font-bold uppercase mb-xs" style={{ letterSpacing: '0.05em' }}><FaBullseye /> Success Metric</h5>
                    <p className="text-sm text-secondary">{phase.success_metrics.join(', ')}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PHASE COST & BUDGET ALLOCATION */}
      {activeSubTab === 'costs' && (
        <div className="animate-fade-in">
          <div className="metrics-grid mb-xl">
            {phases.map((phase, idx) => (
              <div key={idx} className="glass-card p-lg" style={{ borderLeft: `4px solid ${phaseColors[idx % phaseColors.length]}` }}>
                <h4 style={{ color: phaseColors[idx % phaseColors.length], fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>{phase.name}</h4>
                <div className="metric-value text-warning" style={{ fontSize: '1.2rem' }}>{phase.estimated_cost}</div>
                <div className="text-secondary text-sm mt-xs">Phase Duration: {phase.duration}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapTab;
