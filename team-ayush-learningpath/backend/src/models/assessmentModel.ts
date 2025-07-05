import { Schema, model, Document, Types } from 'mongoose';

// Interfaces for Assessment model
export interface IQuestion {
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'coding' | 'essay';
  question: string;
  options?: string[];
  correctAnswer: any;
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
  codingProblem?: {
    starterCode?: string;
    solution?: string;
    testCases?: {
      input: string;
      expectedOutput: string;
      isHidden: boolean;
    }[];
    constraints?: string;
    timeLimit: number;
    memoryLimit: number;
  };
}

export interface IAssessmentContext {
  type: 'course' | 'concept' | 'learning-path' | 'standalone';
  contextId?: Types.ObjectId;
  contextTitle?: string;
}

export interface IAssessmentSettings {
  timeLimit?: number;
  attemptsAllowed: number;
  passingScore: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showResults: boolean;
  showCorrectAnswers: boolean;
  allowReview: boolean;
  requireProctoring: boolean;
}

export interface IAssessmentAvailability {
  startDate?: Date;
  endDate?: Date;
  isPublic: boolean;
  requiresEnrollment: boolean;
}

export interface IAssessmentStats {
  totalAttempts: number;
  totalCompletions: number;
  averageScore: number;
  averageTime: number;
  passRate: number;
  difficultyRating: number;
}

export interface IAssessmentCreator {
  creatorId?: Types.ObjectId;
  name?: string;
  role: 'instructor' | 'admin' | 'system';
}

export interface IAssessmentFeedback {
  userId: Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface IAssessment extends Document {
  title: string;
  slug: string;
  description: string;
  type: 'quiz' | 'test' | 'exam' | 'practice' | 'certification';
  context: IAssessmentContext;
  questions: IQuestion[];
  totalQuestions: number;
  totalPoints: number;
  settings: IAssessmentSettings;
  availability: IAssessmentAvailability;
  level: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  tags: string[];
  stats: IAssessmentStats;
  creator: IAssessmentCreator;
  status: 'draft' | 'published' | 'archived';
  feedback: IAssessmentFeedback[];
  
  // Methods
  updateStats(score: number, timeSpent: number, passed: boolean): Promise<IAssessment>;
}

const questionSchema = new Schema<IQuestion>({
  type: {
    type: String,
    enum: ["multiple-choice", "true-false", "fill-blank", "coding", "essay"],
    required: true,
  },
  question: { type: String, required: true },
  options: [String],
  correctAnswer: Schema.Types.Mixed,
  explanation: String,
  points: { type: Number, default: 1 },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  tags: [String],
  codingProblem: {
    starterCode: String,
    solution: String,
    testCases: [
      {
        input: String,
        expectedOutput: String,
        isHidden: { type: Boolean, default: false },
      },
    ],
    constraints: String,
    timeLimit: { type: Number, default: 1000 },
    memoryLimit: { type: Number, default: 256 },
  },
});

const assessmentSchema = new Schema<IAssessment>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["quiz", "test", "exam", "practice", "certification"],
      required: true,
    },
    context: {
      type: { type: String, enum: ["course", "concept", "learning-path", "standalone"], required: true },
      contextId: { type: Schema.Types.ObjectId },
      contextTitle: String,
    },
    questions: [questionSchema],
    totalQuestions: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    settings: {
      timeLimit: { type: Number },
      attemptsAllowed: { type: Number, default: 3 },
      passingScore: { type: Number, default: 70 },
      randomizeQuestions: { type: Boolean, default: false },
      randomizeOptions: { type: Boolean, default: false },
      showResults: { type: Boolean, default: true },
      showCorrectAnswers: { type: Boolean, default: true },
      allowReview: { type: Boolean, default: true },
      requireProctoring: { type: Boolean, default: false },
    },
    availability: {
      startDate: Date,
      endDate: Date,
      isPublic: { type: Boolean, default: true },
      requiresEnrollment: { type: Boolean, default: false },
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    category: String,
    tags: [String],
    stats: {
      totalAttempts: { type: Number, default: 0 },
      totalCompletions: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 },
      passRate: { type: Number, default: 0 },
      difficultyRating: { type: Number, default: 0 },
    },
    creator: {
      creatorId: { type: Schema.Types.ObjectId, ref: "User" },
      name: String,
      role: { type: String, enum: ["instructor", "admin", "system"], default: "instructor" },
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    feedback: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
assessmentSchema.index({ slug: 1 }, { unique: true });
assessmentSchema.index({ type: 1, status: 1 });
assessmentSchema.index({ "context.type": 1, "context.contextId": 1 });
assessmentSchema.index({ category: 1, level: 1 });
assessmentSchema.index({ createdAt: -1 });
assessmentSchema.index({ title: "text", description: "text" });

// Pre-save middleware
assessmentSchema.pre<IAssessment>("save", function (this: IAssessment, next: () => void) {
  this.totalQuestions = this.questions.length;
  this.totalPoints = this.questions.reduce((sum, q) => sum + q.points, 0);
  next();
});

// Method to calculate statistics
assessmentSchema.methods.updateStats = function (this: IAssessment, score: number, timeSpent: number, passed: boolean): Promise<IAssessment> {
  this.stats.totalAttempts += 1;
  if (passed) {
    this.stats.totalCompletions += 1;
  }

  // Update average score
  const totalScore = this.stats.averageScore * (this.stats.totalAttempts - 1) + score;
  this.stats.averageScore = totalScore / this.stats.totalAttempts;

  // Update average time
  const totalTime = this.stats.averageTime * (this.stats.totalAttempts - 1) + timeSpent;
  this.stats.averageTime = totalTime / this.stats.totalAttempts;

  // Update pass rate
  this.stats.passRate = (this.stats.totalCompletions / this.stats.totalAttempts) * 100;

  return this.save();
};

export default model<IAssessment>("Assessment", assessmentSchema); 