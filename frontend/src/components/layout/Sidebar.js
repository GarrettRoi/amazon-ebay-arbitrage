import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const Sidebar = ({ auth: { isAuthenticated } }) => {
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="sidebar">
      <ul className="sidebar-nav">
        <li className="sidebar-item">
          <Link to="/" className="sidebar-link">
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </Link>
        </li>
        <li className="sidebar-item">
          <Link to="/products" className="sidebar-link">
            <i className="fas fa-box"></i>
            <span>Products</span>
          </Link>
        </li>
        <li className="sidebar-item">
          <Link to="/orders" className="sidebar-link">
            <i className="fas fa-shopping-cart"></i>
            <span>Orders</span>
          </Link>
        </li>
        <li className="sidebar-item">
          <Link to="/inventory" className="sidebar-link">
            <i className="fas fa-warehouse"></i>
            <span>Inventory</span>
          </Link>
        </li>
        <li className="sidebar-item">
          <Link to="/system" className="sidebar-link">
            <i className="fas fa-server"></i>
            <span>System Status</span>
          </Link>
        </li>
        <li className="sidebar-item">
          <Link to="/settings" className="sidebar-link">
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

Sidebar.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(Sidebar);
