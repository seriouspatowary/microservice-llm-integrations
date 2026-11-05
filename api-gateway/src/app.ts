
import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello from API Gateway!");
});

// Auth service
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://auth-service:5003",
    changeOrigin: true,
    pathRewrite: (path) => `/api/auth${path}`,
  })
);

// Expense service
app.use(
  "/api/expenses",
  createProxyMiddleware({
    target: "http://expense-service:5001",
    changeOrigin: true,
    pathRewrite: (path) => `/api/expenses${path}`,
  })
);


app.use(express.json());

export default app;
