import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ragRoutes from "./modules/rag/routes/rag.route.js";

dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Fake News Service!");
});

app.use("/api/rag",ragRoutes)


export default app;