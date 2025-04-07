import express, { Request, Response } from 'express';
import db from '../db';
import bcrypt from 'bcrypt';

const router = express.Router();
interface UserInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }
// POST request to create a new user
router.get('/', (req, res) => {
  res.send('Test route is working!');
});
router.post('/', async (req: Request, res: Response) => {
  console.log("POST /api/users hit");  // Debugging log

  const { email, password, firstName, lastName, phoneNumber } = req.body as UserInput;
  const client = await db.connect();

  try {
    console.log("Processing request...");
    await client.query('BEGIN');
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const accountResult = await client.query(
      `INSERT INTO accounts (id_account, email, password, status, role) 
       VALUES (DEFAULT, $1, $2, 'activated', 'user') 
       RETURNING id_account`, 
      [email, hashedPassword]
    );
    const accountId = accountResult.rows[0].id;

    await client.query(
      `INSERT INTO users (name, lastname, phone_number, id_account) VALUES ($1, $2, $3, $4)`,
      [firstName, lastName, phoneNumber, accountId]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Account created', userId: accountId.rows[0].id });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    client.release();
  }
});

// Export the router so it can be used in server.ts
export default router;