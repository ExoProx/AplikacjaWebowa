import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
if (!dbUser || !dbPassword) {
  throw new Error('❌ DB_USER or DB_PASSWORD is not defined in .env');
}

const pool = new Pool({
  user: dbUser,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'pui',
  password: dbPassword,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

export default pool;
