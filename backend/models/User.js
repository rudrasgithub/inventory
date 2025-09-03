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
  },

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

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    console.log(`Cascading delete for user: ${this._id}`);

    const Product = mongoose.model('Product');
    const Purchase = mongoose.model('Purchase');
    const Invoice = mongoose.model('Invoice');

    const deletedProducts = await Product.deleteMany({ userId: this._id });
    console.log(`Deleted ${deletedProducts.deletedCount} products for user ${this._id}`);

    const deletedPurchases = await Purchase.deleteMany({ userId: this._id });
    console.log(`Deleted ${deletedPurchases.deletedCount} purchases for user ${this._id}`);

    const deletedInvoices = await Invoice.deleteMany({ userId: this._id });
    console.log(`Deleted ${deletedInvoices.deletedCount} invoices for user ${this._id}`);

    next();
  } catch (error) {
    console.error('Error during cascade delete:', error);
    next(error);
  }
});

userSchema.pre('findOneAndDelete', async function(next) {
  try {

    const user = await this.model.findOne(this.getQuery());
    if (!user) {
      return next();
    }

    console.log(`Cascading delete for user: ${user._id}`);

    const Product = mongoose.model('Product');
    const Purchase = mongoose.model('Purchase');
    const Invoice = mongoose.model('Invoice');

    const deletedProducts = await Product.deleteMany({ userId: user._id });
    console.log(`Deleted ${deletedProducts.deletedCount} products for user ${user._id}`);

    const deletedPurchases = await Purchase.deleteMany({ userId: user._id });
    console.log(`Deleted ${deletedPurchases.deletedCount} purchases for user ${user._id}`);

    const deletedInvoices = await Invoice.deleteMany({ userId: user._id });
    console.log(`Deleted ${deletedInvoices.deletedCount} invoices for user ${user._id}`);

    next();
  } catch (error) {
    console.error('Error during cascade delete:', error);
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
