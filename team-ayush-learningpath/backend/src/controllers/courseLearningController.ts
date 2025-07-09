import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Course from '../models/courseModel';
import Concept from '../models/conceptModel';
import UserProgress from '../models/userProgressModel';
import UserConceptProgress from '../models/userConceptProgress';
import { IUser } from '../models/userModel';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export class CourseLearningController {
  // Helper method to find course by ID or slug
  private findCourse = async (courseId: string) => {
    // Check if it's a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(courseId)) {
      return await Course.findById(courseId);
    } else {
      // Try to find by slug
      return await Course.findOne({ slug: courseId });
    }
  }

  // Helper method to get all concepts from course topics
  private getAllConceptsFromCourse = (course: any) => {
    // If new schema: flat concepts array
    if (Array.isArray(course.concepts)) {
      return course.concepts;
    }
    // If old schema: topics with concepts
    if (Array.isArray(course.topics)) {
      const allConcepts: any[] = [];
      course.topics?.forEach((topic: any) => {
        if (topic.concepts && topic.concepts.length > 0) {
          allConcepts.push(...topic.concepts);
        }
        if (topic.conceptReferences && topic.conceptReferences.length > 0) {
          topic.conceptReferences.forEach((ref: any) => {
            allConcepts.push({
              _id: ref.conceptId,
              title: ref.customTitle || 'Referenced Concept',
              description: ref.customDescription || '',
              order: ref.order,
              estimatedTime: ref.estimatedTime,
              difficulty: ref.difficulty,
              isReferenced: true
            });
          });
        }
      });
      return allConcepts;
    }
    // If neither, return empty array
    return [];
  }

  // Enroll user in a course
  enrollInCourse = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { courseId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      // Find course by ID or slug
      const course = await this.findCourse(courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      // Get total concepts count
      const allConcepts = this.getAllConceptsFromCourse(course);

      // Check if already enrolled - use the actual course ID, not the slug
      let userProgress = await UserProgress.findOne({ userId, courseId: course._id });
      if (userProgress && userProgress.status !== 'not_enrolled') {
        return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
      }

      // Create or update user progress - use the actual course ID
      if (!userProgress) {
        userProgress = new UserProgress({
          userId,
          courseId: course._id,
          totalConcepts: allConcepts.length,
          status: 'enrolled'
        });
      } else {
        userProgress.status = 'enrolled';
        userProgress.enrolledAt = new Date();
      }

      await userProgress.save();

      res.json({
        success: true,
        message: 'Successfully enrolled in course',
        data: { userProgress }
      });
    } catch (error) {
      console.error('Enroll in course error:', error);
      res.status(500).json({ success: false, message: 'Failed to enroll in course' });
    }
  }

  // Get course learning dashboard with user progress
  getCourseDashboard = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { courseId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      // Find course by ID or slug
      const course = await this.findCourse(courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      // Get user progress - use the actual course ID, not the slug
      let userProgress = await UserProgress.findOne({ userId, courseId: course._id });
      if (!userProgress) {
        const allConcepts = this.getAllConceptsFromCourse(course);
        userProgress = new UserProgress({
          userId,
          courseId: course._id,
          totalConcepts: allConcepts.length,
          status: 'not_enrolled'
        });
        await userProgress.save();
      }

      // Get concept progress for all concepts in this course - use the actual course ID
      const conceptProgresses = await UserConceptProgress.find({ 
        userId, 
        courseId: course._id 
      });

      // Get all concepts from the course (new schema)
      const allConcepts: any[] = this.getAllConceptsFromCourse(course);

      // Map concepts with progress
      const conceptsWithProgress = allConcepts.map((concept: any) => {
        const progress = conceptProgresses.find((cp: any) => 
          cp.conceptId.toString() === (concept._id?.toString?.() || concept.conceptId?.toString?.())
        );
        return {
          _id: concept._id || concept.conceptId,
          title: concept.title,
          description: concept.description,
          complexity: concept.difficulty === 'Easy' ? 1 : concept.difficulty === 'Medium' ? 3 : 5,
          estLearningTimeHours: this.parseTimeToHours(concept.estimatedTime),
          masteryScore: progress?.masteryScore || 0,
          status: progress?.status || 'not_started',
          mastered: progress?.mastered || false,
          timeSpent: progress?.timeSpent || 0,
          attempts: progress?.attempts || 0,
          isUnlocked: this.isConceptUnlocked(concept, conceptProgresses, allConcepts)
        };
      });

      // Process topics with progress
      // Remove topicsWithProgress and all references to course.topics
      // (No replacement needed, as conceptsWithProgress is already used)

      res.json({
        success: true,
        data: {
          course: {
            _id: course._id,
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail,
            level: course.level,
            estimatedDuration: course.stats?.totalDuration || 0,
            concepts: conceptsWithProgress // Always include the concepts array
          },
          userProgress: {
            status: userProgress.status,
            overallProgress: userProgress.overallProgress,
            conceptsCompleted: userProgress.conceptsCompleted,
            totalConcepts: userProgress.totalConcepts,
            totalTimeSpent: userProgress.totalTimeSpent,
            enrolledAt: userProgress.enrolledAt,
            lastAccessedAt: userProgress.lastAccessedAt
          }
        }
      });
    } catch (error) {
      console.error('Get course dashboard error:', error);
      res.status(500).json({ success: false, message: 'Failed to get course dashboard' });
    }
  }

  // Get concept learning page
  getConceptLearningPage = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { courseId, conceptId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      // Find course by ID or slug
      const course = await this.findCourse(courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      // Find concept in course concepts (not topics)
      let concept: any = null;
      let currentIndex = -1;
      const allConcepts: any[] = this.getAllConceptsFromCourse(course);
      allConcepts.forEach((c: any, idx: number) => {
        if ((c._id?.toString?.() || c.conceptId?.toString?.()) === conceptId) {
          concept = c;
          currentIndex = idx;
        }
      });

      if (!concept) {
        return res.status(404).json({ success: false, message: 'Concept not found in this course' });
      }

      // Get user progress for this concept
      let conceptProgress = await UserConceptProgress.findOne({ 
        userId, 
        conceptId, 
        courseId: course._id 
      });

      // Get next and previous concepts
      const nextConcept = currentIndex < allConcepts.length - 1 ? (allConcepts[currentIndex + 1]._id || allConcepts[currentIndex + 1].conceptId) : null;
      const prevConcept = currentIndex > 0 ? (allConcepts[currentIndex - 1]._id || allConcepts[currentIndex - 1].conceptId) : null;

      res.json({
        success: true,
        data: {
          concept: {
            _id: concept._id || concept.conceptId,
            title: concept.title,
            description: concept.description,
            contentBlocks: concept.videos || [],
            articleContent: concept.articles || [],
            quiz: concept.quiz,
            complexity: concept.difficulty === 'Easy' ? 1 : concept.difficulty === 'Medium' ? 3 : 5,
            estLearningTimeHours: this.parseTimeToHours(concept.estimatedTime),
            prerequisites: concept.prerequisites || [],
            relatedConcepts: []
          },
          progress: {
            masteryScore: conceptProgress?.masteryScore || 0,
            status: conceptProgress?.status || 'not_started',
            mastered: conceptProgress?.mastered || false,
            timeSpent: conceptProgress?.timeSpent || 0,
            attempts: conceptProgress?.attempts || 0,
            lastUpdated: conceptProgress?.lastUpdated
          },
          navigation: {
            nextConcept,
            prevConcept,
            currentIndex: currentIndex + 1,
            totalConcepts: allConcepts.length
          }
        }
      });
    } catch (error) {
      console.error('Get concept learning page error:', error);
      res.status(500).json({ success: false, message: 'Failed to get concept learning page' });
    }
  }

  // Update concept progress (video watched, article read, etc.)
  updateConceptProgress = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { conceptId } = req.params;
      const { action, courseId, timeSpent, score } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      // Find course by ID or slug to get the actual course ID
      const course = await this.findCourse(courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      // Get or create concept progress - use the actual course ID
      let conceptProgress = await UserConceptProgress.findOne({ 
        userId, 
        conceptId, 
        courseId: course._id 
      });

      if (!conceptProgress) {
        conceptProgress = new UserConceptProgress({
          userId,
          conceptId,
          courseId: course._id,
          status: 'not_started',
          masteryScore: 0,
          timeSpent: 0,
          attempts: 0,
          descriptionRead: false,
          videoWatched: false,
          quizPassed: false
        });
      }

      switch (action) {
        case 'mark_description_read':
          conceptProgress.descriptionRead = true;
          if (conceptProgress.status === 'not_started') conceptProgress.status = 'in_progress';
          conceptProgress.lastUpdated = new Date();
          break;
        case 'mark_video_watched':
          conceptProgress.videoWatched = true;
          if (timeSpent) conceptProgress.timeSpent += timeSpent;
          conceptProgress.lastUpdated = new Date();
          break;
        case 'quiz_completed':
          conceptProgress.attempts += 1;
          conceptProgress.lastQuizAttempt = new Date();
          conceptProgress.masteryScore = Math.max(conceptProgress.masteryScore, score);
          if (score >= 75) {
            conceptProgress.quizPassed = true;
            conceptProgress.failedAttempts = 0;
            conceptProgress.mastered = true;
            conceptProgress.masteredAt = new Date();
            conceptProgress.status = 'completed';
          } else {
            conceptProgress.quizPassed = false;
            conceptProgress.failedAttempts = (conceptProgress.failedAttempts || 0) + 1;
            if (conceptProgress.failedAttempts >= 3) {
              conceptProgress.descriptionRead = false;
              conceptProgress.videoWatched = false;
              conceptProgress.quizPassed = false;
              conceptProgress.status = 'in_progress';
            }
          }
          conceptProgress.lastUpdated = new Date();
          break;
        default:
          return res.status(400).json({ success: false, message: 'Invalid action' });
      }

      await conceptProgress.save();

      // Update course progress
      if (!userId || typeof conceptId !== 'string' || !conceptId.trim()) {
        return res.status(400).json({ success: false, message: 'Invalid user or concept ID' });
      }
      await this.updateCourseProgress(String(userId), conceptId);

      res.json({
        success: true,
        message: 'Progress updated successfully',
        data: { conceptProgress }
      });
    } catch (error) {
      console.error('Update concept progress error:', error);
      res.status(500).json({ success: false, message: 'Failed to update progress' });
    }
  }

  // Submit quiz results
  submitQuizResults = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { conceptId } = req.params;
      const { answers, timeSpent } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      // Get concept progress
      let conceptProgress = await UserConceptProgress.findOne({ userId, conceptId });
      if (!conceptProgress) {
        conceptProgress = new UserConceptProgress({
          userId,
          conceptId,
          status: 'not_started',
          masteryScore: 0,
          timeSpent: 0,
          attempts: 0
        });
      }

      // Calculate score based on answers (simplified)
      const totalQuestions = Object.keys(answers).length;
      let correctAnswers = 0;

      // This is a simplified scoring - in real implementation, you'd check against correct answers
      Object.values(answers).forEach((answer: any) => {
        if (answer !== undefined && answer !== null) {
          correctAnswers++;
        }
      });

      const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
      const mastered = score >= 75;

      // Update concept progress
      conceptProgress.masteryScore = Math.max(conceptProgress.masteryScore, score);
      conceptProgress.attempts += 1;
      conceptProgress.timeSpent += timeSpent || 0;
      conceptProgress.quizPassed = mastered;

      if (mastered) {
        conceptProgress.status = 'completed';
      } else if (conceptProgress.status === 'not_started') {
        conceptProgress.status = 'in_progress';
      }

      await conceptProgress.save();

      // Update overall course progress
      if (!userId || typeof conceptId !== 'string' || !conceptId.trim()) {
        return res.status(400).json({ success: false, message: 'Invalid user or concept ID' });
      }
      await this.updateCourseProgress(String(userId), conceptId);

      res.json({
        success: true,
        data: {
          score,
          mastered,
          conceptProgress
        }
      });
    } catch (error) {
      console.error('Submit quiz results error:', error);
      res.status(500).json({ success: false, message: 'Failed to submit quiz results' });
    }
  }

  // Get course learning data for sequential learning
  getCourseLearning = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { courseId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      // Find course by ID or slug
      const course = await this.findCourse(courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      // Check if user is enrolled - use the actual course ID, not the slug
      let userProgress = await UserProgress.findOne({ userId, courseId: course._id });
      if (!userProgress || userProgress.status === 'not_enrolled') {
        // Auto-enroll and initialize progress
        const allConcepts = this.getAllConceptsFromCourse(course);
        userProgress = new UserProgress({
          userId,
          courseId: course._id,
          totalConcepts: allConcepts.length,
          status: 'enrolled',
          overallProgress: 0,
          conceptsCompleted: 0,
          totalTimeSpent: 0,
          enrolledAt: new Date(),
          lastAccessedAt: new Date()
        });
        await userProgress.save();
      }

      // Get all concepts from course
      const allConcepts = this.getAllConceptsFromCourse(course);

      // Get user's concept progress - use the actual course ID
      const userConceptProgress = await UserConceptProgress.find({
        userId,
        courseId: course._id
      });

      // Create a map of concept progress
      const progressMap = new Map();
      userConceptProgress.forEach(progress => {
        progressMap.set(progress.conceptId.toString(), progress);
      });

      // Build sequential concepts list with prerequisites
      const sequentialConcepts = this.buildSequentialConcepts(allConcepts, progressMap);

      // Check if all concepts are completed by the user
      const allCompleted = sequentialConcepts.length > 0 && sequentialConcepts.every(c => c.status === 'completed');

      res.json({
        success: true,
        data: {
          course: {
            _id: course._id,
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail,
            level: course.level,
            estimatedDuration: course.stats?.totalDuration || 0
            // Removed topics spread for new schema
          },
          userProgress: {
            status: userProgress.status,
            overallProgress: userProgress.overallProgress,
            conceptsCompleted: userProgress.conceptsCompleted,
            totalConcepts: sequentialConcepts.length,
            totalTimeSpent: userProgress.totalTimeSpent,
            enrolledAt: userProgress.enrolledAt,
            lastAccessedAt: userProgress.lastAccessedAt
          },
          sequentialConcepts,
          allCompleted
        }
      });
    } catch (error) {
      console.error('Get course learning error:', error);
      res.status(500).json({ success: false, message: 'Failed to get learning data' });
    }
  }

  // Helper method to build sequential concepts with prerequisites
  private buildSequentialConcepts = (allConcepts: any[], progressMap: Map<string, any>) => {
    // Sort concepts by prerequisites (topological sort)
    const sortedConcepts: any[] = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (concept: any) => {
      if (!concept || !concept._id) return; // Defensive: skip if no _id
      const conceptIdStr = concept._id.toString();
      if (visiting.has(conceptIdStr)) {
        // Circular dependency detected
        return;
      }
      if (visited.has(conceptIdStr)) {
        return;
      }
      visiting.add(conceptIdStr);
      // Visit prerequisites first
      if (concept.prerequisites && Array.isArray(concept.prerequisites)) {
        for (const prereqId of concept.prerequisites) {
          if (!prereqId) continue; // Defensive: skip if undefined
          const prereq = allConcepts.find((c: any) => c && c._id && c._id.toString() === prereqId.toString());
          if (prereq) {
            visit(prereq);
          }
        }
      }
      visiting.delete(conceptIdStr);
      visited.add(conceptIdStr);
      // Get user progress for this concept
      const userProgress = progressMap.get(conceptIdStr);
      // Determine if concept is unlocked
      let isUnlocked = true;
      if (concept.prerequisites && Array.isArray(concept.prerequisites)) {
        for (const prereqId of concept.prerequisites) {
          if (!prereqId) { isUnlocked = false; break; }
          const prereqProgress = progressMap.get(prereqId.toString());
          if (!prereqProgress || prereqProgress.status !== 'completed') {
            isUnlocked = false;
            break;
          }
        }
      }
      sortedConcepts.push({
        _id: concept._id,
        title: concept.title,
        description: concept.description,
        complexity: concept.difficulty === 'Easy' ? 1 : concept.difficulty === 'Medium' ? 3 : 5,
        estLearningTimeHours: this.parseTimeToHours(concept.estimatedTime),
        masteryScore: userProgress?.masteryScore || 0,
        status: userProgress?.status || 'not_started',
        mastered: userProgress?.mastered || false,
        timeSpent: userProgress?.timeSpent || 0,
        attempts: userProgress?.attempts || 0,
        isUnlocked,
        prerequisites: concept.prerequisites || [],
        content: {
          description: concept.description,
          videoUrl: concept.videoUrl,
          articleUrl: concept.articleUrl
        }
      });
    };
    // Visit all concepts
    for (const concept of allConcepts) {
      if (concept && concept._id && !visited.has(concept._id.toString())) {
        visit(concept);
      }
    }
    return sortedConcepts;
  }

  // Helper method to parse time string to hours
  private parseTimeToHours = (timeString: string): number => {
    const match = timeString.match(/(\d+)h\s*(\d+)?m?/);
    if (match) {
      const hours = parseInt(match[1]) || 0;
      const minutes = parseInt(match[2]) || 0;
      return hours + (minutes / 60);
    }
    return 1; // Default to 1 hour
  }

  // Helper method to check if concept is unlocked
  private isConceptUnlocked = (concept: any, conceptProgresses: any[], allConcepts: any[]): boolean => {
    // First concept is always unlocked
    if (!concept.prerequisites || concept.prerequisites.length === 0) {
      return true;
    }

    // Check if all prerequisites are completed
    return concept.prerequisites.every((prereqId: any) => {
      const prereqProgress = conceptProgresses.find((cp: any) => 
        cp.conceptId.toString() === prereqId.toString()
      );
      return prereqProgress && prereqProgress.status === 'completed';
    });
  }

  // Helper method to update course progress
  private updateCourseProgress = async (userId: string, conceptId: string) => {
    try {
      // Find course that contains this concept (new schema)
      const course = await Course.findOne({
        'concepts.conceptId': conceptId
      });
      if (!course) return;

      // Get all concept progress for this course
      const conceptProgresses = await UserConceptProgress.find({ 
        userId, 
        courseId: course._id 
      });

      // Count completed concepts in this course
      const completedConcepts = conceptProgresses.filter(cp => cp.status === 'completed').length;

      // Update course progress
      await UserProgress.findOneAndUpdate(
        { userId, courseId: course._id },
        {
          conceptsCompleted: completedConcepts,
          lastAccessedAt: new Date()
        },
        { new: true }
      );
    } catch (error) {
      console.error('Update course progress error:', error);
    }
  }
}

export default new CourseLearningController(); 