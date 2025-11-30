import pool from "../config/db.js";
import bcrypt from "bcryptjs";

export const verifyStudent = async (req, res) => {
  try {
    const { studentId, fingerprint } = req.body;
    

    if (!studentId || !fingerprint) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    // Fetch stored fingerprint hash
    const result = await pool.query(
      "SELECT fingerprint_hash FROM students WHERE id = $1",
      [studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const storedHash = result.rows[0].fingerprint_hash;
    
    // Compare fingerprints
   
    const isMatch = await bcrypt.compare(fingerprint, storedHash);
    
    // Insert log into auth_logs
    const logStatus = isMatch ? "VERIFIED" : "IMPERSONATION";
   

    await pool.query(
      "INSERT INTO auth_logs (student_id, status) VALUES ($1, $2)",
      [studentId, logStatus]
    );

    if (isMatch) {
      return res.json({
        success: true,
        message: "Identity verified",
        status: "VERIFIED"
      });
    } else {
      return res.json({
        success: false,
        message: "Fingerprint mismatch",
        status: "IMPERSONATION"
      });
    }

  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};