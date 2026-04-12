// uploadMiddleware.js
import multer from "multer";

// ✅ Memory storage for Supabase uploads
const storage = multer.memoryStorage();

// Optional: file filter (allow all)
const fileFilter = (req, file, cb) => {
  cb(null, true);
};

// Multer instance
const upload = multer({ storage, fileFilter });

export default upload;