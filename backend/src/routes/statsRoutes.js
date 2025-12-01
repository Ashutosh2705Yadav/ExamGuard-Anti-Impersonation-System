import express from "express";
import { getDashboardStats } from "../controllers/statsController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", adminAuth, getDashboardStats);

export default router;