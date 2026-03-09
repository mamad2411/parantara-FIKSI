import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100 // Max 100 requests per minute per IP

// In-memory store (use Redis in production for distributed systems)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

// Suspicious patterns
const SUSPICIOUS_PATTERNS = [
  /\.\./g, // Path traversal
  /<script/gi, // XSS attempts
  /union.*select/gi, // SQL injection
  /javascript:/gi, // XSS
  /on\w+=/gi, // Event handlers
]

// Bot user agents (common DDoS bots)
const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python/i,
  /java/i,
]

function getClientIP(request: NextRequest): string {
  // Get real IP from various headers (Vercel provides these)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip') // Cloudflare
  
  return forwarded?.split(',')[0] || realIP || cfIP || 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = requestCounts.get(ip)

  if (!record || now > record.resetTime) {
    // New window
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    })
    return false
  }

  record.count++

  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    return true
  }

  return false
}

function isSuspiciousRequest(request: NextRequest): boolean {
  const url = request.url
  const userAgent = request.headers.get('user-agent') || ''

  // Check for suspicious patterns in URL
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(url)) {
      return true
    }
  }

  // Check for bot user agents (allow legitimate bots)
  const isLegitimateBot = /googlebot|bingbot|slurp|duckduckbot/i.test(userAgent)
  if (!isLegitimateBot) {
    for (const pattern of BOT_PATTERNS) {
      if (pattern.test(userAgent)) {
        return true
      }
    }
  }

  // Check for missing or suspicious user agent
  if (!userAgent || userAgent.length < 10) {
    return true
  }

  return false
}

function cleanupOldRecords() {
  const now = Date.now()
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(ip)
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupOldRecords, 5 * 60 * 1000)

export function middleware(request: NextRequest) {
  const ip = getClientIP(request)
  const pathname = request.nextUrl.pathname

  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard'] // '/jamaah' temporarily removed for preview
  const authRoutes = ['/login', '/register']
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  const isDaftarMasjid = pathname.startsWith('/daftar-masjid')
  
  // Get auth token from cookies
  const authToken = request.cookies.get('auth_token')?.value
  const sessionStart = request.cookies.get('daftar_masjid_session')?.value
  const isAuthenticated = !!authToken
  
  // Check session timeout for daftar-masjid (1 hour)
  if (isDaftarMasjid && isAuthenticated) {
    if (sessionStart) {
      const sessionStartTime = parseInt(sessionStart)
      const now = Date.now()
      const sessionDuration = now - sessionStartTime
      
      // If session is older than 1 hour (3600000 ms), redirect to login
      if (sessionDuration > 60 * 60 * 1000) {
        const response = NextResponse.redirect(new URL('/login', request.url))
        // Clear the session cookie
        response.cookies.delete('daftar_masjid_session')
        return response
      }
    } else {
      // Set session start time if not exists
      const response = NextResponse.next()
      response.cookies.set('daftar_masjid_session', Date.now().toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60, // 1 hour
        path: '/daftar-masjid'
      })
      return response
    }
  }
  
  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    loginUrl.searchParams.set('message', 'mari kita realisasikan tranparansi untuk umat')
    return NextResponse.redirect(loginUrl)
  }
  
  // Allow authenticated users to access auth routes (login/register)
  // No auto-redirect to daftar-masjid
  
  // Require authentication for daftar-masjid
  if (isDaftarMasjid && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check for suspicious requests
  if (isSuspiciousRequest(request)) {
    console.warn(`[Security] Suspicious request blocked from IP: ${ip}`)
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Rate limiting
  if (isRateLimited(ip)) {
    console.warn(`[Security] Rate limit exceeded for IP: ${ip}`)
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(Date.now() + RATE_LIMIT_WINDOW).toISOString(),
      },
    })
  }

  // Add security headers
  const response = NextResponse.next()
  
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}