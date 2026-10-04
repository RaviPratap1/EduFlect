const multer = require("multer");
const path = require("path");
const fs = require("fs");

const TEMP_DIR = path.join(process.cwd(), "public", "temp");

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_DIR),

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
]);

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.has(file.mimetype)) {
    return cb(null, true);
  }

  cb(
    new Error("Only JPEG, PNG, WEBP images and MP4 videos are allowed."),
    false
  );
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024,
    files: 5,
  },
});