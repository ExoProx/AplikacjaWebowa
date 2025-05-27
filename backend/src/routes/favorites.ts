import express from 'express';
import passport from 'passport';
import db from '../db';

const router = express.Router();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const user = req.user as { userId: string };

    console.log('Fetching favorites for account:', user.userId);

    const client = await db.connect();
    try {
      const userResult = await client.query(
        `SELECT id_user FROM users WHERE id_account = $1`,
        [parseInt(user.userId)]
      );
      
      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const userId = userResult.rows[0].id_user;

      const result = await client.query(
        `SELECT id_external FROM favourite_recipes WHERE id_user = $1`,
        [userId]
      );
      
      console.log('Fetch favorites result:', result.rows);
      res.json(result.rows.map(row => row.id_external));
    } catch (err) {
      console.error('Error fetching favorites:', err);
      res.status(500).json({ 
        error: 'Internal server error',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      client.release();
    }
  }
);

router.get(
  '/:recipeId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const user = req.user as { userId: string };
    const recipeId = req.params.recipeId;

    console.log('Checking favorite for account:', user.userId);

    const client = await db.connect();
    try {
      const userResult = await client.query(
        `SELECT id_user FROM users WHERE id_account = $1`,
        [parseInt(user.userId)]
      );
      
      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const userId = userResult.rows[0].id_user;

      const result = await client.query(
        `SELECT * FROM favourite_recipes WHERE id_user = $1 AND id_external = $2`,
        [userId, recipeId]
      );
      
      console.log('Check favorite result:', result.rows);
      res.json({ isFavorite: result.rows.length > 0 });
    } catch (err) {
      console.error('Error checking favorite:', err);
      console.error('Query params:', { userId: user.userId, recipeId });
      res.status(500).json({ 
        error: 'Internal server error',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      client.release();
    }
  }
);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const user = req.user as { userId: string };
    const { recipeId } = req.body;

    console.log('Adding favorite for account:', user.userId);

    if (!recipeId) {
      return res.status(400).json({ error: 'Recipe ID is required' });
    }

    let userId;
    try {
      const userResult = await db.query(
        `SELECT id_user FROM users WHERE id_account = $1`,
        [parseInt(user.userId)]
      );
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      userId = userResult.rows[0].id_user;
    } catch (err) {
      console.error('Error getting user:', err);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: 'Error getting user information'
      });
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');
      
      const exists = await client.query(
        `SELECT * FROM favourite_recipes WHERE id_user = $1 AND id_external = $2`,
        [userId, recipeId]
      );

      console.log('Exists check result:', exists.rows);

      if (exists.rows.length === 0) {
        const insertResult = await client.query(
          `INSERT INTO favourite_recipes (id_user, id_external) VALUES ($1, $2) RETURNING *`,
          [userId, recipeId]
        );
        console.log('Insert result:', insertResult.rows[0]);
      }

      await client.query('COMMIT');
      res.json({ message: 'Added to favorites' });
    } catch (err) {
      await client.query('ROLLBACK').catch(rollbackErr => {
        console.error('Error rolling back transaction:', rollbackErr);
      });
      console.error('Error adding favorite:', err);
      console.error('Query params:', { userId, recipeId });
      res.status(500).json({ 
        error: 'Internal server error',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      client.release();
    }
  }
);

router.delete(
  '/:recipeId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const user = req.user as { userId: string };
    const recipeId = req.params.recipeId;

    console.log('Removing favorite for account:', user.userId);

    const client = await db.connect();
    try {
      const userResult = await client.query(
        `SELECT id_user FROM users WHERE id_account = $1`,
        [parseInt(user.userId)]
      );
      
      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const userId = userResult.rows[0].id_user;

      const result = await client.query(
        `DELETE FROM favourite_recipes WHERE id_user = $1 AND id_external = $2 RETURNING *`,
        [userId, recipeId]
      );
      
      console.log('Delete result:', result.rows[0]);
      res.json({ message: 'Removed from favorites' });
    } catch (err) {
      console.error('Error removing favorite:', err);
      console.error('Query params:', { userId: user.userId, recipeId });
      res.status(500).json({ 
        error: 'Internal server error',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      client.release();
    }
  }
);

export default router; 