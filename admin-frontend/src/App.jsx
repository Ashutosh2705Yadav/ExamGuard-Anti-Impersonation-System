import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext.jsx";
import Exams from "./pages/Exams.jsx";
import AssignedStudents from "./pages/AssignedStudents";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Verify from "./pages/Verify";

export default function App() {
  const { token } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/exams/:examId/students" element={<AssignedStudents />} />
        <Route path="/exams" element={token ? <Exams /> : <Navigate to="/login" />} />
        <Route path="/verify" element={<Verify />} />

        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Route */}
        <Route
          path="/"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />

      </Routes>
    </BrowserRouter>
  );
}