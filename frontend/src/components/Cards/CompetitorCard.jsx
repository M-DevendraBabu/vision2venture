import React from 'react';
import './Cards.css';

const CompetitorCard = ({ name, similarity, strengths, weaknesses }) => {
  return (
    <div className="competitor-card glass-card">
      <div className="comp-header">
        <h3>{name}</h3>
        <div className="similarity-badge">
          {similarity}% Match
        </div>
      </div>
      <div className="comp-progress">
        <div className="progress-fill" style={{ width: `${similarity}%` }}></div>
      </div>
      <div className="comp-details">
        <div className="comp-strengths">
          <h4>Strengths</h4>
          <ul>
            {strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        <div className="comp-weaknesses">
          <h4>Weaknesses</h4>
          <ul>
            {weaknesses.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CompetitorCard;
