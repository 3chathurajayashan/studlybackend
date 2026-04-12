import User from "../Models/UserModel.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import fs from "fs";
import path from "path";

// ================= CLOUDINARY CONFIG =================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ================= MULTER CONFIG FOR IMAGE UPLOAD =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
});

// ================= EMAIL SETUP =================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 📩 SEND EMAIL FUNCTION
const sendOTPEmail = async (email, otp) => {
  const currentYear = new Date().getFullYear();
  await transporter.sendMail({
    from: `"Studly Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${otp} is your Studly verification code`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; color: #333333; border: 1px solid #f0f0f0; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4F46E5; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px;">Studly</h1>
        </div>
        <div style="line-height: 1.6;">
          <h2 style="font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 16px;">Verify your email address</h2>
          <p style="margin-bottom: 24px; color: #4B5563;">Hello,</p>
          <p style="margin-bottom: 24px; color: #4B5563;">
            To finish setting up your account and ensure your security, please use the following verification code. This code is valid for <b>3 minutes</b>.
          </p>
          <div style="background-color: #F3F4F6; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="display: block; font-size: 12px; text-transform: uppercase; tracking: 0.1em; color: #6B7280; margin-bottom: 8px; font-weight: 600;">Verification Code</span>
            <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; color: #111827; letter-spacing: 8px;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #6B7280; margin-bottom: 32px;">
            <i>If you didn't request this code, you can safely ignore this email. Someone may have typed your email address by mistake.</i>
          </p>
          <hr style="border: 0; border-top: 1px solid #E5E7EB; margin-bottom: 24px;">
          <p style="font-size: 13px; color: #9CA3AF; text-align: center;">
            Sent with 💙 from the Studly Team<br>
            &copy; ${currentYear} Studly Inc. All rights reserved.
          </p>
        </div>
      </div>
    `,
  });
};

// ================= REGISTER USER =================
export const registerUser = async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // ✅ HANDLE PROFILE IMAGE UPLOAD
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "studly/users",
      });
      req.body.profilePicture = result.secure_url;
      fs.unlinkSync(req.file.path); // remove temp file
    }

    user = new User(req.body);

    // 🔢 generate OTP
    const otp = user.generateEmailOTP();
    await user.save();

    // 📧 send email
    await sendOTPEmail(user.email, otp);

    res.status(201).json({ message: "User registered. OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ================= VERIFY EMAIL =================
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isValid = user.verifyEmailOTP(otp);
    if (!isValid) return res.status(400).json({ message: "Invalid or expired OTP" });

    await user.save();
    res.json({ message: "Email verified successfully. You can login now." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= LOGIN USER =================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.emailVerified) return res.status(401).json({ message: "Please verify your email first" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ message: "Login successful", token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= RESEND OTP =================
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = user.generateEmailOTP();
    await user.save();
    await sendOTPEmail(user.email, otp);

    res.json({ message: "OTP resent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET USER BY ID =================
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= UPDATE USER =================
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { _id, __v, createdAt, updatedAt, emailOTP, emailOTPExpires, ...updateData } = req.body;

    // 🔐 HASH PASSWORD
    if (updateData.password && updateData.password.trim() !== "") {
      const bcrypt = await import("bcryptjs");
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    } else {
      delete updateData.password;
    }

    // ✅ HANDLE PROFILE IMAGE UPLOAD
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "studly/users",
      });
      updateData.profilePicture = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        ...updateData,
        address: {
          street: updateData.address?.street,
          city: updateData.address?.city,
          state: updateData.address?.state,
          postalCode: updateData.address?.postalCode,
          country: updateData.address?.country,
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ================= DELETE USER =================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET ALL INSTRUCTORS =================
export const getAllInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: "instructor" }).select("-password").sort({ createdAt: -1 });
    res.json(instructors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET ALL STUDENTS =================
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password").sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= UPDATE PROFILE PICTURE ONLY =================
export const updateProfilePicture = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "studly/users",
      resource_type: "image",
    });

    // Remove temporary local file
    fs.unlinkSync(req.file.path);

    // Update user's profilePicture in DB
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { profilePicture: result.secure_url },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile picture updated successfully", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllSubmissions = async (req, res) => {
  try {
    const { courseId, assessmentId } = req.query;

    const filter = {
      type: "assignment",
    };

    if (courseId) filter.courseId = courseId;
    if (assessmentId) filter.assessmentId = assessmentId;

    const submissions = await Progress.find(filter)
      .populate("studentId", "name email")
      .populate("courseId", "title")
      .populate("assessmentId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const { marks, feedback, instructorId } = req.body;

    const updated = await Progress.findByIdAndUpdate(
      id,
      {
        instructorId,
        review: {
          marks,
          feedback,
          reviewedAt: new Date(),
        },
        status: "graded",
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Submission graded successfully",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markUnderReview = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Progress.findByIdAndUpdate(
      id,
      { status: "under-review" },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Marked as under review",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};