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
      (err) => {}
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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Verify Student Identity</h1>

      {!scanResult && (
        <>
          <button
            onClick={startScanner}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Start QR Scanner
          </button>

          <div id="qr-reader" className="mt-4"></div>

          {message && <p className="mt-3 text-red-500">{message}</p>}
        </>
      )}

      {scanResult && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-bold mb-3">Student Details</h2>
          <p>
            <b>Name:</b> {scanResult.student.name}
          </p>
          <p>
            <b>Email:</b> {scanResult.student.email}
          </p>
          <p>
            <b>Aadhaar:</b> {scanResult.student.aadhaar}
          </p>

          <h2 className="text-xl font-bold mt-4">Exam Details</h2>
          <p>
            <b>Exam:</b> {scanResult.exam.exam_name}
          </p>
          <p>
            <b>Center:</b> {scanResult.exam.center}
          </p>

          <h2 className="text-xl font-bold mt-4">Hall Ticket QR</h2>
          <img
            src={scanResult.hallticket}
            className="w-40 border"
            alt="QR Code"
          />

          <button
            onClick={verifyFingerprint}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
            disabled={loading}
          >
            Verify Fingerprint
          </button>

          {message && (
            <p
              className={`mt-4 font-bold text-lg ${
                message.includes("matched")
                  ? "text-green-600"
                  : message.includes("failed")
                  ? "text-red-600"
                  : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}