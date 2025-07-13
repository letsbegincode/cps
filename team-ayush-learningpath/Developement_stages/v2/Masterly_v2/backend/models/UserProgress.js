const mongoose = require("mongoose")

const topicProgressSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, required: true },
  status: {
    type: String,
    enum: ["not-started", "in-progress", "completed", "skipped"],
    default: "not-started",
  },
  timeSpent: { type: Number, default: 0 }, // minutes
  attempts: { type: Number, default: 0 },
  score: { type: Number }, // for quizzes/assessments
  maxScore: { type: Number },
  completedAt: { type: Date },
  lastAccessedAt: { type: Date, default: Date.now },

  // Activity-specific data
  activityData: {
    // For video content
    watchTime: { type: Number, default: 0 },
    totalDuration: { type: Number },
    watchPercentage: { type: Number, default: 0 },

    // For quiz content
    quizAttempts: [
      {
        attemptNumber: Number,
        answers: [Number],
        score: Number,
        timeSpent: Number,
        completedAt: { type: Date, default: Date.now },
      },
    ],

    // For coding problems
    codeSubmissions: [
      {
        code: String,
        language: String,
        testsPassed: Number,
        totalTests: Number,
        submittedAt: { type: Date, default: Date.now },
        feedback: String,
      },
    ],

    // For articles
    readingProgress: { type: Number, default: 0 }, // percentage
    bookmarks: [String], // section IDs
    notes: [
      {
        content: String,
        position: String, // section or timestamp
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
})

const conceptProgressSchema = new mongoose.Schema({
  conceptId: { type: mongoose.Schema.Types.ObjectId, required: true },
  status: {
    type: String,
    enum: ["not-started", "in-progress", "completed"],
    default: "not-started",
  },
  progress: { type: Number, default: 0 }, // percentage (0-100)
  timeSpent: { type: Number, default: 0 }, // minutes
  startedAt: { type: Date },
  completedAt: { type: Date },
  lastAccessedAt: { type: Date, default: Date.now },

  // Topic-level progress
  topics: [topicProgressSchema],

  // Concept-level assessments
  assessments: [
    {
      assessmentId: { type: mongoose.Schema.Types.ObjectId },
      score: Number,
      maxScore: Number,
      attempts: { type: Number, default: 0 },
      bestScore: Number,
      completedAt: Date,
    },
  ],
})

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // Overall course progress
    overallProgress: { type: Number, default: 0 }, // percentage (0-100)
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed", "paused"],
      default: "not-started",
    },

    // Time tracking
    totalTimeSpent: { type: Number, default: 0 }, // minutes
    estimatedTimeRemaining: { type: Number }, // minutes
    averageSessionTime: { type: Number, default: 0 }, // minutes
    totalSessions: { type: Number, default: 0 },

    // Dates
    enrolledAt: { type: Date, default: Date.now },
    startedAt: { type: Date },
    lastAccessedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },

    // Concept-level progress
    concepts: [conceptProgressSchema],

    // Course-level assessments and certificates
    finalAssessment: {
      score: Number,
      maxScore: Number,
      attempts: { type: Number, default: 0 },
      bestScore: Number,
      passed: { type: Boolean, default: false },
      completedAt: Date,
    },

    certificate: {
      issued: { type: Boolean, default: false },
      issuedAt: Date,
      certificateId: String,
      downloadUrl: String,
    },

    // Learning preferences and settings
    preferences: {
      playbackSpeed: { type: Number, default: 1.0 },
      autoplay: { type: Boolean, default: true },
      subtitles: { type: Boolean, default: false },
      notifications: { type: Boolean, default: true },
    },

    // Streak and consistency tracking
    streakData: {
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastStudyDate: Date,
      studyDays: [Date], // Array of dates when user studied
    },

    // Performance metrics
    performance: {
      averageScore: { type: Number, default: 0 },
      conceptsMastered: { type: Number, default: 0 },
      totalQuizzesTaken: { type: Number, default: 0 },
      totalProblemsAttempted: { type: Number, default: 0 },
      totalProblemsSolved: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Compound indexes
userProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true })
userProgressSchema.index({ userId: 1, status: 1 })
userProgressSchema.index({ courseId: 1, status: 1 })
userProgressSchema.index({ lastAccessedAt: -1 })

// Virtual for completion percentage
userProgressSchema.virtual("completionPercentage").get(function () {
  return this.overallProgress
})

// Method to update overall progress
userProgressSchema.methods.updateOverallProgress = function () {
  if (this.concepts.length === 0) {
    this.overallProgress = 0
    return
  }

  const totalProgress = this.concepts.reduce((sum, concept) => sum + concept.progress, 0)
  this.overallProgress = Math.round(totalProgress / this.concepts.length)

  // Update status based on progress
  if (this.overallProgress === 0) {
    this.status = "not-started"
  } else if (this.overallProgress === 100) {
    this.status = "completed"
    if (!this.completedAt) {
      this.completedAt = new Date()
    }
  } else {
    this.status = "in-progress"
    if (!this.startedAt) {
      this.startedAt = new Date()
    }
  }
}

// Method to update concept progress
userProgressSchema.methods.updateConceptProgress = function (conceptId) {
  const concept = this.concepts.find((c) => c.conceptId.toString() === conceptId.toString())
  if (!concept) return

  const completedTopics = concept.topics.filter((t) => t.status === "completed").length
  const totalTopics = concept.topics.length

  if (totalTopics > 0) {
    concept.progress = Math.round((completedTopics / totalTopics) * 100)

    if (concept.progress === 100) {
      concept.status = "completed"
      if (!concept.completedAt) {
        concept.completedAt = new Date()
      }
    } else if (concept.progress > 0) {
      concept.status = "in-progress"
      if (!concept.startedAt) {
        concept.startedAt = new Date()
      }
    }
  }

  this.updateOverallProgress()
}

// Method to add time spent
userProgressSchema.methods.addTimeSpent = function (minutes, conceptId = null, topicId = null) {
  this.totalTimeSpent += minutes
  this.lastAccessedAt = new Date()

  if (conceptId) {
    const concept = this.concepts.find((c) => c.conceptId.toString() === conceptId.toString())
    if (concept) {
      concept.timeSpent += minutes
      concept.lastAccessedAt = new Date()

      if (topicId) {
        const topic = concept.topics.find((t) => t.topicId.toString() === topicId.toString())
        if (topic) {
          topic.timeSpent += minutes
          topic.lastAccessedAt = new Date()
        }
      }
    }
  }

  // Update session tracking
  this.totalSessions += 1
  this.averageSessionTime = this.totalTimeSpent / this.totalSessions
}

// Method to update streak
userProgressSchema.methods.updateStreak = function () {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastStudyDate = this.streakData.lastStudyDate
  if (lastStudyDate) {
    const lastStudy = new Date(lastStudyDate)
    lastStudy.setHours(0, 0, 0, 0)

    const daysDiff = Math.floor((today - lastStudy) / (1000 * 60 * 60 * 24))

    if (daysDiff === 1) {
      // Consecutive day
      this.streakData.currentStreak += 1
    } else if (daysDiff > 1) {
      // Streak broken
      this.streakData.currentStreak = 1
    }
    // If daysDiff === 0, same day, don't change streak
  } else {
    // First study session
    this.streakData.currentStreak = 1
  }

  // Update longest streak
  if (this.streakData.currentStreak > this.streakData.longestStreak) {
    this.streakData.longestStreak = this.streakData.currentStreak
  }

  this.streakData.lastStudyDate = today
  if (!this.streakData.studyDays.includes(today)) {
    this.streakData.studyDays.push(today)
  }
}

module.exports = mongoose.model("UserProgress", userProgressSchema)
