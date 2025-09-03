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

    const user = await User.create({ name, email, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

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

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

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

  res.json({ message: 'Logged out' });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`Forgot password request received for email: ${email}`); // Log email request

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found for email: ${email}`); // Log user not found
      return res.status(404).json({ message: 'User not found with this email address' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated OTP for ${email}: ${otp}`); // Log generated OTP

    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.resetOTP = otp;
    user.resetOTPExpiry = otpExpiry;
    await user.save();
    console.log(`OTP saved to database for ${email}`); // Log OTP saved

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

    const user = await User.findOne({ resetOTP: otp });
    if (!user) {
      return res.status(404).json({ message: 'Invalid OTP or user not found' });
    }

    if (user.resetOTP !== otp || user.resetOTPExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const tempToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });

    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();

    res.json({ message: 'OTP verified successfully', tempToken });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword, tempToken } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'New password and confirm password are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

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

export const verifyToken = async (req, res) => {
  try {

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

export const deleteUser = async (req, res) => {
  try {
    console.log(`Delete user request for user ID: ${req.user._id}`);

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`Deleting user: ${user.email} (${user.name})`);

    await User.findOneAndDelete({ _id: req.user._id });

    console.log(`User ${user.email} and all associated data deleted successfully`);

    res.json({
      message: 'User account and all associated data deleted successfully',
      deletedUser: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error while deleting user account' });
  }
};
