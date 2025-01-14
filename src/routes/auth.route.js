import express from 'express';
import {
  signup,
  login,
  logout,
  updateProfile,
  updateMyProfile,
  checkAuth,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfessionals,
  getUsersForSidebar
} from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-email', verifyEmail)
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)

router.put('/update-profile', protectRoute, updateProfile);
router.put('/update-my-profile', protectRoute, updateMyProfile)

router.get('/check', protectRoute, checkAuth);
router.get('/list-professionals', getProfessionals);
router.get('/get-users', protectRoute, getUsersForSidebar);



export default router;