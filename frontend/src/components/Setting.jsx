import EditProfile from './EditProfile'
import AccountManagement from './AccountManagement'
import Sidebar from './Sidebar'
import BottomNav from "./BottomNav"
import "../css/Setting.css"
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/ContextProvider';
import MobileHeader from './MobileHeader';

const Setting = () => {
    const { token, isInitialized } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('EditProfile');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const navigate = useNavigate();

    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth <= 768);
      };

      checkMobile();
      window.addEventListener('resize', checkMobile);

      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isInitialized && !token) {
            navigate('/login');
        }
    }, [isInitialized, token, navigate]);

    const handleMobileClose = () => {
        navigate('/');
    };

    return (
        <div className="setting-dashboard">
            {!isMobile && <Sidebar />}

            <div className="main-setting">

                {!isMobile && (
                  <header className="header-setting">
                      <h1>Setting</h1>
                  </header>
                )}

                {}
                {isMobile && (
                    <div className="mobile-close-container">
                        <button
                            className="mobile-close-btn"
                            onClick={handleMobileClose}
                            aria-label="Close Settings"
                        >
                          <img src="/close.svg" />
                        </button>
                    </div>
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

            {}
            {isMobile && <BottomNav />}
        </div>
    );
}

export default Setting