import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/Cards/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { startupAPI, analysisAPI } from '../services/api';
import { FaLightbulb, FaCheckCircle, FaStar, FaPlus, FaTrash, FaRocket } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../styles/Dashboard.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  
  // Instant Stale-While-Revalidate: Load from localStorage in 0ms
  const [ideas, setIdeas] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_startup_ideas');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // If cached ideas exist, do NOT block screen with full-screen spinner
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_startup_ideas');
      return !cached || JSON.parse(cached).length === 0;
    } catch {
      return true;
    }
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetchIdeas();
    // Safety guard: Never stay stuck in full-screen loading loop for >6s
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 6000);
    return () => clearTimeout(safetyTimer);
  }, []);

  const fetchIdeas = async () => {
    const hasCached = ideas.length > 0;
    if (!hasCached) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setFetchError(false);

    try {
      const res = await startupAPI.list();
      setIdeas(res.data);
      localStorage.setItem('cached_startup_ideas', JSON.stringify(res.data));
    } catch (err) {
      if (!hasCached) {
        setFetchError(true);
        toast.error('Could not connect to server. Retrying...');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const hasRunning = ideas.some(i => i.analysis_status === 'running');
    if (!hasRunning) return;

    const interval = setInterval(async () => {
      try {
        const res = await startupAPI.list();
        setIdeas(res.data);
        localStorage.setItem('cached_startup_ideas', JSON.stringify(res.data));
      } catch (err) {
        console.error('Poll error', err);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [ideas]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this startup idea and all its analysis?')) return;
    try {
      await startupAPI.delete(id);
      const updated = ideas.filter(i => i.id !== id);
      setIdeas(updated);
      localStorage.setItem('cached_startup_ideas', JSON.stringify(updated));
      toast.success('Idea deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleRunAnalysis = async (id) => {
    try {
      await analysisAPI.run(id);
      toast.info('Analysis started! This may take a minute...');
      // Update local state
      setIdeas(ideas.map(i => i.id === id ? { ...i, analysis_status: 'running' } : i));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start analysis');
    }
  };

  const completedCount = ideas.filter(i => i.analysis_status === 'completed').length;

  const stats = [
    { icon: <FaLightbulb />, label: 'Total Ideas', value: String(ideas.length), trend: ideas.length, trendLabel: 'all time' },
    { icon: <FaCheckCircle />, label: 'Analyzed', value: String(completedCount), trend: completedCount, trendLabel: 'completed' },
    { icon: <FaStar />, label: 'Pending', value: String(ideas.length - completedCount), trend: 0, trendLabel: 'awaiting' }
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'running': return 'status-running';
      case 'failed': return 'status-failed';
      default: return 'status-pending';
    }
  };

  if (loading) {
    return (
      <div className="page-layout">
        <Sidebar />
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '14px' }}>
          <LoadingSpinner />
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (fetchError && ideas.length === 0) {
    return (
      <div className="page-layout">
        <Sidebar />
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px', textAlign: 'center' }}>
          <FaLightbulb size={48} color="#6366f1" />
          <h2 style={{ color: '#f8fafc', margin: 0 }}>Connection Delayed</h2>
          <p style={{ color: '#94a3b8', maxWidth: '420px', margin: 0 }}>
            The cloud server is taking a moment to respond. Click below to reconnect.
          </p>
          <button className="btn-primary" onClick={fetchIdeas}>
            Retry Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content">
        <div className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="page-title" style={{ margin: 0 }}>Dashboard</h1>
            {isRefreshing && (
              <span style={{ fontSize: '0.72rem', color: '#a5b4fc', background: 'rgba(99, 102, 241, 0.12)', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.25)', fontWeight: 600 }}>
                Syncing...
              </span>
            )}
          </div>
          <button className="btn-primary" onClick={() => navigate('/new-idea')}>
            <FaPlus /> New Idea
          </button>
        </div>

        <div className="stats-grid">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        <div className="dashboard-section">
          <h2>Active Ideas</h2>
          {ideas.filter(i => i.analysis_status !== 'completed').length === 0 ? (
            <div className="empty-state glass-card">
              <FaLightbulb size={48} />
              <h3>No active ideas</h3>
              <p>Submit your first startup idea to get AI-powered analysis!</p>
              <button className="btn-primary" onClick={() => navigate('/new-idea')}>
                <FaPlus /> Submit New Idea
              </button>
            </div>
          ) : (
            <div className="ideas-grid">
              {ideas.filter(i => i.analysis_status !== 'completed').map(idea => (
                <div key={idea.id} className="idea-card glass-card">
                  <div className="idea-card-header">
                    <h3 className="idea-title" title={idea.title}>
                      {idea.title}
                    </h3>
                  </div>
                  <div className="idea-meta-row">
                    <div className="idea-meta">
                      <span>{idea.industry}</span>
                      <span className="idea-meta-bullet">•</span>
                      <span className={`sector-badge sector-badge-${idea.sector}`}>{idea.sector}</span>
                    </div>
                    <span className={`status-badge ${getStatusClass(idea.analysis_status)}`}>
                      {idea.analysis_status}
                    </span>
                  </div>
                  <p className="idea-desc">{idea.description?.substring(0, 120)}...</p>
                  <div className="idea-actions">
                    {idea.analysis_status === 'pending' && (
                      <button className="btn-primary" onClick={() => handleRunAnalysis(idea.id)}>
                        <FaRocket /> Run Analysis
                      </button>
                    )}
                    {idea.analysis_status === 'running' && (
                      <button className="btn-secondary" disabled>
                        ⏳ Analyzing...
                      </button>
                    )}
                    {idea.analysis_status === 'failed' && (
                      <button className="btn-primary" onClick={() => handleRunAnalysis(idea.id)}>
                        🔄 Retry
                      </button>
                    )}
                    <button className="btn-danger" onClick={() => handleDelete(idea.id)} title="Delete">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {completedCount > 0 && (
          <div className="dashboard-section" style={{ marginTop: '2rem' }}>
            <h2>Analysis History</h2>
            <div className="ideas-grid">
              {ideas.filter(i => i.analysis_status === 'completed').map(idea => (
                <div key={idea.id} className="idea-card glass-card">
                  <div className="idea-card-header">
                    <h3 className="idea-title" title={idea.title}>
                      {idea.title}
                    </h3>
                  </div>
                  <div className="idea-meta-row">
                    <div className="idea-meta">
                      <span>{idea.industry}</span>
                      <span className="idea-meta-bullet">•</span>
                      <span className={`sector-badge sector-badge-${idea.sector}`}>{idea.sector}</span>
                    </div>
                    <span className="status-badge status-completed">
                      Success Probability: {idea.overall_score ? `${idea.overall_score}/100` : 'High'}
                    </span>
                  </div>
                  <p className="idea-desc">{idea.description?.substring(0, 120)}...</p>
                  <div className="idea-actions">
                    <Link to={`/analysis/${idea.id}`} className="btn-secondary">
                      View Results
                    </Link>
                    <button className="btn-danger" onClick={() => handleDelete(idea.id)} title="Delete">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
