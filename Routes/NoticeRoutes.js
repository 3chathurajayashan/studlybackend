import express from "express";
import { createNotice, getNoticesByCourse, getNoticeById , getAllNotices} from "../Controllers/NoticeController.js";
import { protect } from "../middlewares/authMiddleware.js"; // JWT Auth middleware
import { upload } from "../middlewares/multerMiddleware.js"; 

const router = express.Router();

// Create notice (instructor only)
router.post("/", protect,upload.array("attachments"), createNotice);

// Get all notices for a course
router.get("/course/:courseId", getNoticesByCourse);
router.get("/all", getAllNotices);

// Get single notice
router.get("/:id", getNoticeById);

export default router;