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
    
    const defaultLayout = {
      leftColumn: [0, 1, 2],
      rightColumn: [0, 1, 2]
    };
    
    if (!token) {
      toast.success('Layout reset to default!');
      setIsResettingLayout(false);
      return;
    }
    
    try {
      // Reset in database
      const response = await fetch(`${API_BASE_URL}/api/statistics/user/layout`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ homeLayout: defaultLayout })
      });

      if (response.ok) {
        toast.success('Dashboard layout reset to default!');
        console.log('Dashboard layout reset in database');
      } else {
        toast.error('Failed to reset dashboard layout.');
      }
    } catch (error) {
      console.error('Error resetting dashboard layout:', error);
      toast.error('Failed to reset dashboard layout.');
      // Clear localStorage as fallback
      try {
        localStorage.removeItem('gridLayout');
        console.log('Dashboard layout cleared from localStorage as fallback');
      } catch (localError) {
        console.log('Could not clear dashboard layout from localStorage');
      }
    }
    
    setIsResettingLayout(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Call backend logout API for validation and tracking
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
        // Even if backend fails, still logout locally
        toast.success('Logged out successfully!');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // If network error, still logout locally
      toast.success('Logged out successfully!');
    }

    // Always perform local logout regardless of backend response
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