import React, { useState } from 'react';
import { reportAPI } from '../../services/api';
import {
  FiDownload,
  FiFileText,
  FiRefreshCw,
  FiCheckCircle,
  FiTrendingUp,
  FiDollarSign,
  FiShield,
  FiAward,
  FiMap,
  FiLayers,
  FiCpu,
  FiPieChart,
  FiTarget
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const ReportTab = ({ ideaId }) => {
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleGenerate = async () => {
    if (!ideaId) return;
    setGenerating(true);
    try {
      await reportAPI.generate(ideaId);
      toast.success('Fresh PDF report compiled successfully. Click Download PDF to save it.');
    } catch (error) {
      toast.error('Failed to regenerate report. Please try again.');
      console.error('Report generation error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!ideaId) return;
    setDownloading(true);
    try {
      const response = await reportAPI.download(ideaId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Vision2Venture_Report_${ideaId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF report downloaded successfully!');
    } catch (error) {
      toast.error('Unable to download report. Regenerating now...');
      console.error('Report download error:', error);
      // Fallback: trigger generation then inform user
      try {
        await reportAPI.generate(ideaId);
        const retryRes = await reportAPI.download(ideaId);
        const blob = new Blob([retryRes.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Vision2Venture_Report_${ideaId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('PDF report generated and downloaded!');
      } catch (retryErr) {
        toast.error('Failed to generate PDF. Please verify backend status.');
        console.error('Retry error:', retryErr);
      }
    } finally {
      setDownloading(false);
    }
  };

  const reportModules = [
    { id: 1, title: 'Business Overview & Domain', icon: <FiTarget size={18} color="#2563EB" />, desc: 'Problem-solution synthesis, domain categorization, and executive summary' },
    { id: 2, title: 'Market Analysis & Demographics', icon: <FiTrendingUp size={18} color="#059669" />, desc: 'TAM/SAM sizing, CAGR rates, demographics, pain points, and purchase triggers' },
    { id: 3, title: 'Competitor Intelligence & USPs', icon: <FiPieChart size={18} color="#D97706" />, desc: 'Benchmarking against YC alumni, similarity scores, weaknesses, and market gaps' },
    { id: 4, title: 'Technology Architecture', icon: <FiCpu size={18} color="#7C3AED" />, desc: 'Curated full-stack recommendations, cloud infrastructure, and AI frameworks' },
    { id: 5, title: 'Business Model Canvas', icon: <FiLayers size={18} color="#0284C7" />, desc: '9 core pillars: customer segments, revenue streams, channels, and cost dynamics' },
    { id: 6, title: 'SWOT Strategic Matrix', icon: <FiFileText size={18} color="#DC2626" />, desc: '4-quadrant strategic audit with qualitative risk and growth assessments' },
    { id: 7, title: 'Financial Projections & Unit Economics', icon: <FiDollarSign size={18} color="#059669" />, desc: 'CapEx/OpEx breakdown, MRR, CAC/LTV, break-even timeline, and projected ROI' },
    { id: 8, title: 'Multi-Vector Risk Assessment', icon: <FiShield size={18} color="#EA580C" />, desc: 'Technical, market, competitive, financial, and operational risk mitigation' },
    { id: 9, title: 'Feasibility & Investor Readiness', icon: <FiAward size={18} color="#4F46E5" />, desc: 'Ensemble ML scoring, scalability index, and tailored investor recommendations' },
    { id: 10, title: '5-Phase Implementation Roadmap', icon: <FiMap size={18} color="#0D9488" />, desc: 'Milestone sequencing, task timelines, and phase-by-phase budget allocations' },
    { id: 11, title: 'Executive Summary & Recommendation', icon: <FiCheckCircle size={18} color="#16A34A" />, desc: 'Scorecard summary, left-aligned analytical narrative, and strategic verdict' },
  ];

  return (
    <div className="report-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%' }}>
      
      {/* ── Hero Card ── */}
      <div 
        style={{ 
          background: '#FFFFFF', 
          borderRadius: '16px', 
          border: '1px solid #E2E8F0', 
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)', 
          padding: '40px 32px', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div 
          style={{ 
            width: '72px', 
            height: '72px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '20px',
            border: '1px solid #BFDBFE'
          }}
        >
          <FiFileText size={36} style={{ color: '#2563EB' }} />
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', marginBottom: '10px', letterSpacing: '-0.02em' }}>
          Executive Venture Intelligence Dossier
        </h2>
        
        <p style={{ maxWidth: '640px', color: '#475569', fontSize: '1.02rem', lineHeight: '1.65', marginBottom: '32px' }}>
          Generate a publication-grade, investor-ready PDF report compiling all 11 analytical dimensions, validated ML models, financial unit economics, and strategic roadmaps.
        </p>

        {/* ── Primary Action Buttons ── */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
          
          {/* Primary Download Button */}
          <button 
            onClick={handleDownload} 
            disabled={downloading || generating}
            className="report-download-btn"
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: (downloading || generating) ? 'not-allowed' : 'pointer',
              opacity: (downloading || generating) ? 0.75 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            <FiDownload size={20} />
            {downloading ? 'Preparing & Downloading PDF...' : 'Download PDF Report'}
          </button>

          {/* Secondary Regenerate Button */}
          <button 
            onClick={handleGenerate}
            disabled={generating || downloading}
            className="report-regenerate-btn"
            style={{
              padding: '14px 24px',
              background: '#F8FAFC',
              color: '#1E293B',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: (generating || downloading) ? 'not-allowed' : 'pointer',
              opacity: (generating || downloading) ? 0.75 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s ease',
            }}
          >
            <FiRefreshCw size={18} className={generating ? 'spin' : ''} />
            {generating ? 'Compiling Report...' : 'Regenerate Fresh Report'}
          </button>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '0.85rem' }}>
          <FiCheckCircle color="#10B981" size={15} />
          <span>Includes verified dataset benchmarks, ML confidence calibrations, and formatted strategic recommendations.</span>
        </div>
      </div>

      {/* ── Blueprint Grid: 11 Modules Included ── */}
      <div 
        style={{ 
          background: '#FFFFFF', 
          borderRadius: '16px', 
          border: '1px solid #E2E8F0', 
          padding: '32px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
              Dossier Blueprint & Included Modules
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0 }}>
              The exported PDF incorporates all 11 core intelligence modules synthesized into an executive layout.
            </p>
          </div>
          <span 
            style={{ 
              background: '#F1F5F9', 
              color: '#334155', 
              padding: '6px 14px', 
              borderRadius: '20px', 
              fontSize: '0.85rem', 
              fontWeight: 600 
            }}
          >
            11 Comprehensive Dimensions
          </span>
        </div>

        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '16px' 
          }}
        >
          {reportModules.map((module) => (
            <div 
              key={module.id} 
              style={{ 
                background: '#F8FAFC', 
                border: '1px solid #E2E8F0', 
                borderRadius: '10px', 
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'border-color 0.2s ease, transform 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px', 
                    background: '#FFFFFF', 
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {module.icon}
                </span>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A' }}>
                  {module.id}. {module.title}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
                {module.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ReportTab;
