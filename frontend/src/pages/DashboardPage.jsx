import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/Cards/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { startupAPI, analysisAPI } from '../services/api';
import { FaLightbulb, FaCheckCircle, FaStar, FaPlus, FaTrash, FaRocket, FaSearch } from 'react-icons/fa';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');

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
  const scoredIdeas = ideas.filter(i => i.overall_score);
  const avgScore = scoredIdeas.length > 0 
    ? Math.round(scoredIdeas.reduce((sum, i) => sum + Number(i.overall_score), 0) / scoredIdeas.length)
    : null;

  const stats = [
    { icon: <FaLightbulb />, label: 'Total Ideas', value: String(ideas.length), trend: ideas.length, trendLabel: 'portfolio' },
    { icon: <FaCheckCircle />, label: 'Analyzed', value: String(completedCount), trend: completedCount, trendLabel: 'complete' },
    { icon: <FaStar />, label: 'Pending', value: String(ideas.length - completedCount), trend: 0, trendLabel: 'awaiting' }
  ];

  const filteredIdeas = ideas.filter(idea => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      idea.title?.toLowerCase().includes(query) ||
      idea.description?.toLowerCase().includes(query) ||
      idea.industry?.toLowerCase().includes(query);
    const matchesSector = sectorFilter === 'all' || 
      idea.sector?.toLowerCase() === sectorFilter.toLowerCase();
    return matchesSearch && matchesSector;
  });

  const activeIdeas = filteredIdeas.filter(i => i.analysis_status !== 'completed');
  const completedIdeas = filteredIdeas.filter(i => i.analysis_status === 'completed');

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
          <FaLightbulb size={48} color="#0ea5e9" />
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
          <div className="dashboard-header-text">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 className="page-title" style={{ margin: 0 }}>Founder Workspace</h1>
              {isRefreshing && (
                <span style={{ fontSize: '0.72rem', color: '#21B8F2', background: 'rgba(33, 184, 242, 0.12)', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(33, 184, 242, 0.25)', fontWeight: 600 }}>
                  Syncing...
                </span>
              )}
            </div>
            <p>Real-time venture validation pipeline and market intelligence portfolio</p>
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

        <div className="dashboard-toolbar">
          <div className="dashboard-search-wrap">
            <FaSearch className="dashboard-search-icon" />
            <input 
              type="text" 
              className="dashboard-search-input"
              placeholder="Search concepts by title, industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="dashboard-filter-chips">
            {['all', 'online', 'offline', 'hybrid'].map((sector) => (
              <button
                key={sector}
                className={`filter-chip ${sectorFilter === sector ? 'active' : ''}`}
                onClick={() => setSectorFilter(sector)}
              >
                {sector.charAt(0).toUpperCase() + sector.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>Active Concepts <span className="section-count-badge">{activeIdeas.length}</span></h2>
          </div>
          {activeIdeas.length === 0 ? (
            <div className="empty-state">
              <FaLightbulb size={40} />
              <h3>{searchQuery || sectorFilter !== 'all' ? 'No matching concepts' : 'No active concepts'}</h3>
              <p>
                {searchQuery || sectorFilter !== 'all'
                  ? 'Try clearing your search query or switching sector filters.'
                  : 'Submit your first startup idea to get AI-powered venture intelligence!'}
              </p>
              {!searchQuery && sectorFilter === 'all' && (
                <button className="btn-primary" onClick={() => navigate('/new-idea')}>
                  <FaPlus /> Submit New Idea
                </button>
              )}
            </div>
          ) : (
            <div className="ideas-grid">
              {activeIdeas.map(idea => (
                <div key={idea.id} className="idea-card">
                  <div className="idea-card-header">
                    <h3 className="idea-title" title={idea.title}>
                      {idea.title}
                    </h3>
                  </div>
                  <div className="idea-meta-row">
                    <div className="idea-meta">
                      <span>{idea.industry}</span>
                      <span className="idea-meta-bullet">•</span>
                      <span className={`sector-badge sector-badge-${idea.sector?.toLowerCase()}`}>{idea.sector}</span>
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
            <div className="dashboard-section-header">
              <h2>Validated Intelligence <span className="section-count-badge">{completedIdeas.length}</span></h2>
            </div>
            {completedIdeas.length === 0 ? (
              <div className="empty-state">
                <p>No analyzed concepts match your search criteria.</p>
              </div>
            ) : (
              <div className="ideas-grid">
                {completedIdeas.map(idea => (
                  <div key={idea.id} className="idea-card">
                    <div className="idea-card-header">
                      <h3 className="idea-title" title={idea.title}>
                        {idea.title}
                      </h3>
                    </div>
                    <div className="idea-meta-row">
                      <div className="idea-meta">
                        <span>{idea.industry}</span>
                        <span className="idea-meta-bullet">•</span>
                        <span className={`sector-badge sector-badge-${idea.sector?.toLowerCase()}`}>{idea.sector}</span>
                      </div>
                      <span className="status-badge status-completed">
                        {idea.overall_score ? `V2V ${idea.overall_score}/100` : 'Validated'}
                      </span>
                    </div>
                    <p className="idea-desc">{idea.description?.substring(0, 120)}...</p>
                    <div className="idea-actions">
                      <Link to={`/analysis/${idea.id}`} className="btn-secondary">
                        View Dossier
                      </Link>
                      <button className="btn-danger" onClick={() => handleDelete(idea.id)} title="Delete">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
