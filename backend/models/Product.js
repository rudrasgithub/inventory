import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  threshold: {
    type: Number,
    required: true,
  },
  expiry: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['In-stock', 'Out of stock', 'Low stock', 'Expired'],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  image: {
    type: String, // Store as base64 string or file path
    required: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

productSchema.pre("save", function (next) {

  if (this.status === "Expired") {
    next();
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (this.expiry < today) {
    this.status = "Expired";
    this.quantity = 0;
  } else if (this.quantity === 0) {
    this.status = "Out of stock";
  } else if (this.quantity > this.threshold) {
    this.status = "In-stock";
  } else {
    this.status = "Low stock";
  }
  next();
});

export default mongoose.model('Product', productSchema);
