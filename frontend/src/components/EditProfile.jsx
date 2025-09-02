import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../Context/ContextProvider';
import toast from 'react-hot-toast';
import '../css/EditProfile.css';

function FormField({ label, type = "text", name, value, onChange, placeholder }) {
  return (
    <div className="form-group-profile">
      <label htmlFor={name}>{label}</label>
      <input 
        type={type} 
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

export default function EditProfile() {
  const { user, setUser, token, setToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Initialize form data from context user data
  useEffect(() => {
    if (user) {
      const userData = {
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        password: '••••••••',
        confirmPassword: '••••••••'
      };
      setInitialData(userData);
      setFormData(userData);
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Check if form data has changed from initial data
  const hasChanges = () => {
    return (
      formData.firstName !== initialData.firstName ||
      formData.lastName !== initialData.lastName ||
      formData.email !== initialData.email ||
      (formData.password !== '••••••••' && formData.password !== '') ||
      (formData.confirmPassword !== '••••••••' && formData.confirmPassword !== '')
    );
  };

  const handleSave = async () => {
    setLoading(true);

    try {
    // Enhanced password validation
    const isPasswordChanged = formData.password !== '••••••••' && formData.password !== '' && formData.password.trim() !== '';
    const isConfirmPasswordChanged = formData.confirmPassword !== '••••••••' && formData.confirmPassword !== '' && formData.confirmPassword.trim() !== '';
    
    if (isPasswordChanged || isConfirmPasswordChanged) {
      if (!isPasswordChanged || formData.password.trim() === '') {
        toast.error('Please enter your new password');
        setLoading(false);
        return;
      }
      if (!isConfirmPasswordChanged || formData.confirmPassword.trim() === '') {
        toast.error('Please confirm your password');
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Both passwords should match');
        setLoading(false);
        return;
      }
      if (formData.password.length < 8) {
        toast.error('Password must be at least 8 characters long');
        setLoading(false);
        return;
      }
      // Additional validation: check if password is still placeholder
      if (formData.password === '••••••••') {
        toast.error('Please enter a new password, not the placeholder');
        setLoading(false);
        return;
      }
    }      const updateData = {};
      
      if (formData.firstName !== initialData.firstName) {
        updateData.firstName = formData.firstName.trim();
      }
      if (formData.lastName !== initialData.lastName) {
        updateData.lastName = formData.lastName.trim();
      }
    if (formData.email !== initialData.email) {
      updateData.email = formData.email.trim();
    }
    // Only send password if it's actually changed and not a placeholder
    if (formData.password !== '••••••••' && formData.password !== '' && formData.password.trim() !== '') {
      // Double check that we're not sending placeholder data
      if (formData.password === '••••••••' || formData.confirmPassword === '••••••••') {
        toast.error('Invalid password data detected. Please try again.');
        setLoading(false);
        return;
      }
      updateData.password = formData.password.trim();
      updateData.confirmPassword = formData.confirmPassword.trim();
    }

    console.log('Sending to backend:', { ...updateData, password: updateData.password ? '[REDACTED]' : undefined }); // Debug log without exposing password

    const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      
      console.log('Backend response:', { status: response.status, data }); // Debug log

      if (response.ok) {
        const emailChanged = updateData.email && updateData.email !== user.email;
        const passwordChanged = updateData.password;
        
        if (emailChanged) {
          toast.success('Email updated successfully! Please login again with your new email.');
          setTimeout(() => {
            setUser(null);
            setToken(null);
            localStorage.clear();
            window.location.href = '/login';
          }, 2000);
        } else if (passwordChanged) {
          toast.success('Password updated successfully! Please login again with your new password.');
          setTimeout(() => {
            setUser(null);
            setToken(null);
            localStorage.clear();
            window.location.href = '/login';
          }, 2000);
        } else {
          toast.success('Profile updated successfully!');
          
          const updatedUser = {
            ...user,
            ...data.user
          };
          setUser(updatedUser);
          
          const newInitialData = {
            firstName: data.user.firstName || '',
            lastName: data.user.lastName || '',
            email: data.user.email || '',
            password: '••••••••',
            confirmPassword: '••••••••'
          };
          setInitialData(newInitialData);
          setFormData(newInitialData);
        }
        
      } else {
        // Handle token expiration or invalid token
        if (response.status === 401 && (data.message.includes('Token is not valid') || data.message.includes('authorization denied'))) {
          toast.error('Session expired. Please login again.');
          // Clear invalid token and redirect to login
          setUser(null);
          setToken(null);
          window.location.href = '/login';
          return;
        }
        
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-profile">
      <div className="main">
        <div className="profile-container">
          <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
            <FormField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter your first name"
            />
            <FormField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter your last name"
            />
            <FormField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
            />
            
            <FormField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter password"
            />
            <FormField
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm password"
            />

            <div className="form-actions">
              <button 
                type="button" 
                className="save-btn" 
                onClick={handleSave}
                disabled={loading || !hasChanges()}
                style={{
                  cursor: hasChanges() && !loading ? 'pointer' : 'not-allowed',
                  opacity: hasChanges() && !loading ? 1 : 0.6
                }}
              >
                {loading ? 'Saving...' : (hasChanges() ? 'Save Changes' : 'Save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
