const express = require("express");
const app = express();
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");



app.use(express.json());


// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profile", profileRoutes);

app.get("/", (req, res) => {
  res.send("EduFlect API Running");
});

module.exports = app;