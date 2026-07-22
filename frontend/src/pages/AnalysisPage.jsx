import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import { startupAPI, analysisAPI } from '../services/api';
import { toast } from 'react-toastify';
import '../styles/Analysis.css';

import OverviewTab from '../components/Analysis/OverviewTab';
import MarketTab from '../components/Analysis/MarketTab';
import CompetitorTab from '../components/Analysis/CompetitorTab';
import TechnologyTab from '../components/Analysis/TechnologyTab';
import BusinessTab from '../components/Analysis/BusinessTab';
import FinancialTab from '../components/Analysis/FinancialTab';
import RiskTab from '../components/Analysis/RiskTab';
import RoadmapTab from '../components/Analysis/RoadmapTab';
import ReportTab from '../components/Analysis/ReportTab';

const AnalysisPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  const [idea, setIdea] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState('pending');
  const [analysisData, setAnalysisData] = useState({});
  const [loading, setLoading] = useState(true);

  const tabs = [
    'Overview', 'Market', 'Competitor', 'Technology',
    'Business', 'Financial', 'Risk', 'Roadmap', 'Report'
  ];

  // Fetch startup idea details
  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const res = await startupAPI.getById(id);
        setIdea(res.data);
        setAnalysisStatus(res.data.analysis_status);
      } catch (err) {
        toast.error('Failed to load startup idea');
      } finally {
        setLoading(false);
      }
    };
    fetchIdea();
  }, [id]);

  // Poll for analysis status when running
  useEffect(() => {
    if (analysisStatus !== 'running') return;

    const interval = setInterval(async () => {
      try {
        const res = await analysisAPI.getStatus(id);
        const status = res.data.data.analysis_status;
        setAnalysisStatus(status);
        if (status === 'completed') {
          toast.success('Analysis complete! 🎉');
          clearInterval(interval);
          fetchTabData('Overview');
        } else if (status === 'failed') {
          toast.error('Analysis failed. Please try again.');
          clearInterval(interval);
        }
      } catch (err) {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [analysisStatus, id]);

  // Fetch data for active tab
  const fetchTabData = useCallback(async (tab) => {
    if (analysisData[tab]) return; // Already fetched
    try {
      let res;
      switch (tab) {
        case 'Overview': res = await analysisAPI.getOverview(id); break;
        case 'Market': res = await analysisAPI.getMarket(id); break;
        case 'Competitor': res = await analysisAPI.getCompetitors(id); break;
        case 'Technology': res = await analysisAPI.getTechnology(id); break;
        case 'Business': res = await analysisAPI.getBusiness(id); break;
        case 'Financial': res = await analysisAPI.getFinancial(id); break;
        case 'Risk': res = await analysisAPI.getRisk(id); break;
        case 'Roadmap': res = await analysisAPI.getRoadmap(id); break;
        default: return;
      }
      setAnalysisData(prev => ({ ...prev, [tab]: res.data.data }));
    } catch (err) {
      // Store error marker so the tab doesn't show infinite loading
      setAnalysisData(prev => ({ ...prev, [tab]: { _error: true, _message: 'Analysis data is being generated. Please refresh in a moment.' } }));
    }
  }, [id, analysisData]);

  useEffect(() => {
    if (analysisStatus === 'completed') {
      fetchTabData(activeTab);
    }
  }, [activeTab, analysisStatus, fetchTabData]);


  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    if (analysisStatus === 'running') {
      return (
        <div className="analysis-loading">
          <LoadingSpinner />
          <h3>AI is analyzing your startup idea...</h3>
          <p>This usually takes 30-60 seconds. We're running NLP, market research, competitor analysis, and financial projections.</p>
        </div>
      );
    }

    if (analysisStatus === 'pending') {
      return (
        <div className="analysis-loading">
          <h3>Analysis Not Started</h3>
          <p>Go back to the dashboard and click "Run Analysis" to begin.</p>
        </div>
      );
    }

    if (analysisStatus === 'failed') {
      return (
        <div className="analysis-loading">
          <h3>⚠️ Analysis Failed</h3>
          <p>Something went wrong. Go back to the dashboard and retry the analysis.</p>
        </div>
      );
    }

    const data = analysisData[activeTab];
    if (!data && activeTab !== 'Report') {
      return <LoadingSpinner />;
    }

    // Show error message if tab data failed to load
    if (data && data._error) {
      return (
        <div className="analysis-loading">
          <h3>⏳ Data Not Available Yet</h3>
          <p>{data._message}</p>
          <button className="btn-primary" onClick={() => {
            setAnalysisData(prev => {
              const copy = { ...prev };
              delete copy[activeTab];
              return copy;
            });
          }} style={{ marginTop: '16px' }}>
            🔄 Retry Loading
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'Overview': return <OverviewTab data={data} idea={idea} />;
      case 'Market': return <MarketTab data={data} idea={idea} />;
      case 'Competitor': return <CompetitorTab data={data} idea={idea} />;
      case 'Technology': return <TechnologyTab data={data} idea={idea} />;
      case 'Business': return <BusinessTab data={data} idea={idea} />;
      case 'Financial': return <FinancialTab data={data} idea={idea} />;
      case 'Risk': return <RiskTab data={data} idea={idea} />;
      case 'Roadmap': return <RoadmapTab data={data} idea={idea} />;
      case 'Report': return <ReportTab ideaId={id} />;
      default: return <OverviewTab data={data} idea={idea} />;
    }
  };

  if (loading) return <div className="page-layout"><Sidebar /><div className="page-content"><LoadingSpinner /></div></div>;

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content analysis-page">
        <div className="analysis-header stagger-1">
          <div className="title-section">
            <h1>{idea?.title || 'Startup Analysis'}</h1>
            <p className="text-secondary flex align-center gap-sm mt-xs">
              <span className={`sector-badge sector-badge-${idea?.sector || 'hybrid'}`}>{idea?.sector || 'hybrid'}</span>
              <span>•</span>
              <span>{idea?.industry}</span>
              <span>•</span>
              Status: <span className={`status-text status-${analysisStatus} uppercase text-xs font-bold`}>{analysisStatus}</span>
            </p>
          </div>
          
          {analysisStatus === 'completed' && analysisData['Overview'] && (
            <div className="overall-score-card glass-card">
              <div className="score-display">
                <span className="label">V2V Score</span>
                <span className={`value text-${analysisData['Overview'].overall_score > 80 ? 'success' : analysisData['Overview'].overall_score > 60 ? 'primary' : 'warning'}`}>
                  {analysisData['Overview'].overall_score || 85}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="tabs-container glass-card">
          <div className="tabs-nav">
            {tabs.map(tab => (
              <button
                key={tab}
                id={`tab-${tab.toLowerCase()}`}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => handleTabChange(tab)}
                disabled={analysisStatus !== 'completed' && tab !== 'Overview'}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="tab-content-area">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
