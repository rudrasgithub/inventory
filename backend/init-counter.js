// Initialize TotalCounter with existing product quantities
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import TotalCounter from './models/TotalCounter.js';

dotenv.config();

const initializeCounter = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Calculate total quantity from existing products
    const existingProducts = await Product.aggregate([
      { $group: { _id: null, totalQuantity: { $sum: { $ifNull: ["$quantity", 0] } } } }
    ]);
    
    const currentTotal = existingProducts[0]?.totalQuantity || 0;
    console.log('Current total quantity in products:', currentTotal);

    // Get or create counter
    const counter = await TotalCounter.getCounter();
    console.log('Current counter value:', counter.totalProducts);

    // Update counter to match existing products (if it's 0)
    if (counter.totalProducts === 0 && currentTotal > 0) {
      counter.totalProducts = currentTotal;
      await counter.save();
      console.log('Updated counter to:', counter.totalProducts);
    } else {
      console.log('Counter already has value:', counter.totalProducts);
    }

    await mongoose.disconnect();
    console.log('Done');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

initializeCounter();
