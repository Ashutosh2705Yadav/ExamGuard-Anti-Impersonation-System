import React from "react";

/**
 * Props:
 * - open: boolean
 * - student: object | null
 * - logs: array (verification logs for all students) — we'll show only those for this student
 * - onClose: function
 */
export default function StudentDetailModal({ open, student, logs = [], onClose }) {
  if (!open || !student) return null;

  // filter logs for this student (match by id or aadhaar or email)
  const studentLogs = logs.filter(
    (l) =>
      (l.student_id && l.student_id === student.id) ||
      (l.aadhaar && student.aadhaar && l.aadhaar === student.aadhaar) ||
      (l.email && student.email && l.email === student.email) ||
      (l.name && student.name && l.name === student.name)
  ).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* modal */}
      <div className="relative bg-white w-11/12 md:w-3/4 lg:w-2/3 max-h-[90vh] overflow-auto rounded-lg shadow-lg p-6 z-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-semibold">Student Details</h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 bg-gray-100 px-3 py-1 rounded"
          >
            Close
          </button>
        </div>

        {/* profile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="col-span-2">
            <h4 className="text-xl font-medium">{student.name}</h4>
            <p className="text-sm text-gray-600">{student.email}</p>
            <p className="text-sm text-gray-600">Phone: {student.phone}</p>
            <p className="text-sm text-gray-600">Aadhaar: {student.aadhaar}</p>
            <p className="text-sm text-gray-500 mt-2">
              Registered: {new Date(student.created_at).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            {student.qr_code ? (
              <img src={student.qr_code} alt="qr" className="w-32 h-32 object-contain border p-1 rounded bg-white" />
            ) : (
              <div className="w-32 h-32 flex items-center justify-center border rounded text-sm text-gray-500">
                No QR
              </div>
            )}

            <button
              onClick={() => {
                // download QR as image if available
                if (!student.qr_code) return;
                const a = document.createElement("a");
                a.href = student.qr_code;
                a.download = `student-${student.id}-qr.png`;
                document.body.appendChild(a);
                a.click();
                a.remove();
              }}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Download QR
            </button>
          </div>
        </div>

        {/* optional fingerprint hash (hidden by default, admin can toggle) */}
        <details className="mb-4">
          <summary className="cursor-pointer text-sm text-gray-700">Fingerprint hash (show)</summary>
          <pre className="bg-gray-100 p-3 rounded mt-2 text-xs overflow-auto">{student.fingerprint_hash || "—"}</pre>
        </details>

        {/* verification history */}
        <h4 className="text-lg font-semibold mb-2">Verification History</h4>
        <div className="space-y-2">
          {studentLogs.length === 0 && (
            <div className="text-sm text-gray-500">No verification logs for this student.</div>
          )}

          {studentLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between border p-3 rounded">
              <div>
                <div className="text-sm">
                  <span className="font-medium">{log.status}</span>
                  {" • "}
                  <span className="text-gray-600 text-xs">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {log.notes || ""} {/* if you later add notes field */}
                </div>
              </div>
              <div>
                <span className={`px-2 py-1 rounded text-xs ${log.status === "VERIFIED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}