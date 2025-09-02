import express from 'express';
import { getStatistics } from '../controllers/statisticsController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get statistics - protected route
router.get('/statistics', auth, getStatistics);

export default router;
