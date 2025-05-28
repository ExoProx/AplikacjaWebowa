import express, { Request, Response, NextFunction } from 'express';
import db from '../db';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import passport from 'passport';

const router = express.Router();

interface PostgresError {
  code: string;
  detail?: string;
}

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

// NEW SCHEMA FOR ADDING USER (to match frontend)
const addUserSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters long.' })
    .refine((val) => val.split('').some(char => char >= 'A' && char <= 'Z'), { message: 'Password must contain at least one uppercase letter.' })
    .refine((val) => val.split('').some(char => char >= '0' && char <= '9'), { message: 'Password must contain at least one number.' })
    .refine((val) => {
      const specialChars = '!@#$%^&*()_+';
      return val.split('').some(char => specialChars.includes(char));
    }, { message: 'Password must contain at least one special character.' }),
  name: z.string().min(1, { message: "Name cannot be empty." }),
  phone_number: z.number()
    .refine(val => String(val).match(/^\d{9,11}$/), { message: "Phone number must be 9 to 11 digits." }),
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
  } catch (err: Error | unknown) {
    await client.query("ROLLBACK");

    if (typeof err === "object" && err !== null && "code" in err) {
      const pgError = err as PostgresError;
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

// NEW ENDPOINT FOR ADDING USER (via Admin Page) - NO ADMIN MIDDLEWARE
router.post('/add',
    passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
        // You might still want a role check here if non-admins shouldn't add users
        const user = req.user as { userId: string, role: string } | undefined;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Admin access required to add users.' });
        }

        const parseResult = addUserSchema.safeParse(req.body);

        if (!parseResult.success) {
            console.error("Validation errors for /add endpoint:", parseResult.error.format());
            return res.status(400).json({
                error: "Validation failed",
                details: parseResult.error.format(),
            });
        }

        const { email, password, name, phone_number } = parseResult.data;

        // Split the 'name' from frontend into firstName and lastName for your database
        let firstName = '';
        let lastName = '';
        const nameParts = name.trim().split(' ');
        if (nameParts.length > 1) {
            firstName = nameParts[0];
            lastName = nameParts.slice(1).join(' ');
        } else {
            firstName = nameParts[0];
            lastName = '';
        }

        const client = await db.connect();

        try {
            await client.query("BEGIN");

            const hashedPassword = await bcrypt.hash(password, 10);
            const phoneNumberString = String(phone_number);

            const newRole = 'user';

            const accountResult = await client.query(
                `INSERT INTO accounts (email, password, status, role)
                 VALUES ($1, $2, 'activated', $3)
                 RETURNING id_account`,
                [email, hashedPassword, newRole]
            );
            const accountId = accountResult.rows[0].id_account;

            await client.query(
                `INSERT INTO users (name, lastname, phone_number, id_account)
                 VALUES ($1, $2, $3, $4)`,
                [firstName, lastName, phoneNumberString, accountId]
            );

            await client.query("COMMIT");
            res.status(201).json({ message: "User account created successfully", userId: accountId });
        } catch (err: Error | unknown) {
            await client.query("ROLLBACK");

            if (typeof err === "object" && err !== null && "code" in err) {
                const pgError = err as PostgresError;
                if (pgError.code === "23505") {
                    if (pgError.detail?.includes("email")) {
                        return res.status(400).json({ error: "Email is already in use." });
                    }
                    if (pgError.detail?.includes("phone_number")) {
                        return res.status(400).json({ error: "Phone number is already in use." });
                    }
                }
            }
            console.error("Error adding user via /add endpoint:", err);
            res.status(500).json({ error: "Internal server error." });
        } finally {
            client.release();
        }
    }
);


router.get('/', passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const client = await db.connect();
  try {
    const result = await client.query(`
      SELECT
        u.id_account AS id,
        u.name || ' ' || u.lastname AS name,
        u.phone_number as phone_number,
        a.email,
        a.status
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

router.put('/change', passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
    // Existing role check (as you provided it)
    const user = req.user as { userId: string};
    const role = req.user as { role: string};
    if (role.role != 'admin'){
        res.status(403).json({error: 'Unauthorized Access'});
        return;
    }

    const { id_account, email, name, phone_number} = req.body
    const client = await db.connect();

    // Existing name parsing logic (as you provided it)
    let firstName = '';
    let lastName = '';
    if (name && typeof name === 'string') {
        const nameParts = name.trim().split(' ');
        if (nameParts.length > 1) {
            firstName = nameParts[0];
            lastName = nameParts.slice(1).join(' ');
        } else {
            firstName = nameParts[0];
            lastName = '';
        }
    }
    console.log(firstName, lastName)

    try {
        await client.query("BEGIN");

        const currentEmailResult = await client.query(
            `SELECT email FROM accounts WHERE id_account = $1`,
            [id_account]
        );


        if (currentEmailResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "Account not found." });
        }

        const currentEmail = currentEmailResult.rows[0].email;
        // ... inside your try block, before the if (email !== currentEmail)

        if (email !== currentEmail) {
            // ... your email update logic
        } else {
            console.log(`Email for account ${id_account} is unchanged, skipping email update.`);
        }
// ... rest of your function
        if (email !== currentEmail) {
            await client.query(
                `UPDATE accounts SET email = $1 WHERE id_account = $2`,
                [email, id_account]
            );
        } else {
            console.log(`Email for account ${id_account} is unchanged, skipping email update.`);
        }
        await client.query(` UPDATE users SET name = $1, lastname = $2, phone_number = $3 WHERE id_account = $4;`,
            [ firstName, lastName, phone_number,id_account ]
        );

        await client.query("COMMIT");
        res.status(200).json({message: `Update Successful`})
    } catch (err: Error | unknown) {
        await client.query("ROLLBACK");
        console.error('Error fetching users:', err);

        if (typeof err === "object" && err !== null && "code" in err) {
            const pgError = err as PostgresError;
            if (pgError.code === "23505" && pgError.detail && pgError.detail.includes('email')) {
                return res.status(400).json({ error: 'The provided email is already in use by another account.' });
            }
        }

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
      const {name, lastname, phone_number, email } = req.body;

      const client = await db.connect();
      try {
        await client.query("BEGIN")
        await client.query(` UPDATE accounts SET email = $1 WHERE id_account = $2`, [email, user.userId]);
        await client.query(` UPDATE users SET name = $1, lastname = $2, phone_number = $3 WHERE id_account = $4;
        `, [name, lastname, phone_number, user.userId]);
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

// MODIFIED ENDPOINT TO TOGGLE USER STATUS (ACTIVATE/DEACTIVATE)
router.put(
  '/toggle-status',
  passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response) => {
    const user = req.user as { userId: string, role: string };
    const { id_account } = req.body;

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required.' });
    }

    if (!id_account) {
      return res.status(400).json({ error: 'Account ID is required to toggle status.' });
    }

    const client = await db.connect();
    try {
      await client.query("BEGIN");

      // Get current status
      const accountResult = await client.query(
        `SELECT status FROM accounts WHERE id_account = $1`,
        [id_account]
      );

      if (accountResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Account not found." });
      }

      const currentStatus = accountResult.rows[0].status;
      let newStatus: string;
      let actionMessage: string;

      if (currentStatus === 'activated') {
        newStatus = 'deactivated';
        actionMessage = 'deactivated';
      } else if (currentStatus === 'deactivated') {
        newStatus = 'activated';
        actionMessage = 'activated';
      } else {
        // Handle unexpected status if necessary, or default to deactivated
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `Invalid current status: ${currentStatus}` });
      }

      // Update the account status
      await client.query(
        `UPDATE accounts SET status = $1 WHERE id_account = $2`,
        [newStatus, id_account]
      );

      await client.query("COMMIT");
      res.status(200).json({ message: `Account with ID ${id_account} ${actionMessage} successfully.` });
    } catch (err: Error | unknown) {
      await client.query("ROLLBACK");
      console.error('Error toggling account status:', err);
      res.status(500).json({ error: 'Internal server error.' });
    } finally {
      client.release();
    }
  }
);

export default router;