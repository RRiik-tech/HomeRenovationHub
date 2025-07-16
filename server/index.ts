import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Setup routes and middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Register routes
registerRoutes(app);

// Setup Vite in development mode
if (process.env.NODE_ENV === "development") {
  setupVite(app).catch((err) => {
    console.error('Failed to setup Vite:', err);
    process.exit(1);
  });
}

const PORT = parseInt(process.env.PORT || '3001', 10);

server.listen(PORT, () => {
  log(`[express] 🚀 Server running on http://localhost:${PORT}`);
  log(`[express] 📱 API available at http://localhost:${PORT}/api`);
});
