import React, { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    amazonApiKey: '',
    ebayApiKey: '',
    profitMargin: 15,
    autoList: true,
    autoFulfill: true,
    emailNotifications: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save settings logic would go here
    alert('Settings saved successfully!');
  };

  return (
    <div className="settings-page">
      <h1 className="page-title">Settings</h1>
      
      <form onSubmit={handleSubmit} className="settings-form">
        <div className="settings-section">
          <h2>API Credentials</h2>
          <div className="form-group">
            <label htmlFor="amazonApiKey">Amazon API Key</label>
            <input
              type="password"
              id="amazonApiKey"
              name="amazonApiKey"
              value={settings.amazonApiKey}
              onChange={handleChange}
              placeholder="Enter Amazon API Key"
            />
          </div>
          <div className="form-group">
            <label htmlFor="ebayApiKey">eBay API Key</label>
            <input
              type="password"
              id="ebayApiKey"
              name="ebayApiKey"
              value={settings.ebayApiKey}
              onChange={handleChange}
              placeholder="Enter eBay API Key"
            />
          </div>
        </div>

        <div className="settings-section">
          <h2>Business Settings</h2>
          <div className="form-group">
            <label htmlFor="profitMargin">Minimum Profit Margin (%)</label>
            <input
              type="number"
              id="profitMargin"
              name="profitMargin"
              value={settings.profitMargin}
              onChange={handleChange}
              min="1"
              max="100"
            />
          </div>
        </div>

        <div className="settings-section">
          <h2>Automation</h2>
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="autoList"
              name="autoList"
              checked={settings.autoList}
              onChange={handleChange}
            />
            <label htmlFor="autoList">Automatically list products on eBay</label>
          </div>
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="autoFulfill"
              name="autoFulfill"
              checked={settings.autoFulfill}
              onChange={handleChange}
            />
            <label htmlFor="autoFulfill">Automatically fulfill orders from Amazon</label>
          </div>
        </div>

        <div className="settings-section">
          <h2>Notifications</h2>
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="emailNotifications"
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleChange}
            />
            <label htmlFor="emailNotifications">Email notifications for new orders</label>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">Save Settings</button>
      </form>
    </div>
  );
};

export default Settings;
