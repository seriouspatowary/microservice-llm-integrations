import dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();


const DB_URI = process.env.DATABASE_URL;

if (!DB_URI) {
  throw new Error('DATABASE_URL is missing from .env');
}

export const pool = new Pool({
  connectionString: DB_URI,
  ssl: {
    rejectUnauthorized: false,
  },
});


// Test database connection
export async function connectDB(): Promise<void> {
  try {
    const result = await pool.query('SELECT NOW()');

    console.log('PostgreSQL connected successfully');
    console.log('Database time:', result.rows[0].now);
  } catch (error) {
    console.error('PostgreSQL connection failed:', error);
    throw error;
  }
}