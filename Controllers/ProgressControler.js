import Progress from "../Models/ProgressModel.js";
import cloudinary    from "../Config/cloudinary.js";
import Course from '../Models/CourseModel.js'
 
export const startProgress = async (req, res) => {
  try {
    const { studentId, courseId, contentId, assessmentId, type } = req.body;

    // 1. Validation
    if (type === "lecture" && !contentId) {
      return res.status(400).json({ success: false, message: "contentId required" });
    }
    if (type === "assignment" && !assessmentId) {
      return res.status(400).json({ success: false, message: "assessmentId required" });
    }

    // 2. The Query - We filter out nulls to avoid matching the wrong record
    const query = {
      studentId,
      courseId,
      type
    };
    if (type === "lecture") query.contentId = contentId;
    if (type === "assignment") query.assessmentId = assessmentId;

    let existing = await Progress.findOne(query);

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Progress retrieved",
        data: existing, // This will return 'submitted', 'graded', etc.
      });
    }

    // 3. Create if not exists
    const course = await Course.findById(courseId);
    const progress = new Progress({
      ...query,
      instructorId: course?.instructor || null,
      status: "started",
      progress: 0,
    });

    await progress.save();

    res.status(201).json({
      success: true,
      message: "Progress started",
      data: progress,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const submitWork = async (req, res) => {
  try {
    const { id } = req.params; // Make sure this is the Progress _id, not Assessment _id
    const { textAnswer } = req.body;
    const file = req.file;

    const progress = await Progress.findById(id);
    if (!progress) return res.status(404).json({ success: false, message: "Record not found" });

    let uploadedFile = null;
    if (file) {
      uploadedFile = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "studly-submissions", resource_type: "auto" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(file.buffer);
      });
    }

    // Update the existing record
    progress.submission = {
      fileUrl: uploadedFile ? uploadedFile.secure_url : progress.submission?.fileUrl,
      filePublicId: uploadedFile ? uploadedFile.public_id : progress.submission?.filePublicId,
      submittedAt: new Date(),
      textAnswer: textAnswer || "",
    };

    progress.status = "submitted"; // CRITICAL: This must be saved
    progress.progress = 100;

    await progress.save();

    res.status(200).json({ success: true, data: progress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================================================
   2. SUBMIT ASSIGNMENT / WORK (STUDENT UPLOAD)
========================================================= */
// export const submitWork = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { textAnswer } = req.body;
//     const file = req.file;

//     const progress = await Progress.findById(id);

//     if (!progress) {
//       return res.status(404).json({
//         success: false,
//         message: "Progress not found",
//       });
//     }

//     let uploadedFile = null;

//     /* ================= UPLOAD TO CLOUDINARY ================= */
//     if (file) {
//       const result = await new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream(
//           {
//             folder: "studly-submissions", // LMS folder
//             resource_type: "auto", // allows pdf, image, zip, etc
//           },
//           (error, result) => {
//             if (error) return reject(error);
//             resolve(result);
//           }
//         );

//         stream.end(file.buffer);
//       });

//       uploadedFile = result;
//     }

//     /* ================= SAVE TO DB ================= */
//     progress.submission = {
//       fileUrl: uploadedFile ? uploadedFile.secure_url : null,
//       filePublicId: uploadedFile ? uploadedFile.public_id : null,
//       submittedAt: new Date(),
//       textAnswer: textAnswer || "",
//     };

//     progress.status = "submitted";

//     await progress.save();

//     res.status(200).json({
//       success: true,
//       message: "Work submitted successfully (Cloudinary)",
//       data: progress,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

/* =========================================================
   3. MARK UNDER REVIEW (INSTRUCTOR)
========================================================= */
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

/* =========================================================
   4. GRADE SUBMISSION (INSTRUCTOR)
========================================================= */
export const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { marks, feedback, instructorId } = req.body;

    const progress = await Progress.findById(id);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found",
      });
    }

    progress.instructorId = instructorId;

    progress.review = {
      marks,
      feedback,
      reviewedAt: new Date(),
    };

    progress.status = "graded";

    await progress.save();

    res.status(200).json({
      success: true,
      message: "Submission graded successfully",
      data: progress,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================================================
   5. GET STUDENT PROGRESS DASHBOARD
========================================================= */
export const getStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;

    const progress = await Progress.find({ studentId })
      .populate("courseId", "title")
      .populate("contentId", "title")
      .populate("assessmentId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: progress.length,
      data: progress,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================================================
   6. GET ALL SUBMISSIONS (INSTRUCTOR DASHBOARD)
========================================================= */
export const getAllSubmissions = async (req, res) => {
  try {
    const { courseId, assessmentId, status } = req.query;

    const filter = {
      type: "assignment",
    };

    if (courseId) filter.courseId = courseId;
    if (assessmentId) filter.assessmentId = assessmentId;
    if (status) filter.status = status;

    const submissions = await Progress.find(filter)
      .populate("studentId", "name profilePicture email")
        .populate({
    path: "courseId",
    select: "title instructor",
    populate: {
      path: "instructor",
      select: "name email profilePicture",
    },
  })
      .populate("assessmentId", "title description totalMarks dueDate")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================================================
   7. UPDATE PROGRESS (LECTURE COMPLETION / TIME SPENT)
========================================================= */
export const updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, timeSpent } = req.body;

    const updated = await Progress.findByIdAndUpdate(
      id,
      {
        ...(progress !== undefined && { progress }),
        ...(timeSpent !== undefined && { timeSpent }),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Progress updated",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================================================
   8. DELETE PROGRESS (ADMIN / CLEANUP)
========================================================= */
export const deleteProgress = async (req, res) => {
  try {
    await Progress.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Progress deleted",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};