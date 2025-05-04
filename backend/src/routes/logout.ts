
import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', (req: Request, res: Response) => {
    res.clearCookie('token', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // change to true if production and HTTPS
    });
    res.status(200).json({ message: 'Logged out successfully' });
  });

export default router;
