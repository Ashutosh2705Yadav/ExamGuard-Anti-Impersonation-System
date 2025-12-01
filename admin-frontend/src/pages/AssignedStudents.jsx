import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";

export default function AssignedStudents() {
  const { examId } = useParams();
  const [students, setStudents] = useState([]);

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

      <Link
        to="/admin/exams"
        className="px-3 py-1 bg-gray-200 rounded text-sm mb-4 inline-block"
      >
        ← Back to Exams
      </Link>

      <div className="space-y-4 mt-4">
        {students.length === 0 ? (
          <div className="text-gray-500">No students assigned yet.</div>
        ) : (
          students.map((s) => (
            
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
                    className={`px-2 py-1 rounded text-white text-xs ${s.status === "VERIFIED"
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

              <div className="flex items-center gap-3">
                {/* View Hallticket */}
                <a
                  href={`http://localhost:5001/api/exams/${examId}/hallticket`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  View Hallticket
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}