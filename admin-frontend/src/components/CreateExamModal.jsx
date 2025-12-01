// admin-frontend/src/components/CreateExamModal.jsx
import React, { useState } from "react";
import API from "../services/api";

export default function CreateExamModal({ isOpen, onClose }) {
  const [form, setForm] = useState({
    exam_name: "",
    exam_date: "",
    start_time: "",
    end_time: "",
    center: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setLoading(true);
    try {
      const res = await API.post("/exams", form);
      if (res.data && res.data.success) {
        onClose();
      } else {
        alert(res.data?.message || "Unable to create exam");
      }
    } catch (err) {
      console.error("CreateExam error:", err);
      alert("Server error creating exam");
    }
    setLoading(false);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white p-6 rounded w-full max-w-md">
        <h3 className="text-xl font-semibold mb-3">Create Exam</h3>

        <input
          name="exam_name"
          onChange={handleChange}
          placeholder="Exam name"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          name="exam_date"
          onChange={handleChange}
          type="date"
          className="w-full p-2 border rounded mb-2"
        />
        <div className="flex gap-2 mb-2">
          <input
            name="start_time"
            onChange={handleChange}
            type="time"
            className="flex-1 p-2 border rounded"
          />
          <input
            name="end_time"
            onChange={handleChange}
            type="time"
            className="flex-1 p-2 border rounded"
          />
        </div>
        <input
          name="center"
          onChange={handleChange}
          placeholder="Center (e.g., Room 101)"
          className="w-full p-2 border rounded mb-4"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 bg-gray-200 rounded">
            Cancel
          </button>
          <button disabled={loading} onClick={submit} className="px-3 py-1 bg-blue-600 text-white rounded">
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}