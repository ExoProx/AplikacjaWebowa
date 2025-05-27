import express, { Request, Response } from 'express';
import db from '../db';
const router = express.Router();
import passport from 'passport';

router.put(
  '/updateuserdata',
  passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response) => {
    const user = req.user as { userId: string };

    const client = await db.connect();
    try {

      const result = await client.query(`
        UPDATE
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


      res.status(200).json('Success'); 
      console.log('Success');
    } catch (err) {
      console.error('Error fetching user data:', err); 
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  }
);