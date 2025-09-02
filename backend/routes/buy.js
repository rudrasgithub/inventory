import express from 'express';
import { auth } from '../middleware/auth.js';
import { buyProduct } from '../controllers/buyController.js';

const router = express.Router();

// POST /api/products/buy - requires authentication
router.post('/buy', auth, buyProduct);

export default router;
