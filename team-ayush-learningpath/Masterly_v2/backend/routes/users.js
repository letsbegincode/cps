const express = require("express")
const User = require("../models/User")
const { updateProfileValidation } = require("../middleware/validation")

const router = express.Router()

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("enrollments.courseId", "title slug thumbnail")
      .populate("learningPaths.pathId", "title description")
      .populate("achievements.achievementId", "title description icon")

    res.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    })
  }
})

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", updateProfileValidation, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      bio,
      location,
      phone,
      website,
      socialLinks,
    } = req.body

    const updates = {
      "profile.firstName": firstName,
      "profile.lastName": lastName,
      "profile.bio": bio,
      "profile.location": location,
      "profile.phone": phone,
      "profile.website": website,
      "profile.socialLinks.github": socialLinks?.github,
      "profile.socialLinks.linkedin": socialLinks?.linkedin,
      "profile.socialLinks.twitter": socialLinks?.twitter,
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true })

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    })
  }
})

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put("/preferences", async (req, res) => {
  try {
    const { preferences } = req.body

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { preferences } },
      { new: true, runValidators: true },
    )

    res.json({
      success: true,
      message: "Preferences updated successfully",
      data: { preferences: user.preferences },
    })
  } catch (error) {
    console.error("Update preferences error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update preferences",
    })
  }
})

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get("/stats", async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    // Calculate additional stats
    const currentLevel = user.calculateLevel()
    const nextLevelXP = Math.pow(currentLevel, 2) * 100
    const currentLevelXP = Math.pow(currentLevel - 1, 2) * 100
    const progressToNextLevel = ((user.stats.experiencePoints - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100

    const stats = {
      ...user.stats.toObject(),
      currentLevel,
      nextLevelXP,
      progressToNextLevel: Math.max(0, Math.min(100, progressToNextLevel)),
    }

    res.json({
      success: true,
      data: { stats },
    })
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
    })
  }
})

// @route   POST /api/users/change-password
// @desc    Change user password
// @access  Private
router.post("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      })
    }

    const user = await User.findById(req.user._id).select("+password")

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to change password",
    })
  }
})

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete("/account", async (req, res) => {
  try {
    const { password } = req.body

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to delete account",
      })
    }

    const user = await User.findById(req.user._id).select("+password")

    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      })
    }

    // Soft delete - deactivate account instead of hard delete
    user.isActive = false
    user.email = `deleted_${Date.now()}_${user.email}`
    await user.save()

    res.json({
      success: true,
      message: "Account deleted successfully",
    })
  } catch (error) {
    console.error("Delete account error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete account",
    })
  }
})

router.get("/dashboard", async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("enrollments.courseId", "title slug thumbnail category stats")
      .populate("learningPaths.pathId", "title description estimatedDuration")

    const recentCourses = user.enrollments.sort((a, b) => b.lastAccessedAt - a.lastAccessedAt).slice(0, 5)

    const activePaths = user.learningPaths.filter((lp) => lp.status === "active")

    const weeklyProgress = {
      conceptsLearned: user.stats?.conceptsMastered || 0,
      quizzesCompleted: user.stats?.quizzesCompleted || 0,
      studyTimeHours: Math.round((user.stats?.totalStudyTime || 0) / 60),
    }

    res.json({
      success: true,
      data: {
        user: {
          profile: user.profile,
          stats: user.stats,
          subscription: user.subscription,
        },
        recentCourses,
        activePaths,
        weeklyProgress,
      },
    })
  } catch (error) {
    console.error("Get dashboard error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    })
  }
})

module.exports = router
