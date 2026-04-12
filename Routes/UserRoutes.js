// Route/UserRoute.js
import {upload} from '../Controllers/UserController.js'
import express from "express";
import User from '../Models/UserModel.js';
import {
  registerUser,
  verifyEmail,
  loginUser,
  resendOTP,
  getUserById,
  updateUser,
  deleteUser,
  getAllInstructors,
  getAllStudents,
  updateProfilePicture,
  getAllSubmissions,
  gradeSubmission,
  markUnderReview,
} from "../Controllers/UserController.js";

const router = express.Router();

// 🟢 Register
router.post("/register",upload.single("profilePicture"), registerUser);
router.get("/:id", getUserById);
// UPDATE USER
router.put("/:id", upload.single("profilePicture"),updateUser);
router.get("/instructors/all", getAllInstructors);
router.get("/students/all", getAllStudents);

// DELETE USER
router.delete("/:id", deleteUser);

// 🔵 Verify OTP
router.post("/verify-email", verifyEmail);

// 🟡 Login
router.post("/login", loginUser);

// 🔄 Resend OTP
router.post("/resend-otp", resendOTP);

 router.put("/update-profile-picture/:id", upload.single("profilePicture"), updateProfilePicture);

 /* Instructor - view submissions */
router.get("/submissions", getAllSubmissions);

/* Instructor - mark reviewing */
router.put("/:id/review", markUnderReview);

/* Instructor - grade */
router.put("/:id/grade", gradeSubmission);

export default router;