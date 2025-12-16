import "./config/db.js";
import express from "express";
import cors from "cors";
import studentRoutes from "./routes/studentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";
import verifyRoutes from "./routes/verifyRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import examRoutes from "./routes/examRoutes.js";

const app = express();
app.use(cors());

// Middlewares
app.use(express.json());

// Student APIs
app.use("/api/admin", adminRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/exams", examRoutes);

app.use(cors({
  origin: "*", // later you can restrict
  credentials: true
}));


// Test route
app.get("/", (req, res) => {
  res.json({ message: "ExamGuard Backend Running ✔" });
});

export default app;