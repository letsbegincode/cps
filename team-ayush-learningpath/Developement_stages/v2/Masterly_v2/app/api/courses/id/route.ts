import { type NextRequest, NextResponse } from "next/server"

// Mock data structure matching your types
const mockCourseData = {
  _id: "course-1",
  title: "Complete JavaScript Mastery",
  slug: "complete-javascript-mastery",
  description: "Master JavaScript from basics to advanced concepts with hands-on projects and real-world applications.",
  shortDescription: "Learn JavaScript fundamentals and advanced concepts",
  thumbnail: "/placeholder.svg?height=400&width=600",
  category: "Programming",
  subcategory: "Web Development",
  level: "Beginner",
  tags: ["JavaScript", "Programming", "Web Development"],
  isActive: true,
  comingSoon: false,
  instructor: {
    name: "John Doe",
    bio: "Senior JavaScript Developer with 8+ years of experience",
    avatar: "/placeholder.svg?height=100&width=100",
    credentials: ["Google Certified", "Meta Frontend Developer"],
  },
  pricing: {
    type: "free" as const,
    amount: 0,
    currency: "USD",
    originalPrice: 99,
    discountPrice: 0,
    discountPercentage: 100,
  },
  stats: {
    enrollments: 15420,
    completions: 8934,
    views: 45230,
    totalStudents: 15420,
    totalRatings: 1250,
    averageRating: 4.8,
    totalReviews: 892,
    completionRate: 58,
    totalDuration: 1200,
    totalConcepts: 8,
    totalVideos: 24,
    totalArticles: 16,
    totalProblems: 12,
    totalQuizzes: 8,
  },
  topics: [
    {
      _id: "topic-1",
      title: "JavaScript Fundamentals",
      description: "Learn the core concepts of JavaScript programming",
      order: 1,
      icon: "code",
      estimatedHours: 20,
      concepts: [
        {
          _id: "concept-1",
          title: "Variables and Data Types",
          description: "Understanding JavaScript variables, data types, and type conversion",
          order: 1,
          estimatedTime: "2 hours",
          difficulty: "Beginner",
          videos: [
            {
              _id: "video-1",
              title: "Introduction to Variables",
              description: "Learn about var, let, and const in JavaScript",
              duration: "15:30",
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              thumbnail: "/placeholder.svg?height=180&width=320",
              order: 1,
              isPreview: true,
            },
            {
              _id: "video-2",
              title: "JavaScript Data Types",
              description: "Understanding primitive and non-primitive data types",
              duration: "20:45",
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              thumbnail: "/placeholder.svg?height=180&width=320",
              order: 2,
            },
          ],
          articles: [
            {
              _id: "article-1",
              title: "JavaScript Variables Deep Dive",
              content: `# JavaScript Variables Deep Dive

## Introduction

Variables are fundamental building blocks in JavaScript programming. They allow us to store and manipulate data throughout our programs.

## Variable Declarations

### var
The \`var\` keyword was the original way to declare variables in JavaScript:

\`\`\`javascript
var name = "John";
var age = 25;
\`\`\`

### let
Introduced in ES6, \`let\` provides block-scoped variables:

\`\`\`javascript
let count = 0;
let isActive = true;
\`\`\`

### const
Also introduced in ES6, \`const\` creates constants:

\`\`\`javascript
const PI = 3.14159;
const API_URL = "https://api.example.com";
\`\`\`

## Data Types

JavaScript has several built-in data types:

1. **Number**: Integers and floating-point numbers
2. **String**: Text data
3. **Boolean**: true or false values
4. **Undefined**: Variables that haven't been assigned a value
5. **Null**: Intentional absence of value
6. **Object**: Complex data structures
7. **Symbol**: Unique identifiers (ES6)

## Best Practices

- Use \`const\` by default
- Use \`let\` when you need to reassign the variable
- Avoid \`var\` in modern JavaScript
- Use descriptive variable names
- Follow camelCase naming convention

## Conclusion

Understanding variables and data types is crucial for JavaScript development. Practice using different variable declarations and data types to become comfortable with these concepts.`,
              readTime: "8 min read",
              author: "John Doe",
            },
          ],
          codingProblems: [
            {
              _id: "problem-1",
              title: "Variable Swap",
              description: "Write a function to swap two variables without using a temporary variable.",
              difficulty: "Easy",
              category: "Fundamentals",
              hints: ["You can use arithmetic operations", "Consider using destructuring assignment"],
              starterCode: {
                python: "def swap_variables(a, b):\n    # Your code here\n    return a, b",
                java: "public static int[] swapVariables(int a, int b) {\n    // Your code here\n    return new int[]{a, b};\n}",
              },
              solution: {
                python: "def swap_variables(a, b):\n    return b, a",
              },
              testCases: [
                {
                  input: "5, 10",
                  expectedOutput: "10, 5",
                  explanation: "Swap 5 and 10 to get 10 and 5",
                },
              ],
              constraints: ["1 <= a, b <= 1000"],
              timeLimit: 1000,
              memoryLimit: "128MB",
              order: 1,
            },
          ],
          quiz: {
            _id: "quiz-1",
            title: "Variables and Data Types Quiz",
            description: "Test your understanding of JavaScript variables and data types",
            timeLimit: 15,
            passingScore: 70,
            questions: [
              {
                type: "mcq" as const,
                question: "Which keyword should you use for variables that won't be reassigned?",
                options: ["var", "let", "const", "static"],
                correctAnswers: [2],
                explanation: "const should be used for variables that won't be reassigned",
                points: 10,
                difficulty: "Easy",
              },
            ],
            order: 1,
          },
          prerequisites: [],
        },
        {
          _id: "concept-2",
          title: "Functions and Scope",
          description: "Learn about JavaScript functions, parameters, and scope",
          order: 2,
          estimatedTime: "3 hours",
          difficulty: "Beginner",
          videos: [
            {
              _id: "video-3",
              title: "Function Basics",
              description: "Introduction to JavaScript functions",
              duration: "18:20",
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              thumbnail: "/placeholder.svg?height=180&width=320",
              order: 1,
            },
          ],
          articles: [
            {
              _id: "article-2",
              title: "Understanding JavaScript Functions",
              content: `# Understanding JavaScript Functions

Functions are reusable blocks of code that perform specific tasks. They are fundamental to JavaScript programming.

## Function Declaration

\`\`\`javascript
function greet(name) {
    return "Hello, " + name + "!";
}
\`\`\`

## Function Expression

\`\`\`javascript
const greet = function(name) {
    return "Hello, " + name + "!";
};
\`\`\`

## Arrow Functions

\`\`\`javascript
const greet = (name) => {
    return "Hello, " + name + "!";
};

// Shorter syntax for single expressions
const greet = name => "Hello, " + name + "!";
\`\`\`

## Scope

JavaScript has function scope and block scope. Understanding scope is crucial for writing maintainable code.`,
              readTime: "10 min read",
              author: "John Doe",
            },
          ],
          codingProblems: [],
          prerequisites: ["concept-1"],
        },
      ],
    },
    {
      _id: "topic-2",
      title: "Advanced JavaScript",
      description: "Dive deeper into advanced JavaScript concepts",
      order: 2,
      icon: "zap",
      estimatedHours: 25,
      concepts: [
        {
          _id: "concept-3",
          title: "Asynchronous JavaScript",
          description: "Master promises, async/await, and asynchronous programming",
          order: 1,
          estimatedTime: "4 hours",
          difficulty: "Intermediate",
          videos: [
            {
              _id: "video-4",
              title: "Understanding Promises",
              description: "Learn about JavaScript promises and how to use them",
              duration: "25:15",
              videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              thumbnail: "/placeholder.svg?height=180&width=320",
              order: 1,
            },
          ],
          articles: [
            {
              _id: "article-3",
              title: "Mastering Async/Await",
              content: `# Mastering Async/Await

Async/await is a powerful feature that makes asynchronous code easier to read and write.

## Basic Syntax

\`\`\`javascript
async function fetchData() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}
\`\`\`

## Error Handling

Always use try/catch blocks with async/await for proper error handling.`,
              readTime: "12 min read",
              author: "John Doe",
            },
          ],
          codingProblems: [
            {
              _id: "problem-2",
              title: "Promise Chain",
              description: "Create a function that chains multiple promises together.",
              difficulty: "Medium",
              category: "Asynchronous",
              hints: ["Use Promise.then() for chaining", "Handle errors properly"],
              starterCode: {
                python: "# JavaScript problem - implement in JS",
                java: "// JavaScript problem - implement in JS",
              },
              solution: {
                python: "// Solution would be in JavaScript",
              },
              testCases: [
                {
                  input: "Promise chain",
                  expectedOutput: "Resolved chain",
                  explanation: "Chain promises correctly",
                },
              ],
              constraints: ["Handle all promise states"],
              timeLimit: 2000,
              memoryLimit: "256MB",
              order: 1,
            },
          ],
          prerequisites: ["concept-1", "concept-2"],
        },
      ],
    },
  ],
}

const mockUserProgress = {
  _id: "progress-1",
  userId: "user-1",
  courseId: "course-1",
  overallProgress: 25,
  status: "in-progress",
  lastAccessedAt: new Date().toISOString(),
  conceptsProgress: [
    {
      conceptId: "concept-1",
      completed: true,
      topicsProgress: [
        {
          topicId: 1,
          completed: true,
          timeSpent: 900,
          completedAt: new Date().toISOString(),
          score: 85,
        },
      ],
    },
    {
      conceptId: "concept-2",
      completed: false,
      topicsProgress: [
        {
          topicId: 1,
          completed: false,
          timeSpent: 300,
        },
      ],
    },
  ],
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const courseId = params.id

    // In a real app, you would fetch from your database
    // const course = await Course.findById(courseId).populate('topics.concepts')
    // const userProgress = await UserProgress.findOne({ courseId, userId })

    return NextResponse.json({
      success: true,
      course: mockCourseData,
      userProgress: mockUserProgress,
    })
  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch course" }, { status: 500 })
  }
}
