import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";

// ✅ backend base URL (Render-safe)
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function AssignedStudents() {
  const { examId } = useParams();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  const fetchAssigned = async () => {
    try {
      const res = await API.get(`/exams/${examId}/students`);
      setStudents(res.data.students || []);
    } catch (err) {
      console.error("Assigned students error:", err);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-white">Assigned Students</h1>

      <Link
        to="/exams"
        className="inline-block px-3 py-1 bg-gray-800 text-gray-100 rounded text-sm hover:bg-gray-700"
      >
        ← Back to Exams
      </Link>

      <input
        type="text"
        placeholder="Search by name, email or Aadhaar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="block mt-4 w-full md:w-1/3 px-3 py-2 rounded bg-gray-800 text-gray-100 border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="space-y-4 mt-4">
        {students.length === 0 ? (
          <div className="text-gray-400">No students assigned yet.</div>
        ) : (
          students
            .filter((s) => {
              const q = search.toLowerCase();
              return (
                s.name?.toLowerCase().includes(q) ||
                s.email?.toLowerCase().includes(q) ||
                s.aadhaar?.includes(q)
              );
            })
            .map((s) => (
              <div
                key={s.id}
                className="p-4 border border-gray-700 rounded-lg flex justify-between items-center bg-gray-800 shadow"
              >
                <div>
                  <div className="font-semibold">
                    {s.name} • {s.email}
                  </div>
                  <div className="text-sm text-gray-400">
                    Aadhaar: {s.aadhaar}
                  </div>
                  <div className="text-sm">
                    Status:{" "}
                    <span
                      className={`px-2 py-1 rounded text-white text-xs ${
                        s.status === "VERIFIED"
                          ? "bg-green-600"
                          : s.status === "IMPERSONATION"
                          ? "bg-red-600"
                          : "bg-gray-400"
                      }`}
                    >
                      {s.status || "PENDING"}
                    </span>
                  </div>
                </div>

                {/* ✅ External backend link (Render-safe) */}
                <a
                  href={`${BACKEND_URL}/exams/${examId}/hallticket/student/${s.student_id || s.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  View Hallticket
                </a>
              </div>
            ))
        )}
      </div>
    </div>
  );
}