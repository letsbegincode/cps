const express = require("express")
const Assessment = require("../models/Assessment")
const { authenticateToken, requirePremium } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/assessments
// @desc    Get all assessments
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 12, type, category, difficulty, search } = req.query

    const filter = { status: "published", isPublic: true }

    if (type) filter.type = type
    if (category) filter.category = category
    if (difficulty) filter.difficulty = difficulty

    if (search) {
      filter.$text = { $search: search }
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const assessments = await Assessment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))
      .select("-questions") // Don't send questions in list view

    const total = await Assessment.countDocuments(filter)

    res.json({
      success: true,
      data: {
        assessments,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / Number.parseInt(limit)),
          total,
          limit: Number.parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error("Get assessments error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch assessments",
    })
  }
})

// @route   GET /api/assessments/:id
// @desc    Get single assessment
// @access  Public (but questions only for enrolled users)
router.get("/:id", async (req, res) => {
  try {
    let assessment = await Assessment.findById(req.params.id)

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      })
    }

    // Check if user has access to questions
    let includeQuestions = false
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1]
        const jwt = require("jsonwebtoken")
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const User = require("../models/User")
        const user = await User.findById(decoded.userId)

        if (user && (assessment.requiredSubscription === "free" || user.hasPremiumAccess())) {
          includeQuestions = true
        }
      } catch (err) {
        // Token invalid, continue without questions
      }
    }

    if (!includeQuestions) {
      assessment = assessment.toObject()
      delete assessment.questions
    }

    res.json({
      success: true,
      data: { assessment },
    })
  } catch (error) {
    console.error("Get assessment error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch assessment",
    })
  }
})

// @route   POST /api/assessments/:id/submit
// @desc    Submit assessment answers
// @access  Private
router.post("/:id/submit", authenticateToken, async (req, res) => {
  try {
    const { answers, timeSpent } = req.body

    const assessment = await Assessment.findById(req.params.id)
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      })
    }

    // Check subscription requirements
    if (assessment.requiredSubscription === "premium" && !req.user.hasPremiumAccess()) {
      return res.status(403).json({
        success: false,
        message: "Premium subscription required",
      })
    }

    // Calculate score
    let totalScore = 0
    let maxScore = 0
    let correctAnswers = 0

    const results = assessment.questions.map((question, index) => {
      const userAnswer = answers[index]
      maxScore += question.points

      let isCorrect = false
      let earnedPoints = 0

      if (question.type === "mcq" || question.type === "multiple-select" || question.type === "true-false") {
        const correctIndices = question.correctAnswers
        const userIndices = userAnswer?.selectedAnswers || []

        if (question.type === "multiple-select") {
          // For multiple select, need exact match
          isCorrect =
            correctIndices.length === userIndices.length && correctIndices.every((idx) => userIndices.includes(idx))
        } else {
          // For single select
          isCorrect = correctIndices.length === 1 && userIndices.length === 1 && correctIndices[0] === userIndices[0]
        }

        if (isCorrect) {
          earnedPoints = question.points
          correctAnswers++
        }
      } else if (question.type === "coding") {
        // For coding questions, this would typically involve running test cases
        // For now, we'll assume manual grading or simplified logic
        isCorrect = false // Would be determined by test case execution
        earnedPoints = 0
      }

      totalScore += earnedPoints

      return {
        questionId: question._id,
        isCorrect,
        earnedPoints,
        userAnswer,
      }
    })

    const scorePercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
    const passed = scorePercentage >= assessment.passingScore

    // Update assessment statistics
    assessment.stats.totalAttempts += 1
    assessment.stats.averageScore =
      (assessment.stats.averageScore * (assessment.stats.totalAttempts - 1) + scorePercentage) /
      assessment.stats.totalAttempts

    if (passed) {
      assessment.stats.passRate =
        (assessment.stats.passRate * (assessment.stats.totalAttempts - 1) + 100) / assessment.stats.totalAttempts
    } else {
      assessment.stats.passRate =
        (assessment.stats.passRate * (assessment.stats.totalAttempts - 1)) / assessment.stats.totalAttempts
    }

    assessment.stats.averageCompletionTime =
      (assessment.stats.averageCompletionTime * (assessment.stats.totalAttempts - 1) + timeSpent) /
      assessment.stats.totalAttempts

    await assessment.save()

    // Update user stats
    const User = require("../models/User")
    const user = await User.findById(req.user._id)

    if (assessment.type === "quiz") {
      user.stats.quizzesCompleted += 1
    }

    // Award experience points
    const baseXP = Math.round(scorePercentage / 10) // 1-10 XP based on score
    const bonusXP = passed ? 10 : 0
    const totalXP = baseXP + bonusXP

    user.stats.experiencePoints += totalXP
    user.stats.level = user.calculateLevel()

    await user.save()

    res.json({
      success: true,
      data: {
        score: scorePercentage,
        totalScore,
        maxScore,
        correctAnswers,
        totalQuestions: assessment.questions.length,
        passed,
        timeSpent,
        results: assessment.settings.showResults ? results : null,
        xpGained: totalXP,
      },
    })
  } catch (error) {
    console.error("Submit assessment error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to submit assessment",
    })
  }
})

module.exports = router
