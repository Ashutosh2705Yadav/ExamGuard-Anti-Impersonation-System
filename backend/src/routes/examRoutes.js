// backend/src/routes/examRoutes.js
import express from "express";
import pool from "../config/db.js";
import qr from "qr-image";

const router = express.Router();

/* --------------------------------------------
   CREATE EXAM
--------------------------------------------- */
router.post("/", async (req, res) => {
  try {
    const { exam_name, exam_date, start_time, end_time, center } = req.body;

    const result = await pool.query(
      `INSERT INTO exams (exam_name, exam_date, start_time, end_time, center)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [exam_name, exam_date, start_time, end_time, center]
    );

    res.json({ success: true, exam: result.rows[0] });
  } catch (err) {
    console.error("CREATE_EXAM_ERROR:", err);
    res.status(500).json({ success: false, message: "Unable to create exam" });
  }
});

/* --------------------------------------------
   LIST EXAMS
--------------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM exams ORDER BY exam_date DESC, start_time`
    );

    res.json({ success: true, exams: result.rows });
  } catch (err) {
    console.error("LIST_EXAMS_ERROR:", err);
    res.status(500).json({ success: false, message: "Unable to fetch exams" });
  }
});

/* --------------------------------------------
   ASSIGN STUDENTS + GENERATE HALLTICKET QR
--------------------------------------------- */
router.post("/:examId/assign", async (req, res) => {
  try {
    const examId = Number(req.params.examId);
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0)
      return res.status(400).json({
        success: false,
        message: "studentIds required",
      });

    const insertPromises = studentIds.map(async (sid) => {
      const payload = JSON.stringify({
        studentId: sid,
        examId,
        ts: Date.now(),
      });

      const qrPng = qr.imageSync(payload, { type: "png", ec_level: "M", size: 6 });
      const dataUri = `data:image/png;base64,${qrPng.toString("base64")}`;

      const exists = await pool.query(
        `SELECT id FROM student_exam WHERE student_id=$1 AND exam_id=$2`,
        [sid, examId]
      );

      if (exists.rowCount > 0) {
        await pool.query(
          `UPDATE student_exam SET hall_ticket_qr=$1, created_at=NOW() WHERE id=$2`,
          [dataUri, exists.rows[0].id]
        );
      } else {
        await pool.query(
          `INSERT INTO student_exam (student_id, exam_id, hall_ticket_qr)
           VALUES ($1,$2,$3)`,
          [sid, examId, dataUri]
        );
      }

      return { studentId: sid, qr: dataUri };
    });

    const results = await Promise.all(insertPromises);

    res.json({
      success: true,
      assigned: results,
      message: `${results.length} students assigned`,
    });
  } catch (err) {
    console.error("ASSIGN_EXAM_ERROR:", err);
    res.status(500).json({ success: false, message: "Unable to assign students" });
  }
});

/* --------------------------------------------
   SINGLE STUDENT HALLTICKET (JSON)
--------------------------------------------- */
router.get("/hallticket/:examId/:studentId", async (req, res) => {
  try {
    const examId = Number(req.params.examId);
    const studentId = Number(req.params.studentId);

    const studentRes = await pool.query(
      `SELECT id, name, email, phone, aadhaar FROM students WHERE id=$1`,
      [studentId]
    );

    if (studentRes.rowCount === 0)
      return res.status(404).json({ success: false, message: "Student not found" });

    const examRes = await pool.query(`SELECT * FROM exams WHERE id=$1`, [
      examId,
    ]);

    if (examRes.rowCount === 0)
      return res.status(404).json({ success: false, message: "Exam not found" });

    const hallRes = await pool.query(
      `SELECT hall_ticket_qr FROM student_exam WHERE student_id=$1 AND exam_id=$2`,
      [studentId, examId]
    );

    if (hallRes.rowCount === 0)
      return res.status(404).json({
        success: false,
        message: "Hall ticket not generated",
      });

    res.json({
      success: true,
      student: studentRes.rows[0],
      exam: examRes.rows[0],
      hall_ticket_qr: hallRes.rows[0].hall_ticket_qr,
    });
  } catch (err) {
    console.error("HALLTICKET_ERROR:", err);
    res.status(500).json({ success: false, message: "Unable to fetch hallticket" });
  }
});

/* --------------------------------------------
   ALL HALLTICKETS FOR EXAM (HTML)
   Correct Route: /api/exams/:examId/hallticket
--------------------------------------------- */
router.get("/:examId/hallticket", async (req, res) => {
  try {
    const { examId } = req.params;

    const examRes = await pool.query(`SELECT * FROM exams WHERE id=$1`, [
      examId,
    ]);

    if (examRes.rowCount === 0) return res.status(404).send("Exam not found");

    const exam = examRes.rows[0];

    const studentsRes = await pool.query(
      `SELECT s.id, s.name, s.email, s.phone, s.aadhaar, se.hall_ticket_qr
       FROM student_exam se
       JOIN students s ON s.id = se.student_id
       WHERE se.exam_id=$1 ORDER BY s.id`,
      [examId]
    );

    const students = studentsRes.rows;

    let html = `
      <html>
      <head>
        <title>Hall Tickets - ${exam.exam_name}</title>
        <style>
          body { font-family: Arial; padding: 20px; background: #f7f7f7; }
          .card { background:white; padding:20px; border-radius:10px; margin-bottom:20px; border:1px solid #ccc; }
          img { width:180px; height:180px; border:1px solid #aaa; }
        </style>
      </head>
      <body>
        <h1>Hall Tickets – ${exam.exam_name}</h1><hr/>
    `;

    students.forEach((s) => {
      html += `
        <div class="card">
          <h2>${s.name}</h2>
          <p><b>Email:</b> ${s.email}</p>
          <p><b>Phone:</b> ${s.phone}</p>
          <p><b>Aadhaar:</b> ${s.aadhaar}</p>
          <img src="${s.hall_ticket_qr}" />
        </div>
      `;
    });

    html += "</body></html>";

    res.send(html);
  } catch (err) {
    console.error("HALLTICKET_PAGE_ERROR:", err);
    res.status(500).send("Server error generating hallticket page");
  }
});

export default router;