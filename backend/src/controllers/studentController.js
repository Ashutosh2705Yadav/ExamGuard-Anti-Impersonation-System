import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";

// Mock Aadhaar verification function
function verifyAadhaar(aadhaar) {
  return aadhaar.length === 12;  // Simple check
}

export const registerStudent = async (req, res) => {
  try {
    const { name, email, phone, aadhaar, fingerprint } = req.body;

    // Validate Aadhaar
    if (!verifyAadhaar(aadhaar)) {
      return res.status(400).json({ message: "Invalid Aadhaar number" });
    }

    if (!fingerprint) {
      return res.status(400).json({ success: false, message: "Fingerprint is required" });
    }

    // Hash fingerprint
    const fingerprint_hash = await bcrypt.hash(fingerprint, 10);

    // Insert student into DB
    const result = await pool.query(
      `INSERT INTO students (name, email, phone, aadhaar, fingerprint_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [name, email, phone, aadhaar, fingerprint_hash]
    );

    const studentId = result.rows[0].id;

    // Generate QR code (contains student ID)
    const qrData = JSON.stringify({ id: studentId });
    const qrCode = await QRCode.toDataURL(qrData);

    // Save QR code to DB
    await pool.query(
      "UPDATE students SET qr_code=$1 WHERE id=$2",
      [qrCode, studentId]
    );

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      studentId,
      qr_code: qrCode
    });

  } catch (error) {
    console.error("🔥 Registration Error:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};
export const getAllStudents = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, phone, aadhaar, qr_code, created_at FROM students ORDER BY id DESC"
    );

    res.json({
      success: true,
      count: result.rows.length,
      students: result.rows
    });

  } catch (error) {
    console.error("Get Students Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT id, name, email, phone, aadhaar, qr_code, created_at FROM students WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({
      success: true,
      student: result.rows[0]
    });

  } catch (error) {
    console.error("Get Student Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};