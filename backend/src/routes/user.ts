import express, { Request, Response } from 'express';
import db from '../db';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const router = express.Router();
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().regex(/^\d{9,15}$/), // only digits, 9-15 chars
});
// POST request to create a new user
router.get('/', (req, res) => {
  res.send('Test route is working!');
});
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
    console.log("Processing request...");
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

    // Custom database constraint errors
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

// Export the router so it can be used in server.ts
export default router;