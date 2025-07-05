import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import Course from '../models/courseModel';
import UserProgress from '../models/userProgressModel';
import User, { IUser } from '../models/userModel';
import { authenticateToken, optionalAuth } from '../middlewares/authMiddleware';
import { ICourse } from '../types';

// Extend course object to include user enrollment
interface CourseWithEnrollment extends ICourse {
  userEnrollment?: {
    enrolled: boolean;
    progress: number;
    status: string;
    lastAccessedAt?: Date;
  };
}

const router = Router();

// @route   GET /api/courses
// @desc    Get all courses with filtering and pagination
// @access  Public
router.get("/", optionalAuth, async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      level, 
      search, 
      sort = "-stats.enrollments", 
      free, 
      featured 
    } = req.query;

    // Build query
    const query: any = { status: { $in: ["published", "coming_soon"] }, isPublic: true };

    if (category && category !== "All Courses") query.category = category;
    if (level && level !== "all") {
      if (level === "beginner") query.level = { $regex: /beginner/i };
      else if (level === "intermediate") query.level = { $regex: /intermediate/i };
      else if (level === "advanced") query.level = { $regex: /advanced/i };
    }
    if (free === "true") query["pricing.type"] = "free";
    if (featured === "true") query.isFeatured = true;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search as string, "i")] } },
        { "instructor.name": { $regex: search, $options: "i" } },
      ];
    }

    // Execute query with pagination
    const courses = await Course.find(query)
      .select("-concepts.topics.content") // Exclude detailed content for list view
      .sort(sort as string)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Course.countDocuments(query);

    // If user is authenticated, get their enrollment status
    let userEnrollments: any[] = [];
    if (req.user) {
      userEnrollments = await UserProgress.find({
        userId: (req.user as IUser)._id,
        courseId: { $in: courses.map((c) => c._id) },
      }).select("courseId overallProgress status");
    }

    // Add enrollment info to courses
    const coursesWithEnrollment: CourseWithEnrollment[] = courses.map((course) => {
      const courseObj = course.toObject() as CourseWithEnrollment;
      const enrollment = userEnrollments.find((e) => e.courseId.toString() === (course._id as any).toString());

      courseObj.userEnrollment = enrollment
        ? {
            enrolled: true,
            progress: enrollment.overallProgress,
            status: enrollment.status,
          }
        : {
            enrolled: false,
            progress: 0,
            status: "not_enrolled",
          };

      return courseObj;
    });

    res.json({
      success: true,
      data: {
        courses: coursesWithEnrollment,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
});

// @route   GET /api/courses/categories
// @desc    Get all course categories with counts
// @access  Public
router.get("/categories", async (req: Request, res: Response) => {
  try {
    const categories = await Course.aggregate([
      { $match: { status: { $in: ["published", "coming_soon"] }, isPublic: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          subcategories: { $addToSet: "$subcategory" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Add "All Courses" category
    const totalCourses = await Course.countDocuments({
      status: { $in: ["published", "coming_soon"] },
      isPublic: true,
    });

    const categoriesWithAll = [{ _id: "All Courses", count: totalCourses, subcategories: [] }, ...categories];

    res.json({
      success: true,
      data: { categories: categoriesWithAll },
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
});

// @route   GET /api/courses/:slug
// @desc    Get single course by slug
// @access  Public
router.get("/:slug", optionalAuth, async (req: Request, res: Response) => {
  try {
    const course = await Course.findOne({
      slug: req.params.slug,
      status: { $in: ["published", "coming_soon"] },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Increment view count
    course.stats.views += 1;
    await course.save();

    // If user is authenticated, get their progress
    let userProgress = null;
    if (req.user) {
      userProgress = await UserProgress.findOne({
        userId: (req.user as IUser)._id,
        courseId: course._id,
      });
    }

    const courseObj = course.toObject() as CourseWithEnrollment;
    courseObj.userEnrollment = userProgress
      ? {
          enrolled: true,
          progress: userProgress.overallProgress,
          status: userProgress.status,
          lastAccessedAt: userProgress.lastAccessedAt,
        }
      : {
          enrolled: false,
          progress: 0,
          status: "not_enrolled",
        };

    res.json({
      success: true,
      data: {
        course: courseObj,
        userProgress,
      },
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course",
    });
  }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in a course
// @access  Private
router.post("/:id/enroll", authenticateToken, async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    const userId = (req.user as IUser)._id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if course is published
    if (course.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Course is not available for enrollment",
      });
    }

    // Check if user is already enrolled
    const existingEnrollment = await UserProgress.findOne({
      userId,
      courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course",
      });
    }

    // Create enrollment
    const userProgress = new UserProgress({
      userId,
      courseId,
      enrolledAt: new Date(),
      lastAccessedAt: new Date(),
    });

    await userProgress.save();

    // Update course enrollment count
    course.stats.enrollments += 1;
    await course.save();

    // Update user enrollments
    const user = await User.findById(userId);
    if (user) {
      user.enrollments.push({
        courseId: course._id as any,
        enrolledAt: new Date(),
        progress: 0,
        certificateIssued: false,
      });
      user.stats.coursesEnrolled += 1;
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: "Successfully enrolled in course",
      data: {
        enrollment: userProgress,
      },
    });
  } catch (error) {
    console.error("Enrollment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to enroll in course",
    });
  }
});

// @route   GET /api/courses/:id/progress
// @desc    Get user's progress in a course
// @access  Private
router.get("/:id/progress", authenticateToken, async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    const userId = (req.user as IUser)._id;

    const userProgress = await UserProgress.findOne({
      userId,
      courseId,
    }).populate("courseId");

    if (!userProgress) {
      return res.status(404).json({
        success: false,
        message: "No progress found for this course",
      });
    }

    res.json({
      success: true,
      data: {
        progress: userProgress,
      },
    });
  } catch (error) {
    console.error("Get progress error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch progress",
    });
  }
});

// @route   PUT /api/courses/:id/progress
// @desc    Update user's progress in a course
// @access  Private
router.put("/:id/progress", authenticateToken, async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    const userId = (req.user as IUser)._id;
    const { conceptId, topicId, timeSpent, status } = req.body;

    let userProgress = await UserProgress.findOne({
      userId,
      courseId,
    });

    if (!userProgress) {
      return res.status(404).json({
        success: false,
        message: "No progress found for this course",
      });
    }

    // Update concept progress if conceptId is provided
    if (conceptId) {
      let concept = userProgress.concepts.find(
        (c) => c.conceptId.toString() === conceptId
      );

      if (!concept) {
        concept = {
          conceptId,
          status: "not-started",
          progress: 0,
          timeSpent: 0,
          lastAccessedAt: new Date(),
          topics: [],
          assessments: [],
        };
        userProgress.concepts.push(concept);
      }

      // Update topic progress if topicId is provided
      if (topicId) {
        let topic = concept.topics.find(
          (t) => t.topicId.toString() === topicId
        );

        if (!topic) {
          topic = {
            topicId,
            status: "not-started",
            timeSpent: 0,
            attempts: 0,
            lastAccessedAt: new Date(),
            activityData: {},
          };
          concept.topics.push(topic);
        }

        if (status) topic.status = status;
        if (timeSpent) topic.timeSpent += timeSpent;
        topic.lastAccessedAt = new Date();
      }

      // Update concept progress
      userProgress.updateConceptProgress(conceptId);
    }

    // Update overall time spent
    if (timeSpent) {
      userProgress.addTimeSpent(timeSpent, conceptId, topicId);
    }

    // Update streak
    userProgress.updateStreak();

    await userProgress.save();

    res.json({
      success: true,
      message: "Progress updated successfully",
      data: {
        progress: userProgress,
      },
    });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
    });
  }
});

// @route   POST /api/courses/:id/review
// @desc    Add a review to a course
// @access  Private
router.post("/:id/review", authenticateToken, async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    const userId = (req.user as IUser)._id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Add review
    await course.addReview(userId as Types.ObjectId, rating, comment);

    res.json({
      success: true,
      message: "Review added successfully",
      data: {
        course,
      },
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add review",
    });
  }
});

export default router; 