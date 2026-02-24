import jwt from 'jsonwebtoken';

export interface JWTPayload {
  id: number;
  email: string;
  name: string;
}

export const generateToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET!;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  // @ts-ignore - Type definition issue with jsonwebtoken, but works correctly at runtime
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch (error) {
    throw new Error('Token tidak valid');
  }
};
