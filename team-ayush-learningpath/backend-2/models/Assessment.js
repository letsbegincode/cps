const mongoose = require("mongoose")

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["multiple-choice", "true-false", "fill-blank", "coding", "essay"],
    required: true,
  },
  question: { type: String, required: true },
  options: [String], // For multiple choice
  correctAnswer: mongoose.Schema.Types.Mixed, // Can be number, string, or array
  explanation: String,
  points: { type: Number, default: 1 },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  tags: [String],

  // For coding questions
  codingProblem: {
    starterCode: String,
    solution: String,
    testCases: [
      {
        input: String,
        expectedOutput: String,
        isHidden: { type: Boolean, default: false },
      },
    ],
    constraints: String,
    timeLimit: { type: Number, default: 1000 }, // milliseconds
    memoryLimit: { type: Number, default: 256 }, // MB
  },
})

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },

    // Assessment type and context
    type: {
      type: String,
      enum: ["quiz", "test", "exam", "practice", "certification"],
      required: true,
    },
    context: {
      type: { type: String, enum: ["course", "concept", "learning-path", "standalone"], required: true },
      contextId: { type: mongoose.Schema.Types.ObjectId }, // Course ID, Concept ID, etc.
      contextTitle: String,
    },

    // Questions
    questions: [questionSchema],
    totalQuestions: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },

    // Assessment settings
    settings: {
      timeLimit: { type: Number }, // minutes, null for unlimited
      attemptsAllowed: { type: Number, default: 3 },
      passingScore: { type: Number, default: 70 }, // percentage
      randomizeQuestions: { type: Boolean, default: false },
      randomizeOptions: { type: Boolean, default: false },
      showResults: { type: Boolean, default: true },
      showCorrectAnswers: { type: Boolean, default: true },
      allowReview: { type: Boolean, default: true },
      requireProctoring: { type: Boolean, default: false },
    },

    // Availability
    availability: {
      startDate: Date,
      endDate: Date,
      isPublic: { type: Boolean, default: true },
      requiresEnrollment: { type: Boolean, default: false },
    },

    // Difficulty and categorization
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    category: String,
    tags: [String],

    // Statistics
    stats: {
      totalAttempts: { type: Number, default: 0 },
      totalCompletions: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 }, // minutes
      passRate: { type: Number, default: 0 }, // percentage
      difficultyRating: { type: Number, default: 0 }, // 1-5 scale
    },

    // Creator information
    creator: {
      creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      role: { type: String, enum: ["instructor", "admin", "system"], default: "instructor" },
    },

    // Status
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    // Feedback and analytics
    feedback: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes
assessmentSchema.index({ slug: 1 }, { unique: true })
assessmentSchema.index({ type: 1, status: 1 })
assessmentSchema.index({ "context.type": 1, "context.contextId": 1 })
assessmentSchema.index({ category: 1, level: 1 })
assessmentSchema.index({ createdAt: -1 })
assessmentSchema.index({ title: "text", description: "text" })

// Pre-save middleware
assessmentSchema.pre("save", function (next) {
  this.totalQuestions = this.questions.length
  this.totalPoints = this.questions.reduce((sum, q) => sum + q.points, 0)
  next()
})

// Method to calculate statistics
assessmentSchema.methods.updateStats = function (score, timeSpent, passed) {
  this.stats.totalAttempts += 1
  if (passed) {
    this.stats.totalCompletions += 1
  }

  // Update average score
  const totalScore = this.stats.averageScore * (this.stats.totalAttempts - 1) + score
  this.stats.averageScore = totalScore / this.stats.totalAttempts

  // Update average time
  const totalTime = this.stats.averageTime * (this.stats.totalAttempts - 1) + timeSpent
  this.stats.averageTime = totalTime / this.stats.totalAttempts

  // Update pass rate
  this.stats.passRate = (this.stats.totalCompletions / this.stats.totalAttempts) * 100

  return this.save()
}

module.exports = mongoose.model("Assessment", assessmentSchema)
