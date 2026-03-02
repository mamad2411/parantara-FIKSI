import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { sendEmail, generateOTP, getOTPEmailHTML, getWelcomeEmailHTML, getSubscribeWelcomeEmailHTML } from './utils/emailWorker'
import { hashPassword, comparePassword, validatePasswordStrength } from './utils/password'
import { 
  advancedRateLimit, 
  sqlInjectionProtection, 
  xssProtection, 
  replayAttackProtection,
  securityHeaders,
  validateInput
} from './middleware/apiSecurity'

// Types
type Bindings = {
  JWT_SECRET: string
  DATABASE_URL: string
  SMTP_HOST: string
  SMTP_PORT: string
  SMTP_USER: string
  SMTP_PASS: string
  RECAPTCHA_SECRET_KEY: string
  RESEND_API_KEY: string
  ENVIRONMENT: string
  CORS_ORIGIN: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Temporary OTP storage (in production, use KV or database)
const otpStorage = new Map<string, { otp: string; expires: number; data?: any }>()

// Middleware
app.use('*', logger())

// Security headers
app.use('*', securityHeaders())

// Replay attack protection
app.use('*', replayAttackProtection())

// XSS Protection
app.use('*', xssProtection())

// SQL Injection Protection
app.use('*', sqlInjectionProtection())

// Rate limiting - 300 requests per minute (increased for testing)
app.use('*', advancedRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 300
}))

app.use('*', async (c, next) => {
  const origin = c.req.header('origin') || ''
  const allowedOrigins = [
    'http://localhost:3000',
    'https://danamasjid.vercel.app',
  ]
  
  // Check if origin matches Vercel preview deployments
  const isVercelPreview = origin.match(/^https:\/\/danamasjid-[a-z0-9]+-chaalis-projects\.vercel\.app$/)
  
  const corsMiddleware = cors({
    origin: (origin) => {
      if (allowedOrigins.includes(origin) || isVercelPreview) {
        return origin
      }
      return allowedOrigins[0]
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
  return corsMiddleware(c, next)
})

// Health check
app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'DanaMasjid API is running on Cloudflare Workers',
    version: '1.0.0',
    environment: c.env.ENVIRONMENT || 'development',
  })
})

app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  })
})

// ============================================
// SUBSCRIBE ENDPOINT
// ============================================
app.post('/api/subscribe', 
  advancedRateLimit({ windowMs: 60 * 1000, maxRequests: 20 }), // 20 per minute (increased for testing)
  validateInput({
    email: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
  }),
  async (c) => {
  try {
    const { email } = await c.req.json()

    // Validation
    if (!email || typeof email !== 'string') {
      return c.json(
        { success: false, message: 'Email is required' },
        400
      )
    }

    if (!email.includes('@') || !email.includes('.')) {
      return c.json(
        { success: false, message: 'Email tidak valid' },
        400
      )
    }

    // TODO: Save to database/mailing list

    // Send welcome email
    const emailSent = await sendEmail({
      to: email,
      subject: '🕌 Selamat! Anda Telah Berlangganan DanaMasjid',
      html: getSubscribeWelcomeEmailHTML(email),
      resendApiKey: c.env.RESEND_API_KEY
    })

    if (!emailSent) {
      console.warn(`Failed to send welcome email to: ${email}`)
      // Still return success even if email fails
    }

    console.log(`New subscription: ${email}`)

    return c.json({
      success: true,
      message: 'Terima kasih! Cek email Anda untuk langkah selanjutnya.',
      email: email,
    })
  } catch (error) {
    console.error('Subscribe error:', error)
    return c.json(
      { success: false, message: 'Terjadi kesalahan server' },
      500
    )
  }
})

// ============================================
// AUTH ENDPOINTS
// ============================================

// Register
app.post('/api/auth/register', async (c) => {
  try {
    const { email, password, name } = await c.req.json()

    // Validation
    if (!email || !password || !name) {
      return c.json(
        { success: false, message: 'All fields are required' },
        400
      )
    }

    if (password.length < 8) {
      return c.json(
        { success: false, message: 'Password must be at least 8 characters' },
        400
      )
    }

    // TODO: Implement user registration with database
    // For now, return success
    console.log(`New registration: ${email}`)

    return c.json({
      success: true,
      message: 'Registration successful',
      user: {
        email,
        name,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    return c.json(
      { success: false, message: 'Registration failed' },
      500
    )
  }
})

// Register Step 1 - Send OTP
app.post('/api/auth/register/step1',
  advancedRateLimit({ windowMs: 60 * 1000, maxRequests: 20 }), // 20 per minute (increased for testing)
  validateInput({
    email: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
    nickname: { required: true, type: 'string', minLength: 3, maxLength: 30 }
  }),
  async (c) => {
  try {
    const { email, name, nickname } = await c.req.json()

    if (!email || !name || !nickname) {
      return c.json(
        { success: false, message: 'Semua field harus diisi' },
        400
      )
    }

    // Generate OTP
    const otp = generateOTP()
    const expires = Date.now() + 10 * 60 * 1000 // 10 minutes

    // Store OTP with user data
    otpStorage.set(email, {
      otp,
      expires,
      data: { name, nickname }
    })

    // Send OTP email
    const emailSent = await sendEmail({
      to: email,
      subject: 'Kode OTP Registrasi DanaMasjid',
      html: getOTPEmailHTML(otp, 'registrasi'),
      resendApiKey: c.env.RESEND_API_KEY
    })

    if (!emailSent) {
      return c.json(
        { success: false, message: 'Gagal mengirim OTP ke email' },
        500
      )
    }

    console.log(`OTP sent to: ${email}`)
    
    return c.json({
      success: true,
      message: 'OTP berhasil dikirim ke email Anda'
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return c.json(
      { success: false, message: 'Gagal mengirim OTP' },
      500
    )
  }
})

// Register Step 2 - Verify OTP
app.post('/api/auth/register/verify-otp', async (c) => {
  try {
    const { email, otp } = await c.req.json()

    if (!email || !otp) {
      return c.json(
        { success: false, message: 'Email dan OTP harus diisi' },
        400
      )
    }

    // Verify OTP
    const stored = otpStorage.get(email)
    
    if (!stored) {
      return c.json(
        { success: false, message: 'OTP tidak ditemukan atau sudah kadaluarsa' },
        400
      )
    }

    if (stored.expires < Date.now()) {
      otpStorage.delete(email)
      return c.json(
        { success: false, message: 'OTP sudah kadaluarsa' },
        400
      )
    }

    if (stored.otp !== otp) {
      return c.json(
        { success: false, message: 'Kode OTP tidak valid' },
        400
      )
    }

    console.log(`OTP verified for: ${email}`)

    return c.json({
      success: true,
      message: 'OTP berhasil diverifikasi',
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return c.json(
      { success: false, message: 'Kode OTP tidak valid' },
      500
    )
  }
})

// Register Step 4 - Complete Registration
app.post('/api/auth/register/complete', async (c) => {
  try {
    const { name, email, nickname, password, mosqueName, mosqueAddress, mosqueCity } = await c.req.json()

    if (!name || !email || !nickname || !password) {
      return c.json(
        { success: false, message: 'Semua field harus diisi' },
        400
      )
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      return c.json(
        { success: false, message: passwordValidation.message },
        400
      )
    }

    // Hash password using bcrypt
    const hashedPassword = await hashPassword(password)
    console.log(`Password hashed successfully for: ${email}`)

    // Clear OTP after successful registration
    otpStorage.delete(email)

    // Send welcome email
    await sendEmail({
      to: email,
      subject: '🕌 Selamat Datang di DanaMasjid',
      html: getWelcomeEmailHTML(name),
      resendApiKey: c.env.RESEND_API_KEY
    })

    // TODO: Save user and mosque to database with hashed password
    console.log(`Registration completed for: ${email}`)
    console.log(`Mosque: ${mosqueName}, ${mosqueCity}`)

    return c.json({
      success: true,
      message: 'Registrasi berhasil',
      user: {
        email,
        name,
        nickname,
      },
    })
  } catch (error) {
    console.error('Complete registration error:', error)
    return c.json(
      { success: false, message: 'Gagal menyelesaikan registrasi' },
      500
    )
  }
})

// Login
app.post('/api/auth/login',
  advancedRateLimit({ windowMs: 60 * 1000, maxRequests: 20 }), // 20 per minute (increased for testing)
  validateInput({
    email: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { required: true, type: 'string', minLength: 6 }
  }),
  async (c) => {
  try {
    const { email, password } = await c.req.json()

    // Validation
    if (!email || !password) {
      return c.json(
        { success: false, message: 'Email dan password harus diisi' },
        400
      )
    }

    // TODO: Get user from database
    // For now, return mock response with password comparison example
    console.log(`Login attempt: ${email}`)
    
    // Example: In production, you would:
    // 1. Get user from database by email
    // 2. Compare password with stored hash using comparePassword()
    // const user = await getUserByEmail(email)
    // const isPasswordValid = await comparePassword(password, user.hashedPassword)
    // if (!isPasswordValid) {
    //   return c.json({ success: false, message: 'Email atau password salah' }, 401)
    // }

    return c.json({
      success: true,
      message: 'Login berhasil',
      token: 'mock-jwt-token',
      user: {
        email,
        name: 'User Name',
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json(
      { success: false, message: 'Login gagal' },
      500
    )
  }
})

// Forgot Password
app.post('/api/auth/forgot-password',
  advancedRateLimit({ windowMs: 60 * 1000, maxRequests: 20 }), // 20 per minute (increased for testing)
  validateInput({
    email: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
  }),
  async (c) => {
  try {
    const { email } = await c.req.json()

    if (!email) {
      return c.json(
        { success: false, message: 'Email harus diisi' },
        400
      )
    }

    // Generate OTP
    const otp = generateOTP()
    const expires = Date.now() + 10 * 60 * 1000 // 10 minutes

    // Store OTP for password reset
    otpStorage.set(`reset_${email}`, {
      otp,
      expires
    })

    // Send OTP email
    const emailSent = await sendEmail({
      to: email,
      subject: 'Kode OTP Reset Password DanaMasjid',
      html: getOTPEmailHTML(otp, 'reset password'),
      resendApiKey: c.env.RESEND_API_KEY
    })

    if (!emailSent) {
      return c.json(
        { success: false, message: 'Gagal mengirim OTP ke email' },
        500
      )
    }

    console.log(`Password reset OTP sent to: ${email}`)

    return c.json({
      success: true,
      message: 'OTP berhasil dikirim ke email Anda',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return c.json(
      { success: false, message: 'Gagal mengirim OTP' },
      500
    )
  }
})

// Verify Reset OTP
app.post('/api/auth/verify-reset-otp', async (c) => {
  try {
    const { email, otp } = await c.req.json()

    if (!email || !otp) {
      return c.json(
        { success: false, message: 'Email dan OTP harus diisi' },
        400
      )
    }

    // Verify OTP
    const stored = otpStorage.get(`reset_${email}`)
    
    if (!stored) {
      return c.json(
        { success: false, message: 'OTP tidak ditemukan atau sudah kadaluarsa' },
        400
      )
    }

    if (stored.expires < Date.now()) {
      otpStorage.delete(`reset_${email}`)
      return c.json(
        { success: false, message: 'OTP sudah kadaluarsa' },
        400
      )
    }

    if (stored.otp !== otp) {
      return c.json(
        { success: false, message: 'Kode OTP tidak valid' },
        400
      )
    }

    console.log(`Reset OTP verified for: ${email}`)

    return c.json({
      success: true,
      message: 'OTP berhasil diverifikasi',
    })
  } catch (error) {
    console.error('Verify reset OTP error:', error)
    return c.json(
      { success: false, message: 'Kode OTP tidak valid' },
      500
    )
  }
})

// Reset Password
app.post('/api/auth/reset-password', async (c) => {
  try {
    const { email, otp, password } = await c.req.json()

    if (!email || !otp || !password) {
      return c.json(
        { success: false, message: 'Semua field harus diisi' },
        400
      )
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      return c.json(
        { success: false, message: passwordValidation.message },
        400
      )
    }

    // Verify OTP one more time before reset
    const stored = otpStorage.get(`reset_${email}`)
    if (!stored || stored.otp !== otp || stored.expires < Date.now()) {
      return c.json(
        { success: false, message: 'OTP tidak valid atau sudah kadaluarsa' },
        400
      )
    }

    // Hash new password using bcrypt
    const hashedPassword = await hashPassword(password)
    console.log(`Password hashed successfully for reset: ${email}`)

    // Clear OTP after successful reset
    otpStorage.delete(`reset_${email}`)

    // TODO: Update password in database with hashed password
    console.log(`Password reset completed for: ${email}`)

    return c.json({
      success: true,
      message: 'Password berhasil direset',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return c.json(
      { success: false, message: 'Gagal reset password' },
      500
    )
  }
})

// ============================================
// MASJID ENDPOINTS
// ============================================

// Get all masjids
app.get('/api/masjid', async (c) => {
  try {
    // TODO: Fetch from database
    const masjids = [
      {
        id: 1,
        name: 'Masjid Al-Ikhlas',
        city: 'Jakarta',
        address: 'Jl. Sudirman No. 123',
      },
    ]

    return c.json({
      success: true,
      data: masjids,
    })
  } catch (error) {
    console.error('Get masjids error:', error)
    return c.json(
      { success: false, message: 'Failed to fetch masjids' },
      500
    )
  }
})

// Get masjid by ID
app.get('/api/masjid/:id', async (c) => {
  try {
    const id = c.req.param('id')

    // TODO: Fetch from database
    const masjid = {
      id: parseInt(id),
      name: 'Masjid Al-Ikhlas',
      city: 'Jakarta',
      address: 'Jl. Sudirman No. 123',
    }

    return c.json({
      success: true,
      data: masjid,
    })
  } catch (error) {
    console.error('Get masjid error:', error)
    return c.json(
      { success: false, message: 'Failed to fetch masjid' },
      500
    )
  }
})

// Register Masjid - Multi-step verification
app.post('/api/masjid/register',
  advancedRateLimit({ windowMs: 60 * 1000, maxRequests: 10 }), // 10 per minute (increased for testing)
  validateInput({
    mosqueName: { required: true, type: 'string', minLength: 3, maxLength: 100 },
    mosqueAddress: { required: true, type: 'string', minLength: 10, maxLength: 500 },
    province: { required: true, type: 'string' },
    city: { required: true, type: 'string' },
    district: { required: true, type: 'string' },
    subDistrict: { required: true, type: 'string' },
    postalCode: { required: true, type: 'string', pattern: /^\d{5}$/ },
    aktaPendirian: { required: true, type: 'string' },
    skKemenkumham: { required: true, type: 'string' },
    npwpMasjid: { required: true, type: 'string', pattern: /^\d{15}$/ },
    nomorRekening: { required: true, type: 'string' },
    namaBank: { required: true, type: 'string' },
    namaKetua: { required: true, type: 'string' },
    nikKetua: { required: true, type: 'string', pattern: /^\d{16}$/ },
    kontakKetua: { required: true, type: 'string' },
    namaBendahara: { required: true, type: 'string' },
    nikBendahara: { required: true, type: 'string', pattern: /^\d{16}$/ },
    kontakBendahara: { required: true, type: 'string' },
    namaSekretaris: { required: true, type: 'string' },
    nikSekretaris: { required: true, type: 'string', pattern: /^\d{16}$/ },
    kontakSekretaris: { required: true, type: 'string' },
    adminEmail: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    adminPassword: { required: true, type: 'string', minLength: 6 }
  }),
  async (c) => {
  try {
    // Get form data (multipart/form-data for file uploads)
    const formData = await c.req.parseBody()
    
    // Validate password strength
    const password = formData.adminPassword as string
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      return c.json(
        { success: false, message: passwordValidation.message },
        400
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Validate NIK uniqueness (all 3 NIKs must be different)
    const nikKetua = formData.nikKetua as string
    const nikBendahara = formData.nikBendahara as string
    const nikSekretaris = formData.nikSekretaris as string
    
    if (nikKetua === nikBendahara || nikKetua === nikSekretaris || nikBendahara === nikSekretaris) {
      return c.json(
        { success: false, message: 'NIK pengurus harus berbeda satu sama lain' },
        400
      )
    }

    // TODO: Save to database with status "pending_verification"
    // TODO: Upload files to storage (R2, S3, etc.)
    // TODO: Send notification email to admin for verification
    
    console.log(`New mosque registration: ${formData.mosqueName}`)
    console.log(`Location: ${formData.city}, ${formData.province}`)
    console.log(`Admin email: ${formData.adminEmail}`)
    console.log(`NPWP: ${formData.npwpMasjid}`)
    console.log(`Ketua: ${formData.namaKetua} (NIK: ${nikKetua})`)
    
    // Send confirmation email to admin
    await sendEmail({
      to: formData.adminEmail as string,
      subject: '🕌 Pendaftaran Masjid Berhasil - Menunggu Verifikasi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🕌 DanaMasjid</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Pendaftaran Berhasil!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Terima kasih telah mendaftarkan <strong>${formData.mosqueName}</strong> di platform DanaMasjid.
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <h3 style="color: #1f2937; margin-top: 0;">Status Pendaftaran</h3>
              <p style="color: #4b5563; margin: 10px 0;">
                <strong>Status:</strong> <span style="color: #f59e0b;">⏳ Menunggu Verifikasi</span>
              </p>
              <p style="color: #4b5563; margin: 10px 0;">
                <strong>Estimasi Waktu:</strong> 1-3 Hari Kerja
              </p>
            </div>
            <p style="color: #4b5563; line-height: 1.6;">
              Tim kami akan melakukan verifikasi dokumen dan data yang Anda kirimkan. 
              Anda akan menerima email notifikasi setelah proses verifikasi selesai.
            </p>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>⚠️ Catatan:</strong> Pastikan email Anda aktif untuk menerima notifikasi verifikasi.
              </p>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Jika ada pertanyaan, hubungi kami di support@danamasjid.com
            </p>
          </div>
        </div>
      `,
      resendApiKey: c.env.RESEND_API_KEY
    })

    return c.json({
      success: true,
      message: 'Pendaftaran berhasil! Menunggu verifikasi admin (1-3 hari kerja)',
      data: {
        mosqueName: formData.mosqueName,
        status: 'pending_verification',
        adminEmail: formData.adminEmail
      }
    })
  } catch (error) {
    console.error('Mosque registration error:', error)
    return c.json(
      { success: false, message: 'Gagal mendaftar. Silakan coba lagi.' },
      500
    )
  }
})

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      message: 'Endpoint not found',
      path: c.req.path,
    },
    404
  )
})

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json(
    {
      success: false,
      message: 'Internal server error',
      error: c.env.ENVIRONMENT === 'development' ? err.message : undefined,
    },
    500
  )
})

export default app
