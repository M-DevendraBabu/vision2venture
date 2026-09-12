import React, { useState } from 'react';
import { FaTimes, FaPlus, FaStore, FaGlobe, FaSync, FaShieldAlt } from 'react-icons/fa';

const ManualCompetitorModal = ({ isOpen, onClose, onAddCompetitor, ideaId, defaultLocation = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    business_type: 'online',
    competitor_type: 'direct',
    website_url: '',
    location: defaultLocation,
    pricing_model: 'Freemium / Monthly',
    pricing_details: '',
    strengths: '',
    weaknesses: '',
    competitive_gap: ''
  });

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      await onAddCompetitor({
        ...formData,
        idea_id: ideaId,
        strengths: formData.strengths ? `• ${formData.strengths}` : '• Recognized brand awareness.',
        weaknesses: formData.weaknesses ? `• ${formData.weaknesses}` : '• Potential pricing or customization friction.'
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '540px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '24px',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaPlus />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>Add Competitor Manually</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Benchmark a custom competitor against your venture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              fontSize: '18px',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Competitor Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Competitor Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Swiggy Instamart, Notion, Local Fitness Hub"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '0.92rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Business Type Selector */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Operating Model
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { key: 'offline', label: 'Offline', icon: <FaStore /> },
                { key: 'online', label: 'Online', icon: <FaGlobe /> },
                { key: 'hybrid', label: 'Hybrid', icon: <FaSync /> }
              ].map(item => (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => setFormData({ ...formData, business_type: item.key })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: formData.business_type === item.key ? '#0284c7' : '#f8fafc',
                    color: formData.business_type === item.key ? '#ffffff' : '#475569',
                    border: formData.business_type === item.key ? '1px solid #0284c7' : '1px solid #E2E8F0'
                  }}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Website URL & Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Website / App URL
              </label>
              <input
                type="text"
                placeholder="https://competitor.com"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Location / City
              </label>
              <input
                type="text"
                placeholder="e.g. Hyderabad or Global"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Pricing Model & Details */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Pricing Model
            </label>
            <input
              type="text"
              placeholder="e.g. Freemium ($19/mo), Menu Pricing, Hourly Rate"
              value={formData.pricing_model}
              onChange={(e) => setFormData({ ...formData, pricing_model: e.target.value })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Known Strengths */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Observed Strength
            </label>
            <input
              type="text"
              placeholder="e.g. Strong brand name, prime physical location, high viral growth"
              value={formData.strengths}
              onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Known Weaknesses */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Observed Weakness / Vulnerability
            </label>
            <input
              type="text"
              placeholder="e.g. Slow customer support, rigid pricing, lack of mobile experience"
              value={formData.weaknesses}
              onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#475569',
                cursor: 'pointer',
                fontSize: '0.88rem',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 22px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
                color: '#FFFFFF',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '0.88rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
              }}
            >
              {submitting ? 'Adding...' : 'Add to Analysis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualCompetitorModal;
