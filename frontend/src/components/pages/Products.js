import React from 'react';

const Products = () => {
  return (
    <div className="products-page">
      <h1 className="page-title">Products</h1>
      <div className="products-actions">
        <button className="btn btn-primary">Add New Product</button>
        <button className="btn btn-secondary">Import Products</button>
        <div className="search-container">
          <input type="text" placeholder="Search products..." />
          <button className="btn btn-search">Search</button>
        </div>
      </div>
      <div className="products-table">
        <div className="table-header">
          <div className="header-cell">Product Name</div>
          <div className="header-cell">Amazon Price</div>
          <div className="header-cell">eBay Price</div>
          <div className="header-cell">Profit</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Actions</div>
        </div>
        <div className="table-body">
          <div className="empty-state">
            <p>No products found. Add your first product to get started.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
