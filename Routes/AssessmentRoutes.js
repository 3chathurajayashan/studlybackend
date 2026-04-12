import express from "express";
import upload from "../middlewares/upload.js";
import { addAssessment,getAssessmentsByCourse,getSingleAssessment,updateAssessment,deleteAssessment} from "../Controllers/AssessmentController.js";

const router = express.Router();

router.post("/courses/:courseId/assessments", upload.single("file"), addAssessment);
// READ
router.get("/courses/:courseId/assessments", getAssessmentsByCourse);
router.get("/assessments/:id", getSingleAssessment);

// UPDATE
router.put("/assessments/:id", upload.single("file"), updateAssessment);

// DELETE
router.delete("/assessments/:id", deleteAssessment);

export default router;