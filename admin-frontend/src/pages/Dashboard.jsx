import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
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
  const [loading, setLoading] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
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
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of students, exams & verifications
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/exams"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
          >
            Exams
          </Link>

          <Link
            to="/verify"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition"
          >
            Verify Identity
          </Link>

          <button
            onClick={() => setOpenAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Add Student
          </button>

          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ================= LOADING ================= */}
      {loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-xl"></div>
            ))}
          </div>

          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </>
      )}

      {/* ================= STATS ================= */}
      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            color="bg-blue-600"
          />
          <StatCard
            title="Total Verifications"
            value={stats.totalLogs}
            color="bg-emerald-600"
          />
          <StatCard
            title="Verified"
            value={stats.totalVerified}
            color="bg-purple-600"
          />
          <StatCard
            title="Impersonations"
            value={stats.totalImpersonation}
            color="bg-red-600"
          />
        </div>
      )}

      {/* ================= STUDENTS ================= */}
      {!loading && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Registered Students
          </h2>
          <div className="bg-white rounded-xl shadow p-4">
            <StudentsPanel
              students={students}
              onSelectStudent={(s) => {
                setSelectedStudent(s);
                setModalOpen(true);
              }}
            />
          </div>
        </section>
      )}

      {/* ================= LOGS ================= */}
      {!loading && (
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Verification Logs
          </h2>

          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Time</th>
                  <th className="p-3 text-left">Student</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3">{log.id}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                          log.status === "VERIFIED"
                            ? "bg-emerald-600"
                            : log.status === "IMPERSONATION"
                            ? "bg-red-600"
                            : "bg-gray-400"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-medium">{log.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ================= MODALS ================= */}
      <StudentDetailModal
        open={modalOpen}
        student={selectedStudent}
        logs={logs}
        onClose={() => setModalOpen(false)}
      />

      <AddStudentModal
        isOpen={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onStudentAdded={fetchDashboardData}
      />
    </div>
  );
}

/* ================= REUSABLE STAT CARD ================= */
function StatCard({ title, value, color }) {
  return (
    <div className={`${color} text-white p-5 rounded-xl shadow`}>
      <div className="text-sm opacity-80">{title}</div>
      <div className="text-3xl font-bold mt-2">{value}</div>
    </div>
  );
}