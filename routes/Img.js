const multer = require("multer");
const path = require("path");
const express = require("express");
const { uploadImg } = require("../controllers/ImageController");
const router = express.Router();



// 📁 Storage Config
const storage = multer.diskStorage({
  destination: "./uploads/images",  // make sure folder exists
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}_${Date.now()}${ext}`);
  }
});

// 📸 File Filter (optional but recommended)
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only images allowed"), false);
};

// 📂 Multer Upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 } // 3MB
});


router.post("/upload", upload.single("image"), uploadImg);

module.exports = router;

