import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/Cards/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { startupAPI, analysisAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { 
  FaLightbulb, 
  FaCheckCircle, 
  FaClock, 
  FaChartLine, 
  FaPlus, 
  FaTrash, 
  FaRocket, 
  FaSearch, 
  FaBrain 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../styles/Dashboard.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

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
      setIdeas(ideas.map(i => i.id === id ? { ...i, analysis_status: 'running' } : i));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start analysis');
    }
  };

  // Metrics derived strictly from existing data
  const totalCount = ideas.length;
  const completedCount = ideas.filter(i => i.analysis_status === 'completed').length;
  const pendingCount = ideas.filter(i => i.analysis_status !== 'completed').length;
  const scoredIdeas = ideas.filter(i => i.overall_score && !isNaN(Number(i.overall_score)));
  const avgScore = scoredIdeas.length > 0 
    ? (scoredIdeas.reduce((sum, i) => sum + Number(i.overall_score), 0) / scoredIdeas.length).toFixed(1)
    : null;

  // Score tiers derived strictly from existing real scores
  const highPotentialIdeas = useMemo(() => scoredIdeas.filter(i => Number(i.overall_score) >= 70), [scoredIdeas]);
  const needsValidationIdeas = useMemo(() => scoredIdeas.filter(i => Number(i.overall_score) >= 50 && Number(i.overall_score) < 70), [scoredIdeas]);
  const atRiskIdeas = useMemo(() => scoredIdeas.filter(i => Number(i.overall_score) < 50), [scoredIdeas]);

  const stats = [
    { 
      icon: <FaLightbulb />, 
      label: 'TOTAL IDEAS', 
      value: String(totalCount), 
      description: 'All submitted ventures',
      accent: 'blue' 
    },
    { 
      icon: <FaCheckCircle />, 
      label: 'ANALYZED', 
      value: String(completedCount), 
      description: 'Venture dossiers ready',
      accent: 'green' 
    },
    { 
      icon: <FaClock />, 
      label: 'PENDING', 
      value: String(pendingCount), 
      description: 'Awaiting validation',
      accent: 'amber' 
    },
    { 
      icon: <FaChartLine />, 
      label: 'AVERAGE V2V SCORE', 
      value: avgScore ? `${avgScore}` : '—', 
      description: scoredIdeas.length > 0 
        ? `Across ${scoredIdeas.length} evaluated concept${scoredIdeas.length > 1 ? 's' : ''}` 
        : 'No evaluated scores yet',
      accent: 'cyan' 
    }
  ];

  const filteredAndSortedIdeas = useMemo(() => {
    return ideas.filter(idea => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        idea.title?.toLowerCase().includes(query) ||
        idea.description?.toLowerCase().includes(query) ||
        idea.industry?.toLowerCase().includes(query) ||
        idea.sector?.toLowerCase().includes(query);
      const matchesSector = sectorFilter === 'all' || 
        idea.sector?.toLowerCase() === sectorFilter.toLowerCase();
      const matchesStatus = statusFilter === 'all' || 
        idea.analysis_status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesSector && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'score-desc') {
        return (Number(b.overall_score) || 0) - (Number(a.overall_score) || 0);
      }
      if (sortBy === 'score-asc') {
        return (Number(a.overall_score) || 0) - (Number(b.overall_score) || 0);
      }
      if (sortBy === 'title-asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return (b.id || 0) - (a.id || 0);
    });
  }, [ideas, searchQuery, sectorFilter, statusFilter, sortBy]);

  const activeIdeas = filteredAndSortedIdeas.filter(i => i.analysis_status !== 'completed');
  const completedIdeas = filteredAndSortedIdeas.filter(i => i.analysis_status === 'completed');

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
          <p style={{ color: '#64748B', fontSize: '0.88rem', fontWeight: 500 }}>Loading venture intelligence portfolio...</p>
        </div>
      </div>
    );
  }

  if (fetchError && ideas.length === 0) {
    return (
      <div className="page-layout">
        <Sidebar />
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px', textAlign: 'center' }}>
          <FaLightbulb size={48} color="#0EA5E9" />
          <h2 style={{ color: '#0F172A', margin: 0 }}>Connection Delayed</h2>
          <p style={{ color: '#475569', maxWidth: '420px', margin: 0 }}>
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
        {/* 1. DASHBOARD HEADER */}
        <div className="dashboard-header">
          <div className="dashboard-header-text">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 className="page-title" style={{ margin: 0 }}>Dashboard</h1>
              {isRefreshing && (
                <span className="sync-badge">
                  Syncing...
                </span>
              )}
            </div>
            <p className="dashboard-subtitle">
              {user?.name ? `Welcome back, ${user.name}. ` : ''}Monitor and evaluate your startup portfolio.
            </p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/new-idea')}>
            <FaPlus /> New Idea
          </button>
        </div>

        {/* 2. EXECUTIVE KPI AREA */}
        <div className="stats-grid">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* 3. SCORE / INSIGHT FEATURE AREA */}
        {scoredIdeas.length > 0 && (
          <div className="dashboard-intelligence-card">
            <div className="intel-left-panel">
              <div className="intel-tag">
                <FaBrain className="intel-tag-icon" /> V2V Portfolio Intelligence
              </div>
              <div className="intel-score-wrap">
                <div className="intel-gauge-circle">
                  <svg className="intel-gauge-svg" viewBox="0 0 100 100">
                    <circle
                      className="intel-gauge-bg"
                      cx="50"
                      cy="50"
                      r="40"
                    />
                    <circle
                      className="intel-gauge-fill"
                      cx="50"
                      cy="50"
                      r="40"
                      style={{
                        strokeDasharray: `${2 * Math.PI * 40}`,
                        strokeDashoffset: `${2 * Math.PI * 40 * (1 - (Math.min(Number(avgScore) || 0, 100)) / 100)}`
                      }}
                    />
                  </svg>
                  <div className="intel-gauge-inner">
                    <span className="intel-gauge-num">{avgScore}</span>
                    <span className="intel-gauge-max">/100</span>
                  </div>
                </div>
                <div className="intel-text-wrap">
                  <h3 className="intel-title">Average Venture Score</h3>
                  <p className="intel-desc">
                    Synthesized from {scoredIdeas.length} evaluated venture concept{scoredIdeas.length > 1 ? 's' : ''}.
                  </p>
                  <div className="intel-status-pill">
                    {Number(avgScore) >= 70 
                      ? '🟢 High Overall Viability' 
                      : Number(avgScore) >= 50 
                        ? '🟡 Balanced Growth Potential' 
                        : '🔴 Early Phase / Needs Validation'}
                  </div>
                </div>
              </div>
            </div>

            <div className="intel-right-panel">
              <h4 className="intel-tiers-title">Venture Health Distribution</h4>
              <div className="intel-tier-list">
                <div className="intel-tier-item">
                  <div className="intel-tier-header">
                    <span className="intel-tier-label">
                      <span className="tier-dot tier-dot-green"></span> High Potential (70–100)
                    </span>
                    <span className="intel-tier-count">
                      {highPotentialIdeas.length} {highPotentialIdeas.length === 1 ? 'venture' : 'ventures'} ({scoredIdeas.length ? Math.round((highPotentialIdeas.length / scoredIdeas.length) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="intel-tier-bar">
                    <div
                      className="intel-tier-bar-fill tier-fill-green"
                      style={{ width: `${scoredIdeas.length ? (highPotentialIdeas.length / scoredIdeas.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="intel-tier-item">
                  <div className="intel-tier-header">
                    <span className="intel-tier-label">
                      <span className="tier-dot tier-dot-amber"></span> Needs Validation (50–69)
                    </span>
                    <span className="intel-tier-count">
                      {needsValidationIdeas.length} {needsValidationIdeas.length === 1 ? 'venture' : 'ventures'} ({scoredIdeas.length ? Math.round((needsValidationIdeas.length / scoredIdeas.length) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="intel-tier-bar">
                    <div
                      className="intel-tier-bar-fill tier-fill-amber"
                      style={{ width: `${scoredIdeas.length ? (needsValidationIdeas.length / scoredIdeas.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="intel-tier-item">
                  <div className="intel-tier-header">
                    <span className="intel-tier-label">
                      <span className="tier-dot tier-dot-rose"></span> At Risk (&lt; 50)
                    </span>
                    <span className="intel-tier-count">
                      {atRiskIdeas.length} {atRiskIdeas.length === 1 ? 'venture' : 'ventures'} ({scoredIdeas.length ? Math.round((atRiskIdeas.length / scoredIdeas.length) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="intel-tier-bar">
                    <div
                      className="intel-tier-bar-fill tier-fill-rose"
                      style={{ width: `${scoredIdeas.length ? (atRiskIdeas.length / scoredIdeas.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. FILTER / SEARCH CONTROLS */}
        <div className="dashboard-toolbar">
          <div className="dashboard-search-wrap">
            <FaSearch className="dashboard-search-icon" />
            <input 
              type="text" 
              className="dashboard-search-input"
              placeholder="Search concepts by title, industry, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="search-clear-btn" 
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="dashboard-filter-controls">
            <div className="filter-select-wrap">
              <span className="filter-select-label">Business Type</span>
              <select 
                className="dashboard-select"
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div className="filter-select-wrap">
              <span className="filter-select-label">Status</span>
              <select 
                className="dashboard-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="completed">Validated</option>
                <option value="pending">Pending</option>
                <option value="running">In Progress</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="filter-select-wrap">
              <span className="filter-select-label">Sort</span>
              <select 
                className="dashboard-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="score-desc">Highest Score</option>
                <option value="score-asc">Lowest Score</option>
                <option value="title-asc">Title (A–Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* EMPTY STATE (No ideas submitted yet) */}
        {totalCount === 0 ? (
          <div className="dashboard-empty-card">
            <div className="empty-icon-wrap">
              <FaLightbulb />
            </div>
            <h3>No startup ideas yet</h3>
            <p>Start your first analysis to evaluate your venture.</p>
            <button className="btn-primary" onClick={() => navigate('/new-idea')}>
              <FaPlus /> Analyze New Idea
            </button>
          </div>
        ) : filteredAndSortedIdeas.length === 0 ? (
          /* EMPTY STATE (Filters matched zero) */
          <div className="dashboard-empty-card">
            <div className="empty-icon-wrap">
              <FaSearch />
            </div>
            <h3>No matching concepts found</h3>
            <p>Try adjusting your search query or reset your filters.</p>
            <button 
              className="btn-secondary" 
              onClick={() => {
                setSearchQuery('');
                setSectorFilter('all');
                setStatusFilter('all');
                setSortBy('newest');
              }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            {/* 5. ACTIVE / IN-PROGRESS CONCEPTS */}
            {activeIdeas.length > 0 && (
              <div className="dashboard-section">
                <div className="dashboard-section-header">
                  <h2>Active Concepts <span className="section-count-badge">{activeIdeas.length}</span></h2>
                </div>
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
                          <span className="idea-industry-text" title={idea.industry}>{idea.industry}</span>
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
                        <button className="btn-danger" onClick={() => handleDelete(idea.id)} title="Delete Venture">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. RECENT ANALYSES / VALIDATED INTELLIGENCE */}
            {completedIdeas.length > 0 && (
              <div className="dashboard-section">
                <div className="dashboard-section-header">
                  <h2>Recent Analyses <span className="section-count-badge">{completedIdeas.length}</span></h2>
                </div>
                <div className="ideas-grid">
                  {completedIdeas.map(idea => {
                    const score = Number(idea.overall_score);
                    const hasScore = !isNaN(score) && score > 0;
                    return (
                      <div key={idea.id} className="idea-card idea-card-completed">
                        <div className="idea-card-header">
                          <h3 className="idea-title" title={idea.title}>
                            {idea.title}
                          </h3>
                          {hasScore && (
                            <div className={`idea-score-callout ${score >= 70 ? 'callout-high' : score >= 50 ? 'callout-mid' : 'callout-low'}`}>
                              <span className="score-callout-val">{score}</span>
                              <span className="score-callout-lbl">V2V SCORE</span>
                            </div>
                          )}
                        </div>
                        <div className="idea-meta-row">
                          <div className="idea-meta">
                            <span className="idea-industry-text" title={idea.industry}>{idea.industry}</span>
                            <span className="idea-meta-bullet">•</span>
                            <span className={`sector-badge sector-badge-${idea.sector?.toLowerCase()}`}>{idea.sector}</span>
                          </div>
                          <span className="status-badge status-completed">
                            Validated
                          </span>
                        </div>
                        <p className="idea-desc">{idea.description?.substring(0, 120)}...</p>
                        <div className="idea-actions">
                          <Link to={`/analysis/${idea.id}`} className="btn-dossier">
                            View Dossier →
                          </Link>
                          <button className="btn-danger" onClick={() => handleDelete(idea.id)} title="Delete Venture">
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
