import express from "express";
import upload from '../middlewares/upload.js'
import Course from '../Models/CourseModel.js'
import * as courseController from "../Controllers/CourseController.js";

const router = express.Router();

// CREATE
router.post("/courses",  upload.single("coverImage"),courseController.createCourse);

// READ
router.get("/courses", courseController.getCourses);
router.get("/courses/:id",upload.single("coverImage"), courseController.getSingleCourse);

// UPDATE
router.put("/courses/:id", upload.single("coverImage"),courseController.updateCourse);

// PUBLISH / UNPUBLISH
router.patch("/courses/:id/toggle-publish", courseController.togglePublishCourse);

// DELETE (Soft)
router.delete("/courses/:id", courseController.deleteCourse);
// GET ALL DELETED COURSES (ADMIN)
// routes/courseRoutes.js
// routes/CourseRoute.js
router.get("/admin/deleted-courses", async (req, res) => {
  try {
    const deletedCourses = await Course.find({ isDeleted: true })
      .populate({
        path: "subject",
        select: "name",
        options: { strictPopulate: false } // prevents failure if subject missing
      })
      .populate({
        path: "instructor",
        select: "name email",
        options: { strictPopulate: false } // prevents failure if instructor missing
      })
      .sort({ deletedAt: -1 });

    console.log("Deleted courses fetched:", deletedCourses.length);

    res.status(200).json({ success: true, data: deletedCourses });
  } catch (error) {
    console.error("Error fetching deleted courses:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching deleted courses",
      error: error.message
    });
  }
});

// DELETE PERMANENTLY (ADMIN)
router.delete("/admin/courses/:id/permanent", courseController.deleteCoursePermanently);

export default router;
