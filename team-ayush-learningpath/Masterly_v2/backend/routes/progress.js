const express = require("express")
const UserProgress = require("../models/UserProgress")
const User = require("../models/User")

const router = express.Router()

// @route   GET /api/progress
// @desc    Get user's overall progress
// @access  Private
router.get("/", async (req, res) => {
  try {
    const userProgress = await UserProgress.find({ userId: req.user._id })
      .populate("courseId", "title slug thumbnail category")
      .sort({ lastAccessedAt: -1 })

    // Calculate overall statistics
    const stats = {
      totalCourses: userProgress.length,
      completedCourses: userProgress.filter((p) => p.status === "completed").length,
      inProgressCourses: userProgress.filter((p) => p.status === "in-progress").length,
      totalTimeSpent: userProgress.reduce((sum, p) => sum + p.totalTimeSpent, 0),
      averageProgress:
        userProgress.length > 0 ? userProgress.reduce((sum, p) => sum + p.overallProgress, 0) / userProgress.length : 0,
    }

    res.json({
      success: true,
      data: {
        progress: userProgress,
        stats,
      },
    })
  } catch (error) {
    console.error("Get progress error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch progress",
    })
  }
})

// @route   GET /api/progress/:courseId
// @desc    Get detailed progress for a specific course
// @access  Private
router.get("/:courseId", async (req, res) => {
  try {
    const userProgress = await UserProgress.findOne({
      userId: req.user._id,
      courseId: req.params.courseId,
    }).populate("courseId")

    if (!userProgress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found for this course",
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

// @route   POST /api/progress/:courseId/time
// @desc    Update time spent on a course
// @access  Private
router.post("/:courseId/time", async (req, res) => {
  try {
    const { timeSpent, conceptId, topicId } = req.body

    const userProgress = await UserProgress.findOne({
      userId: req.user._id,
      courseId: req.params.courseId,
    })

    if (!userProgress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found for this course",
      })
    }

    // Update time spent
    userProgress.totalTimeSpent += timeSpent
    userProgress.lastAccessedAt = new Date()

    // Update topic and concept time if specified
    if (topicId) {
      const topic = userProgress.topics.find((t) => t.topicId.toString() === topicId)
      if (topic) {
        topic.timeSpent += timeSpent
        topic.lastAccessedAt = new Date()

        if (conceptId) {
          const concept = topic.concepts.find((c) => c.conceptId.toString() === conceptId)
          if (concept) {
            concept.timeSpent += timeSpent
            concept.lastAccessedAt = new Date()
          }
        }
      }
    }

    await userProgress.save()

    // Update user's total study time
    const user = await User.findById(req.user._id)
    user.stats.totalStudyTime += Math.round(timeSpent / 60) // convert to minutes
    await user.save()

    res.json({
      success: true,
      message: "Time updated successfully",
    })
  } catch (error) {
    console.error("Update time error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update time",
    })
  }
})

// @route   GET /api/progress/analytics/weekly
// @desc    Get weekly progress analytics
// @access  Private
router.get("/analytics/weekly", async (req, res) => {
  try {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const userProgress = await UserProgress.find({
      userId: req.user._id,
      lastAccessedAt: { $gte: weekAgo },
    }).populate("courseId", "title category")

    // Calculate daily activity for the past week
    const dailyActivity = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dayProgress = userProgress.filter((p) => {
        const lastAccessed = new Date(p.lastAccessedAt)
        return lastAccessed >= date && lastAccessed < nextDate
      })

      dailyActivity.push({
        date: date.toISOString().split("T")[0],
        coursesStudied: dayProgress.length,
        totalTime: dayProgress.reduce((sum, p) => sum + p.totalTimeSpent, 0),
        conceptsCompleted: dayProgress.reduce((sum, p) => {
          return (
            sum +
            p.topics.reduce((topicSum, topic) => {
              return topicSum + topic.concepts.filter((c) => c.status === "completed").length
            }, 0)
          )
        }, 0),
      })
    }

    res.json({
      success: true,
      data: { dailyActivity },
    })
  } catch (error) {
    console.error("Get weekly analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch weekly analytics",
    })
  }
})

module.exports = router
