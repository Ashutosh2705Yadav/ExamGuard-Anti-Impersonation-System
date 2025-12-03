// backend/src/routes/verifyRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { adminAuth } from "../middleware/authMiddleware.js";
import { verifyStudent } from "../controllers/verifyController.js";

const router = express.Router();

/* ============================================================
   PART 1 — QR SCAN → DECODE → FETCH STUDENT + EXAM
   Route: POST /api/verify/scan
============================================================ */
router.post("/scan", async (req, res) => {
  try {
    const { qrPayload } = req.body;

    if (!qrPayload) {
      return res.status(400).json({
        success: false,
        message: "qrPayload missing",
      });
    }

    // Decode QR JSON string
    let data;
    try {
      data = JSON.parse(qrPayload);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: "Invalid QR payload format",
      });
    }

    const { studentId, examId } = data;

    if (!studentId || !examId) {
      return res.status(400).json({
        success: false,
        message: "Invalid QR: studentId or examId missing",
      });
    }

    // Fetch student
    const studentRes = await pool.query(
      "SELECT id, name, email, phone, aadhaar FROM students WHERE id=$1",
      [studentId]
    );

    if (studentRes.rowCount === 0)
      return res.status(404).json({ success: false, message: "Student not found" });

    // Fetch exam
    const examRes = await pool.query("SELECT * FROM exams WHERE id=$1", [
      examId,
    ]);

    if (examRes.rowCount === 0)
      return res.status(404).json({ success: false, message: "Exam not found" });

    // Fetch hallticket
    const hallRes = await pool.query(
      `SELECT hall_ticket_qr, status 
       FROM student_exam 
       WHERE student_id=$1 AND exam_id=$2`,
      [studentId, examId]
    );

    if (hallRes.rowCount === 0)
      return res.status(404).json({
        success: false,
        message: "Hallticket not generated for this student",
      });

    return res.json({
      success: true,
      student: studentRes.rows[0],
      exam: examRes.rows[0],
      hallticket: hallRes.rows[0].hall_ticket_qr,
      status: hallRes.rows[0].status || "PENDING",
    });
  } catch (err) {
    console.error("QR_SCAN_ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error while decoding QR",
    });
  }
});

/* ============================================================
   PART 2 — FINGERPRINT VERIFICATION
   Route: POST /api/verify/
============================================================ */
router.post("/", adminAuth, verifyStudent);

/* ============================================================
   TEMP — generate hash for testing
============================================================ */
router.get("/gen", (req, res) => {
  const hash = bcrypt.hashSync("my_fingerprint", 10);
  res.send(hash);
});

export default router;