import React from "react";
import { useState, useContext } from "react";
import API from "../services/api.js";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/admin/login", form);

      if (res.data.success) {
        login(res.data.token);
        navigate("/");
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg p-8 rounded-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          ExamGuard Admin Login
        </h1>

        {error && (
          <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-center">
            {error}
          </p>
        )}

        <div className="mb-4">
          <label className="block mb-1 text-gray-700">Username</label>
          <input
            type="text"
            name="username"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            value={form.username}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            value={form.password}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}