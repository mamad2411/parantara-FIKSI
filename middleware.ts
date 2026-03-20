import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authMiddleware, redirectToLogin } from 'next-firebase-auth-edge'
import { authEdgeConfig } from '@/lib/firebase-auth-edge'

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100

const requestCounts = new Map<string, { count: number; resetTime: number }>()

const SUSPICIOUS_PATTERNS = [
  /\.\./g,
  /<script/gi,
  /union.*select/gi,
  /javascript:/gi,
  /on\w+=/gi,
]

const BOT_PATTERNS = [/bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i, /python/i, /java/i]

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip')
  return forwarded?.split(',')[0] || realIP || cfIP || 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = requestCounts.get(ip)
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }
  record.count++
  return record.count > MAX_REQUESTS_PER_WINDOW
}

function isSuspiciousRequest(request: NextRequest): boolean {
  const url = request.url
  const userAgent = request.headers.get('user-agent') || ''
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(url)) return true
  }
  const isLegitimateBot = /googlebot|bingbot|slurp|duckduckbot/i.test(userAgent)
  if (!isLegitimateBot) {
    for (const pattern of BOT_PATTERNS) {
      if (pattern.test(userAgent)) return true
    }
  }
  if (!userAgent || userAgent.length < 10) return true
  return false
}

// Routes that require authentication (verified via Firebase ID token)
// NOTE: /daftar-masjid is intentionally NOT here — protected client-side
// because Firebase auth state lives in browser, not server cookies on first visit
const PROTECTED_PATHS = ['/menunggu', '/dashboard']

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  return response
}

export async function middleware(request: NextRequest) {
  const ip = getClientIP(request)
  const pathname = request.nextUrl.pathname

  // Skip for static files, API routes, Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Security checks first
  if (isSuspiciousRequest(request)) {
    console.warn(`[Security] Suspicious request blocked from IP: ${ip}`)
    return new NextResponse('Forbidden', { status: 403 })
  }

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

  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p))
  const isDaftarMasjid = pathname.startsWith('/daftar-masjid')

  // /daftar-masjid: only redirect if already submitted (mosque_registered cookie)
  // Auth check is handled client-side — Firebase auth lives in browser localStorage
  if (isDaftarMasjid) {
    const mosqueRegistered = request.cookies.get('mosque_registered')?.value
    if (mosqueRegistered === 'true') {
      return NextResponse.redirect(new URL('/menunggu', request.url))
    }
    return addSecurityHeaders(NextResponse.next())
  }

  if (isProtected) {
    // Use next-firebase-auth-edge to verify the session cookie properly
    return authMiddleware(request, {
      ...authEdgeConfig,
      loginPath: '/api/auth/session',
      logoutPath: '/api/auth/session',
      handleValidToken: async (_tokens, headers) => {
        // Token valid — check extra conditions per route
        const response = NextResponse.next({ request: { headers } })

        // /menunggu: must have mosque_registered cookie
        if (pathname === '/menunggu') {
          const mosqueRegistered = request.cookies.get('mosque_registered')?.value
          if (mosqueRegistered !== 'true') {
            return NextResponse.redirect(new URL('/daftar-masjid', request.url))
          }
        }

        // /daftar-masjid: already submitted → go to waiting
        if (pathname.startsWith('/daftar-masjid')) {
          const mosqueRegistered = request.cookies.get('mosque_registered')?.value
          if (mosqueRegistered === 'true') {
            return NextResponse.redirect(new URL('/menunggu', request.url))
          }
        }

        return addSecurityHeaders(response)
      },
      handleInvalidToken: async (reason) => {
        console.log(`[Auth] Invalid token on ${pathname}: ${reason}`)
        
        // Fallback: if legacy auth_token cookie exists, allow through
        // Client-side will refresh the proper session cookie
        const legacyToken = request.cookies.get('auth_token')?.value
        if (legacyToken) {
          console.log(`[Auth] Falling back to legacy auth_token for ${pathname}`)
          const response = NextResponse.next()
          return addSecurityHeaders(response)
        }

        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        if (pathname.startsWith('/daftar-masjid')) {
          loginUrl.searchParams.set('message', 'Harus login terlebih dahulu untuk mendaftar masjid')
          loginUrl.searchParams.set('type', 'daftar-masjid')
        }
        return NextResponse.redirect(loginUrl)
      },
      handleError: async (error) => {
        console.error(`[Auth] Middleware error on ${pathname}:`, error)
        // On error, allow through — client-side guard will handle it
        return NextResponse.next()
      },
    })
  }

  return addSecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
