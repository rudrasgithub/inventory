import EditProfile from './EditProfile'
import AccountManagement from './AccountManagement'
import Sidebar from './Sidebar'
import BottomNav from "./BottomNav"
import "../css/Setting.css"
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Setting = () => {
    const [activeTab, setActiveTab] = useState('EditProfile');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 414);
    const navigate = useNavigate();

    // Check if mobile screen
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth <= 414);
      };
  
      checkMobile();
      window.addEventListener('resize', checkMobile);
  
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleMobileClose = () => {
        navigate('/');
    };

    return (
        <div className="setting-dashboard">
            {!isMobile && <Sidebar />}
            
            <div className="main-setting">
                {/* Mobile close button - no header */}
                {isMobile && (
                  <div className="mobile-close-container">
                    <button className="mobile-close-btn" onClick={handleMobileClose}>
                      <img src='/close.svg' width={20} height={20} />
                    </button>
                  </div>
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