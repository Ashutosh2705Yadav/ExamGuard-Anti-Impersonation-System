import React, { useEffect, useState, useContext } from "react";
import API from "../services/api";
import StudentsPanel from "../components/StudentsPanel.jsx";
import StudentDetailModal from "../components/StudentDetailModal.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import AddStudentModal from "../components/AddStudentModal";

export default function Dashboard() {
  const { logout } = useContext(AuthContext);

  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true); // NEW

  // modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // add student modal state
  const [openAddModal, setOpenAddModal] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, studentsRes, logsRes] = await Promise.all([
        API.get("/stats"),
        API.get("/students"),
        API.get("/logs"),
      ]);

      setStats(statsRes.data.stats);
      setStudents(studentsRes.data.students);
      setLogs(logsRes.data.logs);
    } catch (err) {
      console.log("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSelectStudent = (s) => {
    setSelectedStudent(s);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedStudent(null);
  };

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <div className="flex gap-3">
          <a
            href="/exams"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Exams
          </a>

          <a
            href="/verify"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Verify Identity
          </a>

          <button
            onClick={() => setOpenAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Student
          </button>

          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* --------------------------------------------------- */}
      {/*                    LOADING SKELETONS                */}
      {/* --------------------------------------------------- */}

      {loading && (
        <>
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 h-24 rounded"></div>
            ))}
          </div>

          {/* Students skeleton */}
          <h2 className="text-2xl font-bold mb-4">Registered Students</h2>
          <div className="space-y-3 mb-10 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-gray-200 h-12 rounded"></div>
            ))}
          </div>

          {/* Logs skeleton */}
          <h2 className="text-2xl font-bold mb-4">Verification Logs</h2>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 h-10 rounded"></div>
            ))}
          </div>
        </>
      )}

      {/* --------------------------------------------------- */}
      {/*                     AFTER LOADING                   */}
      {/* --------------------------------------------------- */}

      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">

          <div className="bg-blue-500 text-white p-4 rounded shadow">
            <h2 className="text-xl">Total Students</h2>
            <p className="text-3xl font-bold">{stats.totalStudents}</p>
          </div>

          <div className="bg-green-500 text-white p-4 rounded shadow">
            <h2 className="text-xl">Total Verifications</h2>
            <p className="text-3xl font-bold">{stats.totalLogs}</p>
          </div>

          <div className="bg-purple-500 text-white p-4 rounded shadow">
            <h2 className="text-xl">Verified</h2>
            <p className="text-3xl font-bold">{stats.totalVerified}</p>
          </div>

          <div className="bg-red-500 text-white p-4 rounded shadow">
            <h2 className="text-xl">Impersonations</h2>
            <p className="text-3xl font-bold">{stats.totalImpersonation}</p>
          </div>

        </div>
      )}

      {/* STUDENTS PANEL */}
      {!loading && (
        <>
          <h2 className="text-2xl font-bold mb-4">Registered Students</h2>
          <div className="mb-10">
            <StudentsPanel
              students={students}
              onSelectStudent={handleSelectStudent}
            />
          </div>
        </>
      )}

      {/* LOGS TABLE */}
      {!loading && (
        <>
          <h2 className="text-2xl font-bold mb-4">Verification Logs</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Time</th>
                  <th className="p-2 border">Student</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-100">
                    <td className="p-2 border">{log.id}</td>
                    <td className="p-2 border">{log.status}</td>
                    <td className="p-2 border">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-2 border">{log.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* STUDENT DETAIL MODAL */}
      <StudentDetailModal
        open={modalOpen}
        student={selectedStudent}
        logs={logs}
        onClose={handleCloseModal}
      />

      {/* ADD STUDENT MODAL */}
      <AddStudentModal
        isOpen={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onStudentAdded={fetchDashboardData}
      />
    </div>
  );
}