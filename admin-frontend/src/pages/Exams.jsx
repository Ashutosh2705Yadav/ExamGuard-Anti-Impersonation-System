// admin-frontend/src/pages/Exams.jsx
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import API from "../services/api";
import CreateExamModal from "../components/CreateExamModal.jsx";
import AssignStudentsModal from "../components/AssignStudentsModal.jsx";

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);

  // NEW STATES (correct location — inside component)
  const [selectedExam, setSelectedExam] = useState(null);
  const [openAssign, setOpenAssign] = useState(false);

  const fetchExams = async () => {
    try {
      const res = await API.get("/exams");
      setExams(res.data.exams || []);
    } catch (err) {
      console.error("fetchExams error:", err);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Exams</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setOpenCreate(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Exam
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {exams.length === 0 && (
          <div className="text-sm text-gray-500">No exams yet — create one.</div>
        )}

        {exams.map((e) => (
          <div
            key={e.id}
            className="p-4 border rounded flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">{e.exam_name}</div>
              <div className="text-sm text-gray-600">
                {e.exam_date} • {e.start_time} - {e.end_time} • {e.center}
              </div>
            </div>

            <div className="flex items-center gap-3">

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
                className="px-3 py-1 bg-purple-600 text-white rounded text-sm"
              >
                View Students
              </Link>

              {/* View Halltickets */}
              <a
                className="px-3 py-1 bg-gray-100 rounded text-sm"
                href={`http://localhost:5001/api/exams/${e.id}/hallticket`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Halltickets
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Create Exam Modal */}
      <CreateExamModal
        isOpen={openCreate}
        onClose={() => {
          setOpenCreate(false);
          fetchExams();
        }}
      />

      {/* Assign Students Modal */}
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