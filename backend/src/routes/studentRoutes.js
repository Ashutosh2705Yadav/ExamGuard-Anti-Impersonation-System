import express from "express";
import { registerStudent, getAllStudents } from "../controllers/studentController.js";
import { adminAuth } from "../middleware/authMiddleware.js";
import { getStudentById } from "../controllers/studentController.js";

const router = express.Router();

router.post("/register", registerStudent);
router.get("/", adminAuth, getAllStudents);
router.get("/:id", adminAuth, getStudentById);

export default router;