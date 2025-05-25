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

router.put(
  '/updateMeal',
  passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response) => {
    console.log('req.user:', req.user);

    const user = req.user as { userId: string; email: string };
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const client = await db.connect();

    const { menuId, dayIndex, mealType, recipeId } = req.body;
    if (!menuId || dayIndex === undefined || !mealType || !recipeId) {
      return res.status(400).json({ message: 'Missing required fields' });
     }
    try {
      await client.query("BEGIN");

      const check = await client.query(
        `SELECT id_recipe FROM meal_plans_recipes 
         WHERE id_meal_plans = $1 AND meal_type = $2 AND dayindex = $3`, [menuId, mealType, dayIndex]
      )

      await client.query("COMMIT");
      if (check.rows.length > 0){

        await client.query(
        `UPDATE meal_plans_recipes 
           SET id_recipe = $1 
           WHERE id_meal_plans = $2 AND meal_type = $3 AND dayindex = $4`,
        [recipeId, menuId, mealType, dayIndex]
      );
      await client.query("COMMIT");
      return res.status(201).json({ message: "Recipe Added" });
      }
      else{
      await client.query(
        `INSERT INTO meal_plans_recipes (id_meal_plans, meal_type, dayindex, id_recipe) 
         VALUES ($1, $2, $3, $4)`,
        [menuId, mealType, dayIndex, recipeId]
      );

      await client.query("COMMIT");
      return res.status(201).json({ message: "Recipe Added" });
    }
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
    console.log('--- FETCH ENDPOINT HIT ---');
    console.log('Full Request URL:', req.originalUrl); // This will show the full URL as Express sees it
    console.log('req.query object:', req.query);
    console.log('req.query.menuId (raw from query):', req.query.menuId);

    const user = req.user as { userId: string }; // Keep this for later if userId is needed

    const menuId = Number(req.query.menuId);

    console.log('menuId (after Number() conversion):', menuId);
    console.log('isNaN(menuId):', isNaN(menuId));
    console.log('menuId <= 0:', menuId <= 0);

    if (isNaN(menuId) || menuId <= 0) {
      console.error('Validation failed for menuId. Sending 400 error.'); // Use error for clarity
      return res.status(400).json({ error: 'Invalid or missing menuId' });
    }
    console.log('Validation passed for menuId:', menuId);

    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `SELECT id_recipe as id, meal_plans_recipes.id_meal_plans as menuId, dayindex as dayIndex, meal_type as mealType
         FROM meal_plans_recipes
         WHERE meal_plans_recipes.id_meal_plans = $1`, // Or with JOIN and user_id if applicable
        [menuId]
      );
      console.log('Database query executed. Rows found:', result.rows.length);
      return res.status(200).json(result.rows);
    } catch (err: any) {
      console.error("Error fetching meals from DB:", err);
      res.status(500).json({ error: "Failed to fetch meals." });
    } finally {
      client.release();
    }
  }
);

export default router;

