import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function AssignStudentsModal({ isOpen, onClose, exam }) {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const allSelected =
    students.length > 0 && selected.size === students.length;

  // Fetch list of students when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchStudents = async () => {
      try {
        const res = await API.get("/students");
        setStudents(res.data.students || []);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };

    fetchStudents();
  }, [isOpen]);

  // Toggle selection
  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  // Submit assignment
  const submit = async () => {
    if (!exam) return alert("No exam selected.");
    if (selected.size === 0) return alert("Please select at least one student.");

    setLoading(true);

    try {
      const res = await API.post(`/exams/${exam.id}/assign`, {
        studentIds: Array.from(selected),
      });

      if (res.data.success) {
        alert(`Assigned ${res.data.assigned.length} students successfully`);
        onClose();
        setSelected(new Set());
      } else {
        alert(res.data.message || "Error assigning students.");
      }
    } catch (err) {
      console.error("Assign error:", err);
      alert("Server error assigning students.");
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white p-6 rounded w-full max-w-3xl max-h-[80vh] overflow-auto shadow-lg">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            Assign Students to "{exam?.exam_name}"
          </h3>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>

        {/* Select All */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => {
              if (e.target.checked) {
                setSelected(new Set(students.map(s => s.id)));
              } else {
                setSelected(new Set());
              }
            }}
          />
          <span className="font-medium">Select All Students</span>
        </div>

        {/* Students List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {students.map((s) => (
            <label
              key={s.id}
              className="p-3 border rounded flex items-center gap-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.has(s.id)}
                onChange={() => toggle(s.id)}
              />
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-gray-500">
                  {s.email} • {s.aadhaar}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={submit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? "Assigning..." : "Assign"}
          </button>
        </div>

      </div>
    </div>
  );
}