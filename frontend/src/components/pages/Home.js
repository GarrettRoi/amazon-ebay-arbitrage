import React from 'react';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Active Products</h3>
          <p className="stat-number">0</p>
        </div>
        <div className="stat-card">
          <h3>Pending Orders</h3>
          <p className="stat-number">0</p>
        </div>
        <div className="stat-card">
          <h3>Revenue (30d)</h3>
          <p className="stat-number">$0.00</p>
        </div>
        <div className="stat-card">
          <h3>Profit (30d)</h3>
          <p className="stat-number">$0.00</p>
        </div>
      </div>
      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>Sales Overview</h3>
          <div className="chart-placeholder">
            <p>No data available</p>
          </div>
        </div>
        <div className="chart-container">
          <h3>Top Products</h3>
          <div className="chart-placeholder">
            <p>No data available</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
