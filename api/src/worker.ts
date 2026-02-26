import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { sendEmail, generateOTP, getOTPEmailHTML, getWelcomeEmailHTML, getSubscribeWelcomeEmailHTML } from './utils/emailWorker'
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

// Rate limiting - 100 requests per minute
app.use('*', advancedRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100
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
  advancedRateLimit({ windowMs: 60 * 1000, maxRequests: 5 }), // 5 per minute
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
  advancedRateLimit({ windowMs: 60 * 1000, maxRequests: 3 }), // 3 per minute
  validateInput({
    email: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
    phone: { required: true, type: 'string', minLength: 10, maxLength: 15 }
  }),
  async (c) => {
  try {
    const { email, name, phone } = await c.req.json()

    if (!email || !name || !phone) {
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
      data: { name, phone }
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
    console.log(`OTP CODE: ${otp}`) // Log OTP for development

    return c.json({
      success: true,
      message: 'OTP berhasil dikirim ke email Anda',
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
    const { name, email, phone, password, mosqueName, mosqueAddress, mosqueCity } = await c.req.json()

    if (!name || !email || !phone || !password) {
      return c.json(
        { success: false, message: 'Semua field harus diisi' },
        400
      )
    }

    if (password.length < 6) {
      return c.json(
        { success: false, message: 'Password minimal 6 karakter' },
        400
      )
    }

    // Clear OTP after successful registration
    otpStorage.delete(email)

    // Send welcome email
    await sendEmail({
      to: email,
      subject: '🕌 Selamat Datang di DanaMasjid',
      html: getWelcomeEmailHTML(name),
      resendApiKey: c.env.RESEND_API_KEY
    })

    // TODO: Save user and mosque to database
    console.log(`Registration completed for: ${email}`)

    return c.json({
      success: true,
      message: 'Registrasi berhasil',
      user: {
        email,
        name,
        phone,
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
  advancedRateLimit({ windowMs: 60 * 1000, maxRequests: 5 }), // 5 per minute
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
        { success: false, message: 'Email and password are required' },
        400
      )
    }

    // TODO: Implement authentication with database
    // For now, return mock response
    console.log(`Login attempt: ${email}`)

    return c.json({
      success: true,
      message: 'Login successful',
      token: 'mock-jwt-token',
      user: {
        email,
        name: 'User Name',
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json(
      { success: false, message: 'Login failed' },
      500
    )
  }
})

// Forgot Password
app.post('/api/auth/forgot-password',
  advancedRateLimit({ windowMs: 60 * 1000, maxRequests: 3 }), // 3 per minute
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

    if (password.length < 6) {
      return c.json(
        { success: false, message: 'Password minimal 6 karakter' },
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

    // Clear OTP after successful reset
    otpStorage.delete(`reset_${email}`)

    // TODO: Update password in database
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
