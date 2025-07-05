const mongoose = require("mongoose")

const topicSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ["video", "article", "quiz", "coding", "interactive"],
    required: true,
  },
  duration: { type: String, required: true },
  videoUrl: { type: String }, // YouTube URL for video topics
  thumbnail: { type: String },
  content: {
    // Video content
    videoUrl: String,
    duration: String,
    thumbnail: String,

    // Article content
    articleContent: String,

    // Quiz content
    quizQuestions: [
      {
        question: String,
        options: [String],
        correctAnswer: Number,
        explanation: String,
      },
    ],

    // Coding problem content
    codingProblem: {
      title: String,
      description: String,
      starterCode: String,
      solution: String,
      testCases: [
        {
          input: String,
          expectedOutput: String,
        },
      ],
    },

    // Interactive content
    interactiveContent: mongoose.Schema.Types.Mixed,
  },
  completed: { type: Boolean, default: false },
  order: { type: Number, required: true },
  isRequired: { type: Boolean, default: true },
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topic" }],
})

const conceptSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: String, required: true },
  estimatedTime: { type: Number, default: 30 }, // minutes
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner",
  },
  completed: { type: Boolean, default: false },
  topics: [topicSchema],
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Concept" }],
  learningObjectives: [String],
  resources: [
    {
      title: String,
      url: String,
      type: { type: String, enum: ["article", "video", "book", "documentation"] },
    },
  ],
})

const courseSchema = new mongoose.Schema(
  {
    
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String, maxlength: 200 },
    thumbnail: { type: String, required: true },
    bannerImage: { type: String },
    category: {
      type: String,
      required: true,
      enum: [
        "Programming",
        "Data Science",
        "Web Dev",
        "Mobile",
        "DevOps",
        "Cybersecurity",
        "AI/ML",
        "Blockchain",
        "Game Development",
        "Design",
      ],
    },
    subcategory: { type: String },
    level: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced", "Expert", "Beginner to Advanced"],
    },
    tags: [String],

    // Course structure
    concepts: [conceptSchema],
    syllabus: [{ type: String }],
    prerequisites: [{ type: String }],

    // Instructor information
    instructor: {
      name: { type: String, required: true },
      bio: String,
      avatar: String,
      credentials: [String],
      socialLinks: {
        linkedin: String,
        twitter: String,
        github: String,
        website: String,
      },
    },

    // Course metadata
    duration: { type: String, required: true }, // total minutes
    totalConcepts: { type: Number, default: 0 },
    totalTopics: { type: Number, default: 0 },
    language: { type: String, default: "English" },
    subtitles: [String],

    // Pricing and access
    pricing: {
      type: { type: String, enum: ["free", "premium", "one-time"], default: "free" },
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
      discountPercentage: { type: Number, default: 0 },
      originalPrice: { type: Number, required: true },
    },

    // Course status and visibility
    status: {
      type: String,
      enum: ["draft", "published", "coming_soon", "archived"],
      default: "draft",
    },
    isPublic: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    comingSoon: { type: Boolean, default: false },

    // Statistics
    stats: {
      enrollments: { type: Number, default: 0 },
      completions: { type: Number, default: 0 },
      averageRating: { type: Number, required: true },
      totalRatings: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
    },

    // Reviews and ratings
    reviews: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
        isVerified: { type: Boolean, default: false },
        helpful: { type: Number, default: 0 },
      },
    ],

    // Course requirements and outcomes
    requirements: [String],
    learningOutcomes: [String],
    targetAudience: [String],

    // SEO and marketing
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },

    // Certificates
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
    // _id: false, // Disable auto-generated _id since we're providing custom _id
  },
)

// Indexes
courseSchema.index({ slug: 1 }, { unique: true })
courseSchema.index({ category: 1, level: 1 })
courseSchema.index({ status: 1, isPublic: 1 })
courseSchema.index({ "stats.averageRating": -1 })
courseSchema.index({ "stats.enrollments": -1 })
courseSchema.index({ createdAt: -1 })
courseSchema.index({ title: "text", description: "text", tags: "text" })

// Virtual for completion rate
courseSchema.virtual("completionRate").get(function () {
  if (this.stats.enrollments === 0) return 0
  return (this.stats.completions / this.stats.enrollments) * 100
})

// Pre-save middleware to update totals
courseSchema.pre("save", function (next) {
  this.totalConcepts = this.concepts.length
  this.totalTopics = this.concepts.reduce((total, concept) => total + concept.topics.length, 0)
  next()
})

// Method to calculate average rating
courseSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) return 0

  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0)
  this.stats.averageRating = totalRating / this.reviews.length
  this.stats.totalRatings = this.reviews.length

  return this.stats.averageRating
}

// Method to add review
courseSchema.methods.addReview = function (userId, rating, comment) {
  // Check if user already reviewed
  const existingReview = this.reviews.find((review) => review.userId.toString() === userId.toString())

  if (existingReview) {
    existingReview.rating = rating
    existingReview.comment = comment
    existingReview.createdAt = new Date()
  } else {
    this.reviews.push({
      userId,
      rating,
      comment,
    })
  }

  this.calculateAverageRating()
  return this.save()
}

module.exports = mongoose.model("Course", courseSchema)
