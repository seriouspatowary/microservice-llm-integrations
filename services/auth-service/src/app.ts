import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";



const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser())

app.get("/", (_req, res) => {
  res.send("Hello from Auth Service!");
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

export default app;