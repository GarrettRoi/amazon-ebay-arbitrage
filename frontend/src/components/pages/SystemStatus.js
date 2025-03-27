import React from 'react';

const SystemStatus = () => {
  return (
    <div className="system-status-page">
      <h1 className="page-title">System Status</h1>
      <div className="status-cards">
        <div className="status-card">
          <h3>Amazon API</h3>
          <div className="status-indicator online"></div>
          <p>Online</p>
        </div>
        <div className="status-card">
          <h3>eBay API</h3>
          <div className="status-indicator online"></div>
          <p>Online</p>
        </div>
        <div className="status-card">
          <h3>Database</h3>
          <div className="status-indicator online"></div>
          <p>Online</p>
        </div>
        <div className="status-card">
          <h3>Product Scanner</h3>
          <div className="status-indicator online"></div>
          <p>Online</p>
        </div>
      </div>
      <div className="system-metrics">
        <h2>System Metrics</h2>
        <div className="metrics-container">
          <div className="metric-card">
            <h3>CPU Usage</h3>
            <div className="metric-value">0%</div>
          </div>
          <div className="metric-card">
            <h3>Memory Usage</h3>
            <div className="metric-value">0%</div>
          </div>
          <div className="metric-card">
            <h3>API Requests (24h)</h3>
            <div className="metric-value">0</div>
          </div>
          <div className="metric-card">
            <h3>Errors (24h)</h3>
            <div className="metric-value">0</div>
          </div>
        </div>
      </div>
      <div className="system-logs">
        <h2>Recent Logs</h2>
        <div className="logs-container">
          <p className="empty-logs">No logs available.</p>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
