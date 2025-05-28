"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
if (!dbUser || !dbPassword) {
    throw new Error('❌ DB_USER or DB_PASSWORD is not defined in .env');
}
const pool = new pg_1.Pool({
    user: dbUser,
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'pui',
    password: dbPassword,
    port: parseInt(process.env.DB_PORT || '5432', 10),
});
exports.default = pool;
