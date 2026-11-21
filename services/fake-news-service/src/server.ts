import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initializeLLM } from "./rag/llm.service.js";

dotenv.config();

const PORT = process.env.PORT || 3002;

async function StartServer() {
  try {
    // Step 1: Connect PostgreSQL
    await connectDB();
    console.log("PostgreSQL connected");

    // Step 2: Start Express server
    app.listen(PORT, () => {
      console.log(
        `Fake News Service running on port ${PORT}`
      );
    });

    // Step 3: Initialize Qwen LLM in background
    console.log("Initializing LLM...");

    void initializeLLM()
      .then(() => {
        console.log("LLM ready to accept requests");
      })
      .catch((error) => {
        console.error("LLM initialization failed:", error);
      });

  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

StartServer();