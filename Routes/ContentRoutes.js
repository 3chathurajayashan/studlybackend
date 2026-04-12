import express from "express";
import upload from "../middlewares/upload.js";
import { addContent ,getContentsByCourse,getSingleContent,updateContent,deleteContent} from "../Controllers/ContentController.js";

const router = express.Router();

router.post("/courses/:courseId/contents", upload.single("file"), addContent);


// READ
router.get("/courses/:courseId/contents", getContentsByCourse);
router.get("/contents/:id", getSingleContent);

// UPDATE
router.put("/contents/:id", upload.single("file"), updateContent);

// DELETE
router.delete("/contents/:id", deleteContent);

export default router;