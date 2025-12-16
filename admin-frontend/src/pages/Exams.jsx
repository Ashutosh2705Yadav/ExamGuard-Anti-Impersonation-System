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
    <div className="p-6">

      {/* ================= BACK TO DASHBOARD ================= */}
      <div className="mb-4">
        <Link
          to="/"
          className="inline-block px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Exams</h1>

        <button
          onClick={() => setOpenCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow"
        >
          Create Exam
        </button>
      </div>

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 rounded-lg shadow"
            ></div>
          ))}
        </div>
      )}

      {/* ================= EMPTY STATE ================= */}
      {!loading && exams.length === 0 && (
        <div className="text-sm text-gray-500">
          No exams yet — create one.
        </div>
      )}

      {/* ================= EXAM LIST ================= */}
      {!loading && exams.length > 0 && (
        <div className="space-y-4">
          {exams.map((e) => (
            <div
              key={e.id}
              className="p-5 border rounded-lg shadow hover:shadow-md transition bg-white"
            >
              <div className="flex justify-between items-center">

                {/* LEFT INFO */}
                <div>
                  <div className="text-xl font-semibold text-gray-800">
                    {e.exam_name}
                  </div>

                  <div className="text-sm text-gray-600 mt-1">
                    {new Date(e.exam_date).toLocaleDateString()} •{" "}
                    {e.start_time.slice(0, 5)} - {e.end_time.slice(0, 5)} •{" "}
                    {e.center}
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-3">

                  {/* Assign Students */}
                  <button
                    onClick={() => {
                      setSelectedExam(e);
                      setOpenAssign(true);
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Assign Students
                  </button>

                  {/* View Assigned Students */}
                  <Link
                    to={`/admin/exams/${e.id}/students`}
                    className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                  >
                    View Students
                  </Link>

                  {/* Halltickets */}
                  <a
                    href={`${API.defaults.baseURL}/exams/${e.id}/hallticket`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
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