// models/SubjectModel.js

import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
      minlength: [3, "Subject name must be at least 3 characters"],
      maxlength: [100, "Subject name cannot exceed 100 characters"]
    },

    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be URL friendly (lowercase letters, numbers and hyphens only)"
      ]
    },

    code: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      minlength: [2, "Code must be at least 2 characters"],
      maxlength: [20, "Code cannot exceed 20 characters"],
      match: [
        /^[A-Z0-9-]+$/,
        "Code can only contain uppercase letters, numbers and hyphens"
      ]
    },

    description: {
      type: String,
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [1000, "Description cannot exceed 1000 characters"]
    },

    thumbnail: {
      type: String,
      trim: true,
      match: [
        /^(https?:\/\/.*\.(?:png|jpg|jpeg|webp|svg))$/i,
        "Thumbnail must be a valid image URL"
      ]
    },

    level: {
      type: String,
      enum: {
        values: ["beginner", "intermediate", "advanced", "all"],
        message: "Invalid level type"
      },
      default: "all"
    },

    categoryType: {
      type: String,
      enum: {
        values: ["academic", "professional", "skill-based"],
        message: "Invalid category type"
      },
      default: "skill-based"
    },

    totalCourses: {
      type: Number,
      default: 0,
      min: [0, "Total courses cannot be negative"]
    },

    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "archived"],
        message: "Invalid status"
      },
      default: "active"
    },

    isFeatured: {
      type: Boolean,
      default: false
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: [0, "Sort order cannot be negative"]
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: function (value) {
          return mongoose.Types.ObjectId.isValid(value);
        },
        message: "Invalid createdBy user ID"
      }
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: function (value) {
          return mongoose.Types.ObjectId.isValid(value);
        },
        message: "Invalid updatedBy user ID"
      }
    }
  },
  { timestamps: true }
);

// indexes
subjectSchema.index({ name: "text", description: "text" });

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;