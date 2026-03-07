import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting store (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Generate CSP nonce for inline scripts
function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Buffer.from(array).toString('base64')
}

// Security middleware with advanced protection
export function middleware(request: NextRequest) {
  const nonce = generateNonce()
  const response = NextResponse.next()
  
  // Set nonce in request headers for use in pages
  response.headers.set('x-nonce', nonce)
  
  // Get client IP (fallback to x-forwarded-for header)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  // Rate Limiting (100 requests per minute per IP)
  const now = Date.now()
  const rateLimitWindow = 60000 // 1 minute
  const maxRequests = 100
  
  const clientData = rateLimitMap.get(ip)
  
  if (clientData) {
    if (now < clientData.resetTime) {
      if (clientData.count >= maxRequests) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((clientData.resetTime - now) / 1000)),
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(clientData.resetTime),
          },
        })
      }
      clientData.count++
    } else {
      // Reset window
      rateLimitMap.set(ip, { count: 1, resetTime: now + rateLimitWindow })
    }
  } else {
    rateLimitMap.set(ip, { count: 1, resetTime: now + rateLimitWindow })
  }
  
  // Clean up old entries (every 100 requests)
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime + rateLimitWindow) {
        rateLimitMap.delete(key)
      }
    }
  }
  
  // Add rate limit headers
  const currentData = rateLimitMap.get(ip)!
  response.headers.set('X-RateLimit-Limit', String(maxRequests))
  response.headers.set('X-RateLimit-Remaining', String(maxRequests - currentData.count))
  response.headers.set('X-RateLimit-Reset', String(currentData.resetTime))
  
  // Additional Security Headers (complementing next.config.mjs)
  response.headers.set('X-Request-ID', crypto.randomUUID())
  response.headers.set('X-Robots-Tag', 'index, follow')
  
  // Prevent information disclosure
  response.headers.delete('X-Powered-By')
  response.headers.delete('Server')
  
  // Add timing information for monitoring
  response.headers.set('X-Response-Time', String(Date.now() - now))
  
  // COOP relaxed for GTM but still secure
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
  response.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none')
  response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin')
  
  // Stricter CSP with nonce and Trusted Types
  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://maps.googleapis.com https://apis.google.com https://accounts.google.com https://ssl.gstatic.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com https://tagmanager.google.com",
    "img-src 'self' data: blob: https: *",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.workers.dev https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://*.firebaseio.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://www.googletagmanager.com https://www.emsifa.com wss://ws-us3.pusher.com wss://*.pusher.com",
    "frame-src 'self' https://www.google.com https://www.recaptcha.net https://recaptcha.net https://*.firebaseapp.com https://accounts.google.com https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "manifest-src 'self'",
    "media-src 'self' blob: data:",
    "require-trusted-types-for 'script'",
    "trusted-types 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', cspHeader)
  
  // Security headers for specific paths
  const pathname = request.nextUrl.pathname
  
  // API routes - stricter security
  if (pathname.startsWith('/api/')) {
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }
  
  // Static assets - aggressive caching
  if (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/vidio/') ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf|eot)$/)
  ) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }
  
  // Prevent clickjacking on auth pages
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    response.headers.set('X-Frame-Options', 'DENY')
  }
  
  return response
}

// Configure which routes to run middleware on
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
