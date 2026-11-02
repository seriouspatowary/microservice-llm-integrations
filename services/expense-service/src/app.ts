import "dotenv/config";
import express from "express";
import expenseRoutes from "./routes/expense.routes.js";



const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    service: "expense-service",
    status: "healthy",
  });
});

app.use("/api/expenses", expenseRoutes);

export default app;