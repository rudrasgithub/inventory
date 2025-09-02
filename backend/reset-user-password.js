import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

async function resetUserPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const email = 't@gmail.com';
    const newPassword = '12345678';
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`User with email ${email} not found`);
      return;
    }
    
    console.log('Resetting password for user:', user.email);
    
    // Update password - will be hashed by pre-save middleware
    user.password = newPassword;
    await user.save();
    
    console.log('Password reset successfully!');
    
    // Test the new password
    const isMatch = await user.comparePassword(newPassword);
    console.log('Password verification:', isMatch ? 'SUCCESS' : 'FAILED');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

resetUserPassword();
