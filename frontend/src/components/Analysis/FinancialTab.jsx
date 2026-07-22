import React from 'react';
import DoughnutChart from '../Charts/DoughnutChart';
import BarChart from '../Charts/BarChart';
import { FaMoneyBillWave, FaChartPie, FaChartLine, FaInfoCircle, FaStore, FaLaptopCode } from 'react-icons/fa';

const FinancialTab = ({ data, idea }) => {
  if (!data) return <div className="text-center p-8 animate-fade-in">Loading financial data...</div>;

  const isOnline = (idea?.sector || 'online') !== 'offline';
  const isOffline = (idea?.sector || 'online') !== 'online';

  const getValue = (val) => {
    if (val && typeof val === 'object') return val.value || 0;
    return val || 0;
  };

  const getExplanation = (val) => {
    if (val && typeof val === 'object' && val.detailed_explanation) {
      return val.detailed_explanation;
    }
    return null;
  };

  // Cost breakdown chart — adapt to sector
  const costLabels = isOnline 
    ? ['Development', 'Cloud/Hosting', 'Marketing', 'API/Services', 'Operations']
    : ['Rent/Lease', 'Staff Salaries', 'Raw Materials', 'Marketing', 'Utilities'];

  const costValues = isOnline 
    ? [getValue(data.development_cost), getValue(data.monthly_operating_cost), getValue(data.marketing_cost), getValue(data.customer_acquisition_cost), getValue(data.monthly_operating_cost) * 0.2 || 0]
    : [getValue(data.rent_cost), getValue(data.staff_cost), getValue(data.raw_material_cost), getValue(data.marketing_cost), getValue(data.utility_cost)];

  const costData = {
    labels: costLabels,
    datasets: [{
      data: costValues,
      backgroundColor: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const totalCost = costValues.reduce((a, b) => a + b, 0);
  const revenueEstimate = isOnline ? getValue(data.monthly_recurring_revenue) * 12 : getValue(data.monthly_revenue) * 12;
  const profit = revenueEstimate - totalCost;

  const revenueVsCostData = {
    labels: ['Total Costs (Year 1)', 'Revenue (Year 1)', 'Projected Profit'],
    datasets: [{
      label: 'Amount ($)',
      data: [totalCost, revenueEstimate, profit],
      backgroundColor: [profit < 0 ? '#ef4444' : '#f59e0b', '#10b981', profit >= 0 ? '#3b82f6' : '#ef4444'],
      borderRadius: 8
    }]
  };

  const formatCurrency = (val) => {
    const num = getValue(val);
    if (!num && num !== 0) return 'N/A';
    return '$' + Number(num).toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  return (
    <div className="financial-tab animate-fade-in">
      <div className="section-heading mb-md"><FaMoneyBillWave /> Financial Projections</div>
      
      {/* AI Explanation */}
      <div className="explanation-box mb-xl">
        <strong>AI Financial Assessment:</strong> {data.detailed_explanation || 
          `Based on the ${idea?.sector || 'online'} business model with a ${idea?.pricing_model || 'subscription'} pricing strategy, we've calculated the projected financial trajectory. ${isOnline ? 'Software margins are typically 70-85%, but customer acquisition cost (CAC) will dictate initial burn rate.' : 'Physical businesses require higher upfront capital. Cash flow management in the first 6 months is critical.'}`
        }
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid mb-2xl">
        <div className="metric-card glass-card-success">
          <div className="metric-label">Projected ROI</div>
          <div className="metric-value text-success">{data.roi ? `${Math.round(getValue(data.roi))}%` : 'N/A'}</div>
          <div className="text-secondary text-sm mt-xs">{getExplanation(data.roi) || 'Return on investment'}</div>
        </div>
        <div className="metric-card glass-card-accent">
          <div className="metric-label">Profit Margins</div>
          <div className="metric-value text-primary">{data.profit_margins ? `${Math.round(getValue(data.profit_margins))}%` : 'N/A'}</div>
          <div className="text-secondary text-sm mt-xs">{getExplanation(data.profit_margins) || 'Net profit percentage'}</div>
        </div>
        <div className="metric-card glass-card-accent">
          <div className="metric-label">Monthly Operating Cost</div>
          <div className="metric-value text-warning">{formatCurrency(data.monthly_operating_cost)}</div>
          <div className="text-secondary text-sm mt-xs">{getExplanation(data.monthly_operating_cost) || 'Recurring monthly expenses'}</div>
        </div>
        <div className="metric-card glass-card-accent">
          <div className="metric-label">Development/Setup Cost</div>
          <div className="metric-value text-info">{formatCurrency(data.development_cost)}</div>
          <div className="text-secondary text-sm mt-xs">{getExplanation(data.development_cost) || 'One-time initial investment'}</div>
        </div>
      </div>

      {/* Sector-Specific Metrics */}
      {isOnline && (
        <div className="mb-2xl">
          <h3 className="section-heading mb-lg"><FaLaptopCode /> Online/SaaS Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-card glass-card-accent">
              <div className="metric-label">Monthly Recurring Revenue</div>
              <div className="metric-value text-success">{formatCurrency(data.monthly_recurring_revenue)}</div>
              {getExplanation(data.monthly_recurring_revenue) && <div className="text-secondary text-sm mt-xs">{getExplanation(data.monthly_recurring_revenue)}</div>}
            </div>
            <div className="metric-card glass-card-accent">
              <div className="metric-label">Customer Acquisition Cost</div>
              <div className="metric-value text-warning">{formatCurrency(data.customer_acquisition_cost)}</div>
              {getExplanation(data.customer_acquisition_cost) && <div className="text-secondary text-sm mt-xs">{getExplanation(data.customer_acquisition_cost)}</div>}
            </div>
            <div className="metric-card glass-card-accent">
              <div className="metric-label">Customer Lifetime Value</div>
              <div className="metric-value text-info">{formatCurrency(data.lifetime_value)}</div>
              {getExplanation(data.lifetime_value) && <div className="text-secondary text-sm mt-xs">{getExplanation(data.lifetime_value)}</div>}
            </div>
            <div className="metric-card glass-card-accent">
              <div className="metric-label">Churn Rate</div>
              <div className="metric-value text-danger">{data.churn_rate ? `${getValue(data.churn_rate)}%` : 'N/A'}</div>
              {getExplanation(data.churn_rate) && <div className="text-secondary text-sm mt-xs">{getExplanation(data.churn_rate)}</div>}
            </div>
            <div className="metric-card glass-card-accent">
              <div className="metric-label">Subscription Revenue</div>
              <div className="metric-value text-success">{formatCurrency(data.subscription_revenue)}</div>
              {getExplanation(data.subscription_revenue) && <div className="text-secondary text-sm mt-xs">{getExplanation(data.subscription_revenue)}</div>}
            </div>
            <div className="metric-card glass-card-accent">
              <div className="metric-label">Freemium Conversion</div>
              <div className="metric-value text-primary">{data.freemium_conversion ? `${getValue(data.freemium_conversion)}%` : 'N/A'}</div>
              {getExplanation(data.freemium_conversion) && <div className="text-secondary text-sm mt-xs">{getExplanation(data.freemium_conversion)}</div>}
            </div>
          </div>
        </div>
      )}

      {isOffline && (
        <div className="mb-2xl">
          <h3 className="section-heading mb-lg"><FaStore /> Physical Business Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-card glass-card-accent">
              <div className="metric-label">Daily Customers (Est.)</div>
              <div className="metric-value text-success">{getValue(data.daily_customers_estimate) || 'N/A'}</div>
              {getExplanation(data.daily_customers_estimate) && <div className="text-secondary text-sm mt-xs">{getExplanation(data.daily_customers_estimate)}</div>}
            </div>
            <div className="metric-card glass-card-accent">
              <div className="metric-label">Average Order Value</div>
              <div className="metric-value text-primary">{formatCurrency(data.average_order_value)}</div>
              {getExplanation(data.average_order_value) && <div className="text-secondary text-sm mt-xs">{getExplanation(data.average_order_value)}</div>}
            </div>
            <div className="metric-card glass-card-accent">
              <div className="metric-label">Monthly Revenue</div>
              <div className="metric-value text-success">{formatCurrency(data.monthly_revenue)}</div>
              {getExplanation(data.monthly_revenue) && <div className="text-secondary text-sm mt-xs">{getExplanation(data.monthly_revenue)}</div>}
            </div>
            <div className="metric-card glass-card-accent">
              <div className="metric-label">Rent/Lease Cost</div>
              <div className="metric-value text-warning">{formatCurrency(data.rent_cost)}</div>
              {getExplanation(data.rent_cost) && <div className="text-secondary text-sm mt-xs">{getExplanation(data.rent_cost)}</div>}
            </div>
            <div className="metric-card glass-card-accent">
              <div className="metric-label">Staff Cost (Monthly)</div>
              <div className="metric-value text-warning">{formatCurrency(data.staff_cost)}</div>
              {getExplanation(data.staff_cost) && <div className="text-secondary text-sm mt-xs">{getExplanation(data.staff_cost)}</div>}
            </div>
            <div className="metric-card glass-card-accent">
              <div className="metric-label">Raw Material Cost</div>
              <div className="metric-value text-danger">{formatCurrency(data.raw_material_cost)}</div>
              {getExplanation(data.raw_material_cost) && <div className="text-secondary text-sm mt-xs">{getExplanation(data.raw_material_cost)}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="mb-2xl">
        <div className="glass-card p-lg">
          <h4 className="section-heading mb-md"><FaChartPie /> Cost Breakdown</h4>
          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <DoughnutChart data={costData} />
          </div>
        </div>
        <div className="glass-card p-lg">
          <h4 className="section-heading mb-md"><FaChartLine /> Revenue vs Costs (Year 1)</h4>
          <BarChart data={revenueVsCostData} />
        </div>
      </div>

      {/* Break-Even Analysis */}
      {data.break_even_analysis && (
        <div className="glass-card p-xl mb-lg" style={{ borderTop: '4px solid var(--info)' }}>
          <h4 className="section-heading mb-md"><FaInfoCircle /> Break-Even Analysis</h4>
          <div className="explanation-box">
            {data.break_even_analysis}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialTab;
