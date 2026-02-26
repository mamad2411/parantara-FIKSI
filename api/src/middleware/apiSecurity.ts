import { Context, Next } from 'hono'

// Rate limiting storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// IP blacklist storage
const blacklistedIPs = new Set<string>()

// Request signature validation
const requestSignatures = new Map<string, number>()

/**
 * Advanced Rate Limiting Middleware
 * Protects API from abuse with configurable limits
 */
export const advancedRateLimit = (options: {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
}) => {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'
    
    // Check if IP is blacklisted
    if (blacklistedIPs.has(ip)) {
      return c.json({ success: false, message: 'Access denied' }, 403)
    }

    const now = Date.now()
    const key = `ratelimit:${ip}`
    
    let record = rateLimitStore.get(key)
    
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + options.windowMs
      }
    }
    
    record.count++
    rateLimitStore.set(key, record)
    
    // Auto-blacklist if excessive requests
    if (record.count > options.maxRequests * 3) {
      blacklistedIPs.add(ip)
      console.warn(`IP ${ip} has been blacklisted for excessive requests`)
      return c.json({ success: false, message: 'Too many requests. Access temporarily blocked.' }, 429)
    }
    
    if (record.count > options.maxRequests) {
      return c.json({ 
        success: false, 
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      }, 429)
    }
    
    // Set rate limit headers
    c.header('X-RateLimit-Limit', options.maxRequests.toString())
    c.header('X-RateLimit-Remaining', (options.maxRequests - record.count).toString())
    c.header('X-RateLimit-Reset', new Date(record.resetTime).toISOString())
    
    await next()
  }
}

/**
 * SQL Injection Protection
 * Validates and sanitizes input to prevent SQL injection
 */
export const sqlInjectionProtection = () => {
  return async (c: Context, next: Next) => {
    const body = await c.req.json().catch(() => ({}))
    
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
      /(--|;|\/\*|\*\/|xp_|sp_)/gi,
      /('|(\\')|(;)|(\-\-)|(\/\*))/gi
    ]
    
    const checkValue = (value: any): boolean => {
      if (typeof value === 'string') {
        return sqlPatterns.some(pattern => pattern.test(value))
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => checkValue(v))
      }
      return false
    }
    
    if (checkValue(body)) {
      console.warn('SQL injection attempt detected:', { ip: c.req.header('cf-connecting-ip'), body })
      return c.json({ success: false, message: 'Invalid input detected' }, 400)
    }
    
    await next()
  }
}

/**
 * XSS Protection
 * Sanitizes input to prevent cross-site scripting attacks
 */
export const xssProtection = () => {
  return async (c: Context, next: Next) => {
    const body = await c.req.json().catch(() => ({}))
    
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi
    ]
    
    const checkValue = (value: any): boolean => {
      if (typeof value === 'string') {
        return xssPatterns.some(pattern => pattern.test(value))
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => checkValue(v))
      }
      return false
    }
    
    if (checkValue(body)) {
      console.warn('XSS attempt detected:', { ip: c.req.header('cf-connecting-ip'), body })
      return c.json({ success: false, message: 'Invalid input detected' }, 400)
    }
    
    await next()
  }
}

/**
 * Request Signature Validation
 * Prevents replay attacks
 */
export const replayAttackProtection = () => {
  return async (c: Context, next: Next) => {
    const timestamp = c.req.header('x-timestamp')
    const signature = c.req.header('x-signature')
    
    if (!timestamp) {
      await next()
      return
    }
    
    const requestTime = parseInt(timestamp)
    const now = Date.now()
    
    // Request must be within 5 minutes
    if (Math.abs(now - requestTime) > 5 * 60 * 1000) {
      return c.json({ success: false, message: 'Request expired' }, 401)
    }
    
    // Check for duplicate signatures (replay attack)
    if (signature && requestSignatures.has(signature)) {
      console.warn('Replay attack detected:', { ip: c.req.header('cf-connecting-ip'), signature })
      return c.json({ success: false, message: 'Duplicate request detected' }, 401)
    }
    
    if (signature) {
      requestSignatures.set(signature, now)
      
      // Clean old signatures (older than 10 minutes)
      for (const [sig, time] of requestSignatures.entries()) {
        if (now - time > 10 * 60 * 1000) {
          requestSignatures.delete(sig)
        }
      }
    }
    
    await next()
  }
}

/**
 * Input Validation Middleware
 * Validates request body against schema
 */
export const validateInput = (schema: Record<string, any>) => {
  return async (c: Context, next: Next) => {
    const body = await c.req.json().catch(() => ({}))
    
    for (const [key, rules] of Object.entries(schema)) {
      const value = body[key]
      
      // Required check
      if (rules.required && !value) {
        return c.json({ success: false, message: `${key} is required` }, 400)
      }
      
      // Type check
      if (value && rules.type && typeof value !== rules.type) {
        return c.json({ success: false, message: `${key} must be ${rules.type}` }, 400)
      }
      
      // Min length check
      if (value && rules.minLength && value.length < rules.minLength) {
        return c.json({ success: false, message: `${key} must be at least ${rules.minLength} characters` }, 400)
      }
      
      // Max length check
      if (value && rules.maxLength && value.length > rules.maxLength) {
        return c.json({ success: false, message: `${key} must be at most ${rules.maxLength} characters` }, 400)
      }
      
      // Pattern check
      if (value && rules.pattern && !rules.pattern.test(value)) {
        return c.json({ success: false, message: `${key} format is invalid` }, 400)
      }
    }
    
    await next()
  }
}

/**
 * CORS Security Headers
 * Adds additional security headers to responses
 */
export const securityHeaders = () => {
  return async (c: Context, next: Next) => {
    await next()
    
    // Security headers
    c.header('X-Content-Type-Options', 'nosniff')
    c.header('X-Frame-Options', 'DENY')
    c.header('X-XSS-Protection', '1; mode=block')
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
    c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  }
}

/**
 * Database Query Protection
 * Wraps database queries with additional security
 */
export const protectDatabaseQuery = async (
  query: () => Promise<any>,
  options: { timeout?: number; maxRetries?: number } = {}
) => {
  const timeout = options.timeout || 5000
  const maxRetries = options.maxRetries || 3
  
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await Promise.race([
        query(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), timeout)
        )
      ])
      return result
    } catch (error) {
      lastError = error as Error
      console.error(`Database query attempt ${attempt + 1} failed:`, error)
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }
  
  throw lastError || new Error('Database query failed')
}

/**
 * Clean up function for rate limit store
 * Should be called periodically
 */
export const cleanupRateLimitStore = () => {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Note: Cleanup should be triggered by scheduled events in Cloudflare Workers
// Add this to wrangler.toml:
// [triggers]
// crons = ["*/5 * * * *"]  # Every 5 minutes
