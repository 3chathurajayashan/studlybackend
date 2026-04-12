import Course from "../Models/CourseModel.js";
import Subject from "../Models/SubjectModel.js";
import streamifier from "streamifier";
import User from '../Models/UserModel.js'
import cloudinary from "../Config/cloudinary.js";

 
export const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      instructor,
      duration,
      level,
      price,
      currency,
      enrollmentLimit,
      prerequisites,
      tags
    } = req.body;

    // Required fields check
    if (!title || !description || !subject || !instructor || !duration) {
      return res.status(400).json({ success: false, message: "Required fields are missing" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Course cover image is required" });
    }

    // Validate subject
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    // Validate instructor
    const userExists = await User.findById(instructor);
    if (!userExists) {
      return res.status(404).json({ success: false, message: "Instructor not found" });
    }

    // Upload cover image to Cloudinary
    const uploadFromBuffer = (fileBuffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "courses" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });

    const result = await uploadFromBuffer(req.file.buffer);

    // Create course
    const course = await Course.create({
      title,
      description,
      subject,
      instructor,
      duration,
      coverImage: result.secure_url, // Save Cloudinary URL
      level,
      price,
      currency,
      enrollmentLimit,
      prerequisites,
      tags
    });

    res.status(201).json({ success: true, message: "Course created successfully", data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL COURSES
export const getCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", level, isPublished } = req.query;

    let query = { isDeleted: false };

    if (search) query.$text = { $search: search };
    if (level) query.level = level;
    if (isPublished !== undefined) query.isPublished = isPublished === "true";

    const courses = await Course.find(query)
      .populate("subject", "name")
      .populate("instructor", "name email profilePicture")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      data: courses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET SINGLE COURSE
export const getSingleCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, isDeleted: false })
       .populate({
    path: "subject",
    select: "name slug instructor description status isFeatured sortOrder createdBy updatedBy categoryType level code",
    populate: {
      path: "createdBy",
      select: "_id name email"
    },
    
  })
      
      .populate("instructor", "_id name email role")
      .populate("contents")
       .populate("assessments")
      

    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE COURSE
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, isDeleted: false });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // ✅ Update normal fields
    Object.assign(course, req.body);

    // ✅ If new image uploaded → upload to Cloudinary
    if (req.file) {
      const uploadFromBuffer = (fileBuffer) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "courses" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(fileBuffer).pipe(stream);
        });

      const result = await uploadFromBuffer(req.file.buffer);

      // ✅ Update coverImage
      course.coverImage = result.secure_url;
    }

    await course.save();

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// TOGGLE PUBLISH / UNPUBLISH
export const togglePublishCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, isDeleted: false });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    if (!course.title || !course.description || !course.coverImage || !course.duration) {
      return res.status(400).json({ success: false, message: "Complete course details before publishing" });
    }

    course.isPublished = !course.isPublished;
    await course.save();

    res.status(200).json({
      success: true,
      message: `Course ${course.isPublished ? "published" : "unpublished"} successfully`,
      data: course
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/// DELETE COURSE (SOFT DELETE) — assign deletedBy as creator if no auth
export const deleteCourse = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Delete reason is required"
      });
    }

    const course = await Course.findOne({ _id: req.params.id, isDeleted: false });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Soft delete
    course.isDeleted = true;
    course.deletedAt = new Date();
    course.deleteReason = reason;

    // Assign deletedBy as course creator if no auth
    course.deletedBy = course.instructor;

    await course.save();

    res.status(200).json({
      success: true,
      message: "Course soft deleted successfully",
      data: course
    });
  } catch (error) {
    console.error(error); // log real error for debugging
    res.status(500).json({ success: false, message: error.message });
  }
};


// DELETE COURSE PERMANENTLY (ADMIN)
export const deleteCoursePermanently = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, isDeleted: true });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found or not soft deleted" });
    }

    await Course.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: "Course permanently deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};