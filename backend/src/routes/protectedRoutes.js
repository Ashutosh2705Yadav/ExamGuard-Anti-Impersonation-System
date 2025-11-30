import express from "express";
import { adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/test", adminAuth, (req, res) => {
  res.json({
    success: true,
    message: "Access granted",
    admin: req.admin
  });
});

export default router;