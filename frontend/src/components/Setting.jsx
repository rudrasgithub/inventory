import EditProfile from './EditProfile'
import AccountManagement from './AccountManagement'
import Sidebar from './Sidebar'
import "../css/Setting.css"
import { useState } from 'react';

const Setting = () => {
    const [activeTab, setActiveTab] = useState('EditProfile');

    return (
        <div className="setting-dashboard">
            <Sidebar />
            <div className="main-setting">
                <header className="header-setting">
                    <h1>Setting</h1>
                </header>
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
        </div>
    );
}

export default Setting