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
  // Legacy grid layout (for backward compatibility)
  gridLayout: {
    type: {
      leftColumn: [Number],
      rightColumn: [Number]
    },
    default: {
      leftColumn: [0, 1, 2],
      rightColumn: [3, 4]
    }
  },
  // New layout system for different pages
  layouts: {
    type: {
      statisticsLayout: {
        firstRow: { type: [Number], default: [0, 1, 2] },
        secondRow: { type: [Number], default: [3, 4] }
      },
      homeLayout: {
        leftColumn: { type: [Number], default: [0, 1, 2] },
        rightColumn: { type: [Number], default: [0, 1, 2] }
      }
    },
    default: {}
  }
}, { timestamps: true });

// Hash password before saving if modified
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Cascade delete - remove all associated data when user is deleted
userSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    console.log(`Cascading delete for user: ${this._id}`);
    
    // Import models dynamically to avoid circular dependencies
    const Product = mongoose.model('Product');
    const Purchase = mongoose.model('Purchase');
    const Invoice = mongoose.model('Invoice');
    
    // Delete all products associated with this user
    const deletedProducts = await Product.deleteMany({ userId: this._id });
    console.log(`Deleted ${deletedProducts.deletedCount} products for user ${this._id}`);
    
    // Delete all purchases associated with this user
    const deletedPurchases = await Purchase.deleteMany({ userId: this._id });
    console.log(`Deleted ${deletedPurchases.deletedCount} purchases for user ${this._id}`);
    
    // Delete all invoices associated with this user
    const deletedInvoices = await Invoice.deleteMany({ userId: this._id });
    console.log(`Deleted ${deletedInvoices.deletedCount} invoices for user ${this._id}`);
    
    next();
  } catch (error) {
    console.error('Error during cascade delete:', error);
    next(error);
  }
});

// Also handle findOneAndDelete
userSchema.pre('findOneAndDelete', async function(next) {
  try {
    // Get the user document that will be deleted
    const user = await this.model.findOne(this.getQuery());
    if (!user) {
      return next();
    }
    
    console.log(`Cascading delete for user: ${user._id}`);
    
    // Import models dynamically to avoid circular dependencies
    const Product = mongoose.model('Product');
    const Purchase = mongoose.model('Purchase');
    const Invoice = mongoose.model('Invoice');
    
    // Delete all products associated with this user
    const deletedProducts = await Product.deleteMany({ userId: user._id });
    console.log(`Deleted ${deletedProducts.deletedCount} products for user ${user._id}`);
    
    // Delete all purchases associated with this user
    const deletedPurchases = await Purchase.deleteMany({ userId: user._id });
    console.log(`Deleted ${deletedPurchases.deletedCount} purchases for user ${user._id}`);
    
    // Delete all invoices associated with this user
    const deletedInvoices = await Invoice.deleteMany({ userId: user._id });
    console.log(`Deleted ${deletedInvoices.deletedCount} invoices for user ${user._id}`);
    
    next();
  } catch (error) {
    console.error('Error during cascade delete:', error);
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
