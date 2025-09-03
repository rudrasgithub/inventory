import express from 'express';
import { register, login, logout, forgotPassword, verifyOTP, resetPassword, verifyToken, deleteUser } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/signup', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.get('/verify', auth, verifyToken);
router.delete('/delete-account', auth, deleteUser);

export default router;
