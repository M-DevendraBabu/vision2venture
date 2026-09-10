import React from 'react';
import { Radar } from 'react-chartjs-2';

const RadarChart = ({ data, options }) => {
  const defaultOptions = {
    scales: {
      r: {
        angleLines: { color: 'rgba(15, 23, 42, 0.08)' },
        grid: { color: 'rgba(15, 23, 42, 0.08)' },
        pointLabels: { color: '#475569', font: { size: 12, weight: '600' } },
        ticks: { display: false, min: 0, max: 100 }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#FFFFFF',
        titleColor: '#0F172A',
        bodyColor: '#334155',
        borderColor: '#E2E8F0',
        borderWidth: 1
      }
    }
  };

  return <Radar data={data} options={options || defaultOptions} />;
};

export default RadarChart;
