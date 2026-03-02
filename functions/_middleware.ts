// Cloudflare Pages Functions Middleware
// Rate Limiting & DDoS Protection

interface Env {
  RATE_LIMITER: any;
}

// Rate limit configuration
const RATE_LIMITS = {
  '/login': { limit: 10, window: 300 }, // 10 requests per 5 minutes
  '/register': { limit: 5, window: 300 }, // 5 requests per 5 minutes
  '/api/auth': { limit: 20, window: 60 }, // 20 requests per minute
  default: { limit: 100, window: 60 }, // 100 requests per minute
};

// Simple in-memory rate limiter (for demo, use KV in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimit(pathname: string) {
  for (const [path, config] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(path)) {
      return config;
    }
  }
  return RATE_LIMITS.default;
}

function checkRateLimit(ip: string, pathname: string): { allowed: boolean; retryAfter?: number } {
  const config = getRateLimit(pathname);
  const key = `${ip}:${pathname}`;
  const now = Date.now();
  
  // Clean up old entries
  for (const [k, v] of rateLimitStore.entries()) {
    if (now > v.resetTime) {
      rateLimitStore.delete(k);
    }
  }
  
  let entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    entry = { count: 0, resetTime: now + config.window * 1000 };
    rateLimitStore.set(key, entry);
  }
  
  entry.count++;
  
  if (entry.count > config.limit) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000)
    };
  }
  
  return { allowed: true };
}

export async function onRequest(context: any) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  
  // Security headers
  const securityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  };
  
  // Rate limiting
  const rateCheck = checkRateLimit(ip, url.pathname);
  
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
        retryAfter: rateCheck.retryAfter
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rateCheck.retryAfter),
          ...securityHeaders
        }
      }
    );
  }
  
  // DDoS protection: Block suspicious patterns
  const userAgent = request.headers.get('User-Agent') || '';
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
  ];
  
  // Allow legitimate bots (Google, Bing, etc.)
  const legitimateBots = [
    /googlebot/i,
    /bingbot/i,
    /slurp/i, // Yahoo
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  const isLegitimate = legitimateBots.some(pattern => pattern.test(userAgent));
  
  if (isSuspicious && !isLegitimate) {
    // Challenge suspicious requests
    return new Response('Access Denied', {
      status: 403,
      headers: securityHeaders
    });
  }
  
  // Continue to next middleware/handler
  const response = await next();
  
  // Add security headers to response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', String(getRateLimit(url.pathname).limit));
  response.headers.set('X-RateLimit-Remaining', String(Math.max(0, getRateLimit(url.pathname).limit - (rateLimitStore.get(`${ip}:${url.pathname}`)?.count || 0))));
  
  return response;
}
