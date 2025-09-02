import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcrypt';

dotenv.config();

async function checkPasswordHash() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const email = 't@gmail.com';
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`User with email ${email} not found`);
      return;
    }
    
    console.log('User found:', {
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      passwordHash: user.password.substring(0, 20) + '...',
      passwordHashLength: user.password.length,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
    
    // Test common passwords
    const testPasswords = ['12345678', 'testtest', 'password123', '••••••••'];
    
    for (const testPassword of testPasswords) {
      try {
        const isMatch = await user.comparePassword(testPassword);
        console.log(`Password "${testPassword}": ${isMatch ? 'MATCH' : 'NO MATCH'}`);
        if (isMatch) break;
      } catch (error) {
        console.log(`Error testing "${testPassword}":`, error.message);
      }
    }
    
    // Check if the password looks like a bcrypt hash
    const isBcryptHash = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');
    console.log('Is valid bcrypt hash format:', isBcryptHash);
    
    if (!isBcryptHash) {
      console.log('⚠️ WARNING: Password is not in bcrypt format! This indicates corruption.');
      console.log('Raw password field:', user.password);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkPasswordHash();
