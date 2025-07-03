// Import ObjectId from mongoose
const { ObjectId } = require("mongoose").Types

// User Progress Collection Schema
const userProgressSchema = {
  _id: ObjectId,
  userId: ObjectId, // reference to User
  courseId: ObjectId, // reference to Course

  // Overall Course Progress
  overallProgress: Number, // percentage (0-100)
  startedAt: Date,
  lastAccessedAt: Date,
  completedAt: Date,
  timeSpent: Number, // total minutes spent

  // Topic Progress
  topicProgress: [
    {
      topicId: ObjectId,
      progress: Number, // percentage
      masteryScore: Number, // 0-10 scale
      completedConcepts: Number,
      totalConcepts: Number,
      timeSpent: Number, // minutes
      startedAt: Date,
      completedAt: Date,
    },
  ],

  // Concept Progress
  conceptProgress: [
    {
      conceptId: ObjectId,
      topicId: ObjectId,
      status: String, // "not_started", "in_progress", "completed", "mastered"
      masteryScore: Number, // 0-10 scale
      timeSpent: Number, // minutes

      // Video Progress
      videoProgress: [
        {
          videoId: ObjectId,
          watched: Boolean,
          watchTime: Number, // seconds watched
          totalTime: Number, // total video duration
          lastPosition: Number, // last watched position in seconds
          completedAt: Date,
        },
      ],

      // Article Progress
      articleProgress: [
        {
          articleId: ObjectId,
          read: Boolean,
          readTime: Number, // minutes spent reading
          completedAt: Date,
        },
      ],

      // Coding Problem Progress
      problemProgress: [
        {
          problemId: ObjectId,
          status: String, // "not_attempted", "attempted", "solved"
          attempts: Number,
          bestSolution: {
            code: String,
            language: String,
            submittedAt: Date,
            testCasesPassed: Number,
            totalTestCases: Number,
            executionTime: Number, // milliseconds
            memoryUsed: Number, // bytes
          },
          allSubmissions: [
            {
              code: String,
              language: String,
              submittedAt: Date,
              testCasesPassed: Number,
              totalTestCases: Number,
              executionTime: Number,
              memoryUsed: Number,
              feedback: String,
            },
          ],
          hintsUsed: [Number], // indexes of hints used
          timeSpent: Number, // minutes
          solvedAt: Date,
        },
      ],

      // Quiz Progress
      quizProgress: {
        quizId: ObjectId,
        attempts: [
          {
            attemptNumber: Number,
            startedAt: Date,
            completedAt: Date,
            timeSpent: Number, // seconds
            score: Number, // percentage
            totalQuestions: Number,
            correctAnswers: Number,
            answers: [
              {
                questionId: ObjectId,
                selectedAnswers: [Number], // indexes of selected options
                isCorrect: Boolean,
                timeSpent: Number, // seconds on this question
              },
            ],
            passed: Boolean,
          },
        ],
        bestScore: Number,
        averageScore: Number,
        totalAttempts: Number,
        completed: Boolean,
        completedAt: Date,
      },

      startedAt: Date,
      completedAt: Date,
    },
  ],

  // Learning Analytics
  analytics: {
    dailyActivity: [
      {
        date: Date,
        timeSpent: Number, // minutes
        conceptsCompleted: Number,
        videosWatched: Number,
        articlesRead: Number,
        problemsSolved: Number,
        quizzesTaken: Number,
      },
    ],
    weeklyStats: [
      {
        weekStart: Date,
        weekEnd: Date,
        totalTime: Number,
        conceptsCompleted: Number,
        averageScore: Number,
        streak: Number,
      },
    ],
    strengths: [String], // topics where user performs well
    weaknesses: [String], // topics needing improvement
    recommendedFocus: [String], // AI-generated recommendations
  },

  createdAt: Date,
  updatedAt: Date,
}

// Declare db variable
const db = require("./db") // Assuming db is imported from a module

// Indexes
db.userProgress.createIndex({ userId: 1, courseId: 1 }, { unique: true })
db.userProgress.createIndex({ userId: 1 })
db.userProgress.createIndex({ courseId: 1 })
db.userProgress.createIndex({ lastAccessedAt: -1 })
db.userProgress.createIndex({ "analytics.dailyActivity.date": -1 })
