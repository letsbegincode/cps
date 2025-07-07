import mongoose, { Schema, Document, Types } from 'mongoose';

// User Node Progress Schema for tracking individual concept progress
const UserNodeProgressSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  courseId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  conceptId: { 
    type: Schema.Types.ObjectId, 
    required: true 
  },
  
  // Progress Status
  status: { 
    type: String, 
    enum: ['not_started', 'in_progress', 'completed', 'skipped'], 
    default: 'not_started' 
  },
  progress: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 100 
  },
  
  // Content Progress
  contentProgress: {
    videosWatched: [{
      videoId: Schema.Types.ObjectId,
      watchedAt: { type: Date, default: Date.now },
      watchTime: { type: Number, default: 0 }, // in seconds
      completed: { type: Boolean, default: false }
    }],
    articlesRead: [{
      articleId: Schema.Types.ObjectId,
      readAt: { type: Date, default: Date.now },
      readTime: { type: Number, default: 0 }, // in seconds
      completed: { type: Boolean, default: false }
    }],
    problemsAttempted: [{
      problemId: Schema.Types.ObjectId,
      attemptedAt: { type: Date, default: Date.now },
      submittedCode: String,
      language: String,
      testCasesPassed: { type: Number, default: 0 },
      totalTestCases: { type: Number, default: 0 },
      score: { type: Number, default: 0 },
      completed: { type: Boolean, default: false }
    }]
  },
  
  // Quiz Progress
  quizProgress: {
    attempts: [{
      attemptNumber: { type: Number, required: true },
      answers: [{
        questionId: Schema.Types.ObjectId,
        selectedAnswers: [Schema.Types.Mixed], // Can be numbers or strings
        isCorrect: Boolean,
        points: Number
      }],
      score: { type: Number, min: 0, max: 100 },
      timeSpent: { type: Number, default: 0 }, // in seconds
      completedAt: { type: Date, default: Date.now },
      passed: { type: Boolean, default: false }
    }],
    bestScore: { type: Number, min: 0, max: 100 },
    totalAttempts: { type: Number, default: 0 },
    passed: { type: Boolean, default: false }
  },
  
  // Prerequisites
  prerequisites: {
    required: [Schema.Types.ObjectId], // List of required concept IDs
    met: { type: Boolean, default: false },
    testPassed: { type: Boolean, default: false },
    testScore: { type: Number, min: 0, max: 100 },
    contentCompleted: { type: Boolean, default: false },
    bypassed: { type: Boolean, default: false }
  },
  
  // Time Tracking
  timeSpent: { 
    type: Number, 
    default: 0 
  }, // Total time spent in minutes
  startedAt: { type: Date },
  completedAt: { type: Date },
  lastAccessedAt: { type: Date, default: Date.now },
  
  // Notes and Bookmarks
  notes: [{
    content: String,
    timestamp: { type: Date, default: Date.now },
    position: String // e.g., "video:1:30", "article:paragraph:3"
  }],
  bookmarks: [{
    type: String, // "video", "article", "problem"
    itemId: Schema.Types.ObjectId,
    position: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Completion Criteria
  completionCriteria: {
    videosRequired: { type: Boolean, default: true },
    articlesRequired: { type: Boolean, default: true },
    problemsRequired: { type: Boolean, default: false },
    quizRequired: { type: Boolean, default: true },
    minQuizScore: { type: Number, default: 75 }
  },
  
  // Metadata
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'], 
    required: true 
  },
  estimatedTime: { type: String, required: true }, // e.g., "1h 30m"
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes for performance
UserNodeProgressSchema.index({ userId: 1, courseId: 1, conceptId: 1 }, { unique: true });
UserNodeProgressSchema.index({ userId: 1, status: 1 });
UserNodeProgressSchema.index({ courseId: 1, status: 1 });
UserNodeProgressSchema.index({ userId: 1, lastAccessedAt: -1 });

// Virtual for completion status
UserNodeProgressSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

// Method to calculate progress
UserNodeProgressSchema.methods.calculateProgress = function() {
  let totalItems = 0;
  let completedItems = 0;
  
  // Count videos
  if (this.completionCriteria.videosRequired) {
    totalItems += this.contentProgress.videosWatched.length;
    completedItems += this.contentProgress.videosWatched.filter(v => v.completed).length;
  }
  
  // Count articles
  if (this.completionCriteria.articlesRequired) {
    totalItems += this.contentProgress.articlesRead.length;
    completedItems += this.contentProgress.articlesRead.filter(a => a.completed).length;
  }
  
  // Count problems
  if (this.completionCriteria.problemsRequired) {
    totalItems += this.contentProgress.problemsAttempted.length;
    completedItems += this.contentProgress.problemsAttempted.filter(p => p.completed).length;
  }
  
  // Count quiz
  if (this.completionCriteria.quizRequired) {
    totalItems += 1;
    if (this.quizProgress.passed) completedItems += 1;
  }
  
  this.progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
  // Update status
  if (this.progress >= 100) {
    this.status = 'completed';
    this.completedAt = new Date();
  } else if (this.progress > 0) {
    this.status = 'in_progress';
  }
};

// Method to mark video as watched
UserNodeProgressSchema.methods.markVideoWatched = function(videoId: Types.ObjectId, watchTime: number) {
  const existingVideo = this.contentProgress.videosWatched.find(v => v.videoId.equals(videoId));
  
  if (existingVideo) {
    existingVideo.watchTime = watchTime;
    existingVideo.completed = true;
    existingVideo.watchedAt = new Date();
  } else {
    this.contentProgress.videosWatched.push({
      videoId,
      watchTime,
      completed: true,
      watchedAt: new Date()
    });
  }
  
  this.calculateProgress();
};

// Method to mark article as read
UserNodeProgressSchema.methods.markArticleRead = function(articleId: Types.ObjectId, readTime: number) {
  const existingArticle = this.contentProgress.articlesRead.find(a => a.articleId.equals(articleId));
  
  if (existingArticle) {
    existingArticle.readTime = readTime;
    existingArticle.completed = true;
    existingArticle.readAt = new Date();
  } else {
    this.contentProgress.articlesRead.push({
      articleId,
      readTime,
      completed: true,
      readAt: new Date()
    });
  }
  
  this.calculateProgress();
};

// Method to submit quiz attempt
UserNodeProgressSchema.methods.submitQuizAttempt = function(answers: any[], timeSpent: number) {
  const attemptNumber = this.quizProgress.totalAttempts + 1;
  let totalPoints = 0;
  let earnedPoints = 0;
  
  const attempt = {
    attemptNumber,
    answers: answers.map(answer => {
      totalPoints += answer.points;
      if (answer.isCorrect) earnedPoints += answer.points;
      return answer;
    }),
    score: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0,
    timeSpent,
    completedAt: new Date(),
    passed: false
  };
  
  // Check if passed
  if (attempt.score >= this.completionCriteria.minQuizScore) {
    attempt.passed = true;
    this.quizProgress.passed = true;
  }
  
  this.quizProgress.attempts.push(attempt);
  this.quizProgress.totalAttempts = attemptNumber;
  
  // Update best score
  if (attempt.score > this.quizProgress.bestScore) {
    this.quizProgress.bestScore = attempt.score;
  }
  
  this.calculateProgress();
};

// Pre-save middleware
UserNodeProgressSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.lastAccessedAt = new Date();
  
  if (this.status === 'in_progress' && !this.startedAt) {
    this.startedAt = new Date();
  }
  
  next();
});

export interface IUserNodeProgress extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  conceptId: Types.ObjectId;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  progress: number;
  contentProgress: {
    videosWatched: Array<{
      videoId: Types.ObjectId;
      watchedAt: Date;
      watchTime: number;
      completed: boolean;
    }>;
    articlesRead: Array<{
      articleId: Types.ObjectId;
      readAt: Date;
      readTime: number;
      completed: boolean;
    }>;
    problemsAttempted: Array<{
      problemId: Types.ObjectId;
      attemptedAt: Date;
      submittedCode: string;
      language: string;
      testCasesPassed: number;
      totalTestCases: number;
      score: number;
      completed: boolean;
    }>;
  };
  quizProgress: {
    attempts: Array<{
      attemptNumber: number;
      answers: Array<{
        questionId: Types.ObjectId;
        selectedAnswers: any[];
        isCorrect: boolean;
        points: number;
      }>;
      score: number;
      timeSpent: number;
      completedAt: Date;
      passed: boolean;
    }>;
    bestScore: number;
    totalAttempts: number;
    passed: boolean;
  };
  prerequisites: {
    required: Types.ObjectId[];
    met: boolean;
    testPassed: boolean;
    testScore: number;
    contentCompleted: boolean;
    bypassed: boolean;
  };
  timeSpent: number;
  startedAt?: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  notes: Array<{
    content: string;
    timestamp: Date;
    position: string;
  }>;
  bookmarks: Array<{
    type: string;
    itemId: Types.ObjectId;
    position: string;
    createdAt: Date;
  }>;
  completionCriteria: {
    videosRequired: boolean;
    articlesRequired: boolean;
    problemsRequired: boolean;
    quizRequired: boolean;
    minQuizScore: number;
  };
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  createdAt: Date;
  updatedAt: Date;
  calculateProgress(): void;
  markVideoWatched(videoId: Types.ObjectId, watchTime: number): void;
  markArticleRead(articleId: Types.ObjectId, readTime: number): void;
  submitQuizAttempt(answers: any[], timeSpent: number): void;
}

const UserNodeProgress = mongoose.model<IUserNodeProgress>('UserNodeProgress', UserNodeProgressSchema);

export default UserNodeProgress; 