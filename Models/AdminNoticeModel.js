import mongoose from "mongoose";

const adminNoticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: String, required: true }, // current user name
  },
  { timestamps: true }
);

const AdminNotice = mongoose.model("AdminNotice", adminNoticeSchema);
export default AdminNotice;