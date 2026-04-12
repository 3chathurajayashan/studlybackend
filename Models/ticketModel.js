import mongoose from "mongoose";

// 🔹 Reusable attachment schema
const attachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
    fileName: {
      type: String, // original file name
    },
    fileType: {
      type: String, // image/png, application/pdf etc
    },
    fileSize: {
      type: Number, // in bytes
    },
  },
  { _id: false }
);


// 🔹 Message Schema (Replies)
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["instructor", "admin"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    attachments: [attachmentSchema], // ✅ upgraded
  },
  { timestamps: true }
);


// 🔹 Ticket Schema
const ticketSchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["technical", "payment", "content", "other"],
      default: "other",
    },

    status: {
      type: String,
      enum: ["open", "in-progress", "resolved"],
      default: "open",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    attachments: [attachmentSchema], // ✅ upgraded

    messages: [messageSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);