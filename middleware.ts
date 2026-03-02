import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting store (in-memory for demo, use Redis/KV in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limit configuration
const RATE_LIMITS = {
  '/login': { limit: 10, window: 300000 }, // 10 requests per 5 minutes
  '/register': { limit: 5, window: 300000 }, // 5 requests per 5 minutes
  '/forgot-password': { limit: 3, window: 600000 }, // 3 requests per 10 minutes
  '/api': { limit: 100, window: 60000 }, // 100 requests per minute
  default: { limit: 200, window: 60000 }, // 200 requests per minute
}

function getRateLimit(pathname: string) {
  for (const [path, config] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(path)) {
      return config
    }
  }
  return RATE_LIMITS.default
}

function checkRateLimit(ip: string, pathname: string): { allowed: boolean; retryAfter?: number } {
  const config = getRateLimit(pathname)
  const key = `${ip}:${pathname}`
  const now = Date.now()
  
  // Clean up old entries
  for (const [k, v] of rateLimitStore.entries()) {
    if (now > v.resetTime) {
      rateLimitStore.delete(k)
    }
  }
  
  let entry = rateLimitStore.get(key)
  
  if (!entry || now > entry.resetTime) {
    entry = { count: 0, resetTime: now + config.window }
    rateLimitStore.set(key, entry)
  }
  
  entry.count++
  
  if (entry.count > config.limit) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000)
    }
  }
  
  return { allowed: true }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/vidio') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }
  
  // Get client IP (Vercel provides this via headers)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  // Rate limiting
  const rateCheck = checkRateLimit(ip, pathname)
  
  if (!rateCheck.allowed) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
        retryAfter: rateCheck.retryAfter
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rateCheck.retryAfter),
          'X-RateLimit-Limit': String(getRateLimit(pathname).limit),
          'X-RateLimit-Remaining': '0',
        }
      }
    )
  }
  
  // Security headers
  const response = NextResponse.next()
  
  // Add security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Add rate limit headers
  const config = getRateLimit(pathname)
  const entry = rateLimitStore.get(`${ip}:${pathname}`)
  response.headers.set('X-RateLimit-Limit', String(config.limit))
  response.headers.set('X-RateLimit-Remaining', String(Math.max(0, config.limit - (entry?.count || 0))))
  
  // Bot detection
  const userAgent = request.headers.get('user-agent') || ''
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
  ]
  
  const legitimateBots = [
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
  ]
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent))
  const isLegitimate = legitimateBots.some(pattern => pattern.test(userAgent))
  
  if (isSuspicious && !isLegitimate && !pathname.startsWith('/api')) {
    return new NextResponse('Access Denied', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
      }
    })
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
