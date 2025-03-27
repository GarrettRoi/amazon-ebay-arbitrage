import React from 'react';

const Inventory = () => {
  return (
    <div className="inventory-page">
      <h1 className="page-title">Inventory</h1>
      <div className="inventory-actions">
        <button className="btn btn-primary">Update Inventory</button>
        <div className="search-container">
          <input type="text" placeholder="Search inventory..." />
          <button className="btn btn-search">Search</button>
        </div>
      </div>
      <div className="inventory-table">
        <div className="table-header">
          <div className="header-cell">Product ID</div>
          <div className="header-cell">Product Name</div>
          <div className="header-cell">Amazon Stock</div>
          <div className="header-cell">eBay Listings</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Last Updated</div>
          <div className="header-cell">Actions</div>
        </div>
        <div className="table-body">
          <div className="empty-state">
            <p>No inventory data available.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
