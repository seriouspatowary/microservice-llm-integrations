
import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

app.use(cors());

app.use((req, _res, next) => {
    console.log("Fake News received:", req.method, req.originalUrl);
    next();
});

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

app.use(
  createProxyMiddleware({
    pathFilter: "/api/rag",
    target: "http://fake-news-service:5002",
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq, req) => {
        console.log("Incoming:", req.originalUrl);
        console.log("Forwarding:", proxyReq.path);
      },
      error: (err, req, res) => {
        console.error("Fake News proxy error:", err.message);
      },
    },
  })
);
 

app.use(express.json());

export default app;
