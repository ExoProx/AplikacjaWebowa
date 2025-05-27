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
const db_1 = __importDefault(require("../db"));
const router = express_1.default.Router();
const passport_1 = __importDefault(require("passport"));
router.put('/updateuserdata', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const client = yield db_1.default.connect();
    try {
        const result = yield client.query(`
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
    }
    catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
    finally {
        client.release();
    }
}));
