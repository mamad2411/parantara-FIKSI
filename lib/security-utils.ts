// Security utilities for form data protection

/**
 * Sanitize input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '')
  
  // Escape special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')
  
  return sanitized.trim()
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (Indonesian format)
 */
export function validatePhone(phone: string): boolean {
  // Indonesian phone: 08xx-xxxx-xxxx or +62xxx
  const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/
  return phoneRegex.test(phone.replace(/[\s-]/g, ''))
}

/**
 * Validate NPWP (16 digits)
 */
export function validateNPWP(npwp: string): boolean {
  const npwpRegex = /^[0-9]{16}$/
  return npwpRegex.test(npwp.replace(/[\s.-]/g, ''))
}

/**
 * Validate postal code (5 digits)
 */
export function validatePostalCode(code: string): boolean {
  const postalRegex = /^[0-9]{5}$/
  return postalRegex.test(code)
}

/**
 * Check for SQL injection patterns
 */
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(UNION.*SELECT)/i,
    /(OR\s+1\s*=\s*1)/i,
    /(AND\s+1\s*=\s*1)/i,
    /('|"|;|--|\*|\/\*|\*\/)/,
  ]
  
  return sqlPatterns.some(pattern => pattern.test(input))
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken && token.length === 64
}

/**
 * Simple encryption for sensitive data (client-side)
 * Note: This is basic obfuscation. Real encryption should be done server-side
 */
export function encryptData(data: string, key: string): string {
  let encrypted = ''
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    encrypted += String.fromCharCode(charCode)
  }
  return btoa(encrypted) // Base64 encode
}

/**
 * Decrypt data
 */
export function decryptData(encrypted: string, key: string): string {
  try {
    const decoded = atob(encrypted)
    let decrypted = ''
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      decrypted += String.fromCharCode(charCode)
    }
    return decrypted
  } catch {
    return ''
  }
}

/**
 * Rate limiting check
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map()
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  check(identifier: string): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(identifier) || []
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs)
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false // Rate limit exceeded
    }
    
    recentAttempts.push(now)
    this.attempts.set(identifier, recentAttempts)
    return true
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }
}

/**
 * Validate file upload security
 */
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  // Check file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    return { valid: false, error: 'Ukuran file maksimal 2MB' }
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Format file harus PDF atau JPG/PNG' }
  }
  
  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf']
  const fileName = file.name.toLowerCase()
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
  
  if (!hasValidExtension) {
    return { valid: false, error: 'Ekstensi file tidak valid' }
  }
  
  // Block dangerous extensions
  const dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.sh', '.app', '.dmg', '.deb', '.rpm',
    '.msi', '.apk', '.jar', '.js', '.vbs', '.scr', '.com', '.pif',
    '.dll', '.sys', '.drv', '.bin', '.dat', '.tmp'
  ]
  
  if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
    return { valid: false, error: 'File executable tidak diperbolehkan' }
  }
  
  // Check for path traversal
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return { valid: false, error: 'Nama file tidak valid' }
  }
  
  // Check for null bytes
  if (fileName.includes('\0')) {
    return { valid: false, error: 'Nama file mengandung karakter tidak valid' }
  }
  
  return { valid: true }
}

/**
 * Generate secure random string
 */
export function generateSecureRandom(length: number = 32): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Hash sensitive data (simple client-side hashing)
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item))
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key])
      }
    }
    return sanitized
  }
  
  return obj
}
