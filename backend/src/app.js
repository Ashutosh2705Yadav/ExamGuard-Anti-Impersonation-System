import "./config/db.js";
import express from "express";
import cors from "cors";
import studentRoutes from "./routes/studentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";

const app = express();
app.use(cors());

// Middlewares
app.use(express.json());

// Student APIs
app.use("/api/admin", adminRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/protected", protectedRoutes);


// Test route
app.get("/", (req, res) => {
  res.json({ message: "ExamGuard Backend Running ✔" });
});

export default app;