import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db';

const router = express.Router();
const generateToken = (user: { userId: string, email: string }) => {
    const JWT_SECRET = process.env.JWT_SECRET as string;
  
    // Define options for the JWT token
    const options: jwt.SignOptions = {
      expiresIn: '1h', // Token expires in 1 hour
    };
    return jwt.sign(user, JWT_SECRET, options);
}
router.post('/', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const client = await db.connect();
  try {
    const accountResult = await client.query(
      'SELECT id_account, email, password FROM accounts WHERE email = $1',
      [email]
    );

    if (accountResult.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const account = accountResult.rows[0];
    const isMatch = await bcrypt.compare(password, account.password);

    if (!isMatch) {
        console.log('password error')
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = { userId: account.id_account, email: email };
    const token = generateToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to true if you use HTTPS
      sameSite: 'lax', // or 'none' if different domains
      maxAge: 3600 * 1000, // 1h
      path: '/',
    });
    res.json({ message: "Logged in" });
    console.log('login success')
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

export default router;
