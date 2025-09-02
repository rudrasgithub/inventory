import EditProfile from './EditProfile'
import AccountManagement from './AccountManagement'
import Sidebar from './Sidebar'
import BottomNav from "./BottomNav"
import "../css/Setting.css"
import { useState, useEffect } from 'react';

const Setting = () => {
    const [activeTab, setActiveTab] = useState('EditProfile');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 414);

    // Check if mobile screen
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth <= 414);
      };
  
      checkMobile();
      window.addEventListener('resize', checkMobile);
  
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="setting-dashboard">
            {!isMobile && <Sidebar />}
            
            <div className="main-setting">
                {/* Mobile header */}
                {isMobile && (
                  <header className="mobile-header">
                    <div className="mobile-header-content">
                      <img src="/product-logo.svg" alt="product logo" height={47} width={47} />
                      <div className="mobile-header-settings">
                        <img src="/settings.svg" alt="Settings" height={18} width={18} />
                      </div>
                    </div>
                  </header>
                )}
                
                {/* Desktop header */}
                {!isMobile && (
                  <header className="header-setting">
                      <h1>Setting</h1>
                  </header>
                )}
                <div className="content-setting">
                    <div className="tabs-setting">
                        <button
                            className={activeTab === 'EditProfile' ? 'active' : ''}
                            onClick={() => setActiveTab('EditProfile')}
                        >
                            Edit Profile
                        </button>
                        <button
                            className={activeTab === 'AccountManagement' ? 'active' : ''}
                            onClick={() => setActiveTab('AccountManagement')}
                        >
                            Account Management
                        </button>
                    </div>
                    {activeTab === 'EditProfile' && <EditProfile />}
                    {activeTab === 'AccountManagement' && <AccountManagement />}
                </div>
            </div>
            
            {/* Mobile Bottom Navigation - only show on mobile */}
            {isMobile && <BottomNav />}
        </div>
    );
}

export default Setting