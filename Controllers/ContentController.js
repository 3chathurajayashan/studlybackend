import Content from "../Models/ContentModel.js";
import { uploadToSupabase } from "../Utils/uploadToSupabase.js";

export const addContent = async (req, res) => {
  try {
    let fileUrl = "";

    if (req.file) {
      fileUrl = await uploadToSupabase(req.file, "contents");
    }

    const content = await Content.create({
      courseId: req.params.courseId,
      title: req.body.title,
      type: req.body.type,
      module: req.body.module,
      week: req.body.week,
      description: req.body.description,
      fileUrl
    });

    res.status(201).json({ success: true, data: content });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET all contents for a course
export const getContentsByCourse = async (req, res) => {
  try {
    const data = await Content.find({ courseId: req.params.courseId })
      .sort({ createdAt: 1 });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single content
export const getSingleContent = async (req, res) => {
  try {
    const data = await Content.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Content not found" });
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE content
export const updateContent = async (req, res) => {
  try {
    let updateData = { ...req.body };

    if (req.file) {
      const fileUrl = await uploadToSupabase(req.file, "contents");
      updateData.fileUrl = fileUrl;
    }

    const updated = await Content.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE content
export const deleteContent = async (req, res) => {
  try {
    await Content.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Content deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};