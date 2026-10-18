import express from "express";
import cors from "cors";
import dotenv from "dotenv";




const app = express();
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Hello from Expense Services!");
});

export default app;