import express from "express";
import {
  enrollCourse,
  getMyCourses,
  getCourseStudents
} from "../Controllers/enrollmentController.js";

const router = express.Router();

// 🔥 Enroll
router.post("/enroll", enrollCourse);

// 🔥 Get logged user's courses
router.get("/my-courses/:userId", getMyCourses);

// 🔥 Get students of a course
router.get("/course-students/:courseId", getCourseStudents);

export default router;