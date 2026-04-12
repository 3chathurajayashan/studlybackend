import Notice from "../Models/NoticeModel.js";
import Course from "../Models/CourseModel.js";

 

// Assuming you use multer for file upload
export const createNotice = async (req, res) => {
  try {
    const { courseId, title, description, isPublished } = req.body;
    const instructorId = req.user._id;

    if (!courseId || !title || !description) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Handle uploaded files (attachments)
    const attachments = (req.files || []).map(file => ({
  url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
  filename: file.originalname,
}));

    const notice = await Notice.create({
      course: courseId,
      instructor: instructorId,
      title,
      description,
      attachments,
      isPublished: isPublished === "true" || isPublished === true, // FormData sends strings
    });

    res.status(201).json({ success: true, message: "Notice created successfully", data: notice });
  } catch (error) {
    console.error("Notice creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

 
export const getNoticesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const notices = await Notice.find({ course: courseId, isPublished: true })
      .populate("instructor", "_id name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: notices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

 
export const getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findById(id)
      .populate("instructor", "_id name email role")
      .populate("course", "title courseId");

    if (!notice) return res.status(404).json({ success: false, message: "Notice not found" });

    res.status(200).json({ success: true, data: notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 
export const getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ isPublished: true })
      .populate("instructor", "_id name email role")
      .populate("course", "title courseId") 
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: notices });
  } catch (error) {
    console.error("Fetch all notices error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};