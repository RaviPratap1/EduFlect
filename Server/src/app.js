const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const courseRoutes = require("./routes/course.routes");
const categoryRoutes = require("./routes/category.routes");
const sectionRoutes = require("./routes/section.routes");
const subSectionRoutes = require("./routes/subSection.routes");
const ratingRoutes = require("./routes/rating.routes");
const paymentRoutes = require("./routes/payment.routes");
const enrollmentRoutes = require("./routes/enrollment.routes");

const app = express();

// ─── SECURITY MIDDLEWARE ───────────────────────────────────────
app.use(helmet());
app.use(cookieParser());

// app.use((req, res, next) => {
//   console.log("Origin:", req.headers.origin);
//   next();
// });

// app.use(cors({
//   origin: function(origin, callback) {
//     const allowedOrigins = [
//       "http://localhost:5174",
//       "http://localhost:5173",
//       process.env.CLIENT_URL,
//     ];
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
// }));

// app.use(cors());

app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.CLIENT_URL,
    ].filter(Boolean);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ─── BODY PARSING ─────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ─── ROUTES ───────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/sections", sectionRoutes);
app.use("/api/v1/subsections", subSectionRoutes);
app.use("/api/v1/ratings", ratingRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);

// ─── HEALTH CHECK ─────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "EduFlect Server is running 🚀" });
});

// ─── 404 HANDLER ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─── EMAIL CONFIG ─────────────────────────────────────────────
require('./config/email.config');

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (err.success === false) {
    return res.status(statusCode).json({ success: false, message });
  }

  if (err.name === "ValidationError" && err.errors) {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: errors.join(", ") });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ success: false, message: `${field} already exists` });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token expired, please login again" });
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
