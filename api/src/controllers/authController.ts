import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { generateToken } from '../utils/jwt';
import { generateOTP, isOTPExpired } from '../utils/otp';
import { sendOTPEmail, sendWelcomeEmail } from '../utils/email';

// OTP Storage interface
interface OTPData {
  otp: string;
  expiresAt: Date;
  name: string;
  phone: string;
}

// Temporary storage for OTP (in production, use Redis)
const otpStorage = new Map<string, OTPData>();

// Register Step 1: Submit personal info and send OTP
export const registerStep1 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone } = req.body;

    // Validate input
    if (!name || !email || !phone) {
      res.status(400).json({
        success: false,
        message: 'Semua field harus diisi'
      });
      return;
    }

    // Check if email or phone already exists
    const existingUser = await pool.query(
      'SELECT * FROM admins WHERE email = $1 OR phone = $2',
      [email, phone]
    );

    if (existingUser.rows.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Email atau nomor telepon sudah terdaftar'
      });
      return;
    }

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP temporarily
    otpStorage.set(email, {
      otp: otpCode,
      expiresAt: otpExpiresAt,
      name,
      phone
    });

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, name, otpCode);

    if (!emailResult.success) {
      res.status(500).json({
        success: false,
        message: 'Gagal mengirim OTP. Silakan coba lagi.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Kode OTP telah dikirim ke email Anda',
      data: {
        email,
        expiresAt: otpExpiresAt,
        // Remove this in production:
        debug: process.env.NODE_ENV === 'development' ? { otp: otpCode } : undefined
      }
    });
  } catch (error) {
    console.error('Register Step 1 Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Register Step 2: Verify OTP
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({
        success: false,
        message: 'Email dan kode OTP harus diisi'
      });
      return;
    }

    // Get stored OTP
    const storedData = otpStorage.get(email);

    if (!storedData) {
      res.status(400).json({
        success: false,
        message: 'OTP tidak ditemukan atau sudah kadaluarsa'
      });
      return;
    }

    // Check if OTP expired
    if (isOTPExpired(storedData.expiresAt)) {
      otpStorage.delete(email);
      res.status(400).json({
        success: false,
        message: 'Kode OTP sudah kadaluarsa. Silakan minta kode baru.'
      });
      return;
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      res.status(400).json({
        success: false,
        message: 'Kode OTP tidak valid'
      });
      return;
    }

    // OTP verified successfully
    res.status(200).json({
      success: true,
      message: 'OTP berhasil diverifikasi'
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Register Step 3 & 4: Complete registration
export const completeRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, mosqueName, mosqueAddress, mosqueCity } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password || !mosqueName || !mosqueAddress || !mosqueCity) {
      res.status(400).json({
        success: false,
        message: 'Semua field harus diisi'
      });
      return;
    }

    // Verify OTP was validated (check if data exists in storage)
    const storedData = otpStorage.get(email);
    if (!storedData) {
      res.status(400).json({
        success: false,
        message: 'Silakan verifikasi OTP terlebih dahulu'
      });
      return;
    }

    // Check if email or phone already exists
    const existingUser = await pool.query(
      'SELECT * FROM admins WHERE email = $1 OR phone = $2',
      [email, phone]
    );

    if (existingUser.rows.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Email atau nomor telepon sudah terdaftar'
      });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert new admin
    const result = await pool.query(
      `INSERT INTO admins (name, email, phone, password_hash, mosque_name, mosque_address, mosque_city, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, email, phone, mosque_name, mosque_address, mosque_city, created_at`,
      [name, email, phone, passwordHash, mosqueName, mosqueAddress, mosqueCity, true]
    );

    const admin = result.rows[0];

    // Clear OTP from storage
    otpStorage.delete(email);

    // Send welcome email
    await sendWelcomeEmail(email, name, mosqueName);

    // Generate JWT token
    const token = generateToken({
      id: admin.id,
      email: admin.email,
      name: admin.name
    });

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: {
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          mosqueName: admin.mosque_name,
          mosqueAddress: admin.mosque_address,
          mosqueCity: admin.mosque_city,
          createdAt: admin.created_at
        },
        token
      }
    });
  } catch (error) {
    console.error('Complete Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      res.status(400).json({
        success: false,
        message: 'Email/Telepon dan password harus diisi'
      });
      return;
    }

    // Find admin by email or phone
    const result = await pool.query(
      'SELECT * FROM admins WHERE email = $1 OR phone = $1',
      [emailOrPhone]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Email/Telepon atau password salah'
      });
      return;
    }

    const admin = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Email/Telepon atau password salah'
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      id: admin.id,
      email: admin.email,
      name: admin.name
    });

    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          mosqueName: admin.mosque_name,
          mosqueAddress: admin.mosque_address,
          mosqueCity: admin.mosque_city
        },
        token
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Get current admin profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, mosque_name, mosque_address, mosque_city, created_at FROM admins WHERE id = $1',
      [req.user?.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Admin tidak ditemukan'
      });
      return;
    }

    const admin = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        mosqueName: admin.mosque_name,
        mosqueAddress: admin.mosque_address,
        mosqueCity: admin.mosque_city,
        createdAt: admin.created_at
      }
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};


// Forgot Password - Send OTP
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email harus diisi'
      });
      return;
    }

    // Check if email exists
    const result = await pool.query(
      'SELECT * FROM admins WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Email tidak terdaftar'
      });
      return;
    }

    const admin = result.rows[0];

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP temporarily
    otpStorage.set(`reset_${email}`, {
      otp: otpCode,
      expiresAt: otpExpiresAt,
      name: admin.name,
      phone: admin.phone
    });

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, admin.name, otpCode);

    if (!emailResult.success) {
      res.status(500).json({
        success: false,
        message: 'Gagal mengirim OTP. Silakan coba lagi.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Kode OTP telah dikirim ke email Anda',
      data: {
        email,
        expiresAt: otpExpiresAt,
        // Remove this in production:
        debug: process.env.NODE_ENV === 'development' ? { otp: otpCode } : undefined
      }
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Verify Reset OTP
export const verifyResetOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({
        success: false,
        message: 'Email dan kode OTP harus diisi'
      });
      return;
    }

    // Get stored OTP
    const storedData = otpStorage.get(`reset_${email}`);

    if (!storedData) {
      res.status(400).json({
        success: false,
        message: 'OTP tidak ditemukan atau sudah kadaluarsa'
      });
      return;
    }

    // Check if OTP expired
    if (isOTPExpired(storedData.expiresAt)) {
      otpStorage.delete(`reset_${email}`);
      res.status(400).json({
        success: false,
        message: 'Kode OTP sudah kadaluarsa. Silakan minta kode baru.'
      });
      return;
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      res.status(400).json({
        success: false,
        message: 'Kode OTP tidak valid'
      });
      return;
    }

    // OTP verified successfully
    res.status(200).json({
      success: true,
      message: 'OTP berhasil diverifikasi'
    });
  } catch (error) {
    console.error('Verify Reset OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      res.status(400).json({
        success: false,
        message: 'Semua field harus diisi'
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter'
      });
      return;
    }

    // Verify OTP one more time
    const storedData = otpStorage.get(`reset_${email}`);

    if (!storedData || storedData.otp !== otp) {
      res.status(400).json({
        success: false,
        message: 'Kode OTP tidak valid'
      });
      return;
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password in database
    await pool.query(
      'UPDATE admins SET password_hash = $1 WHERE email = $2',
      [passwordHash, email]
    );

    // Clear OTP from storage
    otpStorage.delete(`reset_${email}`);

    res.status(200).json({
      success: true,
      message: 'Password berhasil direset'
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};
