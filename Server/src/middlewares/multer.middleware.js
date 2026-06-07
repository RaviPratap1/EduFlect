const multer = require("multer");
const path = require("path");
const fs = require("fs");

const TEMP_DIR = path.join(process.cwd(), "public", "temp");
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-+/g, "-").toLowerCase();
    cb(null, `${Date.now()}-${basename}${ext}`);
  },
});

const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "video/x-msvideo", "video/webm", "video/x-matroska"]);

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WEBP, MP4, MOV, AVI, WEBM allowed"), false);
  }
};

exports.upload = multer({ storage, fileFilter, limits: { fileSize: 500 * 1024 * 1024, files: 5 } });
