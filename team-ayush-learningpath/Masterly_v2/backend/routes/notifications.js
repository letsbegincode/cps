const express = require("express")
const User = require("../models/User")

const router = express.Router()

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get("/", async (req, res) => {
  try {
    // In a real application, you would have a Notification model
    // For now, we'll return mock notifications
    const notifications = [
      {
        id: "1",
        type: "achievement",
        title: "New Achievement Unlocked!",
        message: "You've completed your first course. Keep up the great work!",
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: "2",
        type: "course",
        title: "Course Update",
        message: "New content has been added to 'Complete Data Structures & Algorithms'",
        read: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: "3",
        type: "reminder",
        title: "Study Reminder",
        message: "Don't forget to continue your learning streak!",
        read: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    ]

    res.json({
      success: true,
      data: { notifications },
    })
  } catch (error) {
    console.error("Get notifications error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    })
  }
})

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put("/:id/read", async (req, res) => {
  try {
    // In a real application, you would update the notification in the database
    res.json({
      success: true,
      message: "Notification marked as read",
    })
  } catch (error) {
    console.error("Mark notification read error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    })
  }
})

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put("/read-all", async (req, res) => {
  try {
    // In a real application, you would update all notifications for the user
    res.json({
      success: true,
      message: "All notifications marked as read",
    })
  } catch (error) {
    console.error("Mark all notifications read error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
    })
  }
})

module.exports = router
