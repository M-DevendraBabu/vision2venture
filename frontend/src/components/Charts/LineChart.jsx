import React from 'react';
import { Line } from 'react-chartjs-2';

const LineChart = ({ data, options }) => {
  const defaultOptions = {
    responsive: true,
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#a0aec0' } },
      x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#a0aec0' } }
    },
    plugins: {
      legend: { labels: { color: '#ffffff' } }
    }
  };

  return <Line data={data} options={options || defaultOptions} />;
};

export default LineChart;
