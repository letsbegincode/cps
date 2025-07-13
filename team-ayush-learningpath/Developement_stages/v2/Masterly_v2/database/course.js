// Import ObjectId from mongoose
const { ObjectId } = require("mongoose").Types

// Course Collection Schema
const courseSchema = {
  _id: ObjectId,
  title: String, // required
  slug: String, // unique, URL-friendly
  description: String,
  shortDescription: String,
  thumbnail: String, // URL to course image
  instructor: {
    id: ObjectId, // reference to User
    name: String,
    avatar: String,
    bio: String,
  },
  category: String, // "Programming", "Data Science", "AI/ML", "Design", "Web Dev", "Mobile"
  subcategory: String,
  level: String, // "Beginner", "Intermediate", "Advanced", "All Levels"
  tags: [String],

  // Course Structure
  topics: [
    {
      _id: ObjectId,
      title: String,
      description: String,
      order: Number,
      icon: String,
      estimatedHours: Number,
      concepts: [
        {
          _id: ObjectId,
          title: String,
          description: String,
          order: Number,
          estimatedTime: String, // "2h 30m"
          difficulty: String, // "Easy", "Medium", "Hard"

          // Content Types
          videos: [
            {
              _id: ObjectId,
              title: String,
              description: String,
              duration: String, // "15:30"
              videoUrl: String,
              thumbnail: String,
              order: Number,
              transcription: String,
              resources: [String], // URLs to additional resources
            },
          ],

          articles: [
            {
              _id: ObjectId,
              title: String,
              content: String, // Markdown content
              readTime: String, // "8 min read"
              order: Number,
              author: String,
              publishedAt: Date,
            },
          ],

          codingProblems: [
            {
              _id: ObjectId,
              title: String,
              description: String,
              difficulty: String,
              category: String,
              hints: [String],
              starterCode: {
                python: String,
                java: String,
                cpp: String,
                javascript: String,
              },
              solution: {
                python: String,
                java: String,
                cpp: String,
                javascript: String,
              },
              testCases: [
                {
                  input: String,
                  expectedOutput: String,
                  explanation: String,
                },
              ],
              constraints: [String],
              timeLimit: Number, // milliseconds
              memoryLimit: String,
              order: Number,
            },
          ],

          quiz: {
            _id: ObjectId,
            title: String,
            description: String,
            timeLimit: Number, // seconds
            passingScore: Number, // percentage
            questions: [
              {
                _id: ObjectId,
                type: String, // "mcq", "multiple_select", "true_false", "fill_blank"
                question: String,
                options: [String], // for MCQ
                correctAnswers: [Number], // indexes of correct options
                explanation: String,
                points: Number,
                difficulty: String,
              },
            ],
            order: Number,
          },
        },
      ],
    },
  ],

  // Course Metadata
  pricing: {
    type: String, // "free", "paid", "premium_only"
    price: Number,
    currency: String,
    discountPrice: Number,
    discountEndDate: Date,
  },

  stats: {
    totalStudents: Number,
    totalRatings: Number,
    averageRating: Number,
    totalReviews: Number,
    completionRate: Number, // percentage
    totalDuration: Number, // minutes
    totalConcepts: Number,
    totalVideos: Number,
    totalArticles: Number,
    totalProblems: Number,
    totalQuizzes: Number,
  },

  requirements: [String], // Prerequisites
  learningOutcomes: [String], // What students will learn
  targetAudience: [String],

  // Publishing
  status: String, // "draft", "published", "archived"
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date,

  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
  },
}

// Import db from wherever it is defined
const db = require("./path_to_db")

// Indexes
db.courses.createIndex({ slug: 1 }, { unique: true })
db.courses.createIndex({ category: 1, subcategory: 1 })
db.courses.createIndex({ level: 1 })
db.courses.createIndex({ status: 1 })
db.courses.createIndex({ "stats.averageRating": -1 })
db.courses.createIndex({ "stats.totalStudents": -1 })
db.courses.createIndex({ publishedAt: -1 })
db.courses.createIndex({ tags: 1 })
