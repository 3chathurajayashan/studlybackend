import Subject from "../Models/SubjectModel.js";
import slugify from "slugify";


// ==============================
// CREATE SUBJECT (Instructor Only)
// ==============================
export const createSubject = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors can create subjects"
      });
    }

    const {
      name,
      code,
      description,
      thumbnail,
      level,
      categoryType,
      isFeatured,
      sortOrder
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Subject name is required"
      });
    }

    const slug = slugify(name, { lower: true, strict: true });

    // Check duplicate slug
    const existingSubject = await Subject.findOne({ slug });
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: "Subject with this name already exists"
      });
    }

    const subject = await Subject.create({
      name,
      slug,
      code,
      description,
      thumbnail,
      level,
      categoryType,
      isFeatured,
      sortOrder,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Subject created successfully",
      subject
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// ==============================
// GET ALL SUBJECTS
// ==============================
export const getSubjects = async (req, res) => {
  try {
    const { status = "active", search, page = 1, limit = 10 } = req.query;

    let query = { status };

    if (search) {
      query.$text = { $search: search };
    }

    const subjects = await Subject.find(query)
     .populate('createdBy', 'name')
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Subject.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      subjects
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// ==============================
// GET SINGLE SUBJECT
// ==============================
export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject || subject.status === "archived") {
      return res.status(404).json({
        success: false,
        message: "Subject not found"
      });
    }

    res.status(200).json({
      success: true,
      subject
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// ==============================
// UPDATE SUBJECT (Owner Instructor Only)
// ==============================
export const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found"
      });
    }

    // Ownership check
    if (subject.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this subject"
      });
    }

    if (req.body.name) {
      const newSlug = slugify(req.body.name, { lower: true, strict: true });

      const existing = await Subject.findOne({
        slug: newSlug,
        _id: { $ne: subject._id }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Another subject with this name already exists"
        });
      }

      subject.slug = newSlug;
    }

    Object.assign(subject, req.body);

    subject.updatedBy = req.user._id;

    await subject.save();

    res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      subject
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// ==============================
// DELETE SUBJECT (Soft Delete - Owner Only)
// ==============================
export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found"
      });
    }

    // Ownership check
    if (subject.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this subject"
      });
    }

    subject.status = "archived";
    subject.updatedBy = req.user._id;

    await subject.save();

    res.status(200).json({
      success: true,
      message: "Subject archived successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};