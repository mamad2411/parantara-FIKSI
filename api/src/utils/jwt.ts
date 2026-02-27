import jwt from 'jsonwebtoken';

export interface JWTPayload {
  id?: string;
  userId: string;
  email: string;
  name?: string;
  role?: 'admin' | 'user' | 'mosque_admin';
  mosqueName?: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT token
 * @param payload - User data to encode in token
 * @param secret - JWT secret key
 * @param expiresIn - Token expiration time (default: 7 days)
 * @returns JWT token string
 */
export function generateToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  secret: string,
  expiresIn: string = '7d'
): string {
  // @ts-ignore - Type issue with jsonwebtoken library, works correctly at runtime
  return jwt.sign(payload, secret, {
    expiresIn: expiresIn,
    algorithm: 'HS256',
  });
}

/**
 * Generate refresh token (longer expiration)
 * @param payload - User data to encode in token
 * @param secret - JWT secret key
 * @returns Refresh token string
 */
export function generateRefreshToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  secret: string
): string {
  // @ts-ignore - Type issue with jsonwebtoken library, works correctly at runtime
  return jwt.sign(payload, secret, {
    expiresIn: '30d',
    algorithm: 'HS256',
  });
}

/**
 * Verify and decode JWT token
 * @param token - JWT token to verify
 * @param secret - JWT secret key
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string, secret: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('Token expired:', error.message);
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('Invalid token:', error.message);
    } else {
      console.error('Token verification error:', error);
    }
    return null;
  }
}

/**
 * Decode token without verification (for debugging)
 * @param token - JWT token to decode
 * @returns Decoded payload or null
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
}

/**
 * Check if token is expired
 * @param token - JWT token to check
 * @returns True if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token string or null
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}
