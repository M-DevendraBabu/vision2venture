import React from 'react';
import { FaLaptopCode, FaServer, FaDatabase, FaCogs, FaBrain, FaCloud, FaStore } from 'react-icons/fa';

const TechnologyTab = ({ data, idea }) => {
  if (!data) return <div className="text-center p-8 animate-fade-in">Loading tech recommendations...</div>;

  const isOnline = idea?.sector !== 'offline';

  const techCards = [
    { label: isOnline ? 'Frontend Stack' : 'POS & Retail Systems', value: data.frontend, icon: <FaLaptopCode />, color: 'blue' },
    { label: isOnline ? 'Backend Architecture' : 'Inventory & ERP System', value: data.backend, icon: <FaServer />, color: 'purple' },
    { label: 'Database & Storage', value: data.database_system, icon: <FaDatabase />, color: 'cyan' },
    { label: 'Cloud Infrastructure', value: data.cloud_platform, icon: <FaCloud />, color: 'teal' },
    { label: isOnline ? 'AI & ML Frameworks' : 'Marketing & POS Tools', value: data.ai_framework, icon: <FaBrain />, color: 'pink' },
    { label: 'Deployment & Operations', value: data.deployment, icon: <FaCogs />, color: 'indigo' },
  ];

  return (
    <div className="technology-tab animate-fade-in">
      <div className="section-heading mb-md">
        {isOnline ? <><FaLaptopCode /> Recommended Tech Stack</> : <><FaStore /> Operational Tech & Tools</>}
      </div>
      
      <div className="explanation-box mb-xl">
        <strong>AI Architecture Reasoning:</strong> {data.reasoning || (isOnline ? 'Modern decoupled cloud stack built for rapid scalability.' : 'Operational tool stack to automate store management.')}
      </div>

      <div className="tech-stack-grid">
        {techCards.map((tech, idx) => (
          <div key={idx} className={`glass-card p-lg tech-card stagger-${(idx%5)+1}`}>
            <h4 className="flex align-center gap-sm mb-sm text-primary" style={{ fontSize: '1.05rem', fontWeight: 600 }}>
              <span className={`feat-icon gradient-${tech.color}`} style={{ width: '36px', height: '36px', fontSize: '1rem', marginBottom: 0 }}>{tech.icon}</span>
              {tech.label}
            </h4>
            <p className="text-sm text-secondary leading-relaxed" style={{ fontSize: '0.92rem', color: '#e2e8f0' }}>
              {tech.value || 'Data not specified'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnologyTab;
