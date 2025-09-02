import express from 'express';
import { getStatistics } from '../controllers/statisticsController.js';
import { getUserLayout, updateUserLayout } from '../controllers/statisticsController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get statistics - protected route
router.get('/statistics', auth, getStatistics);

// Layout management routes
router.get('/user/layout', auth, getUserLayout);
router.put('/user/layout', auth, updateUserLayout);

export default router;
