import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../Context/ContextProvider';
import toast from 'react-hot-toast';
import "../css/AccountManagement.css";

const AccountManagement = () => {
  const navigate = useNavigate();
  const { setUser, setToken, token } = useContext(AuthContext);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Call backend logout API for validation and tracking
      const response = await fetch('http://localhost:5000/api/auth/logout', {
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