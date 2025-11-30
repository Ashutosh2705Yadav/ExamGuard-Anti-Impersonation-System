import express from "express";
import { registerStudent, getAllStudents } from "../controllers/studentController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerStudent);
router.get("/", adminAuth, getAllStudents);

export default router;