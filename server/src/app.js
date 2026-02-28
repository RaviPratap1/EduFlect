const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const courseRoutes = require("./routes/courseRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const subSectionRoutes = require("./routes/subSectionRoutes");
const rating = require("./routes/ratingRoutes")

const cors = require("cors");

const model =  require("./models/index")

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"], // frontend URLs
    credentials: true,
  })
);



app.use(express.json());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/"
}));


// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/sections", sectionRoutes);
app.use("/api/v1/subsections", subSectionRoutes);
app.use("/api/v1/rating", rating);



app.get("/", (req, res) => {
  res.send("EduFlect API Running");
});

module.exports = app;