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
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isDaftarMasjid = pathname.startsWith('/daftar-masjid')
  const isMenunggu = pathname === '/menunggu'
  
  // Get auth token from cookies
  const authToken = request.cookies.get('auth_token')?.value
  const isAuthenticated = !!authToken
  
  // GUARD: /menunggu hanya bisa diakses setelah submit daftar masjid
  if (isMenunggu) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', '/menunggu')
      return NextResponse.redirect(loginUrl)
    }
    const mosqueRegistered = request.cookies.get('mosque_registered')?.value
    if (mosqueRegistered !== 'true') {
      return NextResponse.redirect(new URL('/daftar-masjid', request.url))
    }
    return NextResponse.next()
  }

  // STRICT PROTECTION FOR DAFTAR-MASJID ROUTE
  if (isDaftarMasjid) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      loginUrl.searchParams.set('message', 'Harus login terlebih dahulu untuk mendaftar masjid')
      loginUrl.searchParams.set('type', 'daftar-masjid')
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('daftar_masjid_session')
      response.cookies.delete('daftar_masjid_progress')
      response.cookies.delete('daftar_masjid_data')
      response.cookies.delete('daftar_masjid_started_at')
      return response
    }

    // Already submitted — redirect to waiting page
    const mosqueRegistered = request.cookies.get('mosque_registered')?.value
    if (mosqueRegistered === 'true') {
      return NextResponse.redirect(new URL('/menunggu', request.url))
    }

    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
    const startedAt = request.cookies.get('daftar_masjid_started_at')?.value
    const now = Date.now()

    if (startedAt && now - parseInt(startedAt, 10) > SEVEN_DAYS_MS) {
      // Form idle > 7 days — treat as unrecognized device, force re-login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('type', 'device-unrecognized')
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('daftar_masjid_started_at')
      response.cookies.delete('daftar_masjid_session')
      response.cookies.delete('daftar_masjid_progress')
      response.cookies.delete('daftar_masjid_data')
      response.cookies.delete('auth_token')
      return response
    }

    const response = NextResponse.next()
    if (!startedAt) {
      // First visit — stamp the start time
      response.cookies.set('daftar_masjid_started_at', String(now), {
        path: '/',
        maxAge: 8 * 24 * 60 * 60,
        sameSite: 'strict',
        httpOnly: true,
      })
    }
    response.headers.set('X-Daftar-Masjid-Protected', 'true')
    return response
  }
  
  // Redirect to login if accessing other protected routes without auth
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    loginUrl.searchParams.set('message', 'mari kita realisasikan tranparansi untuk umat')
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