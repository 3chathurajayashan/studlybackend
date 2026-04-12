import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },

    title: {
      type: String,
      required: true,
    },

    description: String,

    totalMarks: Number,

    dueDate: Date,

    fileUrl: String, // Supabase URL
    fileName: String,
  },
  { timestamps: true }
);

export default mongoose.model("Assessment", assessmentSchema);