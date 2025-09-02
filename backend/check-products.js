import mongoose from 'mongoose';
import Product from './models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const products = await Product.find({}, 'name price quantity').limit(5);
    console.log('Products in database:');
    products.forEach(product => {
      console.log(`- ${product.name} (₹${product.price}) - Qty: ${product.quantity} - ID: ${product._id}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkProducts();
