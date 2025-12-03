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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 p-4">
      <div className="bg-white/10 backdrop-blur-lg shadow-2xl p-10 rounded-2xl w-full max-w-md border border-white/20">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-white drop-shadow">
          🔐 ExamGuard Admin Login
        </h1>

        {error && (
          <p className="bg-red-500/20 text-red-200 p-3 rounded mb-4 text-center border border-red-400/30">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block mb-1 text-gray-200 font-semibold">
            Username
          </label>
          <input
            type="text"
            name="username"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-200 border border-white/30 focus:border-blue-300 outline-none"
            onChange={handleChange}
            value={form.username}
            required
          />
        </div>

        <div className="mb-8">
          <label className="block mb-1 text-gray-200 font-semibold">
            Password
          </label>
          <input
            type="password"
            name="password"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-200 border border-white/30 focus:border-blue-300 outline-none"
            onChange={handleChange}
            value={form.password}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-white text-blue-700 font-bold py-3 rounded-lg shadow-md hover:bg-gray-100 transition"
        >
          Login
        </button>
        </form>
      </div>
    </div>
  );
}