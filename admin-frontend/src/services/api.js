import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach token automatically for every request
API.interceptors.request.use(
  (config) => {
    // Accept both keys (backward-compatible)
    const token =
      localStorage.getItem("adminToken") || localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;