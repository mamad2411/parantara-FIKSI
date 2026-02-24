import express from 'express';
import * as authController from '../controllers/authController';
import authMiddleware from '../middleware/auth';
import { loginLimiter, otpLimiter, registerLimiter } from '../middleware/security';
import {
  validateRegisterStep1,
  validateOTP,
  validateCompleteRegistration,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
} from '../middleware/validation';

const router = express.Router();

// Public routes
router.post('/register/step1', registerLimiter, otpLimiter, validateRegisterStep1, authController.registerStep1);
router.post('/register/verify-otp', validateOTP, authController.verifyOTP);
router.post('/register/complete', validateCompleteRegistration, authController.completeRegistration);
router.post('/login', loginLimiter, validateLogin, authController.login);
router.post('/forgot-password', otpLimiter, validateForgotPassword, authController.forgotPassword);
router.post('/verify-reset-otp', validateOTP, authController.verifyResetOTP);
router.post('/reset-password', validateResetPassword, authController.resetPassword);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);

export default router;
