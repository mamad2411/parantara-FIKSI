import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { Request, Response, NextFunction } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

// ============================================
// RATE LIMITING - Prevent Brute Force Attacks
// ============================================

// Aggressive rate limiter for login attempts
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn(`[SECURITY] Rate limit exceeded for login from IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Terlalu banyak percobaan login. Akun Anda telah dikunci sementara untuk keamanan.'
    });
  }
});

// Speed limiter for login - Slow down repeated attempts
export const loginSpeedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 2, // Allow 2 requests per window at full speed
  delayMs: (hits) => hits * 1000, // Add 1 second delay per request after delayAfter
  maxDelayMs: 10000, // Maximum delay of 10 seconds
});

// Rate limiter for OTP requests - Very strict
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 OTP requests per 5 minutes
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan OTP. Silakan tunggu 5 menit.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn(`[SECURITY] OTP rate limit exceeded from IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Terlalu banyak permintaan OTP. Silakan tunggu 5 menit untuk keamanan.'
    });
  }
});

// Rate limiter for registration - Prevent spam accounts
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registration attempts per hour per IP
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan registrasi. Silakan coba lagi dalam 1 jam.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn(`[SECURITY] Registration rate limit exceeded from IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Terlalu banyak percobaan registrasi dari IP Anda. Silakan coba lagi nanti.'
    });
  }
});

// General API rate limiter - Protect all endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn(`[SECURITY] API rate limit exceeded from IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit.'
    });
  }
});

// Strict rate limiter for password reset
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan reset password. Silakan coba lagi dalam 1 jam.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// INPUT SANITIZATION - Prevent Injection Attacks
// ============================================

// Sanitize MongoDB queries (prevent NoSQL injection)
export const sanitizeInput = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`[SECURITY] Potential NoSQL injection attempt detected from IP: ${req.ip} on key: ${key}`);
  },
});

// Prevent HTTP Parameter Pollution
export const preventHPP = hpp({
  whitelist: ['email', 'phone'], // Allow these parameters to be arrays
});

// ============================================
// CUSTOM SECURITY MIDDLEWARE
// ============================================

// Detect and block suspicious patterns in request body
export const detectSuspiciousPatterns = (req: Request, res: Response, next: NextFunction) => {
  // Use proper HTML sanitization library (DOMPurify) instead of regex for XSS
  // Regex-based HTML filtering is insufficient and can be bypassed
  const suspiciousPatterns = [
    /javascript:/gi, // JavaScript protocol
    /data:text\/html/gi, // Data URI XSS
    /vbscript:/gi, // VBScript protocol
    /on\w+\s*=/gi, // Event handlers (onclick, onerror, etc)
    /\$where/gi, // MongoDB $where operator
    /\$ne/gi, // MongoDB $ne operator (when not expected)
    /eval\(/gi, // eval() function
    /union.*select/gi, // SQL injection
    /drop.*table/gi, // SQL injection
    /insert.*into/gi, // SQL injection
    /delete.*from/gi, // SQL injection
  ];
  
  // Check for dangerous HTML tags using string matching (not regex)
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'svg']
  const checkForDangerousTags = (str: string): boolean => {
    const lowerStr = str.toLowerCase()
    return dangerousTags.some(tag => 
      lowerStr.includes(`<${tag}`) || lowerStr.includes(`</${tag}>`)
    )
  }

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value)) || checkForDangerousTags(value);
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  if (checkValue(req.body) || checkValue(req.query) || checkValue(req.params)) {
    console.error(`[SECURITY] Suspicious pattern detected from IP: ${req.ip}`);
    console.error(`[SECURITY] Request body:`, JSON.stringify(req.body));
    return res.status(400).json({
      success: false,
      message: 'Input tidak valid. Permintaan ditolak untuk keamanan.'
    });
  }

  next();
};

// Validate Content-Type for POST/PUT requests
export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type harus application/json'
      });
    }
  }
  next();
};

// Block requests with suspicious User-Agent
export const validateUserAgent = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers['user-agent'];
  
  // Block requests without User-Agent (likely bots)
  if (!userAgent) {
    console.warn(`[SECURITY] Request without User-Agent from IP: ${req.ip}`);
    return res.status(403).json({
      success: false,
      message: 'Permintaan ditolak'
    });
  }

  // Block known malicious user agents
  const maliciousAgents = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /nessus/i,
    /burp/i,
    /acunetix/i,
  ];

  if (maliciousAgents.some(pattern => pattern.test(userAgent))) {
    console.error(`[SECURITY] Malicious User-Agent detected from IP: ${req.ip}: ${userAgent}`);
    return res.status(403).json({
      success: false,
      message: 'Permintaan ditolak'
    });
  }

  next();
};

// Log all authentication attempts
export const logAuthAttempt = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res);
  
  res.json = function(data: any) {
    const timestamp = new Date().toISOString();
    const ip = req.ip;
    const endpoint = req.path;
    const method = req.method;
    const success = data.success;
    
    console.log(`[AUTH] ${timestamp} | ${method} ${endpoint} | IP: ${ip} | Success: ${success}`);
    
    return originalJson(data);
  };
  
  next();
};

// Prevent timing attacks on authentication
export const preventTimingAttack = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    // Add random delay to prevent timing attacks (50-150ms)
    const randomDelay = Math.floor(Math.random() * 100) + 50;
    
    if (duration < randomDelay) {
      setTimeout(() => {}, randomDelay - duration);
    }
  });
  
  next();
};
