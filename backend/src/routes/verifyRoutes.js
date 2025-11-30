import express from "express";
import { verifyStudent } from "../controllers/verifyController.js";
import { adminAuth } from "../middleware/authMiddleware.js";
import bcrypt from "bcryptjs";

const router = express.Router();

router.post("/", adminAuth, verifyStudent);

// temporary hash generator route
router.get("/gen", (req, res) => {
  const hash = bcrypt.hashSync("my_fingerprint", 10);
  res.send(hash);
});

export default router;