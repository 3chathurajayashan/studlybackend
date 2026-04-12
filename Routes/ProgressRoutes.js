import express from "express";
import {
  startProgress,
  submitWork,
  markUnderReview,
  gradeSubmission,
  getStudentProgress,
  getAllSubmissions,
  updateProgress,
  deleteProgress,
} from "../Controllers/ProgressControler.js";

import  upload  from "../middlewares/upload.js";

const router = express.Router();

/* =========================================================
   STUDENT ROUTES
========================================================= */

/* Start progress (lecture / assignment / quiz) */
router.post("/start", startProgress);

/* Submit assignment / work (file upload supported) */
router.post("/submit/:id", upload.single("file"), submitWork);

/* Update lecture progress (time spent, % completion) */
router.put("/update/:id", updateProgress);

/* Get student dashboard progress */
router.get("/student/:studentId", getStudentProgress);


/* =========================================================
   INSTRUCTOR ROUTES
========================================================= */

/* Get all submissions (filter by query params) */
router.get("/submissions", getAllSubmissions);

/* Mark submission under review */
router.put("/:id/review", markUnderReview);

/* Grade submission (marks + feedback) */
router.put("/:id/grade", gradeSubmission);


/* =========================================================
   ADMIN / CLEANUP
========================================================= */

/* Delete progress record */
router.delete("/:id", deleteProgress);

export default router;