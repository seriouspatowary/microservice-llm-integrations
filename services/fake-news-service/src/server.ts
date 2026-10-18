import dotenv from 'dotenv';
import app from "./app.js";
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 3002;

async function StartServer() {
    try {
        await connectDB();
        app.listen(PORT,()=>{
            console.log(`Fake News Detection Server is running on :${PORT}`)
        })
        
    } catch (error) {
        console.error('Server startup failed because PostGresql is unavailable');
        process.exit(1);
    }
    
}

StartServer()