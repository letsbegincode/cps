import { Schema, model, Document, Types } from 'mongoose';

// Interfaces for LearningPath model
export interface IPathCourse {
  courseId: Types.ObjectId;
  order: number;
  isRequired: boolean;
  prerequisites: Types.ObjectId[];
  estimatedDuration?: number;
  description?: string;
}

export interface IPathCreator {
  type: 'system' | 'instructor' | 'ai';
  creatorId?: Types.ObjectId;
  name?: string;
  bio?: string;
  avatar?: string;
}

export interface IPathStats {
  enrollments: number;
  completions: number;
  averageRating: number;
  totalRatings: number;
  averageCompletionTime: number;
  views: number;
}

export interface IPathReview {
  userId: Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  helpful: number;
}

export interface IPathPricing {
  type: 'free' | 'premium';
  amount: number;
  currency: string;
}

export interface IPathCertificate {
  enabled: boolean;
  template?: string;
  criteria: {
    completionPercentage: number;
    minimumScore: number;
  };
}

export interface ILearningPath extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  bannerImage?: string;
  category: 'programming' | 'data-science' | 'web-development' | 'mobile-development' | 'devops' | 'cybersecurity' | 'ai-ml' | 'blockchain' | 'game-development' | 'design';
  subcategory?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
  courses: IPathCourse[];
  totalDuration: number;
  totalCourses: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  creator: IPathCreator;
  status: 'draft' | 'published' | 'archived';
  isPublic: boolean;
  isFeatured: boolean;
  isAIGenerated: boolean;
  stats: IPathStats;
  learningOutcomes: string[];
  requirements: string[];
  targetAudience: string[];
  careerPaths: string[];
  skillsGained: string[];
  industryRelevance: string[];
  pricing: IPathPricing;
  reviews: IPathReview[];
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  certificate: IPathCertificate;
  
  // Virtuals
  completionRate?: number;
  
  // Methods
  calculateAverageRating(): number;
}

const learningPathSchema = new Schema<ILearningPath>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String, maxlength: 200 },
    thumbnail: { type: String },
    bannerImage: { type: String },
    category: {
      type: String,
      required: true,
      enum: [
        "programming",
        "data-science",
        "web-development",
        "mobile-development",
        "devops",
        "cybersecurity",
        "ai-ml",
        "blockchain",
        "game-development",
        "design",
      ],
    },
    subcategory: { type: String },
    level: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced", "expert"],
    },
    tags: [String],
    courses: [
      {
        courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
        order: { type: Number, required: true },
        isRequired: { type: Boolean, default: true },
        prerequisites: [{ type: Schema.Types.ObjectId, ref: "Course" }],
        estimatedDuration: { type: Number },
        description: String,
      },
    ],
    totalDuration: { type: Number, required: true },
    totalCourses: { type: Number, default: 0 },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "mixed"],
      default: "beginner",
    },
    creator: {
      type: { type: String, enum: ["system", "instructor", "ai"], default: "system" },
      creatorId: { type: Schema.Types.ObjectId, ref: "User" },
      name: String,
      bio: String,
      avatar: String,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    isPublic: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isAIGenerated: { type: Boolean, default: false },
    stats: {
      enrollments: { type: Number, default: 0 },
      completions: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalRatings: { type: Number, default: 0 },
      averageCompletionTime: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
    },
    learningOutcomes: [String],
    requirements: [String],
    targetAudience: [String],
    careerPaths: [String],
    skillsGained: [String],
    industryRelevance: [String],
    pricing: {
      type: { type: String, enum: ["free", "premium"], default: "free" },
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
    },
    reviews: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
        helpful: { type: Number, default: 0 },
      },
    ],
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    certificate: {
      enabled: { type: Boolean, default: false },
      template: String,
      criteria: {
        completionPercentage: { type: Number, default: 100 },
        minimumScore: { type: Number, default: 80 },
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
learningPathSchema.index({ slug: 1 }, { unique: true });
learningPathSchema.index({ category: 1, level: 1 });
learningPathSchema.index({ status: 1, isPublic: 1 });
learningPathSchema.index({ "stats.averageRating": -1 });
learningPathSchema.index({ "stats.enrollments": -1 });
learningPathSchema.index({ createdAt: -1 });
learningPathSchema.index({ title: "text", description: "text", tags: "text" });

// Virtual for completion rate
learningPathSchema.virtual("completionRate").get(function (this: ILearningPath) {
  if (this.stats.enrollments === 0) return 0;
  return (this.stats.completions / this.stats.enrollments) * 100;
});

// Pre-save middleware
learningPathSchema.pre<ILearningPath>("save", function (this: ILearningPath, next: () => void) {
  this.totalCourses = this.courses.length;
  next();
});

// Method to calculate average rating
learningPathSchema.methods.calculateAverageRating = function (this: ILearningPath): number {
  if (this.reviews.length === 0) return 0;

  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.stats.averageRating = totalRating / this.reviews.length;
  this.stats.totalRatings = this.reviews.length;

  return this.stats.averageRating;
};

export default model<ILearningPath>("LearningPath", learningPathSchema); 