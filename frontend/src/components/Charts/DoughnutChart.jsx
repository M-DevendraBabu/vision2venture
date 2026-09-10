import React from 'react';
import { Doughnut } from 'react-chartjs-2';

const DoughnutChart = ({ data, options }) => {
  const defaultOptions = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: { 
        position: 'right', 
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

  return <Doughnut data={data} options={options || defaultOptions} />;
};

export default DoughnutChart;
