import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../Context/ContextProvider';
import toast from 'react-hot-toast';
import "../css/AccountManagement.css";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

const AccountManagement = () => {
  const navigate = useNavigate();
  const { setUser, setToken, token } = useContext(AuthContext);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isResettingLayout, setIsResettingLayout] = useState(false);

  const handleResetLayout = async () => {
    setIsResettingLayout(true);

    const defaultHomeLayout = {
      leftColumn: [0, 1, 2],
      rightColumn: [0, 1, 2]
    };

    const defaultStatisticsLayout = {
      firstRow: [0, 1, 2],
      secondRow: [3, 4]
    };

    if (!token) {
      toast.success('All layouts reset to default!');
      setIsResettingLayout(false);
      return;
    }

    try {

      const homeResponse = await fetch(`${API_BASE_URL}/api/statistics/user/layout`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          homeLayout: defaultHomeLayout,
          statisticsLayout: defaultStatisticsLayout
        })
      });

      if (homeResponse.ok) {
        toast.success('All dashboard layouts reset to default!');
        console.log('Home and Statistics layouts reset in database');
      } else {
        toast.error('Failed to reset layouts.');
      }
    } catch (error) {
      console.error('Error resetting layouts:', error);
      toast.error('Failed to reset layouts.');

      try {
        localStorage.removeItem('gridLayout');
        console.log('Layouts cleared from localStorage as fallback');
      } catch (localError) {
        console.log('Could not clear layouts from localStorage');
      }
    }

    setIsResettingLayout(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {

      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Logged out successfully!');
      } else {

        toast.success('Logged out successfully!');
      }
    } catch (error) {
      console.error('Error during logout:', error);

      toast.success('Logged out successfully!');
    }

    setTimeout(() => {
      setUser(null); // Clear user data from context
      setToken(null); // Clear token from context
      localStorage.clear(); // Clear all localStorage data
      navigate('/login', { replace: true }); // Redirect to login
      setIsLoggingOut(false); // Reset loading state after navigation
    }, 1000);
  };

  return (
    <div className="account-management">
      <div className='account-management-container'>
        <button
          className='reset-layout-btn-account-management'
          onClick={handleResetLayout}
          disabled={isResettingLayout}
          style={{
            cursor: isResettingLayout ? 'not-allowed' : 'pointer',
            opacity: isResettingLayout ? 0.6 : 1,
            marginBottom: '1rem'
          }}
        >
          {isResettingLayout ? 'Resetting...' : 'Reset Layout'}
        </button>

        <button
          className='logout-btn-account-management'
          onClick={handleLogout}
          disabled={isLoggingOut}
          style={{
            cursor: isLoggingOut ? 'not-allowed' : 'pointer',
            opacity: isLoggingOut ? 0.6 : 1
          }}
        >
          {isLoggingOut ? 'Logging out...' : 'Log out'}
        </button>
      </div>
    </div>
  )
}

export default AccountManagement;