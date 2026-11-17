
import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initializeLLM } from "./rag/llm.service.js";

dotenv.config();

const PORT = process.env.PORT || 3002;

async function StartServer() {
  try {
    // ✅ STEP 1: Connect to PostgreSQL first
    await connectDB();
    console.log("PostgreSQL connected");

    // ✅ STEP 2: Initialize and warm up LLM
    // Wait until the model is completely ready
    console.log("Initializing LLM...");

    await initializeLLM();

    console.log("LLM ready to accept requests");

    // ✅ STEP 3: Start server only after dependencies are ready
    app.listen(PORT, () => {
      console.log(
        `Fake News Detection Server is running on :${PORT}`
      );
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

StartServer();
