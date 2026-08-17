import React, { useState } from 'react';
import { FaLaptopCode, FaServer, FaDatabase, FaCogs, FaBrain, FaCloud, FaStore, FaLayerGroup, FaHdd, FaShieldAlt } from 'react-icons/fa';

const TechnologyTab = ({ data, idea }) => {
  const [activeSubTab, setActiveSubTab] = useState('arch');

  if (!data) return <div className="text-center p-8 animate-fade-in">Loading tech recommendations...</div>;

  const isOnline = idea?.sector !== 'offline';

  return (
    <div className="technology-tab animate-fade-in">
      <div className="section-heading mb-md">
        {isOnline ? <><FaLaptopCode /> Technology Architecture & Stack</> : <><FaStore /> Operational POS & Hardware Tools</>}
      </div>
      
      <div className="explanation-box mb-xl" style={{ borderLeft: '4px solid #6366f1' }}>
        <strong>AI Architecture Rationale:</strong> {data.reasoning || (isOnline ? 'Modern decoupled cloud stack built for rapid scalability and low latency.' : 'Operational tool stack to automate store management and inventory sync.')}
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveSubTab('arch')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'arch' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'arch' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaLayerGroup /> 1. Application Layer (Frontend & Backend)
        </button>

        <button
          onClick={() => setActiveSubTab('cloud')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'cloud' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'cloud' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaHdd /> 2. Database & Cloud Infrastructure
        </button>

        <button
          onClick={() => setActiveSubTab('deploy')}
          style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'deploy' ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'deploy' ? '600' : '400',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FaShieldAlt /> 3. AI Framework & CI/CD Deployment
        </button>
      </div>

      {/* SUB-TAB 1: FRONTEND & BACKEND ARCHITECTURE */}
      {activeSubTab === 'arch' && (
        <div className="metrics-grid animate-fade-in mb-xl">
          <div className="metric-card glass-card-accent" style={{ borderLeft: '4px solid #6366f1' }}>
            <h4 className="flex align-center gap-sm text-primary mb-xs" style={{ fontSize: '1.1rem' }}>
              <FaLaptopCode /> {isOnline ? 'Frontend User Interface' : 'POS & Retail Systems'}
            </h4>
            <div className="metric-value text-info" style={{ fontSize: '1.1rem' }}>{data.frontend || 'React.js / Next.js'}</div>
            <div className="text-secondary text-sm mt-xs">Client-facing presentation layer and user experience</div>
          </div>

          <div className="metric-card glass-card-accent" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <h4 className="flex align-center gap-sm text-primary mb-xs" style={{ fontSize: '1.1rem' }}>
              <FaServer /> {isOnline ? 'Backend Microservices API' : 'Inventory Gateway'}
            </h4>
            <div className="metric-value text-primary" style={{ fontSize: '1.1rem' }}>{data.backend || 'Python FastAPI / Node.js'}</div>
            <div className="text-secondary text-sm mt-xs">Business logic, REST/GraphQL APIs and transaction pipeline</div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DATABASE & CLOUD INFRASTRUCTURE */}
      {activeSubTab === 'cloud' && (
        <div className="metrics-grid animate-fade-in mb-xl">
          <div className="metric-card glass-card-accent" style={{ borderLeft: '4px solid #06b6d4' }}>
            <h4 className="flex align-center gap-sm text-primary mb-xs" style={{ fontSize: '1.1rem' }}>
              <FaDatabase /> Database & Data Storage
            </h4>
            <div className="metric-value text-info" style={{ fontSize: '1.1rem' }}>{data.database_system || 'PostgreSQL & Redis'}</div>
            <div className="text-secondary text-sm mt-xs">ACID-compliant relational storage & high-speed cache</div>
          </div>

          <div className="metric-card glass-card-accent" style={{ borderLeft: '4px solid #10b981' }}>
            <h4 className="flex align-center gap-sm text-primary mb-xs" style={{ fontSize: '1.1rem' }}>
              <FaCloud /> Cloud Hosting Provider
            </h4>
            <div className="metric-value text-success" style={{ fontSize: '1.1rem' }}>{data.cloud_platform || 'AWS / GCP'}</div>
            <div className="text-secondary text-sm mt-xs">Scalable cloud hosting infrastructure and CDN acceleration</div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: AI & DEPLOYMENT CI/CD */}
      {activeSubTab === 'deploy' && (
        <div className="metrics-grid animate-fade-in mb-xl">
          <div className="metric-card glass-card-accent" style={{ borderLeft: '4px solid #ec4899' }}>
            <h4 className="flex align-center gap-sm text-primary mb-xs" style={{ fontSize: '1.1rem' }}>
              <FaBrain /> AI Engine & Predictive Framework
            </h4>
            <div className="metric-value text-primary" style={{ fontSize: '1.1rem' }}>{data.ai_framework || 'PyTorch / Groq AI'}</div>
            <div className="text-secondary text-sm mt-xs">Machine Learning inference, NLP, and intelligent recommendation framework</div>
          </div>

          <div className="metric-card glass-card-accent" style={{ borderLeft: '4px solid #f59e0b' }}>
            <h4 className="flex align-center gap-sm text-primary mb-xs" style={{ fontSize: '1.1rem' }}>
              <FaCogs /> Deployment & CI/CD Pipeline
            </h4>
            <div className="metric-value text-warning" style={{ fontSize: '1.1rem' }}>{data.deployment || 'Docker / Kubernetes'}</div>
            <div className="text-secondary text-sm mt-xs">Automated container deployment and continuous integration pipeline</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnologyTab;
