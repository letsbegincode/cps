const mongoose = require("mongoose")

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },

    // Visual representation
    icon: { type: String, required: true }, // Icon name or URL
    color: { type: String, default: "#3B82F6" }, // Hex color
    badge: { type: String }, // Badge image URL

    // Achievement type and category
    type: {
      type: String,
      enum: ["milestone", "streak", "skill", "completion", "performance", "social", "special"],
      required: true,
    },
    category: {
      type: String,
      enum: ["learning", "engagement", "achievement", "social", "special"],
      required: true,
    },

    // Achievement criteria
    criteria: {
      type: {
        type: String,
        enum: ["count", "percentage", "time", "streak", "score", "custom"],
        required: true,
      },
      target: { type: Number, required: true },
      metric: { type: String, required: true }, // What to measure
      context: String, // Additional context (e.g., specific course, category)
      timeframe: String, // e.g., "daily", "weekly", "monthly", "all-time"
    },

    // Difficulty and rarity
    difficulty: {
      type: String,
      enum: ["common", "uncommon", "rare", "epic", "legendary"],
      default: "common",
    },
    rarity: { type: Number, default: 0 }, // Percentage of users who have this achievement

    // Rewards
    rewards: {
      experiencePoints: { type: Number, default: 0 },
      badge: String,
      title: String, // Special title for user profile
      unlocks: [String], // What this achievement unlocks
    },

    // Visibility and availability
    isVisible: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    isSecret: { type: Boolean, default: false }, // Hidden until unlocked

    // Prerequisites
    prerequisites: [
      {
        achievementId: { type: mongoose.Schema.Types.ObjectId, ref: "Achievement" },
        required: { type: Boolean, default: true },
      },
    ],

    // Statistics
    stats: {
      totalUnlocked: { type: Number, default: 0 },
      firstUnlockedAt: Date,
      lastUnlockedAt: Date,
      averageTimeToUnlock: { type: Number, default: 0 }, // days
    },

    // Localization
    localization: {
      title: { type: Map, of: String }, // Language code -> translated title
      description: { type: Map, of: String }, // Language code -> translated description
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes
achievementSchema.index({ slug: 1 }, { unique: true })
achievementSchema.index({ type: 1, category: 1 })
achievementSchema.index({ difficulty: 1 })
achievementSchema.index({ isActive: 1, isVisible: 1 })
achievementSchema.index({ "stats.totalUnlocked": -1 })

// Virtual for unlock rate
achievementSchema.virtual("unlockRate").get(function () {
  return this.rarity
})

// Method to check if user meets criteria
achievementSchema.methods.checkCriteria = function (userStats) {
  const { type, target, metric, context, timeframe } = this.criteria

  switch (type) {
    case "count":
      return userStats[metric] >= target

    case "percentage":
      return (userStats[metric] / userStats.total) * 100 >= target

    case "time":
      return userStats[metric] >= target // assuming metric is in minutes

    case "streak":
      return userStats.currentStreak >= target

    case "score":
      return userStats.averageScore >= target

    default:
      return false
  }
}

// Method to award achievement to user
achievementSchema.methods.awardToUser = async function (userId) {
  const User = mongoose.model("User")

  try {
    const user = await User.findById(userId)
    if (!user) return false

    // Check if user already has this achievement
    const hasAchievement = user.achievements.some(
      (achievement) => achievement.achievementId.toString() === this._id.toString(),
    )

    if (hasAchievement) return false

    // Award the achievement
    user.achievements.push({
      achievementId: this._id,
      unlockedAt: new Date(),
      progress: 100,
    })

    // Add experience points
    user.stats.experiencePoints += this.rewards.experiencePoints

    await user.save()

    // Update achievement stats
    this.stats.totalUnlocked += 1
    if (!this.stats.firstUnlockedAt) {
      this.stats.firstUnlockedAt = new Date()
    }
    this.stats.lastUnlockedAt = new Date()

    await this.save()

    return true
  } catch (error) {
    console.error("Error awarding achievement:", error)
    return false
  }
}

module.exports = mongoose.model("Achievement", achievementSchema)
