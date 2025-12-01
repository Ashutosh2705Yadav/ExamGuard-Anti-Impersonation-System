import pool from "../config/db.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Total students count
    const totalStudents = await pool.query(
      "SELECT COUNT(*) FROM students"
    );

    // Total verification logs
    const totalLogs = await pool.query(
      "SELECT COUNT(*) FROM auth_logs"
    );

    // Total verified
    const totalVerified = await pool.query(
      "SELECT COUNT(*) FROM auth_logs WHERE status = 'VERIFIED'"
    );

    // Total impersonations
    const totalImpersonation = await pool.query(
      "SELECT COUNT(*) FROM auth_logs WHERE status = 'IMPERSONATION'"
    );

    // Today's logs
    const todayLogs = await pool.query(
      `SELECT COUNT(*) FROM auth_logs 
       WHERE DATE(timestamp) = CURRENT_DATE`
    );

    res.json({
      success: true,
      stats: {
        totalStudents: Number(totalStudents.rows[0].count),
        totalLogs: Number(totalLogs.rows[0].count),
        totalVerified: Number(totalVerified.rows[0].count),
        totalImpersonation: Number(totalImpersonation.rows[0].count),
        todayLogs: Number(todayLogs.rows[0].count)
      }
    });

  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};