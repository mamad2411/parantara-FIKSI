import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Validation middleware to check for errors
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors: errors.array()
    });
  }
  next();
};

// Register Step 1 validation
export const validateRegisterStep1 = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nama harus diisi')
    .isLength({ min: 3, max: 100 }).withMessage('Nama harus 3-100 karakter')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Nama hanya boleh huruf dan spasi'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email harus diisi')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Nomor telepon harus diisi')
    .matches(/^(\+62|62|0)[0-9]{9,12}$/).withMessage('Format nomor telepon tidak valid'),
  
  validate
];

// OTP verification validation
export const validateOTP = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email harus diisi')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  
  body('otp')
    .trim()
    .notEmpty().withMessage('Kode OTP harus diisi')
    .isLength({ min: 6, max: 6 }).withMessage('Kode OTP harus 6 digit')
    .isNumeric().withMessage('Kode OTP harus berupa angka'),
  
  validate
];

// Complete registration validation
export const validateCompleteRegistration = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nama harus diisi')
    .isLength({ min: 3, max: 100 }).withMessage('Nama harus 3-100 karakter'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email harus diisi')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Nomor telepon harus diisi')
    .matches(/^(\+62|62|0)[0-9]{9,12}$/).withMessage('Format nomor telepon tidak valid'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password harus diisi')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password harus mengandung huruf besar, huruf kecil, dan angka'),
  
  body('mosqueName')
    .trim()
    .notEmpty().withMessage('Nama masjid harus diisi')
    .isLength({ min: 3, max: 200 }).withMessage('Nama masjid harus 3-200 karakter'),
  
  body('mosqueAddress')
    .trim()
    .notEmpty().withMessage('Alamat masjid harus diisi')
    .isLength({ min: 10, max: 500 }).withMessage('Alamat masjid harus 10-500 karakter'),
  
  body('mosqueCity')
    .trim()
    .notEmpty().withMessage('Kota masjid harus diisi')
    .isLength({ min: 3, max: 100 }).withMessage('Kota masjid harus 3-100 karakter'),
  
  validate
];

// Login validation
export const validateLogin = [
  body('emailOrPhone')
    .trim()
    .notEmpty().withMessage('Email atau nomor telepon harus diisi'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password harus diisi'),
  
  validate
];

// Forgot password validation
export const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email harus diisi')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  
  validate
];

// Reset password validation
export const validateResetPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email harus diisi')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  
  body('otp')
    .trim()
    .notEmpty().withMessage('Kode OTP harus diisi')
    .isLength({ min: 6, max: 6 }).withMessage('Kode OTP harus 6 digit')
    .isNumeric().withMessage('Kode OTP harus berupa angka'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password harus diisi')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  
  validate
];
