import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/database.js';

dotenv.config();

const PORT = process.env.PORT 


async function startServer() {
    try {
        await connectDB();
        app.listen(PORT,()=>{
            console.log(`Expense Server is running on Port:${PORT}`)
        })
        
    } catch (error) {
        console.error('Server startup failed because PostgreSQL is unavailable');
        process.exit(1);
    }
}

startServer()
