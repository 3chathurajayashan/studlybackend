import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      default: null,
    },

    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      default: null,
    },

    type: {
      type: String,
      enum: ["lecture", "assignment", "quiz", "upload"],
      required: true,
    },

    /* ================= STUDENT SUBMISSION ================= */
    submission: {
      fileUrl: String,
      filePublicId: String,
      submittedAt: Date,
      textAnswer: String,
    },

    /* ================= INSTRUCTOR REVIEW ================= */
    review: {
      marks: {
        type: Number,
        default: 0,
      },

      feedback: {
        type: String,
        default: "",
      },

      reviewedAt: Date,
    },

    status: {
      type: String,
      enum: [
        "started",
        "submitted",
        "under-review",
        "graded",
        "rejected",
        "resubmit",
      ],
      default: "started",
    },

    progress: {
      type: Number,
      default: 0,
    },

    timeSpent: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Progress", progressSchema);