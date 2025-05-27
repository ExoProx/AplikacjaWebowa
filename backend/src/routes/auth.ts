// backend/routes/auth.ts (or wherever your auth routes are)

import express, { Request, Response } from 'express';
import passport from 'passport'; // Import passport

const router = express.Router();

router.get('/check-auth',

  passport.authenticate('jwt', { session: false }),
  (req: Request, res: Response) => {
    res.status(200).json({
      isAuthenticated: true,
    });
    console.log('Token is valid for user:', req.user);
  }
);

export default router;