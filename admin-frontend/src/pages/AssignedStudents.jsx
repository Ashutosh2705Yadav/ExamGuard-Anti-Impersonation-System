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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Assigned Students</h1>

      {/* ✅ SPA-safe navigation */}
      <Link
        to="/exams"
        className="px-3 py-1 bg-gray-200 rounded text-sm mb-4 inline-block"
      >
        ← Back to Exams
      </Link>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by name, email or Aadhaar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-1/3 px-3 py-2 border rounded mb-4"
      />

      <div className="space-y-4 mt-4">
        {students.length === 0 ? (
          <div className="text-gray-500">No students assigned yet.</div>
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
                className="p-4 border rounded flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold">
                    {s.name} • {s.email}
                  </div>
                  <div className="text-sm text-gray-600">
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