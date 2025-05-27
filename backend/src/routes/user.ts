import express, { Request, Response } from 'express';
import db from '../db';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import passport from 'passport';

const router = express.Router();
//Walidacja danych biblitoeką zod
const userSchema = z.object({
  email: z.string().email(),
  password: z.string()
   .min(8, { message: 'Password must be at least 8 characters long' })
   .min(8, { message: 'Password must be at least 8 characters long' })
    .refine((val) => {
    return val.split('').some(char => char >= 'A' && char <= 'Z');
    }, { message: 'Password must contain at least one uppercase letter' })
    .refine((val) => {
    return val.split('').some(char => char >= '0' && char <= '9');
  }, { message: 'Password must contain at least one number' })
  .refine((val) => {
    const specialChars = '!@#$%^&*()_+';
    return val.split('').some(char => specialChars.includes(char));
  }, { message: 'Password must contain at least one special character' }),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().regex(/^\d{9,11}$/), 
});
//Dodanie nowego użytkownika do bazy danych
router.post('/', async (req: Request, res: Response) => {
  const parseResult = userSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parseResult.error.format(),
    });
  }

  const { email, password, firstName, lastName, phoneNumber } = parseResult.data;
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const hashedPassword = await bcrypt.hash(password, 10);

    const accountResult = await client.query(
      `INSERT INTO accounts (id_account, email, password, status, role) 
       VALUES (DEFAULT, $1, $2, 'activated', 'user') 
       RETURNING id_account`,
      [email, hashedPassword]
    );
    const accountId = accountResult.rows[0].id_account;

    await client.query(
      `INSERT INTO users (name, lastname, phone_number, id_account) 
       VALUES ($1, $2, $3, $4)`,
      [firstName, lastName, phoneNumber, accountId]
    );

    await client.query("COMMIT");
    res.status(201).json({ message: "Account created", userId: accountId });
  } catch (err) {
    await client.query("ROLLBACK");


    if (typeof err === "object" && err !== null && "code" in err) {
      const pgError = err as { code: string; detail?: string };
      if (pgError.code === "23505") {
        if (pgError.detail?.includes("email")) {
          return res.status(400).json({ error: "Email is already in use" });
        }
        if (pgError.detail?.includes("phone_number")) {
          return res.status(400).json({ error: "Phone number is already in use" });
        }
      }
    }

    console.error("Transaction error:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
});

router.get('/', async (req: Request, res: Response) => {
  const client = await db.connect();
  try {
    const result = await client.query(`
      SELECT 
        u.id_user AS id, 
        u.name || ' ' || u.lastname AS name,
        a.email 
      FROM users u
      JOIN accounts a ON u.id_account = a.id_account
    `);

    res.status(200).json(result.rows);
    console.log(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

router.get('/userdata',
  passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response) => {
  const user = req.user as { userId: string };

  const client = await db.connect();
  try {
    const accountResult = await client.query(`
      SELECT 
        id_account FROM users WHERE id_account = $1`,[user.userId]
    );
    if (accountResult.rows.length === 0) {
    console.warn(`User with ID ${user.userId} not found in users table.`);
    // Or handle this as an error if a user should always exist
    return res.status(404).json({ error: 'User data not found.' });
}
    const accountId = accountResult.rows[0].id_account;
    const result = await client.query(`
      SELECT
        a.email, u.name, u.lastname, u.phone_number FROM users u 
      JOIN
      accounts a ON u.id_account = a.id 
      WHERE
      u.id_account = $1; 
      `,[accountId]);
    await client.query("COMMIT");
    res.status(200).json(result.rows);
    console.log(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

export default router;