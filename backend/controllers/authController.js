import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendOTPEmail, sendPasswordResetSuccessEmail } from '../utils/emailService.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user - password will be hashed by pre-save middleware
    const user = await User.create({ name, email, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Return user data along with token
    res.status(201).json({ 
      message: 'User registered successfully', 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

export const login = async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Log the incoming request body
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found. Please sign up.' });
    }

    // Use the comparePassword method from User model
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Return user data along with token
    res.status(200).json({ 
      message: 'Login successful', 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      }
    });
  } catch (err) {
    console.error('Login error:', err); // Log any errors
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

export const logout = (req, res) => {
  // For JWT, logout is handled on the client by deleting the token
  res.json({ message: 'Logged out' });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`Forgot password request received for email: ${email}`); // Log email request

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found for email: ${email}`); // Log user not found
      return res.status(404).json({ message: 'User not found with this email address' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated OTP for ${email}: ${otp}`); // Log generated OTP

    // Set OTP expiry (10 minutes from now)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to user document
    user.resetOTP = otp;
    user.resetOTPExpiry = otpExpiry;
    await user.save();
    console.log(`OTP saved to database for ${email}`); // Log OTP saved

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp);

    if (emailResult.success) {
      console.log(`OTP email sent successfully to ${email}`); // Log email sent
      res.json({ 
        message: 'Password reset OTP sent successfully. Please check your email.' 
      });
    } else {
      console.error(`Failed to send OTP email to ${email}:`, emailResult.error); // Log email failure
      res.status(500).json({ 
        message: 'Failed to send OTP email. Please try again later.' 
      });
    }
  } catch (err) {
    console.error('Forgot password error:', err); // Log server error
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    // Check if OTP exists in the database
    const user = await User.findOne({ resetOTP: otp });
    if (!user) {
      return res.status(404).json({ message: 'Invalid OTP or user not found' });
    }

    // Check if OTP matches and is not expired
    if (user.resetOTP !== otp || user.resetOTPExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Generate a temporary token with the user's email
    const tempToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // Clear OTP fields
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();

    res.json({ message: 'OTP verified successfully', tempToken });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a new function to reset password after OTP verification
export const resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword, tempToken } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'New password and confirm password are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Decode the temporary token to get the user's email
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      console.log('Decoded Token:', decoded); // Log decoded token for debugging
    } catch (err) {
      console.error('Token verification error:', err); // Log error details
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }
      throw err; // Re-throw other errors
    }

    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password and update the user
    user.password = newPassword; // The pre-save middleware will hash it
    await user.save();

    res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (err) {
    console.error('Password reset error:', err);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify token endpoint
export const verifyToken = async (req, res) => {
  try {
    // The auth middleware already verified the token and set req.user
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
