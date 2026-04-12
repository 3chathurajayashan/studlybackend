import Enrollment from "../Models/enrollmentModel.js";
import Course from "../Models/CourseModel.js";
import User from "../Models/UserModel.js";

// ✅ ENROLL IN COURSE
export const enrollCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    // 1. Check user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "student") {
      return res.status(403).json({ message: "Only students can enroll" });
    }

    // 2. Check course
    const course = await Course.findById(courseId);
    if (!course || course.isDeleted) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 3. Check enrollment limit
    if (course.enrolledStudentsCount >= course.enrollmentLimit) {
      return res.status(400).json({ message: "Course is full" });
    }

    // 4. Check already enrolled
    const existing = await Enrollment.findOne({
      student: userId,
      course: courseId
    });

    if (existing) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    // 5. Create enrollment
    const enrollment = await Enrollment.create({
      student: userId,
      course: courseId
    });

    // 6. Increase count
    course.enrolledStudentsCount += 1;
    await course.save();

    res.status(201).json({
      message: "Enrolled successfully",
      enrollment
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ GET STUDENT ENROLLED COURSES
export const getMyCourses = async (req, res) => {
  try {
    const { userId } = req.params;

  const enrollments = await Enrollment.find({ student: userId })
  .populate({
    path: "course",
    populate: {
      path: "instructor" // 🔥 no select → gets full instructor document
    }
  });

    res.status(200).json(enrollments);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ GET COURSE STUDENTS
export const getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollments = await Enrollment.find({ course: courseId })
      .populate("student", "name email");

    res.status(200).json(enrollments);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};