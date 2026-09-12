import React, { useState, useEffect, useCallback } from 'react';
import {
  FaUsers, FaStore, FaGlobe, FaSync, FaMapMarkerAlt, FaSearch, FaPlus,
  FaRobot, FaCheckCircle, FaTrashAlt, FaExternalLinkAlt, FaInfoCircle,
  FaShieldAlt, FaBolt, FaExclamationTriangle, FaChartLine, FaLayerGroup,
  FaLightbulb, FaFilter, FaCompass, FaClock, FaPhoneAlt
} from 'react-icons/fa';
import CompetitorMap from '../Map/CompetitorMap';
import ManualCompetitorModal from './ManualCompetitorModal';
import { competitorAPI } from '../../services/api';
import { toast } from 'react-toastify';

const RADIUS_OPTIONS = [1, 5, 10, 25, 50];

const CompetitorTab = ({ data, idea }) => {
  const ideaId = idea?.id;

  // Active sub-view: 'map', 'matrix', 'strengths', 'strategy'
  const [activeSubTab, setActiveSubTab] = useState('map');

  // Ground Truth Startup Context (Read-Only from idea record)
  const businessType = (idea?.business_type || idea?.sector || 'online').toLowerCase();
  const locationQuery = idea?.location || idea?.specific_location || idea?.country || 'Hyderabad, India';
  const radiusKm = parseFloat(idea?.radius_km || 5.0);
  const [filterType, setFilterType] = useState('all'); // 'all', 'offline', 'online', 'hybrid'

  // Data State
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [competitors, setCompetitors] = useState([]);
  const [intelligence, setIntelligence] = useState(null);
  const [startupLocation, setStartupLocation] = useState(null);
  const [selectedCompetitorId, setSelectedCompetitorId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Load initial competitor data
  const loadCompetitorData = useCallback(async () => {
    if (!ideaId) return;
    setLoading(true);
    try {
      const res = await competitorAPI.getStartupCompetitors(ideaId);
      if (res.data && res.data.data) {
        const payload = res.data.data;
        setCompetitors(payload.competitors || []);
        setIntelligence(payload.intelligence || null);
        if (payload.status_message) {
          setStatusMessage(payload.status_message);
        }
        if (payload.search_config?.startup_location) {
          setStartupLocation(payload.search_config.startup_location);
        }
      }
    } catch (err) {
      console.error('Error loading competitor data:', err);
      toast.error('Failed to load competitive landscape.');
    } finally {
      setLoading(false);
    }
  }, [ideaId]);

  useEffect(() => {
    loadCompetitorData();
  }, [loadCompetitorData]);

  // Refresh Competitors using saved startup context
  const handleRefresh = async () => {
    if (!ideaId) return;
    setLoading(true);
    try {
      const res = await competitorAPI.discover({
        idea_id: ideaId,
        business_type: businessType,
        location: locationQuery,
        radius_km: radiusKm
      });

      if (res.data && res.data.data) {
        const payload = res.data.data;
        setCompetitors(payload.competitors || []);
        setIntelligence(payload.intelligence || null);
        if (payload.status_message) {
          setStatusMessage(payload.status_message);
        }
        if (payload.startup_location) {
          setStartupLocation(payload.startup_location);
        }
        toast.success(`Discovered ${payload.competitors?.length || 0} competitors!`);
      }
    } catch (err) {
      console.error('Discovery error:', err);
      toast.error(err.response?.data?.detail || 'Refresh failed.');
    } finally {
      setLoading(false);
    }
  };

  // Re-run AI Analysis on Selected
  const handleAnalyzeSelected = async () => {
    if (!ideaId) return;
    const selectedIds = competitors.filter(c => c.is_selected).map(c => c.id);
    if (selectedIds.length === 0) {
      return toast.warning('Please select at least 1 competitor for comparison.');
    }

    setAnalyzing(true);
    try {
      const res = await competitorAPI.analyze({
        idea_id: ideaId,
        selected_competitor_ids: selectedIds
      });

      if (res.data && res.data.data) {
        setIntelligence(res.data.data.intelligence);
        toast.success('AI competitive intelligence matrix updated!');
        setActiveSubTab('matrix');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      toast.error('Failed to update AI analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Toggle Competitor Selection
  const handleToggleSelect = async (compId, currentVal) => {
    const updatedVal = !currentVal;
    setCompetitors(prev => prev.map(c => c.id === compId ? { ...c, is_selected: updatedVal } : c));
    try {
      await competitorAPI.update(compId, { is_selected: updatedVal });
    } catch (err) {
      console.error('Update selection error:', err);
    }
  };

  // Delete Competitor
  const handleDeleteCompetitor = async (compId, compName) => {
    if (!window.confirm(`Remove '${compName}' from your competitor list?`)) return;
    setCompetitors(prev => prev.filter(c => c.id !== compId));
    try {
      await competitorAPI.delete(compId);
      toast.info(`Removed '${compName}'.`);
    } catch (err) {
      console.error('Delete competitor error:', err);
      toast.error('Failed to remove competitor.');
      loadCompetitorData();
    }
  };

  // Add Manual Competitor
  const handleAddManualCompetitor = async (formData) => {
    try {
      const res = await competitorAPI.addManual(formData);
      if (res.data && res.data.data) {
        setCompetitors(prev => [res.data.data, ...prev]);
        toast.success(`Added '${res.data.data.name}'!`);
      }
    } catch (err) {
      console.error('Add manual error:', err);
      toast.error('Failed to add manual competitor.');
    }
  };

  // Derived filtered competitors
  const physicalCompetitors = competitors.filter(c => (c.business_type || '').toLowerCase() === 'offline');
  const digitalCompetitors = competitors.filter(c => (c.business_type || '').toLowerCase() !== 'offline');

  const filteredCompetitors = competitors.filter(c => {
    if (filterType === 'all') return true;
    return (c.business_type || '').toLowerCase() === filterType;
  });

  const selectedCount = competitors.filter(c => c.is_selected).length;

  // Render a single competitor card
  const renderCompetitorCard = (comp) => {
    const isSelected = comp.is_selected !== false;
    const isDirect = (comp.competitor_type || 'direct').toLowerCase() === 'direct';
    const isOffline = (comp.business_type || '').toLowerCase() === 'offline';
    const isOsm = comp.source_type === 'openstreetmap' || (comp.data_sources || []).some(s => s.toLowerCase().includes('openstreetmap'));
    const isLiveWeb = comp.source_type === 'live_web' || (comp.data_sources || []).some(s => s.toLowerCase().includes('live web') || s.toLowerCase().includes('duckduckgo') || s.toLowerCase().includes('tavily') || s.toLowerCase().includes('brave'));
    const isYc = comp.source_type === 'yc_dataset' || (comp.data_sources || []).some(s => s.toLowerCase().includes('yc') || s.toLowerCase().includes('y combinator'));
    const isManual = comp.source_type === 'manual' || comp.evidence_status === 'user_provided' || comp.evidence_status === 'User-provided';

    return (
      <div
        key={comp.id}
        onClick={() => setSelectedCompetitorId(comp.id)}
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: selectedCompetitorId === comp.id ? '2px solid #0284c7' : '1px solid #E2E8F0',
          padding: '16px 18px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Bar: Checkbox, Name, Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleToggleSelect(comp.id, isSelected)}
              style={{ marginTop: '4px', cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                {comp.name}
              </h4>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.68rem',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  fontWeight: '700',
                  background: isOffline ? '#ecfdf5' : '#e0f2fe',
                  color: isOffline ? '#065f46' : '#0369a1',
                  textTransform: 'uppercase'
                }}>
                  {comp.business_type || (isOffline ? 'offline' : 'online')}
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  fontWeight: '700',
                  background: (comp.competitor_type || '').toLowerCase() === 'alternative' ? '#f0fdf4' : (isDirect ? '#fef2f2' : '#fffbeb'),
                  color: (comp.competitor_type || '').toLowerCase() === 'alternative' ? '#166534' : (isDirect ? '#991b1b' : '#92400e'),
                  textTransform: 'uppercase'
                }}>
                  {comp.competitor_type || 'Direct'}
                </span>

                {/* Accurate Source Attribution Badge */}
                {isOsm && (
                  <span style={{
                    fontSize: '0.68rem',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontWeight: '700',
                    background: '#f0fdf4',
                    color: '#15803d',
                    border: '1px solid #bbf7d0',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    📍 OpenStreetMap / Overpass
                  </span>
                )}
                {isLiveWeb && (
                  <span style={{
                    fontSize: '0.68rem',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontWeight: '700',
                    background: '#ecfeff',
                    color: '#0e7490',
                    border: '1px solid #a5f3fc',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    🌐 Live Web Search
                  </span>
                )}
                {isYc && (
                  <span style={{
                    fontSize: '0.68rem',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontWeight: '700',
                    background: '#fff7ed',
                    color: '#c2410c',
                    border: '1px solid #fed7aa',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    🚀 YC Dataset
                  </span>
                )}
                {isManual && (
                  <span style={{
                    fontSize: '0.68rem',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontWeight: '700',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    👤 Manual Entry
                  </span>
                )}
                {!isOsm && !isLiveWeb && !isYc && !isManual && (
                  <span style={{
                    fontSize: '0.68rem',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontWeight: '700',
                    background: '#faf5ff',
                    color: '#7e22ce',
                    border: '1px solid #e9d5ff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    🧠 LLM Inference
                  </span>
                )}

                {/* Distance: Only for physical competitors */}
                {isOffline && comp.distance_km != null && (
                  <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: '700' }}>
                    📍 {comp.distance_km} km away
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Relevance Score Pill */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0284c7' }}>
              {Math.round(comp.relevance_score || comp.similarity_score || 75)}%
            </div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>
              Relevance
            </div>
          </div>
        </div>

        {/* Description */}
        <p style={{ margin: '6px 0 10px', fontSize: '0.84rem', color: '#475569', lineHeight: '1.45' }}>
          {comp.description || (isOffline ? comp.location : 'Market competitor operating in this domain.')}
        </p>

        {/* Metadata Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
          background: '#F8FAFC',
          padding: '10px 12px',
          borderRadius: '10px',
          fontSize: '0.78rem',
          marginBottom: '10px'
        }}>
          <div>
            <span style={{ color: '#64748b' }}>Pricing: </span>
            <strong style={{ color: '#0f172a' }}>{comp.pricing_model || 'Not available'}</strong>
          </div>
          {isOffline && comp.phone && comp.phone !== 'Not available' && (
            <div>
              <span style={{ color: '#64748b' }}>Phone: </span>
              <strong style={{ color: '#0f172a' }}>{comp.phone}</strong>
            </div>
          )}
          {isOffline && comp.opening_hours && comp.opening_hours !== 'Not available' && (
            <div>
              <span style={{ color: '#64748b' }}>Hours: </span>
              <strong style={{ color: '#0f172a' }}>{comp.opening_hours}</strong>
            </div>
          )}
          <div>
            <span style={{ color: '#64748b' }}>Evidence: </span>
            <span style={{
              fontSize: '0.68rem',
              padding: '1px 6px',
              borderRadius: '4px',
              background: (comp.evidence_status === 'source_verified' || comp.evidence_status === 'Verified from source' || comp.evidence_status === 'web_verified') ? '#dcfce7' : '#fef3c7',
              color: (comp.evidence_status === 'source_verified' || comp.evidence_status === 'Verified from source' || comp.evidence_status === 'web_verified') ? '#166534' : '#92400e',
              fontWeight: '600'
            }}>
              {comp.evidence_status || (isOsm ? 'source_verified' : 'not_web_verified')}
            </span>
          </div>
        </div>

        {/* Bottom Links & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px' }}>
          <div>
            {comp.website_url ? (
              <a
                href={comp.website_url.startsWith('http') ? comp.website_url : `https://${comp.website_url}`}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#0284c7', textDecoration: 'none', fontWeight: '600' }}
              >
                <FaExternalLinkAlt style={{ fontSize: '10px' }} /> Official Website
              </a>
            ) : isOsm ? (
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '600' }}>Verified via OpenStreetMap</span>
            ) : (
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Website not available</span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCompetitor(comp.id, comp.name);
            }}
            title="Remove competitor"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.85rem',
              padding: '4px 6px'
            }}
          >
            <FaTrashAlt />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="competitor-intelligence-dashboard animate-fade-in" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      
      {/* SECTION 1: HEADER */}
      <div className="section-heading mb-md" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <FaUsers style={{ color: '#0284c7' }} />
        <span>AI Competitor Intelligence</span>
        <span style={{
          fontSize: '0.75rem',
          background: businessType === 'offline' ? '#ecfdf5' : (businessType === 'hybrid' ? '#fdf4ff' : '#e0f2fe'),
          color: businessType === 'offline' ? '#065f46' : (businessType === 'hybrid' ? '#86198f' : '#0369a1'),
          border: '1px solid currentColor',
          padding: '3px 10px',
          borderRadius: '999px',
          fontWeight: '700',
          textTransform: 'uppercase'
        }}>
          {businessType} Venture
        </span>
      </div>

      {/* SECTION 2: READ-ONLY STARTUP CONTEXT SUMMARY */}
      <div className="startup-context-summary-card mb-lg" style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '16px 20px',
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
              Startup
            </span>
            <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
              {idea?.title || 'Venture'}
            </strong>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
              Business Model
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.8rem',
              fontWeight: '700',
              padding: '3px 8px',
              borderRadius: '6px',
              background: businessType === 'offline' ? '#ecfdf5' : (businessType === 'hybrid' ? '#fdf4ff' : '#e0f2fe'),
              color: businessType === 'offline' ? '#065f46' : (businessType === 'hybrid' ? '#86198f' : '#0369a1'),
              textTransform: 'capitalize'
            }}>
              {businessType === 'offline' ? <FaStore /> : (businessType === 'hybrid' ? <FaSync /> : <FaGlobe />)}
              {businessType}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
              Industry
            </span>
            <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>
              {idea?.industry || 'Technology'}
            </strong>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
              Target Market
            </span>
            <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>
              {idea?.country || 'Global'}
            </strong>
          </div>

          {businessType !== 'online' && (
            <>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                  Location
                </span>
                <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FaMapMarkerAlt style={{ color: '#0284c7', fontSize: '0.85rem' }} />
                  {idea?.location || locationQuery}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                  Search Radius
                </span>
                <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>
                  {radiusKm} km
                </strong>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SECTION 3: COMPACT ACTION ROW */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleRefresh}
            disabled={loading}
            style={{
              padding: '9px 18px',
              borderRadius: '10px',
              background: '#FFFFFF',
              color: '#0284c7',
              border: '1px solid #0284c7',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <FaSync className={loading ? 'fa-spin' : ''} /> {loading ? 'Refreshing...' : 'Refresh Competitors'}
          </button>

          <button
            onClick={() => setModalOpen(true)}
            style={{
              padding: '9px 16px',
              borderRadius: '10px',
              background: '#FFFFFF',
              color: '#334155',
              border: '1px solid #CBD5E1',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FaPlus style={{ color: '#0284c7' }} /> Add Competitor Manually
          </button>
        </div>

        <button
          onClick={handleAnalyzeSelected}
          disabled={analyzing || selectedCount === 0}
          style={{
            padding: '9px 20px',
            borderRadius: '10px',
            background: selectedCount > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : '#CBD5E1',
            color: '#FFFFFF',
            border: 'none',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: (analyzing || selectedCount === 0) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: selectedCount > 0 ? '0 4px 14px rgba(16, 185, 129, 0.25)' : 'none'
          }}
        >
          <FaRobot /> {analyzing ? 'Synthesizing AI Insights...' : `Compare Selected (${selectedCount})`}
        </button>
      </div>

      {/* SECTION 4: STRICT SUMMARY METRICS STRIP */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Total Found</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>
            {businessType === 'offline' ? physicalCompetitors.length : (businessType === 'online' ? digitalCompetitors.length : competitors.length)}
          </div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '700', textTransform: 'uppercase' }}>Offline (Map)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#059669' }}>
            {businessType === 'online' ? 0 : physicalCompetitors.length}
          </div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase' }}>Online (Digital)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0284c7' }}>
            {businessType === 'offline' ? 0 : digitalCompetitors.length}
          </div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#86198f', fontWeight: '700', textTransform: 'uppercase' }}>Hybrid / Omni</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#86198f' }}>
            {businessType === 'hybrid' ? competitors.filter(c => (c.business_type || '').toLowerCase() === 'hybrid').length : 0}
          </div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase' }}>Selected for AI</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0284c7' }}>{selectedCount}</div>
        </div>
      </div>

      {/* SECTION 5: SUB-TAB NAVIGATION */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        borderBottom: '2px solid #E2E8F0',
        paddingBottom: '10px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        {[
          { key: 'map', label: businessType === 'online' ? '1. Discovered Competitors' : '1. Map & Discovered Competitors', icon: <FaCompass />, count: competitors.length },
          { key: 'matrix', label: '2. Side-by-Side Comparison Matrix', icon: <FaLayerGroup />, count: null },
          { key: 'strengths', label: '3. Evidence-Backed Strengths & Gaps', icon: <FaShieldAlt />, count: null },
          { key: 'strategy', label: '4. Actionable Strategic Playbook', icon: <FaLightbulb />, count: null }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key)}
            style={{
              padding: '9px 16px',
              borderRadius: '10px',
              background: activeSubTab === tab.key ? '#0f172a' : '#FFFFFF',
              color: activeSubTab === tab.key ? '#FFFFFF' : '#475569',
              border: activeSubTab === tab.key ? 'none' : '1px solid #CBD5E1',
              fontWeight: activeSubTab === tab.key ? '700' : '500',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span style={{
                background: activeSubTab === tab.key ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                padding: '1px 6px',
                borderRadius: '999px',
                fontSize: '0.72rem'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* SUB-TAB 1: COMPETITOR RESULTS & MAP                         */}
      {/* ============================================================ */}
      {activeSubTab === 'map' && (
        <div className="animate-fade-in">
          {/* Status Message Notification */}
          {statusMessage && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: statusMessage.toLowerCase().includes('temporarily') || statusMessage.toLowerCase().includes('no nearby') ? '#fffbeb' : '#f0fdf4',
              border: statusMessage.toLowerCase().includes('temporarily') || statusMessage.toLowerCase().includes('no nearby') ? '1px solid #fde68a' : '1px solid #bbf7d0',
              color: statusMessage.toLowerCase().includes('temporarily') || statusMessage.toLowerCase().includes('no nearby') ? '#b45309' : '#15803d',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <FaInfoCircle />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* 1. OFFLINE VENTURE: Show Map only when physical competitors exist */}
          {businessType === 'offline' && (
            <div>
              {physicalCompetitors.length === 0 ? (
                <div style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px dashed #CBD5E1',
                  color: '#64748B'
                }}>
                  <FaStore style={{ fontSize: '2.5rem', color: '#94a3b8', marginBottom: '12px' }} />
                  <p style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>
                    No nearby physical competitors found
                  </p>
                  <p style={{ margin: '0 0 16px', fontSize: '0.85rem', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
                    No verified physical {idea?.industry || 'businesses'} were found within {radiusKm} km of {idea?.location || locationQuery}. You can add competitors manually or refresh discovery.
                  </p>
                  <button
                    onClick={() => setModalOpen(true)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: '#0284c7',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    <FaPlus style={{ marginRight: '6px' }} /> Add Competitor Manually
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '20px',
                  alignItems: 'start'
                }}>
                  {/* Interactive Map */}
                  <div style={{ position: 'sticky', top: '80px', width: '100%', height: '440px', minHeight: '340px' }}>
                    <CompetitorMap
                      startupLocation={startupLocation}
                      radiusKm={radiusKm}
                      competitors={physicalCompetitors}
                      selectedCompetitorId={selectedCompetitorId}
                      onSelectCompetitor={(id) => setSelectedCompetitorId(id)}
                      onToggleSelect={handleToggleSelect}
                    />
                  </div>

                  {/* Physical Cards Feed */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', minWidth: 0 }}>
                    {physicalCompetitors.map(renderCompetitorCard)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. ONLINE VENTURE: Completely Hide Map; Show Digital Competitor Feed */}
          {businessType === 'online' && (
            <div>
              {digitalCompetitors.length === 0 ? (
                <div style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px dashed #CBD5E1',
                  color: '#64748B'
                }}>
                  <FaGlobe style={{ fontSize: '2.5rem', color: '#94a3b8', marginBottom: '12px' }} />
                  <p style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>
                    No digital competitors found
                  </p>
                  <p style={{ margin: '0 0 16px', fontSize: '0.85rem' }}>
                    Click <strong>Add Competitor Manually</strong> or refresh to discover digital rivals.
                  </p>
                  <button
                    onClick={() => setModalOpen(true)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: '#0284c7',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    <FaPlus style={{ marginRight: '6px' }} /> Add Competitor Manually
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '16px'
                }}>
                  {digitalCompetitors.map(renderCompetitorCard)}
                </div>
              )}
            </div>
          )}

          {/* 3. HYBRID VENTURE: Separate Physical & Digital Sections */}
          {businessType === 'hybrid' && (
            <div>
              {/* Category Filter Pills for Hybrid */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>Filter View:</span>
                {['all', 'offline', 'online', 'hybrid'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterType(f)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '20px',
                      border: filterType === f ? '1px solid #0284c7' : '1px solid #E2E8F0',
                      background: filterType === f ? '#e0f2fe' : '#FFFFFF',
                      color: filterType === f ? '#0369a1' : '#64748b',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {f} ({f === 'all' ? competitors.length : competitors.filter(c => (c.business_type || '').toLowerCase() === f).length})
                  </button>
                ))}
              </div>

              {/* Physical Competitors & Map (if any physical exist) */}
              {(filterType === 'all' || filterType === 'offline') && physicalCompetitors.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <h4 style={{ margin: '0 0 14px', fontSize: '1.05rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaStore /> Physical Competitors ({physicalCompetitors.length})
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '20px',
                    alignItems: 'start'
                  }}>
                    <div style={{ position: 'sticky', top: '80px', width: '100%', height: '380px', minHeight: '300px' }}>
                      <CompetitorMap
                        startupLocation={startupLocation}
                        radiusKm={radiusKm}
                        competitors={physicalCompetitors}
                        selectedCompetitorId={selectedCompetitorId}
                        onSelectCompetitor={(id) => setSelectedCompetitorId(id)}
                        onToggleSelect={handleToggleSelect}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', minWidth: 0 }}>
                      {physicalCompetitors.map(renderCompetitorCard)}
                    </div>
                  </div>
                </div>
              )}

              {/* Digital Competitors List */}
              {(filterType === 'all' || filterType === 'online' || filterType === 'hybrid') && digitalCompetitors.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 14px', fontSize: '1.05rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaGlobe /> Digital Competitors ({digitalCompetitors.length})
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '16px'
                  }}>
                    {digitalCompetitors.map(renderCompetitorCard)}
                  </div>
                </div>
              )}

              {competitors.length === 0 && (
                <div style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px dashed #CBD5E1',
                  color: '#64748B'
                }}>
                  <p style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>
                    No competitors discovered for this hybrid startup
                  </p>
                  <p style={{ margin: '0 0 16px', fontSize: '0.85rem' }}>
                    You can add competitors manually using the button above.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 2: SIDE-BY-SIDE COMPARISON MATRIX                    */}
      {/* ============================================================ */}
      {activeSubTab === 'matrix' && (
        <div className="animate-fade-in">
          {(!intelligence || !intelligence.comparison_matrix || intelligence.comparison_matrix.length === 0) ? (
            <div className="glass-card p-xl text-center" style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <FaLayerGroup style={{ fontSize: '2.5rem', color: '#0284c7', marginBottom: '12px' }} />
              <h4 style={{ margin: '0 0 8px', color: '#0f172a' }}>Generate AI Comparison Matrix</h4>
              <p style={{ color: '#64748b', maxWidth: '440px', margin: '0 auto 18px', fontSize: '0.88rem' }}>
                Select the competitors you want to benchmark against your venture and run AI comparison.
              </p>
              <button
                onClick={handleAnalyzeSelected}
                disabled={analyzing || selectedCount === 0}
                style={{
                  padding: '10px 22px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                {analyzing ? 'Synthesizing Matrix...' : `Compare ${selectedCount} Competitors`}
              </button>
            </div>
          ) : (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)'
            }}>
              {/* Horizontally scrollable container */}
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.84rem',
                  minWidth: '680px'
                }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontWeight: '700', color: '#334155', width: '22%' }}>
                        Dimension
                      </th>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontWeight: '800', color: '#0284c7', width: '26%', background: '#f0f9ff' }}>
                        📍 Your Startup ({idea?.title || 'V2V Venture'})
                      </th>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontWeight: '700', color: '#334155', width: '32%' }}>
                        Competitor Benchmarks
                      </th>
                      <th style={{ padding: '14px 18px', textAlign: 'left', fontWeight: '700', color: '#059669', width: '20%' }}>
                        Strategic Advantage
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {intelligence.comparison_matrix.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px 18px', fontWeight: '700', color: '#0f172a', verticalAlign: 'top' }}>
                          {row.dimension}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#0369a1', fontWeight: '600', verticalAlign: 'top', background: '#fafcff' }}>
                          {row.startup_value}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#475569', verticalAlign: 'top' }}>
                          {row.competitor_values && row.competitor_values.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {row.competitor_values.map((cv, i) => (
                                <div key={i}>
                                  <strong style={{ color: '#0f172a' }}>{cv.name}: </strong>
                                  <span>{cv.value}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span>Standard market offerings</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#047857', fontWeight: '600', verticalAlign: 'top' }}>
                          {row.advantage}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 3: EVIDENCE-BACKED STRENGTHS & VULNERABILITIES       */}
      {/* ============================================================ */}
      {activeSubTab === 'strengths' && (
        <div className="animate-fade-in">
          {/* 4 Quadrants: Advantages vs Gaps / Opportunities vs Risks */}
          {intelligence && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {/* Startup Advantages */}
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '16px', padding: '18px' }}>
                <h4 style={{ margin: '0 0 12px', color: '#065f46', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaBolt /> Startup Core Advantages
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(intelligence.startup_advantages || []).map((adv, i) => (
                    <div key={i} style={{ background: '#FFFFFF', padding: '12px', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                      <div style={{ fontWeight: '700', color: '#065f46', fontSize: '0.88rem', marginBottom: '4px' }}>
                        {adv.title}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: '1.4' }}>
                        {adv.explanation}
                      </div>
                      <div style={{ marginTop: '6px', fontSize: '0.72rem', color: '#059669', fontStyle: 'italic' }}>
                        Evidence: {adv.evidence}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Startup Gaps */}
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '16px', padding: '18px' }}>
                <h4 style={{ margin: '0 0 12px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaExclamationTriangle /> Startup Gaps & Friction Points
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(intelligence.startup_gaps || []).map((gap, i) => (
                    <div key={i} style={{ background: '#FFFFFF', padding: '12px', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                      <div style={{ fontWeight: '700', color: '#92400e', fontSize: '0.88rem', marginBottom: '4px' }}>
                        {gap.title}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: '1.4' }}>
                        {gap.explanation}
                      </div>
                      <div style={{ marginTop: '6px', fontSize: '0.72rem', color: '#b45309', fontStyle: 'italic' }}>
                        Source: {gap.evidence}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Individual Competitor Strengths & Weaknesses Cards */}
          <h4 style={{ margin: '0 0 14px', color: '#0f172a', fontWeight: '800' }}>Individual Competitor Breakdown</h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {competitors.map((c, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '18px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>{c.name}</h4>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: c.evidence_status === 'Verified from source' ? '#ecfdf5' : '#f8fafc',
                    color: c.evidence_status === 'Verified from source' ? '#065f46' : '#64748b',
                    fontWeight: '600'
                  }}>
                    {c.evidence_status || 'AI inference'}
                  </span>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#059669', marginBottom: '4px' }}>
                    Key Strengths
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                    {c.strengths || 'Established market footprint.'}
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#dc2626', marginBottom: '4px' }}>
                    Vulnerabilities & Weaknesses
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                    {c.weaknesses || 'Traditional operating workflow.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 4: STRATEGIC PLAYBOOK & RECOMMENDATIONS              */}
      {/* ============================================================ */}
      {activeSubTab === 'strategy' && (
        <div className="animate-fade-in">
          {(!intelligence || !intelligence.recommendations || intelligence.recommendations.length === 0) ? (
            <div className="glass-card p-xl text-center" style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <FaLightbulb style={{ fontSize: '2.5rem', color: '#f59e0b', marginBottom: '12px' }} />
              <h4 style={{ margin: '0 0 8px', color: '#0f172a' }}>Generate Strategic Playbook</h4>
              <p style={{ color: '#64748b', maxWidth: '440px', margin: '0 auto 18px', fontSize: '0.88rem' }}>
                Run AI analysis on your discovered competitors to extract high-leverage defensive moats and validation milestones.
              </p>
              <button
                onClick={handleAnalyzeSelected}
                disabled={analyzing || selectedCount === 0}
                style={{
                  padding: '10px 22px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                {analyzing ? 'Analyzing...' : 'Generate Playbook'}
              </button>
            </div>
          ) : (
            <div>
              {/* Recommendations Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {intelligence.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      padding: '20px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        background: rec.priority === 'High' ? '#fee2e2' : '#fef3c7',
                        color: rec.priority === 'High' ? '#991b1b' : '#92400e',
                        textTransform: 'uppercase'
                      }}>
                        {rec.priority} Priority Action
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: '#0f172a', fontWeight: '700' }}>
                      {rec.action}
                    </h4>

                    <p style={{ margin: '0 0 10px', fontSize: '0.86rem', color: '#475569', lineHeight: '1.5' }}>
                      <strong>Strategic Rationale: </strong>{rec.rationale}
                    </p>

                    <div style={{
                      background: '#F8FAFC',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      color: '#0369a1',
                      border: '1px solid #e0f2fe'
                    }}>
                      <strong>🎯 30-Day Validation Milestone: </strong>{rec.validation_milestone}
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Transparency & Limitations */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '16px 20px',
                fontSize: '0.82rem',
                color: '#64748b'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  <FaInfoCircle style={{ color: '#0284c7' }} /> Data Provenance & Methodology
                </div>
                <ul style={{ margin: '4px 0 0', paddingLeft: '18px', lineHeight: '1.5' }}>
                  {(intelligence.data_limitations || [
                    "Physical competitor coordinates and distances verified directly through OpenStreetMap / Overpass APIs.",
                    "Digital competitor benchmarks synthesized from verified venture registries and public domain records.",
                    "No unverified private revenue figures, false reviews, or proprietary financials are fabricated."
                  ]).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MANUAL COMPETITOR MODAL */}
      <ManualCompetitorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddCompetitor={handleAddManualCompetitor}
        ideaId={ideaId}
        defaultLocation={locationQuery}
      />
    </div>
  );
};

export default CompetitorTab;
