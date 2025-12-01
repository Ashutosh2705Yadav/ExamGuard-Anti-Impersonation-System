import React, { useState } from "react";
import API from "../services/api";

export default function AddStudentModal({ isOpen, onClose, onStudentAdded }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    aadhaar: "",
    fingerprint: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/students/register", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        aadhaar: form.aadhaar,
        fingerprint: form.fingerprint,
      });

      if (res.data.success) {
        onStudentAdded(); // refresh dashboard
        onClose(); // close modal
      } else {
        setError(res.data.message || "Error adding student");
      }
    } catch (err) {
      setError("Server error");
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Add New Student</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-3">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <input
            name="name"
            placeholder="Full Name"
            className="w-full border p-2 rounded"
            onChange={handleChange}
          />

          <input
            name="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            onChange={handleChange}
          />

          <input
            name="phone"
            placeholder="Phone"
            className="w-full border p-2 rounded"
            onChange={handleChange}
          />

          <input
            name="aadhaar"
            placeholder="Aadhaar Number"
            className="w-full border p-2 rounded"
            onChange={handleChange}
          />

          <input
            name="fingerprint"
            placeholder="Fingerprint (text temporary)"
            className="w-full border p-2 rounded"
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 mr-3 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? "Adding..." : "Add Student"}
          </button>
        </div>
      </div>
    </div>
  );
}