import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();
const DB_URI = process.env.DATABASE_URL;


if(!DB_URI){
    throw new Error("DATABASE URI is missing..")
}


export const pool = new Pool({
    connectionString: DB_URI,
    ssl:{
       rejectUnauthorized:false  
    }
})


export async function connectDB() :Promise<void>{
    try {
        const result = await pool.query('SELECT NOW()')
        console.log("PostgreSQL is Connected:")
        console.log('Database Time is:',result.rows[0].now)

    } catch (error) {
        console.error('Postgresql Connection Failed:')
        throw error
        
    }

}