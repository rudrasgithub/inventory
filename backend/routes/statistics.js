import express from 'express';
import { getStatistics, getWeeklyStatistics, getYearlyStatistics } from '../controllers/statisticsController.js';
import { getUserLayout, updateUserLayout } from '../controllers/statisticsController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/statistics', auth, getStatistics);

router.get('/statistics/weekly', auth, getWeeklyStatistics);

router.get('/statistics/yearly', auth, getYearlyStatistics);

router.get('/statistics/user/layout', auth, getUserLayout);
router.put('/statistics/user/layout', auth, updateUserLayout);

export default router;
