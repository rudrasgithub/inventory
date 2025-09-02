import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetOTP: { type: String },
  resetOTPExpiry: { type: Date },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  lastLoginAt: { type: Date },
  gridLayout: {
    type: {
      leftColumn: [Number],
      rightColumn: [Number]
    },
    default: {
      leftColumn: [0, 1, 2],
      rightColumn: [3, 4]
    }
  }
}, { timestamps: true });

// Hash password before saving if modified
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
