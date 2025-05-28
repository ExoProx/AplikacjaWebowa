import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db';

const router = express.Router();

const generateToken = (user: { userId: string; email: string, role: string }) => {
  const JWT_SECRET = process.env.JWT_SECRET as string;

  const options: jwt.SignOptions = {
    expiresIn: '1h',
  };
  return jwt.sign(user, JWT_SECRET, options);
};

router.post('/', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const client = await db.connect();

  try {
    const accountResult = await client.query(
      'SELECT id_account, email, password, role, status FROM accounts WHERE email = $1',
      [email]
    );

    if (accountResult.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const account = accountResult.rows[0];
    const isMatch = await bcrypt.compare(password, account.password);

    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if ( account.status == 'deactivated'){
      return res.status(403).json({error: 'Deactivated account'})
    }
    const user = { userId: account.id_account, email: account.email, role: account.role };
    const token = generateToken(user);

    // Set cookie with token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in prod for HTTPS only
      sameSite: 'lax',
      maxAge: 1000* 60 * 60 * 24,
      path: '/',
    });

    res.json({ role: account.role });
    console.log('Login successful');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

export default router;
