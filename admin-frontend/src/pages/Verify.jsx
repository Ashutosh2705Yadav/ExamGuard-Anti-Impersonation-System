import React, { useState } from "react";
import API from "../services/api";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function Verify() {
  const [scanResult, setScanResult] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Start QR Scanner
  const startScanner = () => {
    const scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: 250,
    });

    scanner.render(
      async (qrText) => {
        scanner.clear();
        handleScan(qrText);
      },
      () => { }
    );
  };

  // Handle QR Scan
  const handleScan = async (qrText) => {
    try {
      setLoading(true);
      const res = await API.post("/verify/scan", { qrPayload: qrText });

      if (res.data.success) {
        setScanResult(res.data);
        setMessage("");
      } else {
        setMessage("Invalid QR");
      }
    } catch (err) {
      setMessage("Invalid or unreadable QR");
    } finally {
      setLoading(false);
    }
  };

  // Verify Fingerprint
  const verifyFingerprint = async () => {
    try {
      setLoading(true);

      const res = await API.post("/verify", {
        studentId: scanResult.student.id,
        examId: scanResult.exam.id,
        fingerprint: "my_fingerprint", // static for now
      });

      setMessage(res.data.message);
    } catch (err) {
      if (err.response?.status === 401) {
        setMessage("Authentication error. Please login again.");
      } else {
        setMessage("Verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex justify-center">
      {/* ABSOLUTE TOP-LEFT BACK BUTTON */}
      {/* BACK TO DASHBOARD */}
      <a
        href="/"
        className="fixed top-4 left-4 inline-flex items-center gap-2 px-4 py-2 
             bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-100
             transition z-50"
      >
        <span className="text-lg">←</span> Dashboard
      </a>
      <div className="w-full max-w-2xl">





        <h1 className="text-3xl font-bold mb-6 text-center">
          Verify Student Identity
        </h1>

        {/* ------------------------------ */}
        {/* SCANNER SECTION */}
        {/* ------------------------------ */}
        {!scanResult && (
          <div className="bg-white/60 backdrop-blur shadow-lg rounded-xl p-6 border border-gray-200 text-center">

            <button
              onClick={startScanner}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              Start QR Scanner
            </button>

            <div id="qr-reader" className="mt-5"></div>

            {message && (
              <p className="mt-4 text-red-600 font-medium">{message}</p>
            )}
          </div>
        )}

        {/* ------------------------------ */}
        {/* RESULT SECTION */}
        {/* ------------------------------ */}
        {scanResult && (
          <div className="mt-6 bg-white/70 backdrop-blur shadow-xl rounded-xl p-6 border border-gray-200 animate-fade">

            <h2 className="text-xl font-semibold mb-3 border-b pb-2">
              Student Details
            </h2>

            <div className="space-y-1 text-gray-700">
              <p><b>Name:</b> {scanResult.student.name}</p>
              <p><b>Email:</b> {scanResult.student.email}</p>
              <p><b>Aadhaar:</b> {scanResult.student.aadhaar}</p>
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-3 border-b pb-2">
              Exam Details
            </h2>

            <div className="space-y-1 text-gray-700">
              <p><b>Exam:</b> {scanResult.exam.exam_name}</p>
              <p><b>Center:</b> {scanResult.exam.center}</p>
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-3 border-b pb-2">
              Hall Ticket QR
            </h2>

            <div className="flex justify-center">
              <img
                src={scanResult.hallticket}
                className="w-48 border rounded shadow"
                alt="QR Code"
              />
            </div>

            <button
              onClick={verifyFingerprint}
              disabled={loading}
              className="mt-6 w-full py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
            >
              Verify Fingerprint
            </button>

            {message && (
              <p
                className={`mt-5 text-center text-lg font-bold ${message.includes("matched")
                  ? "text-green-600"
                  : "text-red-600"
                  }`}
              >
                {message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}