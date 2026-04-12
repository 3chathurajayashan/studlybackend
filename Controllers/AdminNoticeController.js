import AdminNotice from "../Models/AdminNoticeModel.js";

// CREATE NOTICE
export const createAdminNotice = async (req, res) => {
  try {
    const { title, description, isPublished, createdBy } = req.body;

    if (!title || !description || !createdBy) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const notice = await AdminNotice.create({ title, description, isPublished, createdBy });

    res.status(201).json({ success: true, message: "Admin notice created", data: notice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET ALL NOTICES
export const getAllAdminNotices = async (req, res) => {
  try {
    const notices = await AdminNotice.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notices });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE NOTICE
export const deleteAdminNotice = async (req, res) => {
  try {
    const { id } = req.params;
    await AdminNotice.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Notice deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};