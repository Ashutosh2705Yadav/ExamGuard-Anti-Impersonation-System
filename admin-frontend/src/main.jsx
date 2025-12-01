import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";            // <- required
import { AuthProvider } from "./context/AuthContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);