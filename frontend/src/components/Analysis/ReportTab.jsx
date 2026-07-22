import React, { useState } from 'react';
import { reportAPI } from '../../services/api';
import { FiDownload, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ReportTab = ({ ideaId }) => {
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleGenerate = async () => {
    if (!ideaId) return;
    setGenerating(true);
    try {
      await reportAPI.generate(ideaId);
      toast.success('Report generation triggered successfully.');
    } catch (error) {
      toast.error('Failed to generate report.');
      console.error(error);
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
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download report. It may not be ready yet.');
      console.error(error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="report-tab animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', textAlign: 'center' }}>
      <FiFileText size={64} style={{ color: 'var(--accent-purple)', marginBottom: '20px' }} />
      <h2 style={{ marginBottom: '10px' }}>Comprehensive Business Report</h2>
      <p style={{ maxWidth: '600px', margin: '0 auto 40px auto', color: '#a0aec0', lineHeight: '1.6' }}>
        Generate a complete, investor-ready PDF report containing all analysis dimensions, charts, and strategic insights for your startup idea.
      </p>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button 
          onClick={handleGenerate} 
          disabled={generating}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, var(--electric-blue) 0%, var(--accent-purple) 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: generating ? 'not-allowed' : 'pointer',
            opacity: generating ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'transform 0.2s'
          }}
        >
          {generating ? 'Generating...' : 'Generate Report'}
        </button>

        <button 
          onClick={handleDownload}
          disabled={downloading}
          style={{
            padding: '12px 24px',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: downloading ? 'not-allowed' : 'pointer',
            opacity: downloading ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          <FiDownload />
          {downloading ? 'Downloading...' : 'Download PDF'}
        </button>
      </div>
    </div>
  );
};

export default ReportTab;
