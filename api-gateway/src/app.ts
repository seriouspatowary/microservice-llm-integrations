
import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  
]


app.use(cors({
  origin:(origin,callback)=>{

       console.log("incoming origin:",origin)
       if(!origin || allowedOrigins.includes(origin)){
          callback(null,true)
       }else{
          callback(new Error("Not allowed by CORS"))
       }
  },
  credentials: true,
  methods: ["GET", "POST","PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));



app.get("/", (req, res) => {
  res.send("Hello from API Gateway 2.0!");
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
       
      },
      error: (err, req, res) => {
        console.error("Fake News proxy error:", err.message);
      },
    },
  })
);
 

app.use(express.json());

export default app;
