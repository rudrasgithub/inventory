import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MobileHeader() {
  const navigate = useNavigate();
  return (
    <header className="mobile-header">
      <div className="mobile-header-content">
        <img src="/product-logo.svg" alt="product logo" width={40} height={40} />
        <div className="mobile-header-settings">
          <img
            src="/settings.svg"
            alt="Settings"
            height={18}
            width={18}
            onClick={() => navigate('/setting')}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>
    </header>
  );
}
