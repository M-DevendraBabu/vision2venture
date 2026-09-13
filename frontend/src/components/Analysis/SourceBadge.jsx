import React from 'react';
import { FaRobot, FaChartBar, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

/**
 * SourceBadge Component
 * Maps data sources to standardized colors and badges:
 * - Green (Real): Google Trends, World Bank, Google News, Wikipedia, OpenStreetMap, DuckDuckGo, YC
 * - Blue (AI): AI-grounded analysis
 * - Yellow (Benchmark): Industry / benchmark estimate
 * - Orange (Fallback): Template / offline fallback
 */

const getSourceCategory = (sourceStr) => {
  if (!sourceStr) return { type: 'fallback', label: 'Offline Fallback' };
  const s = String(sourceStr).toLowerCase();

  // Green: Real Grounded Data
  if (
    s.includes('google trends') ||
    s.includes('world bank') ||
    s.includes('google news') ||
    s.includes('wikipedia') ||
    s.includes('openstreetmap') ||
    s.includes('osm') ||
    s.includes('overpass') ||
    s.includes('duckduckgo') ||
    s.includes('yc') ||
    s.includes('real') ||
    s.includes('live')
  ) {
    return {
      type: 'real',
      color: '#059669',
      bgColor: 'rgba(16, 185, 129, 0.12)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      icon: <FaCheckCircle style={{ fontSize: '0.75rem', flexShrink: 0 }} />,
      tag: 'Real Data'
    };
  }

  // Blue: AI Analysis
  if (
    s.includes('ai') ||
    s.includes('gemini') ||
    s.includes('groq') ||
    s.includes('llama') ||
    s.includes('gpt') ||
    s.includes('llm') ||
    s.includes('nlp') ||
    s.includes('neural')
  ) {
    return {
      type: 'ai',
      color: '#0284c7',
      bgColor: 'rgba(14, 165, 233, 0.12)',
      borderColor: 'rgba(14, 165, 233, 0.3)',
      icon: <FaRobot style={{ fontSize: '0.75rem', flexShrink: 0 }} />,
      tag: 'AI-Grounded'
    };
  }

  // Yellow: Industry Benchmark / Kaggle Datasets
  if (
    s.includes('benchmark') ||
    s.includes('industry') ||
    s.includes('sector') ||
    s.includes('kaggle') ||
    s.includes('dataset') ||
    s.includes('survey')
  ) {
    return {
      type: 'benchmark',
      color: '#d97706',
      bgColor: 'rgba(245, 158, 11, 0.12)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      icon: <FaChartBar style={{ fontSize: '0.75rem', flexShrink: 0 }} />,
      tag: 'Benchmark'
    };
  }

  // Orange: Fallback / Template
  return {
    type: 'fallback',
    color: '#ea580c',
    bgColor: 'rgba(249, 115, 22, 0.12)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
    icon: <FaExclamationTriangle style={{ fontSize: '0.75rem', flexShrink: 0 }} />,
    tag: 'Fallback'
  };
};

const SingleBadge = ({ sourceText, customLabel, size = 'normal', style = {} }) => {
  const meta = getSourceCategory(sourceText);
  const displayText = customLabel || sourceText || meta.tag;
  const isSmall = size === 'small';

  return (
    <span
      className={'source-badge source-badge-' + meta.type}
      title={'Data Source: ' + (sourceText || meta.tag)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: isSmall ? '2px 8px' : '4px 10px',
        borderRadius: '9999px',
        fontSize: isSmall ? '0.7rem' : '0.78rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        lineHeight: 1.3,
        color: meta.color,
        background: meta.bgColor,
        border: '1px solid ' + meta.borderColor,
        verticalAlign: 'middle',
        whiteSpace: 'nowrap',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        ...style
      }}
    >
      {meta.icon}
      <span>{displayText}</span>
    </span>
  );
};

const SourceBadge = ({ source, label, size = 'normal', style = {} }) => {
  if (!source && !label) return null;

  if (Array.isArray(source)) {
    return (
      <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
        {source.map((src, idx) => (
          <SingleBadge key={idx} sourceText={src} size={size} style={style} />
        ))}
      </div>
    );
  }

  return <SingleBadge sourceText={source} customLabel={label} size={size} style={style} />;
};

export default SourceBadge;
