import React from 'react';
import { Radar } from 'react-chartjs-2';

const RadarChart = ({ data, options }) => {
  const defaultOptions = {
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { color: '#a0aec0', font: { size: 12 } },
        ticks: { display: false, min: 0, max: 100 }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return <Radar data={data} options={options || defaultOptions} />;
};

export default RadarChart;
