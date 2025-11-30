import jwt from "jsonwebtoken";

export const adminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.admin = decoded;  // store admin info for future use

    next();

  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};