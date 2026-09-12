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

  // Search & Filter Configuration State
  const [businessType, setBusinessType] = useState(
    (idea?.business_type || idea?.sector || 'online').toLowerCase()
  );
  const [locationQuery, setLocationQuery] = useState(
    idea?.specific_location || idea?.country || 'Hyderabad, India'
  );
  const [radiusKm, setRadiusKm] = useState(10);
  const [keywords, setKeywords] = useState('');
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
        if (payload.search_config?.business_type) {
          setBusinessType(payload.search_config.business_type);
        }
        if (payload.search_config?.radius_km) {
          setRadiusKm(payload.search_config.radius_km);
        }
        if (payload.search_config?.location) {
          setLocationQuery(payload.search_config.location);
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

  // Trigger On-Demand Discovery
  const handleDiscover = async () => {
    if (!ideaId) return;
    setLoading(true);
    try {
      const res = await competitorAPI.discover({
        idea_id: ideaId,
        business_type: businessType,
        location: locationQuery,
        radius_km: radiusKm,
        keywords: keywords
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
      toast.error(err.response?.data?.detail || 'Discovery failed. Check network and location.');
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
    // Optimistic UI update
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

  // Filtered Competitors List
  const filteredCompetitors = competitors.filter(c => {
    if (filterType === 'all') return true;
    return (c.business_type || '').toLowerCase() === filterType;
  });

  const selectedCount = competitors.filter(c => c.is_selected).length;

  return (
    <div className="competitor-intelligence-dashboard animate-fade-in" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      
      {/* SECTION 1: HEADER & STARTUP CONTEXT */}
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

      <div className="explanation-box mb-lg" style={{ borderLeft: '4px solid #0284c7', background: '#f8fafc', padding: '14px 18px', borderRadius: '10px' }}>
        <strong style={{ color: '#0f172a' }}>Real-World Competitive Landscape:</strong>{' '}
        Discover physical competitors via OpenStreetMap within your designated {radiusKm} km radius, digital alternatives across global tech registries, and AI evidence benchmarking without paywalls.
      </div>

      {/* SECTION 2: DISCOVERY & FILTER CONTROLS BAR */}
      <div className="discovery-control-panel glass-card p-md mb-xl" style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
          
          {/* Business Model Switcher */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
              OPERATING MODEL
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { key: 'offline', label: 'Offline', icon: <FaStore /> },
                { key: 'online', label: 'Online', icon: <FaGlobe /> },
                { key: 'hybrid', label: 'Hybrid', icon: <FaSync /> }
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setBusinessType(item.key)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 4px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: businessType === item.key ? '#0284c7' : '#F8FAFC',
                    color: businessType === item.key ? '#FFFFFF' : '#64748B',
                    border: businessType === item.key ? '1px solid #0284c7' : '1px solid #E2E8F0',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Input for Offline / Hybrid */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
              TARGET LOCATION / CITY
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="e.g. Hyderabad, India or San Francisco"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box'
                }}
              />
              <FaMapMarkerAlt style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#0284c7' }} />
            </div>
          </div>

          {/* Radius Selector for Offline / Hybrid */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
              SEARCH RADIUS (OFFLINE)
            </label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {RADIUS_OPTIONS.map(r => (
                <button
                  key={r}
                  onClick={() => setRadiusKm(r)}
                  style={{
                    flex: 1,
                    padding: '8px 2px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: radiusKm === r ? '#0f172a' : '#F8FAFC',
                    color: radiusKm === r ? '#FFFFFF' : '#475569',
                    border: radiusKm === r ? '1px solid #0f172a' : '1px solid #E2E8F0',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {r}km
                </button>
              ))}
            </div>
          </div>

          {/* Keywords / Custom Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
              CUSTOM CATEGORY / KEYWORDS
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. Quick commerce, Cafe, AI Tool"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.88rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Action Buttons Row */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleDiscover}
              disabled={loading}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
              }}
            >
              <FaSearch /> {loading ? 'Discovering Competitors...' : 'Discover Competitors'}
            </button>

            <button
              onClick={() => setModalOpen(true)}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                background: '#FFFFFF',
                color: '#334155',
                border: '1px solid #CBD5E1',
                fontWeight: '600',
                fontSize: '0.88rem',
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
              padding: '10px 22px',
              borderRadius: '10px',
              background: selectedCount > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : '#CBD5E1',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: (analyzing || selectedCount === 0) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: selectedCount > 0 ? '0 4px 14px rgba(16, 185, 129, 0.3)' : 'none'
            }}
          >
            <FaRobot /> {analyzing ? 'Synthesizing AI Insights...' : `Compare Selected (${selectedCount})`}
          </button>
        </div>
      </div>

      {/* DISCOVERY SUMMARY METRICS STRIP */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Total Found</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{competitors.length}</div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '700', textTransform: 'uppercase' }}>Offline (Map)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#059669' }}>
            {competitors.filter(c => c.business_type === 'offline').length}
          </div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase' }}>Online (Digital)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0284c7' }}>
            {competitors.filter(c => c.business_type === 'online').length}
          </div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#86198f', fontWeight: '700', textTransform: 'uppercase' }}>Hybrid / Omni</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#86198f' }}>
            {competitors.filter(c => c.business_type === 'hybrid').length}
          </div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase' }}>Selected for AI</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0284c7' }}>{selectedCount}</div>
        </div>
      </div>

      {/* SUB-TAB NAVIGATION */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        borderBottom: '2px solid #E2E8F0',
        paddingBottom: '10px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none'
      }}>
        {[
          { key: 'map', label: '1. Map & Discovered Competitors', icon: <FaCompass />, count: competitors.length },
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
      {/* SUB-TAB 1: MAP & DISCOVERED COMPETITORS                      */}
      {/* ============================================================ */}
      {activeSubTab === 'map' && (
        <div className="animate-fade-in">
          {/* Quick Category Filter Pills */}
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
                {f} ({f === 'all' ? competitors.length : competitors.filter(c => c.business_type === f).length})
              </button>
            ))}
          </div>

          {/* Desktop Dual-Pane (Map 55% / Cards 45%) & Mobile Single-Column */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: businessType === 'online' ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
            alignItems: 'start'
          }}>
            {/* Interactive Map (Rendered for Offline and Hybrid) */}
            {businessType !== 'online' && (
              <div style={{ position: 'sticky', top: '80px', width: '100%', height: '440px', minHeight: '340px' }}>
                <CompetitorMap
                  startupLocation={startupLocation}
                  radiusKm={radiusKm}
                  competitors={competitors}
                  selectedCompetitorId={selectedCompetitorId}
                  onSelectCompetitor={(id) => setSelectedCompetitorId(id)}
                  onToggleSelect={handleToggleSelect}
                />
              </div>
            )}

            {/* Competitor Cards Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', minWidth: 0 }}>
              {statusMessage && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: statusMessage.toLowerCase().includes('temporarily') ? '#fffbeb' : '#f0fdf4',
                  border: statusMessage.toLowerCase().includes('temporarily') ? '1px solid #fde68a' : '1px solid #bbf7d0',
                  color: statusMessage.toLowerCase().includes('temporarily') ? '#b45309' : '#15803d',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaInfoCircle />
                  <span>{statusMessage}</span>
                </div>
              )}

              {filteredCompetitors.length === 0 ? (
                <div style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px dashed #CBD5E1',
                  color: '#64748B'
                }}>
                  <p style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: '600' }}>No competitors found in this category.</p>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>
                    Try expanding your search radius, adjusting category keywords, or click <strong>Add Competitor Manually</strong> above.
                  </p>
                </div>
              ) : (
                filteredCompetitors.map((comp) => {
                  const isSelected = comp.is_selected !== false;
                  const isDirect = (comp.competitor_type || 'direct').toLowerCase() === 'direct';

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
                                background: comp.business_type === 'offline' ? '#ecfdf5' : '#e0f2fe',
                                color: comp.business_type === 'offline' ? '#065f46' : '#0369a1',
                                textTransform: 'uppercase'
                              }}>
                                {comp.business_type}
                              </span>
                              <span style={{
                                fontSize: '0.68rem',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                fontWeight: '700',
                                background: isDirect ? '#fef2f2' : '#fffbeb',
                                color: isDirect ? '#991b1b' : '#92400e',
                                textTransform: 'uppercase'
                              }}>
                                {comp.competitor_type || 'Direct'}
                              </span>
                              {comp.distance_km && (
                                <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: '700' }}>
                                  📍 {comp.distance_km} km
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

                      {/* Description & Location */}
                      <p style={{ margin: '6px 0 10px', fontSize: '0.84rem', color: '#475569', lineHeight: '1.45' }}>
                        {comp.description || comp.location || 'Local market competitor operating in this domain.'}
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
                          <strong style={{ color: '#0f172a' }}>{comp.pricing_model || 'In-store / Menu'}</strong>
                        </div>
                        {comp.phone && comp.phone !== 'Not available' && (
                          <div>
                            <span style={{ color: '#64748b' }}>Phone: </span>
                            <strong style={{ color: '#0f172a' }}>{comp.phone}</strong>
                          </div>
                        )}
                        {comp.opening_hours && comp.opening_hours !== 'Not available' && (
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
                            background: comp.evidence_status === 'Verified from source' ? '#dcfce7' : '#fef3c7',
                            color: comp.evidence_status === 'Verified from source' ? '#166534' : '#92400e',
                            fontWeight: '600'
                          }}>
                            {comp.evidence_status || 'AI inference'}
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
                              <FaExternalLinkAlt style={{ fontSize: '10px' }} /> Website
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Verified via OpenStreetMap</span>
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
                })
              )}
            </div>
          </div>
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
