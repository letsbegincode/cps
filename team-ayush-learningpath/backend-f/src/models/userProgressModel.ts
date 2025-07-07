import mongoose, { Schema, Document, Types } from 'mongoose';

// User Progress Schema for tracking overall course progress
const UserProgressSchema = new Schema({
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
  
  // Overall Progress
  overallProgress: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 100 
  },
  
  // Status
  status: {
    type: String,
    enum: ['not_enrolled', 'enrolled', 'in_progress', 'completed', 'dropped'], 
    default: 'not_enrolled' 
  },
  
  // Enrollment Details
  enrolledAt: { type: Date },
  startedAt: { type: Date },
  completedAt: { type: Date },
  lastAccessedAt: { type: Date, default: Date.now },
  
  // Progress Tracking
  conceptsCompleted: { type: Number, default: 0 },
  totalConcepts: { type: Number, default: 0 },
  
  // Time Tracking
  totalTimeSpent: { 
    type: Number, 
    default: 0 
  }, // Total time spent in minutes
  
  // Quiz Performance
  quizPerformance: {
    totalQuizzes: { type: Number, default: 0 },
    quizzesPassed: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 }
  },
  
  // Content Progress
  contentProgress: {
    videosWatched: { type: Number, default: 0 },
    articlesRead: { type: Number, default: 0 },
    problemsSolved: { type: Number, default: 0 }
  },
  
  // Certificates and Achievements
  certificates: [{
    certificateId: Schema.Types.ObjectId,
    issuedAt: { type: Date, default: Date.now },
    score: Number,
    validUntil: Date
  }],
  
  achievements: [{
    achievementId: Schema.Types.ObjectId,
    earnedAt: { type: Date, default: Date.now },
    description: String
  }],
  
  // Notes and Bookmarks
  courseNotes: [{
    content: String,
    timestamp: { type: Date, default: Date.now },
    conceptId: Schema.Types.ObjectId
  }],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes for performance
UserProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
UserProgressSchema.index({ userId: 1, status: 1 });
UserProgressSchema.index({ courseId: 1, status: 1 });
UserProgressSchema.index({ userId: 1, lastAccessedAt: -1 });

// Virtual for completion status
UserProgressSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

// Method to calculate overall progress
UserProgressSchema.methods.calculateOverallProgress = function() {
  if (this.totalConcepts === 0) {
    this.overallProgress = 0;
  } else {
    this.overallProgress = Math.round((this.conceptsCompleted / this.totalConcepts) * 100);
  }

  // Update status based on progress
  if (this.overallProgress >= 100) {
    this.status = 'completed';
      this.completedAt = new Date();
  } else if (this.overallProgress > 0) {
    this.status = 'in_progress';
  }
};

// Method to update progress from concept completions
UserProgressSchema.methods.updateFromConcepts = function(completedConcepts: number, totalConcepts: number) {
  this.conceptsCompleted = completedConcepts;
  this.totalConcepts = totalConcepts;
  this.calculateOverallProgress();
  this.lastAccessedAt = new Date();
};

// Method to enroll user in course
UserProgressSchema.methods.enroll = function() {
  this.status = 'enrolled';
  this.enrolledAt = new Date();
  this.lastAccessedAt = new Date();
};

// Method to start course
UserProgressSchema.methods.start = function() {
  this.status = 'in_progress';
  this.startedAt = new Date();
  this.lastAccessedAt = new Date();
};

// Method to complete course
UserProgressSchema.methods.complete = function() {
  this.status = 'completed';
  this.overallProgress = 100;
  this.completedAt = new Date();
  this.lastAccessedAt = new Date();
};

// Pre-save middleware to update timestamps
UserProgressSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const UserProgress = mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);

export interface IUserProgress extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  overallProgress: number;
  status: 'not_enrolled' | 'enrolled' | 'in_progress' | 'completed' | 'dropped';
  enrolledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  conceptsCompleted: number;
  totalConcepts: number;
  totalTimeSpent: number;
  quizPerformance: {
    totalQuizzes: number;
    quizzesPassed: number;
    averageScore: number;
    bestScore: number;
  };
  contentProgress: {
    videosWatched: number;
    articlesRead: number;
    problemsSolved: number;
  };
  certificates: Array<{
    certificateId: Types.ObjectId;
    issuedAt: Date;
    score: number;
    validUntil?: Date;
  }>;
  achievements: Array<{
    achievementId: Types.ObjectId;
    earnedAt: Date;
    description: string;
  }>;
  courseNotes: Array<{
    content: string;
    timestamp: Date;
    conceptId: Types.ObjectId;
  }>;
  createdAt: Date;
  updatedAt: Date;
  isCompleted: boolean;
  calculateOverallProgress(): void;
  updateFromConcepts(completedConcepts: number, totalConcepts: number): void;
  enroll(): void;
  start(): void;
  complete(): void;
}

export default UserProgress; 