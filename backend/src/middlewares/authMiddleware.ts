// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';

export const authenticateToken = (
  req: Request,          // ← plain Request here
  res: Response,
  next: NextFunction
) => {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.split(' ')[1] ||
    '';

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // decode into exactly the shape we declared in AuthRequest
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId: string; email: string };

    // now cast `req` to your extended type and assign
    (req as AuthRequest).user = decoded;

    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
