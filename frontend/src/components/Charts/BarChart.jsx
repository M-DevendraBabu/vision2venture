import React from 'react';
import { Bar } from 'react-chartjs-2';

const BarChart = ({ data, options }) => {
  const defaultOptions = {
    responsive: true,
    scales: {
      y: { 
        grid: { color: 'rgba(15, 23, 42, 0.06)' }, 
        ticks: { color: '#64748B' } 
      },
      x: { 
        grid: { display: false }, 
        ticks: { color: '#64748B' } 
      }
    },
    plugins: {
      legend: { 
        labels: { color: '#0F172A', font: { weight: '600' } } 
      },
      tooltip: {
        backgroundColor: '#FFFFFF',
        titleColor: '#0F172A',
        bodyColor: '#334155',
        borderColor: '#E2E8F0',
        borderWidth: 1
      }
    }
  };

  return <Bar data={data} options={options || defaultOptions} />;
};

export default BarChart;
