const express = require("express")
const Course = require("../models/Course")
const UserProgress = require("../models/UserProgress")
const User = require("../models/User")
const jwt = require("jsonwebtoken") // Import jwt
const { authenticateToken, optionalAuth } = require("../middleware/auth")
const { createCourseValidation } = require("../middleware/validation")

const router = express.Router()

// @route   GET /api/courses
// @desc    Get all courses with filtering and pagination
// @access  Public
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12, category, level, search, sort = "-stats.enrollments", free, featured } = req.query

    // Build query
    const query = { status: { $in: ["published", "coming_soon"] }, isPublic: true }

    if (category && category !== "All Courses") query.category = category
    if (level && level !== "all") {
      if (level === "beginner") query.level = { $regex: /beginner/i }
      else if (level === "intermediate") query.level = { $regex: /intermediate/i }
      else if (level === "advanced") query.level = { $regex: /advanced/i }
    }
    if (free === "true") query["pricing.type"] = "free"
    if (featured === "true") query.isFeatured = true

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
        { "instructor.name": { $regex: search, $options: "i" } },
      ]
    }

    // Execute query with pagination
    const courses = await Course.find(query)
      .select("-concepts.topics.content") // Exclude detailed content for list view
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Course.countDocuments(query)

    // If user is authenticated, get their enrollment status
    let userEnrollments = []
    if (req.user) {
      userEnrollments = await UserProgress.find({
        userId: req.user._id,
        courseId: { $in: courses.map((c) => c._id) },
      }).select("courseId overallProgress status")
    }

    // Add enrollment info to courses
    const coursesWithEnrollment = courses.map((course) => {
      const courseObj = course.toObject()
      const enrollment = userEnrollments.find((e) => e.courseId.toString() === course._id.toString())

      courseObj.userEnrollment = enrollment
        ? {
            enrolled: true,
            progress: enrollment.overallProgress,
            status: enrollment.status,
          }
        : {
            enrolled: false,
            progress: 0,
            status: "not_enrolled",
          }

      return courseObj
    })

    res.json({
      success: true,
      data: {
        courses: coursesWithEnrollment,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    })
  } catch (error) {
    console.error("Get courses error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    })
  }
})

// @route   GET /api/courses/categories
// @desc    Get all course categories with counts
// @access  Public
router.get("/categories", async (req, res) => {
  try {
    const categories = await Course.aggregate([
      { $match: { status: { $in: ["published", "coming_soon"] }, isPublic: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          subcategories: { $addToSet: "$subcategory" },
        },
      },
      { $sort: { count: -1 } },
    ])

    // Add "All Courses" category
    const totalCourses = await Course.countDocuments({
      status: { $in: ["published", "coming_soon"] },
      isPublic: true,
    })

    const categoriesWithAll = [{ _id: "All Courses", count: totalCourses, subcategories: [] }, ...categories]

    res.json({
      success: true,
      data: { categories: categoriesWithAll },
    })
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    })
  }
})

// @route   GET /api/courses/:slug
// @desc    Get single course by slug
// @access  Public
router.get("/:slug", optionalAuth, async (req, res) => {
  try {
    const course = await Course.findOne({
      slug: req.params.slug,
      status: { $in: ["published", "coming_soon"] },
    })

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Increment view count
    course.stats.views += 1
    await course.save()

    // If user is authenticated, get their progress
    let userProgress = null
    if (req.user) {
      userProgress = await UserProgress.findOne({
        userId: req.user._id,
        courseId: course._id,
      })
    }

    const courseObj = course.toObject()
    courseObj.userEnrollment = userProgress
      ? {
          enrolled: true,
          progress: userProgress.overallProgress,
          status: userProgress.status,
          lastAccessedAt: userProgress.lastAccessedAt,
        }
      : {
          enrolled: false,
          progress: 0,
          status: "not_enrolled",
        }

    res.json({
      success: true,
      data: {
        course: courseObj,
        userProgress,
      },
    })
  } catch (error) {
    console.error("Get course error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch course",
    })
  }
})

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in a course
// @access  Private
router.post("/:id/enroll", authenticateToken, async (req, res) => {
  console.log("👉 Enroll route hit with:", req.method, req.originalUrl)
  try {
    const courseId = req.params.id
    const userId = req.user.id

    // Check if course exists
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Check if user is already enrolled
    const user = await User.findById(userId)
    const isAlreadyEnrolled = (user.enrollments || []).some(
      (enr) => enr.courseId.toString() === courseId
    )
    if (isAlreadyEnrolled) {
      return res.status(400).json({ message: "Already enrolled in this course" })
    }

    // Add course to user's enrolled courses
    user.enrollments.push({
      courseId: courseId,
      enrolledAt: new Date(),
      progress: 0,
    })

    await user.save()

    // Create initial progress record
    const userProgress = new UserProgress({
      userId: userId,
      courseId: courseId,
      conceptsProgress: course.concepts.map((concept) => ({
        conceptId: concept.id,
        completed: false,
        topicsProgress: concept.topics.map((topic) => ({
          topicId: topic.id,
          completed: false,
          timeSpent: 0,
        })),
      })),
    })

    await userProgress.save()

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { studentsEnrolled: 1 },
    })

    res.json({ message: "Successfully enrolled in course", courseId })
  } catch (error) {
    console.error("Error enrolling in course:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/courses/:id/progress
// @desc    Get user's progress for a course
// @access  Private
router.get("/:id/progress", authenticateToken, async (req, res) => {
  try {
    const userProgress = await UserProgress.findOne({
      userId: req.user.id,
      courseId: req.params.id,
    }).populate("courseId", "title slug thumbnail")

    if (!userProgress) {
      return res.status(404).json({
        success: false,
        message: "Not enrolled in this course",
      })
    }

    res.json({
      success: true,
      data: { userProgress },
    })
  } catch (error) {
    console.error("Get course progress error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch course progress",
    })
  }
})

// @route   POST /api/courses/:courseId/concepts/:conceptId/topics/:topicId/complete
// @desc    Mark a topic as complete
// @access  Private
router.post("/:courseId/concepts/:conceptId/topics/:topicId/complete", authenticateToken, async (req, res) => {
  try {
    const { data = {} } = req.body

    const userProgress = await UserProgress.findOne({
      userId: req.user.id,
      courseId: req.params.courseId,
    })

    if (!userProgress) {
      return res.status(404).json({
        success: false,
        message: "Not enrolled in this course",
      })
    }

    const concept = userProgress.conceptsProgress.find((c) => c.conceptId === Number.parseInt(req.params.conceptId))

    if (!concept) {
      return res.status(404).json({
        success: false,
        message: "Concept not found",
      })
    }

    const topic = concept.topicsProgress.find((t) => t.topicId === Number.parseInt(req.params.topicId))

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      })
    }

    // Update topic progress
    topic.completed = true
    topic.completedAt = new Date()
    topic.lastAccessedAt = new Date()
    topic.attempts += 1

    // Store activity-specific data
    if (data.watchTime) {
      topic.activityData.watchTime = data.watchTime
      topic.activityData.watchPercentage = data.watchPercentage || 100
    }

    if (data.score !== undefined) {
      topic.score = data.score
      topic.maxScore = data.maxScore || 100
    }

    // Add time spent
    if (data.timeSpent) {
      userProgress.addTimeSpent(data.timeSpent, req.params.conceptId, req.params.topicId)
    }

    // Update concept and overall progress
    userProgress.updateConceptProgress(req.params.conceptId)
    userProgress.updateStreak()

    await userProgress.save()

    res.json({
      success: true,
      message: "Progress updated successfully",
      data: { userProgress },
    })
  } catch (error) {
    console.error("Update progress error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
    })
  }
})

module.exports = router
