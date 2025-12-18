import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function Verify() {
  const navigate = useNavigate();

  const scannerRef = useRef(null);
  const [scanResult, setScanResult] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  // 🔐 Check camera permission explicitly
  const checkCameraPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraReady(true);
    } catch (err) {
      console.error("Camera permission error:", err);
      setMessage(
        "Camera access denied. Please allow camera permission and reload."
      );
      setCameraReady(false);
    }
  };

  useEffect(() => {
    checkCameraPermission();

    return () => {
      // 🧹 cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  // ▶ Start QR Scanner (safe)
  const startScanner = () => {
    if (!cameraReady) {
      setMessage("Camera not available.");
      return;
    }

    // prevent multiple scanners
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: 250,
        rememberLastUsedCamera: true,
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      async (qrText) => {
        try {
          await scanner.clear();
          scannerRef.current = null;
          handleScan(qrText);
        } catch {}
      },
      () => {}
    );
  };

  // 📡 Handle QR scan
  const handleScan = async (qrText) => {
    try {
      setLoading(true);
      setMessage("");

      const res = await API.post("/verify/scan", {
        qrPayload: qrText,
      });

      if (res.data.success) {
        setScanResult(res.data);
      } else {
        setMessage("Invalid QR Code");
      }
    } catch (err) {
      setMessage("Invalid or unreadable QR");
    } finally {
      setLoading(false);
    }
  };

  // 🧬 Verify fingerprint
  const verifyFingerprint = async () => {
    try {
      setLoading(true);

      const res = await API.post("/verify", {
        studentId: scanResult.student.id,
        examId: scanResult.exam.id,
        fingerprint: "my_fingerprint",
      });

      setMessage(res.data.message);
    } catch (err) {
      setMessage("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex justify-center">
      {/* BACK */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 px-4 py-2 bg-white border rounded-lg shadow hover:bg-gray-100 z-50"
      >
        ← Dashboard
      </button>

      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Verify Student Identity
        </h1>

        {/* SCANNER */}
        {!scanResult && (
          <div className="bg-white shadow-lg rounded-xl p-6 border text-center">
            <button
              onClick={startScanner}
              disabled={!cameraReady}
              className={`px-5 py-2 rounded-lg shadow transition ${
                cameraReady
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              Start QR Scanner
            </button>

            <div id="qr-reader" className="mt-5"></div>

            {message && (
              <p className="mt-4 text-red-600 font-medium">{message}</p>
            )}
          </div>
        )}

        {/* RESULT */}
        {scanResult && (
          <div className="mt-6 bg-white shadow-xl rounded-xl p-6 border">
            <h2 className="text-xl font-semibold mb-3">Student Details</h2>

            <p><b>Name:</b> {scanResult.student.name}</p>
            <p><b>Email:</b> {scanResult.student.email}</p>
            <p><b>Aadhaar:</b> {scanResult.student.aadhaar}</p>

            <h2 className="text-xl font-semibold mt-4">Exam Details</h2>
            <p><b>Exam:</b> {scanResult.exam.exam_name}</p>
            <p><b>Center:</b> {scanResult.exam.center}</p>

            <h2 className="text-xl font-semibold mt-4">Hall Ticket QR</h2>
            <div className="flex justify-center mt-2">
              <img
                src={scanResult.hallticket}
                className="w-48 border rounded"
                alt="QR"
              />
            </div>

            <button
              onClick={verifyFingerprint}
              disabled={loading}
              className="mt-6 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Verify Fingerprint
            </button>

            {message && (
              <p
                className={`mt-4 text-center text-lg font-bold ${
                  message.includes("matched")
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