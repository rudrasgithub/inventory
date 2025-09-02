import React from 'react';
import '../css/BottomNav.css';

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="nav-item active">
        <img src="/home.svg" alt="Home" className="nav-icon" />
      </div>
      <div className="nav-item">
        <img src="/invoice.svg" alt="Invoice" className="nav-icon" />
      </div>
      <div className="nav-item">
        <img src="/product-logo.svg" alt="Products" className="nav-icon" />
      </div>
      <div className="nav-item">
        <img src="/statistics.svg" alt="Statistics" className="nav-icon" />
      </div>
    </nav>
  );
}
