import express from 'express';
import pool from '../db';  // Ensure this is the correct import for your DB connection
import bcrypt from 'bcrypt';

const router = express.Router();

// POST /api/users - Create a new user
router.post('/', async (req, res) => {
  console.log("Received POST request at /api/users");
  console.log("Request body:", req.body);
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into the accounts table
    const result = await client.query(
      `INSERT INTO accounts (id_account, email, password, status, role)
       VALUES (DEFAULT, $1, $2, 'activated', 'user')`,
      [email, hashedPassword]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Account created'});
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    client.release();
  }
});

export default router;
