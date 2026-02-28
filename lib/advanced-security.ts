/**
 * Advanced Security Utilities
 * Protection against XSS, CSRF, Clickjacking, and other attacks
 */

/**
 * DOMPurify-like sanitization for HTML content
 */
export function sanitizeHTML(html: string): string {
  if (!html) return ''
  
  // Remove script tags and their content
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove event handlers
  clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  clean = clean.replace(/on\w+\s*=\s*[^\s>]*/gi, '')
  
  // Remove javascript: protocol
  clean = clean.replace(/javascript:/gi, '')
  
  // Remove data: protocol (can be used for XSS)
  clean = clean.replace(/data:text\/html/gi, '')
  
  // Remove vbscript: protocol
  clean = clean.replace(/vbscript:/gi, '')
  
  // Remove iframe tags
  clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
  
  // Remove object and embed tags
  clean = clean.replace(/<(object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '')
  
  return clean
}

/**
 * Prevent clickjacking by checking if page is in iframe
 */
export function preventClickjacking(): void {
  if (typeof window === 'undefined') return
  
  try {
    if (window.self !== window.top) {
      // Page is in an iframe
      window.top!.location.href = window.self.location.href
    }
  } catch (e) {
    // If we can't access window.top, we're in a cross-origin iframe
    // Force break out
    document.body.innerHTML = ''
    window.location.href = 'about:blank'
  }
}

/**
 * Secure cookie settings
 */
export function setSecureCookie(
  name: string,
  value: string,
  days: number = 7
): void {
  if (typeof document === 'undefined') return
  
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  const sameSite = '; SameSite=Strict'
  const httpOnly = '' // Can't set HttpOnly from client-side
  
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/${secure}${sameSite}`
}

/**
 * Get cookie value securely
 */
export function getSecureCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  
  return null
}

/**
 * Delete cookie securely
 */
export function deleteSecureCookie(name: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

/**
 * Validate and sanitize URL to prevent open redirect
 */
export function sanitizeURL(url: string): string {
  if (!url) return '/'
  
  try {
    const parsed = new URL(url, window.location.origin)
    
    // Only allow same origin URLs
    if (parsed.origin !== window.location.origin) {
      return '/'
    }
    
    // Block javascript: and data: protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '/'
    }
    
    return parsed.pathname + parsed.search + parsed.hash
  } catch {
    // Invalid URL, return safe default
    return '/'
  }
}

/**
 * Content Security Policy violation reporter
 */
export function setupCSPReporting(): void {
  if (typeof window === 'undefined') return
  
  document.addEventListener('securitypolicyviolation', (e) => {
    console.error('CSP Violation:', {
      blockedURI: e.blockedURI,
      violatedDirective: e.violatedDirective,
      originalPolicy: e.originalPolicy,
      sourceFile: e.sourceFile,
      lineNumber: e.lineNumber,
    })
    
    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to monitoring service
    }
  })
}

/**
 * Detect and prevent prototype pollution
 */
export function sanitizeObjectKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj
  
  const sanitized: any = Array.isArray(obj) ? [] : {}
  
  for (const key in obj) {
    // Skip prototype pollution attempts
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue
    }
    
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = sanitizeObjectKeys(obj[key])
    }
  }
  
  return sanitized
}

/**
 * Secure random token generation
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}

/**
 * Input validation with whitelist approach
 */
export function validateInput(
  input: string,
  type: 'alphanumeric' | 'email' | 'phone' | 'url' | 'text'
): boolean {
  const patterns = {
    alphanumeric: /^[a-zA-Z0-9_-]+$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^(\+62|62|0)[0-9]{9,13}$/,
    url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    text: /^[a-zA-Z0-9\s.,!?'-]+$/,
  }
  
  return patterns[type].test(input)
}

/**
 * Prevent tabnabbing attack
 */
export function secureExternalLink(url: string): { href: string; rel: string; target: string } {
  return {
    href: url,
    rel: 'noopener noreferrer',
    target: '_blank',
  }
}

/**
 * Rate limiting with exponential backoff
 */
export class AdvancedRateLimiter {
  private attempts: Map<string, { count: number; resetTime: number; backoffMs: number }> = new Map()
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000,
    private baseBackoffMs: number = 1000
  ) {}
  
  check(identifier: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now()
    const record = this.attempts.get(identifier)
    
    if (!record) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
        backoffMs: this.baseBackoffMs,
      })
      return { allowed: true }
    }
    
    // Check if we're still in backoff period
    if (now < record.resetTime) {
      if (record.count >= this.maxAttempts) {
        return {
          allowed: false,
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        }
      }
      
      // Increment count and apply exponential backoff
      record.count++
      record.backoffMs = Math.min(record.backoffMs * 2, 60000) // Max 1 minute
      record.resetTime = now + record.backoffMs
      
      this.attempts.set(identifier, record)
      return { allowed: true }
    }
    
    // Reset window
    this.attempts.set(identifier, {
      count: 1,
      resetTime: now + this.windowMs,
      backoffMs: this.baseBackoffMs,
    })
    
    return { allowed: true }
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }
}

/**
 * Detect suspicious patterns in user input
 */
export function detectSuspiciousPatterns(input: string): {
  isSuspicious: boolean
  reasons: string[]
} {
  const reasons: string[] = []
  
  // Check for SQL injection patterns
  if (/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)\b)/i.test(input)) {
    reasons.push('SQL injection pattern detected')
  }
  
  // Check for XSS patterns
  if (/<script|javascript:|onerror=|onload=/i.test(input)) {
    reasons.push('XSS pattern detected')
  }
  
  // Check for path traversal
  if (/\.\.[\/\\]/.test(input)) {
    reasons.push('Path traversal pattern detected')
  }
  
  // Check for command injection
  if (/[;&|`$()]/.test(input)) {
    reasons.push('Command injection pattern detected')
  }
  
  // Check for LDAP injection
  if (/[*()\\]/.test(input)) {
    reasons.push('LDAP injection pattern detected')
  }
  
  return {
    isSuspicious: reasons.length > 0,
    reasons,
  }
}

/**
 * Initialize all security measures
 */
export function initializeSecurity(): void {
  if (typeof window === 'undefined') return
  
  // Prevent clickjacking
  preventClickjacking()
  
  // Setup CSP reporting
  setupCSPReporting()
  
  // Disable right-click in production (optional)
  if (process.env.NODE_ENV === 'production') {
    document.addEventListener('contextmenu', (e) => {
      // Allow in development tools
      if (e.ctrlKey || e.metaKey) return
      // e.preventDefault() // Uncomment to disable right-click
    })
  }
  
  // Prevent drag and drop of external content
  document.addEventListener('drop', (e) => {
    if (e.target instanceof HTMLInputElement && e.target.type === 'file') {
      return // Allow file inputs
    }
    e.preventDefault()
  })
  
  document.addEventListener('dragover', (e) => {
    if (e.target instanceof HTMLInputElement && e.target.type === 'file') {
      return // Allow file inputs
    }
    e.preventDefault()
  })
}
