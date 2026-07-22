import React from 'react';
import { Doughnut } from 'react-chartjs-2';

const DoughnutChart = ({ data, options }) => {
  const defaultOptions = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: { position: 'right', labels: { color: '#ffffff' } }
    }
  };

  return <Doughnut data={data} options={options || defaultOptions} />;
};

export default DoughnutChart;
