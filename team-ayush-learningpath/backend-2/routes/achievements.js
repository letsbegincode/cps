const express = require("express")
const Achievement = require("../models/Achievement")
const User = require("../models/User")

const router = express.Router()

// @route   GET /api/achievements
// @desc    Get all achievements
// @access  Private
router.get("/", async (req, res) => {
  try {
    const achievements = await Achievement.find({ isActive: true }).sort({ displayOrder: 1, createdAt: 1 })

    // Get user's achievement progress
    const user = await User.findById(req.user._id)

    const achievementsWithProgress = achievements.map((achievement) => {
      const userAchievement = user.achievements.find((ua) => ua.achievementId.toString() === achievement._id.toString())

      return {
        ...achievement.toObject(),
        unlocked: !!userAchievement,
        unlockedAt: userAchievement?.unlockedAt,
        progress: userAchievement?.progress || 0,
      }
    })

    res.json({
      success: true,
      data: { achievements: achievementsWithProgress },
    })
  } catch (error) {
    console.error("Get achievements error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch achievements",
    })
  }
})

// @route   POST /api/achievements/check
// @desc    Check and unlock achievements for user
// @access  Private
router.post("/check", async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const achievements = await Achievement.find({ isActive: true })

    const newlyUnlocked = []

    for (const achievement of achievements) {
      // Skip if already unlocked
      const existingAchievement = user.achievements.find(
        (ua) => ua.achievementId.toString() === achievement._id.toString(),
      )

      if (existingAchievement && !achievement.isProgressive) {
        continue
      }

      // Check achievement criteria
      let progress = 0
      let shouldUnlock = false

      switch (achievement.criteria.type) {
        case "course_completion":
          progress = user.stats.coursesCompleted
          shouldUnlock = progress >= achievement.criteria.target
          break

        case "problems_solved":
          progress = user.stats.problemsSolved
          shouldUnlock = progress >= achievement.criteria.target
          break

        case "quiz_score":
          // This would require more complex logic to track quiz scores
          progress = user.stats.quizzesCompleted
          shouldUnlock = progress >= achievement.criteria.target
          break

        case "study_streak":
          progress = user.stats.currentStreak
          shouldUnlock = progress >= achievement.criteria.target
          break

        case "time_spent":
          progress = user.stats.totalStudyTime
          shouldUnlock = progress >= achievement.criteria.target
          break

        default:
          continue
      }

      if (achievement.isProgressive) {
        // Handle progressive achievements
        const currentStep = existingAchievement?.progress || 0
        const nextStep = achievement.progressSteps.find((step) => step.step > currentStep && progress >= step.target)

        if (nextStep) {
          if (existingAchievement) {
            existingAchievement.progress = nextStep.step
            if (nextStep.step === achievement.progressSteps.length) {
              existingAchievement.unlockedAt = new Date()
            }
          } else {
            user.achievements.push({
              achievementId: achievement._id,
              progress: nextStep.step,
              unlockedAt: nextStep.step === achievement.progressSteps.length ? new Date() : undefined,
            })
          }

          // Award rewards
          user.stats.experiencePoints += nextStep.reward.experiencePoints || 0

          newlyUnlocked.push({
            achievement: achievement.toObject(),
            step: nextStep,
            isComplete: nextStep.step === achievement.progressSteps.length,
          })
        }
      } else if (shouldUnlock && !existingAchievement) {
        // Unlock regular achievement
        user.achievements.push({
          achievementId: achievement._id,
          unlockedAt: new Date(),
          progress: 100,
        })

        // Award rewards
        user.stats.experiencePoints += achievement.rewards.experiencePoints || 0

        newlyUnlocked.push({
          achievement: achievement.toObject(),
          isComplete: true,
        })
      }
    }

    // Update user level based on new XP
    user.stats.level = user.calculateLevel()
    await user.save()

    res.json({
      success: true,
      data: { newlyUnlocked },
    })
  } catch (error) {
    console.error("Check achievements error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to check achievements",
    })
  }
})

module.exports = router
