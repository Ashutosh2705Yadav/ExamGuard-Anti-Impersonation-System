// admin-frontend/src/pages/Exams.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import CreateExamModal from "../components/CreateExamModal.jsx";
import AssignStudentsModal from "../components/AssignStudentsModal.jsx";

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [openAssign, setOpenAssign] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await API.get("/exams");
      setExams(res.data.exams || []);
    } catch (err) {
      console.error("fetchExams error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-6">

      {/* ================= TOP BAR ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-2"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white">Exams</h1>
          <p className="text-sm text-gray-400 mt-1">
            Create exams and manage assigned students
          </p>
        </div>

        <button
          onClick={() => setOpenCreate(true)}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          + Create Exam
        </button>
      </div>

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 rounded-xl"
            />
          ))}
        </div>
      )}

      {/* ================= EMPTY STATE ================= */}
      {!loading && exams.length === 0 && (
        <div className="bg-gray-800 rounded-xl shadow p-8 text-center text-gray-300">
          No exams created yet. Click <b>Create Exam</b> to get started.
        </div>
      )}

      {/* ================= EXAMS LIST ================= */}
      {!loading && exams.length > 0 && (
        <div className="space-y-4">
          {exams.map((e) => (
            <div
              key={e.id}
              className="bg-gray-800 rounded-xl shadow p-5 hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                {/* LEFT INFO */}
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {e.exam_name}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(e.exam_date).toLocaleDateString()} •{" "}
                    {e.start_time.slice(0, 5)} – {e.end_time.slice(0, 5)} •{" "}
                    {e.center}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-wrap gap-2">

                  <button
                    onClick={() => {
                      setSelectedExam(e);
                      setOpenAssign(true);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 transition"
                  >
                    Assign Students
                  </button>

                  <Link
                    to={`/admin/exams/${e.id}/students`}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 transition"
                  >
                    View Students
                  </Link>

                  <a
                    href={`${API.defaults.baseURL}/exams/${e.id}/hallticket`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-gray-700 text-gray-200 rounded-md text-sm hover:bg-gray-600 transition"
                  >
                    Halltickets
                  </a>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= MODALS ================= */}
      <CreateExamModal
        isOpen={openCreate}
        onClose={() => {
          setOpenCreate(false);
          fetchExams();
        }}
      />

      <AssignStudentsModal
        isOpen={openAssign}
        exam={selectedExam}
        onClose={() => {
          setOpenAssign(false);
          setSelectedExam(null);
        }}
      />
    </div>
  );
}