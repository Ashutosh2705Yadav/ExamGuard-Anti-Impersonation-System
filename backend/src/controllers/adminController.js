import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("REQ BODY:", req.body);

    // check admin exists
    const result = await pool.query(
      "SELECT * FROM admins WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid username" });
    }

    const admin = result.rows[0];

    // check password
    console.log("Password received:", password);
console.log("Hash in DB:", admin.password);

const isMatch = await bcrypt.compare(password, admin.password);

console.log("Password match result:", isMatch);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    // generate JWT token
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token
    });

  } catch (err) {
    console.error("Admin Login Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};