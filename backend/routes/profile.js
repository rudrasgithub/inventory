import express from 'express';
import { getProfile, updateProfile, logout, saveGridLayout, getGridLayout } from '../controllers/profileController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get user profile - protected route
router.get('/profile', auth, getProfile);

// Update user profile - protected route
router.put('/profile', auth, updateProfile);

// Enhanced logout - protected route
router.post('/logout', auth, logout);

// Grid layout routes
router.get('/grid-layout', auth, getGridLayout);
router.post('/grid-layout', auth, saveGridLayout);

export default router;
