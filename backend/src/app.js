import "./config/db.js";
import express from "express";
import cors from "cors";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "ExamGuard Backend Running ✔" });
});

export default app;