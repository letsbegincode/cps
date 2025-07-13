const express = require("express")
const jwt = require("jsonwebtoken") // Import jwt
const LearningPath = require("../models/LearningPath")
const User = require("../models/User")
const Course = require("../models/Course")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/learning-paths
// @desc    Get all learning paths
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 12, category, difficulty, type, search, sort = "popular" } = req.query

    // Build filter object
    const filter = { status: "published", isPublic: true }

    if (category) filter.category = category
    if (difficulty) filter.difficulty = difficulty
    if (type) filter.type = type

    if (search) {
      filter.$text = { $search: search }
    }

    // Build sort object
    let sortObj = {}
    switch (sort) {
      case "popular":
        sortObj = { "stats.totalEnrollments": -1 }
        break
      case "rating":
        sortObj = { "stats.averageRating": -1 }
        break
      case "newest":
        sortObj = { createdAt: -1 }
        break
      case "title":
        sortObj = { title: 1 }
        break
      default:
        sortObj = { "stats.totalEnrollments": -1 }
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const learningPaths = await LearningPath.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Number.parseInt(limit))
      .populate("createdBy", "profile.displayName profile.avatar")
      .populate("steps.courseId", "title slug thumbnail")

    const total = await LearningPath.countDocuments(filter)

    res.json({
      success: true,
      data: {
        learningPaths,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / Number.parseInt(limit)),
          total,
          limit: Number.parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error("Get learning paths error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch learning paths",
    })
  }
})

// @route   GET /api/learning-paths/:id
// @desc    Get single learning path
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const learningPath = await LearningPath.findById(req.params.id)
      .populate("createdBy", "profile.displayName profile.avatar")
      .populate("steps.courseId", "title slug thumbnail description level stats")

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: "Learning path not found",
      })
    }

    // Get user progress if authenticated
    let userProgress = null
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        userProgress = await User.findById(decoded.userId).select("learningPaths")
      } catch (err) {
        // Continue without user progress
      }
    }

    res.json({
      success: true,
      data: {
        learningPath,
        userProgress,
      },
    })
  } catch (error) {
    console.error("Get learning path error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch learning path",
    })
  }
})

// @route   POST /api/learning-paths/:id/enroll
// @desc    Enroll in a learning path
// @access  Private
router.post("/:id/enroll", authenticateToken, async (req, res) => {
  try {
    const learningPath = await LearningPath.findById(req.params.id)

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: "Learning path not found",
      })
    }

    // Check if requires premium subscription
    if (learningPath.pricing.requiredSubscription === "premium" && !req.user.hasPremiumAccess()) {
      return res.status(403).json({
        success: false,
        message: "Premium subscription required",
        code: "PREMIUM_REQUIRED",
      })
    }

    const user = await User.findById(req.user._id)

    // Check if already enrolled
    const existingEnrollment = user.learningPaths.find((lp) => lp.pathId.toString() === learningPath._id.toString())
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this learning path",
      })
    }

    // Add to user's learning paths
    user.learningPaths.push({
      pathId: learningPath._id,
      status: "active",
      progress: 0,
      customPath: learningPath.type === "custom",
      aiGenerated: learningPath.type === "ai-generated",
    })

    await user.save()

    // Update learning path stats
    learningPath.stats.totalEnrollments += 1
    await learningPath.save()

    res.json({
      success: true,
      message: "Successfully enrolled in learning path",
    })
  } catch (error) {
    console.error("Enroll learning path error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to enroll in learning path",
    })
  }
})

// @route   POST /api/learning-paths/custom/generate
// @desc    Generate custom learning path using AI
// @access  Private
router.post("/custom/generate", authenticateToken, async (req, res) => {
  try {
    const { goals, currentSkillLevel, timeAvailable, preferredLearningStyle, targetRole, selectedCourses } = req.body

    // Simple AI-like path generation logic
    const generatedPath = await generateCustomPath({
      goals,
      currentSkillLevel,
      timeAvailable,
      preferredLearningStyle,
      targetRole,
      selectedCourses,
      userId: req.user._id,
    })

    res.json({
      success: true,
      message: "Custom learning path generated successfully",
      data: { learningPath: generatedPath },
    })
  } catch (error) {
    console.error("Generate custom path error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate custom learning path",
    })
  }
})

// Helper function to generate custom learning path
async function generateCustomPath(params) {
  const { goals, currentSkillLevel, timeAvailable, preferredLearningStyle, targetRole, selectedCourses, userId } =
    params

  // Get available courses based on goals and skill level
  let courses = []
  if (selectedCourses && selectedCourses.length > 0) {
    courses = await Course.find({
      _id: { $in: selectedCourses },
      status: "published",
    })
  } else {
    // Auto-select courses based on goals
    const courseFilter = {
      status: "published",
      $or: goals.map((goal) => ({
        $or: [
          { title: { $regex: goal, $options: "i" } },
          { tags: { $in: [goal.toLowerCase()] } },
          { category: { $regex: goal, $options: "i" } },
        ],
      })),
    }

    courses = await Course.find(courseFilter).limit(10)
  }

  // Sort courses based on difficulty and user's current skill level
  const sortedCourses = sortCoursesByDifficulty(courses, currentSkillLevel)

  // Create learning path steps
  const steps = sortedCourses.map((course, index) => ({
    title: course.title,
    description: course.shortDescription,
    type: "course",
    order: index + 1,
    courseId: course._id,
    estimatedTime: `${Math.ceil(course.stats.totalDuration / 60)} hours`,
    difficulty: course.level,
    completionCriteria: {
      minimumScore: 70,
      requiredActivities: ["videos", "articles", "problems", "quiz"],
      masteryThreshold: 7,
    },
  }))

  // Calculate estimated duration
  const totalHours = courses.reduce((sum, course) => sum + course.stats.totalDuration, 0) / 60
  const estimatedDuration = calculateEstimatedDuration(totalHours, timeAvailable)

  // Create the learning path
  const learningPath = new LearningPath({
    title: `Custom Path: ${targetRole || "Personalized Learning"}`,
    description: `AI-generated learning path based on your goals: ${goals.join(", ")}`,
    type: "ai-generated",
    difficulty: "Mixed",
    estimatedDuration,
    estimatedHours: Math.ceil(totalHours),
    category: "Custom",
    tags: goals,
    steps,
    aiGeneration: {
      userGoals: goals,
      currentSkillLevel,
      timeAvailable,
      preferredLearningStyle,
      targetRole,
      generatedAt: new Date(),
      algorithm: "basic_recommendation_v1",
      confidence: 0.8,
    },
    status: "published",
    isPublic: false,
    createdBy: userId,
  })

  await learningPath.save()
  return learningPath
}

// Helper function to sort courses by difficulty
function sortCoursesByDifficulty(courses, currentSkillLevel) {
  const difficultyOrder = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
    "All Levels": 1.5,
  }

  const startLevel = currentSkillLevel === "beginner" ? 1 : currentSkillLevel === "intermediate" ? 2 : 3

  return courses.sort((a, b) => {
    const aLevel = difficultyOrder[a.level] || 2
    const bLevel = difficultyOrder[b.level] || 2

    // Prefer courses at or slightly above current skill level
    const aDistance = Math.abs(aLevel - startLevel)
    const bDistance = Math.abs(bLevel - startLevel)

    if (aDistance !== bDistance) {
      return aDistance - bDistance
    }

    // If same distance, prefer higher rated courses
    return b.stats.averageRating - a.stats.averageRating
  })
}

// Helper function to calculate estimated duration
function calculateEstimatedDuration(totalHours, timeAvailable) {
  const hoursPerWeek = {
    "1-2 hours/day": 10,
    "2-3 hours/day": 17,
    "3-4 hours/day": 24,
    "4+ hours/day": 30,
  }

  const weeklyHours = hoursPerWeek[timeAvailable] || 10
  const weeks = Math.ceil(totalHours / weeklyHours)

  return `${weeks} weeks`
}

// @route   PUT /api/learning-paths/:id/progress
// @desc    Update learning path progress
// @access  Private
router.put("/:id/progress", authenticateToken, async (req, res) => {
  try {
    const { stepId, status, score, notes } = req.body

    const user = await User.findById(req.user._id).populate("learningPaths.pathId", "steps")

    const userLearningPath = user.learningPaths.find((lp) => lp.pathId._id.toString() === req.params.id)

    if (!userLearningPath) {
      return res.status(404).json({
        success: false,
        message: "Learning path enrollment not found",
      })
    }

    // Update step progress
    const stepProgress = userLearningPath.pathId.steps.find((step) => step._id.toString() === stepId)

    if (!stepProgress) {
      return res.status(404).json({
        success: false,
        message: "Step not found",
      })
    }

    const previousStatus = stepProgress.status
    stepProgress.status = status
    stepProgress.score = score
    stepProgress.notes = notes

    if (status === "completed" && previousStatus !== "completed") {
      stepProgress.completedAt = new Date()
      userLearningPath.completedSteps.push(stepProgress._id)
    }

    if (status === "in_progress" && previousStatus === "not_started") {
      stepProgress.startedAt = new Date()
    }

    // Update overall progress
    const completedSteps = userLearningPath.pathId.steps.filter((step) => step.status === "completed").length

    userLearningPath.progress = (completedSteps / userLearningPath.pathId.steps.length) * 100

    // Update current step
    const nextIncompleteStep = userLearningPath.pathId.steps.find((step) => step.status !== "completed")

    if (nextIncompleteStep) {
      userLearningPath.currentStep = userLearningPath.pathId.steps.indexOf(nextIncompleteStep)
    }

    // Check if path is completed
    if (userLearningPath.progress === 100) {
      userLearningPath.status = "completed"
      userLearningPath.completedAt = new Date()
    }

    userLearningPath.lastAccessedAt = new Date()
    await user.save()

    res.json({
      success: true,
      message: "Progress updated successfully",
      data: { userLearningPath },
    })
  } catch (error) {
    console.error("Update learning path progress error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
    })
  }
})

module.exports = router
