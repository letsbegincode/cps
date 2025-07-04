const express = require("express")
const UserProgress = require("../models/UserProgress")
const User = require("../models/User")

const router = express.Router()

// @route   GET /api/analytics/dashboard
// @desc    Get user dashboard analytics
// @access  Private
router.get("/dashboard", async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const userProgress = await UserProgress.find({ userId: req.user._id }).populate("courseId", "title category")

    // Calculate this week's activity
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const thisWeekProgress = userProgress.filter((p) => new Date(p.lastAccessedAt) >= weekAgo)

    // Calculate daily activity for the past 7 days
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

      const timeSpent = dayProgress.reduce((sum, p) => sum + p.totalTimeSpent, 0)

      dailyActivity.push({
        date: date.toISOString().split("T")[0],
        timeSpent: Math.round(timeSpent / 60), // convert to minutes
        coursesStudied: dayProgress.length,
      })
    }

    // Category breakdown
    const categoryStats = {}
    userProgress.forEach((p) => {
      if (p.courseId && p.courseId.category) {
        const category = p.courseId.category
        if (!categoryStats[category]) {
          categoryStats[category] = {
            courses: 0,
            timeSpent: 0,
            averageProgress: 0,
          }
        }
        categoryStats[category].courses += 1
        categoryStats[category].timeSpent += p.totalTimeSpent
        categoryStats[category].averageProgress += p.overallProgress
      }
    })

    // Calculate averages for categories
    Object.keys(categoryStats).forEach((category) => {
      const stats = categoryStats[category]
      stats.averageProgress = stats.averageProgress / stats.courses
      stats.timeSpent = Math.round(stats.timeSpent / 60) // convert to minutes
    })

    // Recent achievements
    const recentAchievements = user.achievements
      .filter((a) => a.unlockedAt)
      .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
      .slice(0, 5)

    const analytics = {
      overview: {
        totalCourses: userProgress.length,
        completedCourses: userProgress.filter((p) => p.status === "completed").length,
        totalTimeSpent: Math.round(user.stats.totalStudyTime), // already in minutes
        currentStreak: user.stats.currentStreak,
        level: user.stats.level,
        experiencePoints: user.stats.experiencePoints,
      },
      thisWeek: {
        coursesStudied: thisWeekProgress.length,
        timeSpent: Math.round(thisWeekProgress.reduce((sum, p) => sum + p.totalTimeSpent, 0) / 60),
        conceptsCompleted: thisWeekProgress.reduce((sum, p) => {
          return (
            sum +
            p.topics.reduce((topicSum, topic) => {
              return topicSum + topic.concepts.filter((c) => c.status === "completed").length
            }, 0)
          )
        }, 0),
      },
      dailyActivity,
      categoryStats,
      recentAchievements,
    }

    res.json({
      success: true,
      data: { analytics },
    })
  } catch (error) {
    console.error("Get dashboard analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    })
  }
})

// @route   GET /api/analytics/progress/:courseId
// @desc    Get detailed progress analytics for a course
// @access  Private
router.get("/progress/:courseId", async (req, res) => {
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

    // Calculate topic-wise progress
    const topicProgress = userProgress.topics.map((topic) => ({
      topicId: topic.topicId,
      progress: topic.progress,
      timeSpent: Math.round(topic.timeSpent / 60), // convert to minutes
      conceptsCompleted: topic.concepts.filter((c) => c.status === "completed").length,
      totalConcepts: topic.concepts.length,
    }))

    // Calculate activity timeline (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const activityTimeline = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      // This is simplified - in a real app, you'd track daily activity
      activityTimeline.push({
        date: date.toISOString().split("T")[0],
        timeSpent: 0, // Would be calculated from actual session data
        activitiesCompleted: 0,
      })
    }

    const analytics = {
      overview: {
        overallProgress: userProgress.overallProgress,
        timeSpent: Math.round(userProgress.totalTimeSpent / 60),
        status: userProgress.status,
        enrolledAt: userProgress.enrolledAt,
        lastAccessedAt: userProgress.lastAccessedAt,
      },
      performance: {
        averageQuizScore: userProgress.averageQuizScore,
        totalQuizzesTaken: userProgress.totalQuizzesTaken,
        totalProblemsSolved: userProgress.totalProblemsSolved,
        totalVideosWatched: userProgress.totalVideosWatched,
        totalArticlesRead: userProgress.totalArticlesRead,
      },
      topicProgress,
      activityTimeline,
      streakInfo: {
        currentStreak: userProgress.currentStreak,
        longestStreak: userProgress.longestStreak,
        lastStudyDate: userProgress.lastStudyDate,
      },
    }

    res.json({
      success: true,
      data: { analytics },
    })
  } catch (error) {
    console.error("Get course analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch course analytics",
    })
  }
})

module.exports = router
