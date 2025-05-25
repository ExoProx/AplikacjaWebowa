import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import db from '../db';
const router = express.Router();

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response) => {
    console.log('req.user:', req.user);

    const user = req.user as { userId: string; email: string };
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = user.userId;
    const client = await db.connect();

    const { name, number } = req.body;

    if (
      typeof name !== 'string' || 
      !name.trim() || 
      typeof number !== 'number' || 
      number < 1 || 
      number > 31
    ) {
      client.release();
      return res.status(400).json({ error: 'Invalid name or day count' });
    }

    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO meal_plans (name, created_at, id_user, day_count) 
         VALUES ($1, Now(), $2, $3)`,
        [name.trim(), userId, number]
      );

      await client.query("COMMIT");
      return res.status(201).json({ message: "Mealplan Added" });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error('DB Insert Error:', err);
      return res.status(500).json({ error: "Internal server error" }); 
    } finally {
      client.release();
    }
  }
);
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response) => {
    console.log('req.user:', req.user);

    const user = req.user as { userId: string; email: string };
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `SELECT id_meal_plans AS id, name, day_count AS days FROM meal_plans WHERE id_user = $1`,
        [user.userId]
      );
      await client.query("COMMIT");
      return res.status(200).json(result.rows);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error('DB Select Error:', err);
      return res.status(500).json({ error: "Internal server error" }); 
    } finally {
      client.release();
    }
  }
);
router.get(
  '/fetch',
  passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response) => {
    console.log('req.user:', req.user);

    const user = req.user as { userId: string };

    const menuId = Number(req.query.menuId);
    if (isNaN(menuId)) {
    return res.status(400).json({ error: 'Invalid menuId' });
    }
    if (!menuId || Array.isArray(menuId)) {
      return res.status(400).json({ error: 'Missing or invalid menuId' });
    }
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `SELECT id_recipe as id, meal_plans_recipes.id_meal_plans as menuId, dayindex as dayIndex, meal_type as mealType FROM meal_plans_recipes WHERE 
        meal_plans_recipes.id_meal_plans = $1`,
        [menuId]
      )
       await client.query('COMMIT');

      return res.status(200).json(result.rows);
    } catch (err) {
      console.error("Error fetching meals:", err);
      res.status(500).json({ error: "Failed to fetch meals" });
    } finally {
      client.release();
    }
  }
);

export default router;

