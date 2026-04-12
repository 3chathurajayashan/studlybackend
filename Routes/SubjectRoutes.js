import express from "express";
import {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject
} from "../Controllers/SubjectController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();


 

// Anyone can view subjects
router.get("/", getSubjects);
router.get("/:id", getSubjectById);


 

// Create subject (only instructors)
router.post("/", protect, createSubject);

// Update subject (only owner instructor)
router.put("/:id", protect, updateSubject);

// Delete subject (only owner instructor)
router.delete("/:id", protect, deleteSubject);

export default router;