// src/routes/MainPage.ts
import { Router, Request, Response } from 'express';
import { AuthRequest } from '../types';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateToken, (req: Request, res: Response) => {

  const authReq = req as AuthRequest;

  res.json({
    message: `Welcome to the main page, ${authReq.user.email}!`
  });
});

export default router;