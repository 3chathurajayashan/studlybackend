import Assessment from "../Models/AssessmentModel.js";
import { uploadToSupabase } from "../Utils/uploadToSupabase.js";

export const addAssessment = async (req, res) => {
  try {
    let fileUrl = "";

    if (req.file) {
      fileUrl = await uploadToSupabase(req.file, "assessments");
    }

    const assessment = await Assessment.create({
      courseId: req.params.courseId,
      title: req.body.title,
      description: req.body.description,
      totalMarks: req.body.totalMarks,
      dueDate: req.body.dueDate,
      fileUrl,
      fileName: req.file?.originalname
    });

    res.status(201).json({ success: true, data: assessment });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET all assessments for a course
export const getAssessmentsByCourse = async (req, res) => {
  try {
    const data = await Assessment.find({ courseId: req.params.courseId })
      .sort({ createdAt: -1 });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single assessment
export const getSingleAssessment = async (req, res) => {
  try {
    const data = await Assessment.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE assessment
export const updateAssessment = async (req, res) => {
  try {
    let updateData = { ...req.body };

    if (req.file) {
      const fileUrl = await uploadToSupabase(req.file, "assessments");
      updateData.fileUrl = fileUrl;
      updateData.fileName = req.file.originalname;
    }

    const updated = await Assessment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE assessment
export const deleteAssessment = async (req, res) => {
  try {
    await Assessment.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Assessment deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};