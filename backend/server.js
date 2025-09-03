import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import cron from 'node-cron';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import buyRoutes from './routes/buy.js';
import profileRoutes from './routes/profile.js';
import statisticsRoutes from './routes/statistics.js';
import invoiceRoutes from './routes/invoices.js';
import Product from './models/Product.js';

dotenv.config();

const app = express();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/products', buyRoutes);

app.use('/api/products', upload.single('image'), productRoutes);

app.use('/api', profileRoutes);

app.use('/api', statisticsRoutes);

app.use('/api/invoices', invoiceRoutes);

app.get('/', (req, res) => {
  res.send('Inventory backend API running');
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
})
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    cron.schedule('0 0 * * *', async () => {
      try {
        console.log('Running daily expired products check...');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const result = await Product.updateMany(
          {
            expiry: { $lt: today },
            status: { $ne: 'Expired' }
          },
          {
            status: 'Expired',
            quantity: 0
          }
        );

        if (result.modifiedCount > 0) {
          console.log(`Expired ${result.modifiedCount} products`);
        } else {
          console.log('No products expired today');
        }
      } catch (error) {
        console.error('Error in expired products cron job:', error);
      }
    });

    console.log('Daily expired products check scheduled');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
