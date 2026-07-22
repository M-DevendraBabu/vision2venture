import React from 'react';
import { Bar } from 'react-chartjs-2';

const BarChart = ({ data, options }) => {
  const defaultOptions = {
    responsive: true,
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#a0aec0' } },
      x: { grid: { display: false }, ticks: { color: '#a0aec0' } }
    },
    plugins: {
      legend: { labels: { color: '#ffffff' } }
    }
  };

  return <Bar data={data} options={options || defaultOptions} />;
};

export default BarChart;
