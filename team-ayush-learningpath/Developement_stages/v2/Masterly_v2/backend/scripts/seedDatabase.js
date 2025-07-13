const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

// Import models
const User = require("../models/User")
const Course = require("../models/Course")
const LearningPath = require("../models/LearningPath")
const Assessment = require("../models/Assessment")
const Achievement = require("../models/Achievement")

// Connect to database
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/educational-platform")

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...")

    // Clear existing data
    await User.deleteMany({})
    await Course.deleteMany({})
    await LearningPath.deleteMany({})
    await Assessment.deleteMany({})
    await Achievement.deleteMany({})

    console.log("🗑️  Cleared existing data")

    // Create sample users
    const hashedPassword = await bcrypt.hash("password123", 12)

    const users = await User.create([
      {
        email: "alex.johnson@example.com",
        password: hashedPassword,
        profile: {
          firstName: "Alex",
          lastName: "Johnson",
          displayName: "Alex Johnson",
          bio: "Passionate software developer with 3+ years of experience.",
        },
        subscription: {
          plan: "premium",
          status: "active",
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        },
        stats: {
          totalStudyTime: 9390,
          coursesCompleted: 8,
          coursesEnrolled: 12,
          conceptsMastered: 234,
          problemsSolved: 156,
          quizzesCompleted: 89,
          currentStreak: 15,
          longestStreak: 28,
          level: 12,
          experiencePoints: 15420,
        },
        emailVerified: true,
      },
      {
        email: "sarah.chen@example.com",
        password: hashedPassword,
        profile: {
          firstName: "Sarah",
          lastName: "Chen",
          displayName: "Sarah Chen",
          bio: "Senior Software Engineer at Google with 8+ years of experience",
        },
        role: "instructor",
        emailVerified: true,
      },
    ])

    console.log("👥 Created sample users")

    // Create sample courses
    const courses = await Course.create([
      {
        title: "Complete Data Structures & Algorithms",
        slug: "complete-data-structures-algorithms",
        description:
          "Master the fundamentals of data structures and algorithms with hands-on practice and real-world examples.",
        shortDescription: "Master DSA with 300+ problems and detailed explanations",
        thumbnail: "/placeholder.svg?height=200&width=300",
        instructor: {
          id: users[1]._id,
          name: "Sarah Chen",
          bio: "Senior Software Engineer at Google with 8+ years of experience",
        },
        category: "Programming",
        subcategory: "Data Structures",
        level: "Beginner to Advanced",
        tags: ["algorithms", "data-structures", "coding-interview", "python", "java"],
        topics: [
          {
            title: "Arrays",
            description: "Master array operations, algorithms, and problem-solving techniques",
            order: 1,
            icon: "target",
            estimatedHours: 12,
            concepts: [
              {
                title: "Array Basics",
                description: "Introduction to arrays, declaration, and basic operations",
                order: 1,
                estimatedTime: "2h 30m",
                difficulty: "Easy",
                videos: [
                  {
                    title: "What are Arrays?",
                    description: "Understanding the fundamental concept of arrays",
                    duration: "8:30",
                    videoUrl: "/placeholder-video.mp4",
                    thumbnail: "/placeholder.svg?height=180&width=320",
                    order: 1,
                  },
                ],
                articles: [
                  {
                    title: "Understanding Arrays: A Comprehensive Guide",
                    content: "# Understanding Arrays\n\nArrays are fundamental data structures...",
                    readTime: "8 min read",
                    order: 1,
                    author: "Sarah Chen",
                  },
                ],
                codingProblems: [
                  {
                    title: "Find Maximum Element",
                    description: "Given an array of integers, find and return the maximum element.",
                    difficulty: "Easy",
                    category: "Arrays",
                    hints: ["Iterate through the array and keep track of the maximum value seen so far"],
                    starterCode: {
                      python: "def find_max(arr):\n    # Write your code here\n    pass",
                      java: "public class Solution {\n    public int findMax(int[] arr) {\n        // Write your code here\n        return 0;\n    }\n}",
                    },
                    solution: {
                      python:
                        "def find_max(arr):\n    if not arr:\n        return None\n    max_val = arr[0]\n    for num in arr[1:]:\n        if num > max_val:\n            max_val = num\n    return max_val",
                    },
                    testCases: [
                      {
                        input: "[3, 7, 2, 9, 1]",
                        expectedOutput: "9",
                        explanation: "9 is the largest number in the array",
                      },
                    ],
                    constraints: ["1 ≤ array length ≤ 1000"],
                    order: 1,
                  },
                ],
                quiz: {
                  title: "Array Basics Quiz",
                  description: "Test your understanding of array fundamentals",
                  timeLimit: 300,
                  passingScore: 70,
                  questions: [
                    {
                      type: "mcq",
                      question: "What is the time complexity of accessing an element in an array by index?",
                      options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                      correctAnswers: [0],
                      explanation: "Array elements can be accessed directly using their index in constant time.",
                      points: 5,
                      difficulty: "Easy",
                    },
                  ],
                  order: 1,
                },
              },
            ],
          },
        ],
        pricing: {
          type: "paid",
          price: 99,
          currency: "USD",
          discountPrice: 79,
        },
        stats: {
          totalStudents: 45234,
          totalRatings: 2847,
          averageRating: 4.9,
          totalReviews: 1205,
          completionRate: 78,
        },
        requirements: ["Basic programming knowledge in any language"],
        learningOutcomes: ["Master fundamental data structures", "Solve complex algorithmic problems"],
        targetAudience: ["Software engineering students", "Junior developers preparing for interviews"],
        status: "published",
        publishedAt: new Date(),
      },
    ])

    console.log("📚 Created sample courses")

    // Create sample learning paths
    const learningPaths = await LearningPath.create([
      {
        title: "Full Stack Developer",
        description: "Master both frontend and backend development",
        type: "predefined",
        difficulty: "Intermediate",
        estimatedDuration: "16 weeks",
        estimatedHours: 240,
        category: "Web Development",
        tags: ["react", "nodejs", "mongodb", "system-design"],
        steps: [
          {
            title: "Frontend Basics",
            description: "Learn HTML, CSS, and JavaScript fundamentals",
            type: "course",
            order: 1,
            courseId: courses[0]._id,
            estimatedTime: "4 weeks",
            difficulty: "Beginner",
            completionCriteria: {
              minimumScore: 80,
              requiredActivities: ["videos", "articles", "quiz"],
              masteryThreshold: 70,
            },
          },
        ],
        stats: {
          totalEnrollments: 25000,
          completionRate: 68,
          averageRating: 4.8,
          totalRatings: 1250,
        },
        status: "published",
        createdBy: users[1]._id,
        publishedAt: new Date(),
      },
    ])

    console.log("🛤️  Created sample learning paths")

    // Create sample assessments
    const assessments = await Assessment.create([
      {
        title: "Data Structures & Algorithms - Complete Assessment",
        description: "Comprehensive test covering arrays, linked lists, trees, graphs, and dynamic programming",
        type: "mock-test",
        category: "DSA",
        difficulty: "Mixed",
        duration: 5400, // 90 minutes
        totalQuestions: 25,
        passingScore: 70,
        maxAttempts: 3,
        questionTypes: {
          mcq: 15,
          coding: 10,
        },
        questions: [
          {
            type: "mcq",
            question: "What is the time complexity of inserting an element at the beginning of an array?",
            order: 1,
            points: 5,
            difficulty: "Easy",
            topic: "Arrays",
            options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
            correctAnswers: [2],
            explanation:
              "Inserting at the beginning requires shifting all existing elements one position to the right, which takes O(n) time.",
          },
        ],
        stats: {
          totalAttempts: 15420,
          averageScore: 72.5,
          passRate: 68.2,
        },
        isPublic: true,
        requiredSubscription: "free",
        createdBy: users[1]._id,
        status: "published",
        publishedAt: new Date(),
      },
    ])

    console.log("📝 Created sample assessments")

    // Create sample achievements
    const achievements = await Achievement.create([
      {
        title: "First Course Completed",
        description: "Complete your first course on the platform",
        icon: "trophy",
        category: "learning",
        type: "milestone",
        rarity: "common",
        criteria: {
          type: "course_completion",
          target: 1,
          timeframe: "all_time",
        },
        rewards: {
          experiencePoints: 100,
          badge: "first-course-badge",
          title: "Course Completer",
        },
        isProgressive: false,
        isActive: true,
        displayOrder: 1,
      },
      {
        title: "Problem Solving Master",
        description: "Solve coding problems to become a master",
        icon: "code",
        category: "skill",
        type: "progressive",
        rarity: "epic",
        criteria: {
          type: "problems_solved",
          target: 500,
          timeframe: "all_time",
        },
        rewards: {
          experiencePoints: 1000,
          badge: "problem-master-badge",
          title: "Problem Solving Master",
        },
        isProgressive: true,
        progressSteps: [
          {
            step: 1,
            title: "Problem Solver",
            description: "Solve 10 problems",
            target: 10,
            reward: {
              experiencePoints: 50,
              badge: "solver-bronze",
            },
          },
          {
            step: 2,
            title: "Code Warrior",
            description: "Solve 50 problems",
            target: 50,
            reward: {
              experiencePoints: 200,
              badge: "solver-silver",
            },
          },
        ],
        isActive: true,
        displayOrder: 10,
      },
    ])

    console.log("🏆 Created sample achievements")

    console.log("✅ Database seeding completed successfully!")
    console.log(`📊 Created:`)
    console.log(`   - ${users.length} users`)
    console.log(`   - ${courses.length} courses`)
    console.log(`   - ${learningPaths.length} learning paths`)
    console.log(`   - ${assessments.length} assessments`)
    console.log(`   - ${achievements.length} achievements`)
  } catch (error) {
    console.error("❌ Error seeding database:", error)
  } finally {
    mongoose.connection.close()
  }
}

// Run the seeding function
seedDatabase()
