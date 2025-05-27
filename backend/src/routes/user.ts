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

router.get('/', passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const client = await db.connect();
  try {
    const result = await client.query(`
      SELECT 
        u.id_user AS id, 
        u.name || ' ' || u.lastname AS name,
        u.phone_number as phone_number,
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

router.get(
  '/userdata',
  passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response) => {
    const user = req.user as { userId: string };

    const client = await db.connect();
    try {

      const result = await client.query(`
        SELECT
          a.email, u.name, u.lastname, u.phone_number
        FROM
          users u
        JOIN
          accounts a ON u.id_account = a.id_account
        WHERE
          u.id_account = $1;
      `, [user.userId]);

      if (result.rows.length === 0) {
        console.warn(`User with ID ${user.userId} not found in users table.`);
        return res.status(404).json({ error: 'User data not found.' });
      }


      res.status(200).json(result.rows[0]); 
      console.log(result.rows[0]);
    } catch (err) {
      console.error('Error fetching user data:', err); 
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  }
);

router.put(
  '/updateuserdata',
  passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response) => {
    const user = req.user as { userId: string };
    const {name, phoneNumber } = req.body;
     const trimmedPhoneNumber = phoneNumber ? String(phoneNumber).trim() : ''; // Ensure it's a string and trim
console.log('Backend: Trimmed phone_number for validation:', trimmedPhoneNumber, 'Length:', trimmedPhoneNumber.length);
        if (trimmedPhoneNumber.length < 9) {
            return res.status(400).json({ message: 'Numer telefonu musi zawierać co najmniej 9 cyfr.' });
        }
        // Optional: Check if it contains only digits
        if (!/^\d+$/.test(trimmedPhoneNumber)) {
            return res.status(400).json({ message: 'Numer telefonu może zawierać tylko cyfry.' });
        }
     let firstName = '';
        let lastName = '';

        if (name && typeof name === 'string') {
            const nameParts = name.trim().split(' ');
            if (nameParts.length > 1) {
                firstName = nameParts[0];
                lastName = nameParts.slice(1).join(' ');
            } else {
                firstName = nameParts[0];
            }
        }
    const client = await db.connect();
    try {
      await client.query("BEGIN")
      await client.query(` UPDATE users SET name = $1, lastname = $2, phone_number = $3 WHERE id_account = $4;
      `, [firstName, lastName, trimmedPhoneNumber, user.userId]);
      await client.query("COMMIT");
      res.status(200).json('Success'); 
      console.log('Success');
    } catch (err) {
      await client.query("ROLLBACK");
      console.error('Error updating user data:', err); 
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  }
);

export default router;