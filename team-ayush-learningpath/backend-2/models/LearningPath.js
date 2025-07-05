const mongoose = require("mongoose")

const learningPathSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String, maxlength: 200 },
    thumbnail: { type: String },
    bannerImage: { type: String },

    // Path categorization
    category: {
      type: String,
      required: true,
      enum: [
        "programming",
        "data-science",
        "web-development",
        "mobile-development",
        "devops",
        "cybersecurity",
        "ai-ml",
        "blockchain",
        "game-development",
        "design",
      ],
    },
    subcategory: { type: String },
    level: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced", "expert"],
    },
    tags: [String],

    // Path structure
    courses: [
      {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        order: { type: Number, required: true },
        isRequired: { type: Boolean, default: true },
        prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
        estimatedDuration: { type: Number }, // hours
        description: String,
      },
    ],

    // Path metadata
    totalDuration: { type: Number, required: true }, // total hours
    totalCourses: { type: Number, default: 0 },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "mixed"],
      default: "beginner",
    },

    // Creator information
    creator: {
      type: { type: String, enum: ["system", "instructor", "ai"], default: "system" },
      creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      bio: String,
      avatar: String,
    },

    // Path status and visibility
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    isPublic: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isAIGenerated: { type: Boolean, default: false },

    // Statistics
    stats: {
      enrollments: { type: Number, default: 0 },
      completions: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalRatings: { type: Number, default: 0 },
      averageCompletionTime: { type: Number, default: 0 }, // hours
      views: { type: Number, default: 0 },
    },

    // Learning outcomes and requirements
    learningOutcomes: [String],
    requirements: [String],
    targetAudience: [String],

    // Career and skill information
    careerPaths: [String],
    skillsGained: [String],
    industryRelevance: [String],

    // Pricing (if premium path)
    pricing: {
      type: { type: String, enum: ["free", "premium"], default: "free" },
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
    },

    // Reviews and ratings
    reviews: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
        helpful: { type: Number, default: 0 },
      },
    ],

    // SEO
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },

    // Certificate
    certificate: {
      enabled: { type: Boolean, default: false },
      template: String,
      criteria: {
        completionPercentage: { type: Number, default: 100 },
        minimumScore: { type: Number, default: 80 },
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes
learningPathSchema.index({ slug: 1 }, { unique: true })
learningPathSchema.index({ category: 1, level: 1 })
learningPathSchema.index({ status: 1, isPublic: 1 })
learningPathSchema.index({ "stats.averageRating": -1 })
learningPathSchema.index({ "stats.enrollments": -1 })
learningPathSchema.index({ createdAt: -1 })
learningPathSchema.index({ title: "text", description: "text", tags: "text" })

// Virtual for completion rate
learningPathSchema.virtual("completionRate").get(function () {
  if (this.stats.enrollments === 0) return 0
  return (this.stats.completions / this.stats.enrollments) * 100
})

// Pre-save middleware
learningPathSchema.pre("save", function (next) {
  this.totalCourses = this.courses.length
  next()
})

// Method to calculate average rating
learningPathSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) return 0

  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0)
  this.stats.averageRating = totalRating / this.reviews.length
  this.stats.totalRatings = this.reviews.length

  return this.stats.averageRating
}

module.exports = mongoose.model("LearningPath", learningPathSchema)
