import pool from "../config/db.js";

export const getLogs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        auth_logs.id,
        auth_logs.status,
        auth_logs.timestamp,
        students.name,
        students.email,
        students.phone,
        students.aadhaar
      FROM auth_logs
      INNER JOIN students ON auth_logs.student_id = students.id
      ORDER BY auth_logs.id DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      logs: result.rows
    });

  } catch (error) {
    console.error("Logs Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};