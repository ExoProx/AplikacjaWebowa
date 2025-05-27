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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const router = express_1.default.Router();
const generateToken = (user) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    const options = {
        expiresIn: '1h',
    };
    return jsonwebtoken_1.default.sign(user, JWT_SECRET, options);
};
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    const client = yield db_1.default.connect();
    try {
        const accountResult = yield client.query('SELECT id_account, email, password, role, status FROM accounts WHERE email = $1', [email]);
        if (accountResult.rowCount === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const account = accountResult.rows[0];
        const isMatch = yield bcrypt_1.default.compare(password, account.password);
        if (!isMatch) {
            console.log('Password mismatch');
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        if (account.status == 'deactivated') {
            return res.status(403).json({ error: 'Deactivated account' });
        }
        const user = { userId: account.id_account, email: account.email, role: account.role };
        const token = generateToken(user);
        // Set cookie with token
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24,
            path: '/',
        });
        res.json({ role: account.role });
        console.log('Login successful');
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
    finally {
        client.release();
    }
}));
exports.default = router;
