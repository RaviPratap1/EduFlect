const express = require("express");
const app = express();



app.use(express.json());

app.get("/", (req, res) => {
  res.send("EduFlect API Running");
});

module.exports = app;