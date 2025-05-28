"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const db_1 = __importDefault(require("../db"));
const router = express_1.default.Router();
router.get('/', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    console.log('Fetching favorites for account:', user.userId);
    const client = yield db_1.default.connect();
    try {
        const userResult = yield client.query(`SELECT id_user FROM users WHERE id_account = $1`, [parseInt(user.userId)]);
        if (userResult.rows.length === 0) {
            throw new Error('User not found');
        }
        const userId = userResult.rows[0].id_user;
        const result = yield client.query(`SELECT id_external FROM favourite_recipes WHERE id_user = $1`, [userId]);
        console.log('Fetch favorites result:', result.rows);
        res.json(result.rows.map(row => row.id_external));
    }
    catch (err) {
        console.error('Error fetching favorites:', err);
        res.status(500).json({
            error: 'Internal server error',
            details: err instanceof Error ? err.message : 'Unknown error'
        });
    }
    finally {
        client.release();
    }
}));
router.get('/:recipeId', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const recipeId = req.params.recipeId;
    console.log('Checking favorite for account:', user.userId);
    const client = yield db_1.default.connect();
    try {
        const userResult = yield client.query(`SELECT id_user FROM users WHERE id_account = $1`, [parseInt(user.userId)]);
        if (userResult.rows.length === 0) {
            throw new Error('User not found');
        }
        const userId = userResult.rows[0].id_user;
        const result = yield client.query(`SELECT * FROM favourite_recipes WHERE id_user = $1 AND id_external = $2`, [userId, recipeId]);
        console.log('Check favorite result:', result.rows);
        res.json({ isFavorite: result.rows.length > 0 });
    }
    catch (err) {
        console.error('Error checking favorite:', err);
        console.error('Query params:', { userId: user.userId, recipeId });
        res.status(500).json({
            error: 'Internal server error',
            details: err instanceof Error ? err.message : 'Unknown error'
        });
    }
    finally {
        client.release();
    }
}));
router.post('/', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { recipeId } = req.body;
    console.log('Adding favorite for account:', user.userId);
    if (!recipeId) {
        return res.status(400).json({ error: 'Recipe ID is required' });
    }
    let userId;
    try {
        const userResult = yield db_1.default.query(`SELECT id_user FROM users WHERE id_account = $1`, [parseInt(user.userId)]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        userId = userResult.rows[0].id_user;
    }
    catch (err) {
        console.error('Error getting user:', err);
        return res.status(500).json({
            error: 'Internal server error',
            details: 'Error getting user information'
        });
    }
    const client = yield db_1.default.connect();
    try {
        yield client.query('BEGIN');
        const exists = yield client.query(`SELECT * FROM favourite_recipes WHERE id_user = $1 AND id_external = $2`, [userId, recipeId]);
        console.log('Exists check result:', exists.rows);
        if (exists.rows.length === 0) {
            const insertResult = yield client.query(`INSERT INTO favourite_recipes (id_user, id_external) VALUES ($1, $2) RETURNING *`, [userId, recipeId]);
            console.log('Insert result:', insertResult.rows[0]);
        }
        yield client.query('COMMIT');
        res.json({ message: 'Added to favorites' });
    }
    catch (err) {
        yield client.query('ROLLBACK').catch(rollbackErr => {
            console.error('Error rolling back transaction:', rollbackErr);
        });
        console.error('Error adding favorite:', err);
        console.error('Query params:', { userId, recipeId });
        res.status(500).json({
            error: 'Internal server error',
            details: err instanceof Error ? err.message : 'Unknown error'
        });
    }
    finally {
        client.release();
    }
}));
router.delete('/:recipeId', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const recipeId = req.params.recipeId;
    console.log('Removing favorite for account:', user.userId);
    const client = yield db_1.default.connect();
    try {
        const userResult = yield client.query(`SELECT id_user FROM users WHERE id_account = $1`, [parseInt(user.userId)]);
        if (userResult.rows.length === 0) {
            throw new Error('User not found');
        }
        const userId = userResult.rows[0].id_user;
        const result = yield client.query(`DELETE FROM favourite_recipes WHERE id_user = $1 AND id_external = $2 RETURNING *`, [userId, recipeId]);
        console.log('Delete result:', result.rows[0]);
        res.json({ message: 'Removed from favorites' });
    }
    catch (err) {
        console.error('Error removing favorite:', err);
        console.error('Query params:', { userId: user.userId, recipeId });
        res.status(500).json({
            error: 'Internal server error',
            details: err instanceof Error ? err.message : 'Unknown error'
        });
    }
    finally {
        client.release();
    }
}));
exports.default = router;
