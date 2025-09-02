import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/BottomNav.css';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="bottom-nav">
      <div 
        className={`bottom-nav-item ${location.pathname === '/' ? 'active' : ''}`}
        onClick={() => handleNavigation('/')}
      >
        <img src="/home.svg" alt="Home" className="nav-icon" />
      </div>
      <div 
        className={`bottom-nav-item ${location.pathname === '/product' ? 'active' : ''}`}
        onClick={() => handleNavigation('/product')}
      >
        <img src="/box-icon.svg" alt="Products" className="nav-icon" />
      </div>
      <div 
        className={`bottom-nav-item ${location.pathname === '/invoice' ? 'active' : ''}`}
        onClick={() => handleNavigation('/invoice')}
      >
        <img src="/invoice.svg" alt="Invoice" className="nav-icon" />
      </div>
      <div 
        className={`bottom-nav-item ${location.pathname === '/statistics' ? 'active' : ''}`}
        onClick={() => handleNavigation('/statistics')}
      >
        <img src="/statistics.svg" alt="Statistics" className="nav-icon" />
      </div>
    </nav>
  );
}
