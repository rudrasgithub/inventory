import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -resetOTP -resetOTPExpiry -resetToken -resetTokenExpiry');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    
    // Enhanced password validation if provided
    if (password || confirmPassword) {
      // Check for placeholder password
      if (password === '••••••••' || confirmPassword === '••••••••') {
        return res.status(400).json({ message: 'Invalid password format. Please enter a new password.' });
      }
      if (password && !confirmPassword) {
        return res.status(400).json({ message: 'Please confirm your password' });
      }
      if (!password && confirmPassword) {
        return res.status(400).json({ message: 'Please enter your new password' });
      }
      if (password && confirmPassword && password !== confirmPassword) {
        return res.status(400).json({ message: 'Both passwords should match' });
      }
      if (password && password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
      }
      // Additional check for empty or whitespace-only passwords
      if (password && password.trim() === '') {
        return res.status(400).json({ message: 'Password cannot be empty' });
      }
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }

    // Update user fields if provided
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email && email !== user.email) user.email = email;
    if (password && password.length >= 8 && password.trim() !== '') {
      console.log('Updating password for user:', user.email); // Debug log
      user.password = password.trim(); // Will be hashed by pre-save middleware
    }
    
    // Update name field
    if (firstName !== undefined || lastName !== undefined) {
      user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email is already in use' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Enhanced logout with backend validation
export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update last login time for tracking
    user.lastLoginAt = new Date();
    await user.save();

    res.json({ 
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

// Save grid layout
export const saveGridLayout = async (req, res) => {
  try {
    const { leftColumn, rightColumn } = req.body;
    
    if (!Array.isArray(leftColumn) || !Array.isArray(rightColumn)) {
      return res.status(400).json({ message: 'Invalid grid layout format' });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.gridLayout = { leftColumn, rightColumn };
    await user.save();

    res.json({ 
      message: 'Grid layout saved successfully',
      gridLayout: user.gridLayout
    });
  } catch (error) {
    console.error('Error saving grid layout:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get grid layout
export const getGridLayout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.gridLayout || { leftColumn: [0, 1, 2], rightColumn: [0, 1, 2] });
  } catch (error) {
    console.error('Error getting grid layout:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
