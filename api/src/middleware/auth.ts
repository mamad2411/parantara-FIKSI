import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../utils/jwt';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan'
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token sudah kadaluarsa'
      });
      return;
    }
    res.status(401).json({
      success: false,
      message: 'Token tidak valid'
    });
  }
};

export default authMiddleware;
