import bcrypt from "bcryptjs";
import pool from "../config/db.js";

/*
    FINAL IDENTITY VERIFICATION CONTROLLER
    --------------------------------------
    ✔ Compares fingerprint
    ✔ Updates student_exam.status
    ✔ Inserts log into auth_logs
*/

export const verifyStudent = async (req, res) => {
  try {
    const { studentId, examId, fingerprint } = req.body;

    // Validate inputs
    if (!studentId || !examId || !fingerprint) {
      return res.status(400).json({
        success: false,
        message: "studentId, examId, and fingerprint are required",
      });
    }

    // Fetch student
    const studentRes = await pool.query(
      `SELECT id, name, fingerprint_hash FROM students WHERE id=$1`,
      [studentId]
    );

    if (studentRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const student = studentRes.rows[0];

    // Compare fingerprint with hash
    const isMatch = await bcrypt.compare(fingerprint, student.fingerprint_hash);
    const status = isMatch ? "VERIFIED" : "IMPERSONATION";

    // Update student_exam entry
    await pool.query(
      `UPDATE student_exam 
       SET status=$1
       WHERE student_id=$2 AND exam_id=$3`,
      [status, studentId, examId]
    );

    // Insert log in auth_logs
    await pool.query(
      `INSERT INTO auth_logs (student_id, exam_id, status)
       VALUES ($1, $2, $3)`,
      [studentId, examId, status]
    );

    // Send final response
    return res.json({
      success: true,
      status,
      message: isMatch
        ? "Fingerprint matched. Entry verified."
        : "Fingerprint mismatch! Impersonation detected.",
    });
  } catch (error) {
    console.error("VERIFY_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error verifying identity",
    });
  }
};