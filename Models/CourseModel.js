 

import mongoose from "mongoose";
import { nanoid } from "nanoid";

const courseSchema = new mongoose.Schema(
  {
    
    courseId: {
      type: String,
      unique: true,
      default: () => `CRS-${nanoid(6).toUpperCase()}`
    },

    title: {
      type: String,
      required: true,
      trim: true,
       minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"]
    },

    description: {
      type: String,
      required: true,
      trim: true,
       minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description too long"]
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    duration: {
      type: Number,
      required: true,
      min: [1, "Duration must be at least 1 hour"],
      max: [500, "Duration seems too large"]
    },

    coverImage: {
      type: String,
      required: true,
      publicId: { type: String }
    },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "Beginner"
    },

    price: {
      type: String,
      default: "free"
    },

    currency: {
      type: String,
      default: "Free"
    },

    enrollmentLimit: {
      type: Number,
      default: 100
    },

    enrolledStudentsCount: {
      type: Number,
      default: 0
    },

    prerequisites: [
      {
        type: String
      }
    ],

    tags: [
      {
        type: String
      }
    ],
status: {
  type: String,
  enum: ["draft", "published", "unpublished"],
  default: "published"
},

    averageRating: {
      type: Number,
      default: 0
    },

    totalRatings: {
      type: Number,
      default: 0
    },

    isDeleted: {
      type: Boolean,
      default: false
    },
 

deletedAt: {
  type: Date,
  default: null
},

deleteReason: {
  type: String,
  default: null
},

deletedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null
},

// Admin control
isPermanentlyDeleted: {
  type: Boolean,
  default: false
}
  },
  { timestamps: true }
  
  );

  courseSchema.virtual("assessments", {
  ref: "Assessment",
  localField: "_id",
  foreignField: "courseId"
});

courseSchema.virtual("contents", {
  ref: "Content",
  localField: "_id",
  foreignField: "courseId"
});

courseSchema.set("toObject", { virtuals: true });
courseSchema.set("toJSON", { virtuals: true });

const Course = mongoose.model("Course", courseSchema);

export default Course;
 