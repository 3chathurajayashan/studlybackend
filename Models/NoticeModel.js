import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
     course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"]
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      
    },
    attachments: [
      {
        url: String,
        filename: String
      }
    ],
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Notice = mongoose.model("Notice", noticeSchema);

export default Notice;