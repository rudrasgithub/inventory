import express from 'express';
import { getProfile, updateProfile, logout, saveGridLayout, getGridLayout } from '../controllers/profileController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', auth, getProfile);

router.put('/profile', auth, updateProfile);

router.post('/logout', auth, logout);

router.get('/grid-layout', auth, getGridLayout);
router.post('/grid-layout', auth, saveGridLayout);

export default router;
