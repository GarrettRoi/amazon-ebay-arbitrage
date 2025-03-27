import React from 'react';

const Orders = () => {
  return (
    <div className="orders-page">
      <h1 className="page-title">Orders</h1>
      <div className="orders-actions">
        <div className="filter-container">
          <select defaultValue="all">
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="search-container">
          <input type="text" placeholder="Search orders..." />
          <button className="btn btn-search">Search</button>
        </div>
      </div>
      <div className="orders-table">
        <div className="table-header">
          <div className="header-cell">Order ID</div>
          <div className="header-cell">Date</div>
          <div className="header-cell">Customer</div>
          <div className="header-cell">Product</div>
          <div className="header-cell">Amount</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Actions</div>
        </div>
        <div className="table-body">
          <div className="empty-state">
            <p>No orders found.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
