import { Schema, model, Document, Types } from 'mongoose';

// Interfaces for UserProgress model
export interface IQuizAttempt {
  attemptNumber: number;
  answers: number[];
  score: number;
  timeSpent: number;
  completedAt: Date;
}

export interface ICodeSubmission {
  code: string;
  language: string;
  testsPassed: number;
  totalTests: number;
  submittedAt: Date;
  feedback?: string;
}

export interface INote {
  content: string;
  position: string;
  createdAt: Date;
}

export interface IActivityData {
  watchTime?: number;
  totalDuration?: number;
  watchPercentage?: number;
  quizAttempts?: IQuizAttempt[];
  codeSubmissions?: ICodeSubmission[];
  readingProgress?: number;
  bookmarks?: string[];
  notes?: INote[];
}

export interface ITopicProgress {
  topicId: Types.ObjectId;
  status: 'not-started' | 'in-progress' | 'completed' | 'skipped';
  timeSpent: number;
  attempts: number;
  score?: number;
  maxScore?: number;
  completedAt?: Date;
  lastAccessedAt: Date;
  activityData: IActivityData;
}

export interface IConceptAssessment {
  assessmentId?: Types.ObjectId;
  score?: number;
  maxScore?: number;
  attempts: number;
  bestScore?: number;
  completedAt?: Date;
}

export interface IConceptProgress {
  conceptId: Types.ObjectId;
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
  timeSpent: number;
  startedAt?: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  topics: ITopicProgress[];
  assessments: IConceptAssessment[];
}

export interface IFinalAssessment {
  score?: number;
  maxScore?: number;
  attempts: number;
  bestScore?: number;
  passed: boolean;
  completedAt?: Date;
}

export interface ICertificate {
  issued: boolean;
  issuedAt?: Date;
  certificateId?: string;
  downloadUrl?: string;
}

export interface IProgressPreferences {
  playbackSpeed: number;
  autoplay: boolean;
  subtitles: boolean;
  notifications: boolean;
}

export interface IStreakData {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate?: Date;
  studyDays: Date[];
}

export interface IPerformance {
  averageScore: number;
  conceptsMastered: number;
  totalQuizzesTaken: number;
  totalProblemsAttempted: number;
  totalProblemsSolved: number;
}

export interface IUserProgress extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  overallProgress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  totalTimeSpent: number;
  estimatedTimeRemaining?: number;
  averageSessionTime: number;
  totalSessions: number;
  enrolledAt: Date;
  startedAt?: Date;
  lastAccessedAt: Date;
  completedAt?: Date;
  concepts: IConceptProgress[];
  finalAssessment: IFinalAssessment;
  certificate: ICertificate;
  preferences: IProgressPreferences;
  streakData: IStreakData;
  performance: IPerformance;
  
  // Virtuals
  completionPercentage?: number;
  
  // Methods
  updateOverallProgress(): void;
  updateConceptProgress(conceptId: Types.ObjectId): void;
  addTimeSpent(minutes: number, conceptId?: Types.ObjectId, topicId?: Types.ObjectId): void;
  updateStreak(): void;
}

const topicProgressSchema = new Schema<ITopicProgress>({
  topicId: { type: Schema.Types.ObjectId, required: true },
  status: {
    type: String,
    enum: ["not-started", "in-progress", "completed", "skipped"],
    default: "not-started",
  },
  timeSpent: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  score: { type: Number },
  maxScore: { type: Number },
  completedAt: { type: Date },
  lastAccessedAt: { type: Date, default: Date.now },
  activityData: {
    watchTime: { type: Number, default: 0 },
    totalDuration: { type: Number },
    watchPercentage: { type: Number, default: 0 },
    quizAttempts: [
      {
        attemptNumber: Number,
        answers: [Number],
        score: Number,
        timeSpent: Number,
        completedAt: { type: Date, default: Date.now },
      },
    ],
    codeSubmissions: [
      {
        code: String,
        language: String,
        testsPassed: Number,
        totalTests: Number,
        submittedAt: { type: Date, default: Date.now },
        feedback: String,
      },
    ],
    readingProgress: { type: Number, default: 0 },
    bookmarks: [String],
    notes: [
      {
        content: String,
        position: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
});

const conceptProgressSchema = new Schema<IConceptProgress>({
  conceptId: { type: Schema.Types.ObjectId, required: true },
  status: {
    type: String,
    enum: ["not-started", "in-progress", "completed"],
    default: "not-started",
  },
  progress: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 },
  startedAt: { type: Date },
  completedAt: { type: Date },
  lastAccessedAt: { type: Date, default: Date.now },
  topics: [topicProgressSchema],
  assessments: [
    {
      assessmentId: { type: Schema.Types.ObjectId },
      score: Number,
      maxScore: Number,
      attempts: { type: Number, default: 0 },
      bestScore: Number,
      completedAt: Date,
    },
  ],
});

const userProgressSchema = new Schema<IUserProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    overallProgress: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed", "paused"],
      default: "not-started",
    },
    totalTimeSpent: { type: Number, default: 0 },
    estimatedTimeRemaining: { type: Number },
    averageSessionTime: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    enrolledAt: { type: Date, default: Date.now },
    startedAt: { type: Date },
    lastAccessedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    concepts: [conceptProgressSchema],
    finalAssessment: {
      score: Number,
      maxScore: Number,
      attempts: { type: Number, default: 0 },
      bestScore: Number,
      passed: { type: Boolean, default: false },
      completedAt: Date,
    },
    certificate: {
      issued: { type: Boolean, default: false },
      issuedAt: Date,
      certificateId: String,
      downloadUrl: String,
    },
    preferences: {
      playbackSpeed: { type: Number, default: 1.0 },
      autoplay: { type: Boolean, default: true },
      subtitles: { type: Boolean, default: false },
      notifications: { type: Boolean, default: true },
    },
    streakData: {
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastStudyDate: Date,
      studyDays: [Date],
    },
    performance: {
      averageScore: { type: Number, default: 0 },
      conceptsMastered: { type: Number, default: 0 },
      totalQuizzesTaken: { type: Number, default: 0 },
      totalProblemsAttempted: { type: Number, default: 0 },
      totalProblemsSolved: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound indexes
userProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
userProgressSchema.index({ userId: 1, status: 1 });
userProgressSchema.index({ courseId: 1, status: 1 });
userProgressSchema.index({ lastAccessedAt: -1 });

// Virtual for completion percentage
userProgressSchema.virtual("completionPercentage").get(function (this: IUserProgress) {
  return this.overallProgress;
});

// Method to update overall progress
userProgressSchema.methods.updateOverallProgress = function (this: IUserProgress): void {
  if (this.concepts.length === 0) {
    this.overallProgress = 0;
    return;
  }

  const totalProgress = this.concepts.reduce((sum, concept) => sum + concept.progress, 0);
  this.overallProgress = Math.round(totalProgress / this.concepts.length);

  // Update status based on progress
  if (this.overallProgress === 0) {
    this.status = "not-started";
  } else if (this.overallProgress === 100) {
    this.status = "completed";
    if (!this.completedAt) {
      this.completedAt = new Date();
    }
  } else {
    this.status = "in-progress";
    if (!this.startedAt) {
      this.startedAt = new Date();
    }
  }
};

// Method to update concept progress
userProgressSchema.methods.updateConceptProgress = function (this: IUserProgress, conceptId: Types.ObjectId): void {
  const concept = this.concepts.find((c) => c.conceptId.toString() === conceptId.toString());
  if (!concept) return;

  const completedTopics = concept.topics.filter((t) => t.status === "completed").length;
  const totalTopics = concept.topics.length;

  if (totalTopics > 0) {
    concept.progress = Math.round((completedTopics / totalTopics) * 100);

    if (concept.progress === 100) {
      concept.status = "completed";
      if (!concept.completedAt) {
        concept.completedAt = new Date();
      }
    } else if (concept.progress > 0) {
      concept.status = "in-progress";
      if (!concept.startedAt) {
        concept.startedAt = new Date();
      }
    }
  }

  this.updateOverallProgress();
};

// Method to add time spent
userProgressSchema.methods.addTimeSpent = function (this: IUserProgress, minutes: number, conceptId?: Types.ObjectId, topicId?: Types.ObjectId): void {
  this.totalTimeSpent += minutes;
  this.lastAccessedAt = new Date();

  if (conceptId) {
    const concept = this.concepts.find((c) => c.conceptId.toString() === conceptId.toString());
    if (concept) {
      concept.timeSpent += minutes;
      concept.lastAccessedAt = new Date();

      if (topicId) {
        const topic = concept.topics.find((t) => t.topicId.toString() === topicId.toString());
        if (topic) {
          topic.timeSpent += minutes;
          topic.lastAccessedAt = new Date();
        }
      }
    }
  }

  // Update session tracking
  this.totalSessions += 1;
  this.averageSessionTime = this.totalTimeSpent / this.totalSessions;
};

// Method to update streak
userProgressSchema.methods.updateStreak = function (this: IUserProgress): void {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastStudyDate = this.streakData.lastStudyDate;
  if (lastStudyDate) {
    const lastStudy = new Date(lastStudyDate);
    lastStudy.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      // Consecutive day
      this.streakData.currentStreak += 1;
    } else if (daysDiff > 1) {
      // Streak broken
      this.streakData.currentStreak = 1;
    }
    // If daysDiff === 0, same day, don't change streak
  } else {
    // First study session
    this.streakData.currentStreak = 1;
  }

  // Update longest streak
  if (this.streakData.currentStreak > this.streakData.longestStreak) {
    this.streakData.longestStreak = this.streakData.currentStreak;
  }

  this.streakData.lastStudyDate = today;
  if (!this.streakData.studyDays.some(date => date.getTime() === today.getTime())) {
    this.streakData.studyDays.push(today);
  }
};

export default model<IUserProgress>("UserProgress", userProgressSchema); 