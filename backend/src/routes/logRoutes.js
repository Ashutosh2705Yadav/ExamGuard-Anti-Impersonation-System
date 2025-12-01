import express from "express";
import { getLogs } from "../controllers/logController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", adminAuth, getLogs);

export default router;