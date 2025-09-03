import express from 'express';
import { getStatistics, getWeeklyStatistics, getYearlyStatistics } from '../controllers/statisticsController.js';
import { getUserLayout, updateUserLayout } from '../controllers/statisticsController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get statistics - protected route
router.get('/statistics', auth, getStatistics);

// Get weekly statistics - protected route
router.get('/statistics/weekly', auth, getWeeklyStatistics);

// Get yearly statistics - protected route
router.get('/statistics/yearly', auth, getYearlyStatistics);

// Layout management routes
router.get('/statistics/user/layout', auth, getUserLayout);
router.put('/statistics/user/layout', auth, updateUserLayout);

export default router;
