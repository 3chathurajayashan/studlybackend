import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },

  title: {
    type: String,
    required: true
  },

  type: {
    type: String,
    enum: ["video", "lab_sheet", "lecture_note", "assignment", "quiz", "other"],
    default: "video"
  },

  module: String,
  week: String,

  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner"
  },

  url: String,
  fileUrl: String, // Supabase file

  eventDate: Date,
  description: String,
  tags: [String],

  visibility: {
    type: String,
    enum: ["published", "draft"],
    default: "published"
  }

}, { timestamps: true });

export default mongoose.model("Content", contentSchema);