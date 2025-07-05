import { Schema, model, Document, Types } from 'mongoose';

// Interfaces for Course model
export interface ITopicContent {
  videoUrl?: string;
  duration?: string;
  thumbnail?: string;
  articleContent?: string;
  quizQuestions?: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
  codingProblem?: {
    title: string;
    description: string;
    starterCode: string;
    solution: string;
    testCases: {
      input: string;
      expectedOutput: string;
    }[];
  };
  interactiveContent?: any;
}

export interface ITopic {
  id: number;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'coding' | 'interactive';
  duration: string;
  videoUrl?: string;
  thumbnail?: string;
  content: ITopicContent;
  completed: boolean;
  order: number;
  isRequired: boolean;
  prerequisites: Types.ObjectId[];
}

export interface IConcept {
  id: number;
  title: string;
  description?: string;
  duration: string;
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  topics: ITopic[];
  prerequisites: Types.ObjectId[];
  learningObjectives: string[];
  resources: {
    title: string;
    url: string;
    type: 'article' | 'video' | 'book' | 'documentation';
  }[];
}

export interface IInstructor {
  name: string;
  bio?: string;
  avatar?: string;
  credentials?: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
}

export interface IPricing {
  type: 'free' | 'premium' | 'one-time';
  amount: number;
  currency: string;
  discountPercentage: number;
  originalPrice: number;
}

export interface ICourseStats {
  enrollments: number;
  completions: number;
  averageRating: number;
  totalRatings: number;
  totalReviews: number;
  views: number;
}

export interface IReview {
  userId: Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  isVerified: boolean;
  helpful: number;
}

export interface ICertificate {
  enabled: boolean;
  template?: string;
  criteria: {
    completionPercentage: number;
    minimumScore: number;
  };
}

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnail: string;
  bannerImage?: string;
  category: 'Programming' | 'Data Science' | 'Web Dev' | 'Mobile' | 'DevOps' | 'Cybersecurity' | 'AI/ML' | 'Blockchain' | 'Game Development' | 'Design';
  subcategory?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Beginner to Advanced';
  tags: string[];
  concepts: IConcept[];
  syllabus: string[];
  prerequisites: string[];
  instructor: IInstructor;
  duration: string;
  totalConcepts: number;
  totalTopics: number;
  language: string;
  subtitles: string[];
  pricing: IPricing;
  status: 'draft' | 'published' | 'coming_soon' | 'archived';
  isPublic: boolean;
  isFeatured: boolean;
  isActive: boolean;
  comingSoon: boolean;
  stats: ICourseStats;
  reviews: IReview[];
  requirements: string[];
  learningOutcomes: string[];
  targetAudience: string[];
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  certificate: ICertificate;
  
  // Virtuals
  completionRate?: number;
  
  // Methods
  calculateAverageRating(): number;
  addReview(userId: Types.ObjectId, rating: number, comment?: string): Promise<ICourse>;
}

const topicSchema = new Schema<ITopic>({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ["video", "article", "quiz", "coding", "interactive"],
    required: true,
  },
  duration: { type: String, required: true },
  videoUrl: { type: String },
  thumbnail: { type: String },
  content: {
    videoUrl: String,
    duration: String,
    thumbnail: String,
    articleContent: String,
    quizQuestions: [
      {
        question: String,
        options: [String],
        correctAnswer: Number,
        explanation: String,
      },
    ],
    codingProblem: {
      title: String,
      description: String,
      starterCode: String,
      solution: String,
      testCases: [
        {
          input: String,
          expectedOutput: String,
        },
      ],
    },
    interactiveContent: Schema.Types.Mixed,
  },
  completed: { type: Boolean, default: false },
  order: { type: Number, required: true },
  isRequired: { type: Boolean, default: true },
  prerequisites: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
});

const conceptSchema = new Schema<IConcept>({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: String, required: true },
  estimatedTime: { type: Number, default: 30 },
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    default: "beginner",
  },
  completed: { type: Boolean, default: false },
  topics: [topicSchema],
  prerequisites: [{ type: Schema.Types.ObjectId, ref: "Concept" }],
  learningObjectives: [String],
  resources: [
    {
      title: String,
      url: String,
      type: { type: String, enum: ["article", "video", "book", "documentation"] },
    },
  ],
});

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String, maxlength: 200 },
    thumbnail: { type: String, required: true },
    bannerImage: { type: String },
    category: {
      type: String,
      required: true,
      enum: [
        "Programming",
        "Data Science",
        "Web Dev",
        "Mobile",
        "DevOps",
        "Cybersecurity",
        "AI/ML",
        "Blockchain",
        "Game Development",
        "Design",
      ],
    },
    subcategory: { type: String },
    level: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced", "Expert", "Beginner to Advanced"],
    },
    tags: [String],
    concepts: [conceptSchema],
    syllabus: [{ type: String }],
    prerequisites: [{ type: String }],
    instructor: {
      name: { type: String, required: true },
      bio: String,
      avatar: String,
      credentials: [String],
      socialLinks: {
        linkedin: String,
        twitter: String,
        github: String,
        website: String,
      },
    },
    duration: { type: String, required: true },
    totalConcepts: { type: Number, default: 0 },
    totalTopics: { type: Number, default: 0 },
    language: { type: String, default: "English" },
    subtitles: [String],
    pricing: {
      type: { type: String, enum: ["free", "premium", "one-time"], default: "free" },
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
      discountPercentage: { type: Number, default: 0 },
      originalPrice: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ["draft", "published", "coming_soon", "archived"],
      default: "draft",
    },
    isPublic: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    comingSoon: { type: Boolean, default: false },
    stats: {
      enrollments: { type: Number, default: 0 },
      completions: { type: Number, default: 0 },
      averageRating: { type: Number, required: true },
      totalRatings: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
    },
    reviews: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
        isVerified: { type: Boolean, default: false },
        helpful: { type: Number, default: 0 },
      },
    ],
    requirements: [String],
    learningOutcomes: [String],
    targetAudience: [String],
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
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ status: 1, isPublic: 1 });
courseSchema.index({ "stats.averageRating": -1 });
courseSchema.index({ "stats.enrollments": -1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ title: "text", description: "text", tags: "text" });

// Virtual for completion rate
courseSchema.virtual("completionRate").get(function (this: ICourse) {
  if (this.stats.enrollments === 0) return 0;
  return (this.stats.completions / this.stats.enrollments) * 100;
});

// Pre-save middleware to update totals
courseSchema.pre<ICourse>("save", function (next) {
  this.totalConcepts = this.concepts.length;
  this.totalTopics = this.concepts.reduce((total, concept) => total + concept.topics.length, 0);
  next();
});

// Method to calculate average rating
courseSchema.methods.calculateAverageRating = function (this: ICourse): number {
  if (this.reviews.length === 0) return 0;

  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.stats.averageRating = totalRating / this.reviews.length;
  this.stats.totalRatings = this.reviews.length;

  return this.stats.averageRating;
};

// Method to add review
courseSchema.methods.addReview = function (this: ICourse, userId: Types.ObjectId, rating: number, comment?: string): Promise<ICourse> {
  // Check if user already reviewed
  const existingReview = this.reviews.find((review) => review.userId.toString() === userId.toString());

  if (existingReview) {
    existingReview.rating = rating;
    existingReview.comment = comment;
    existingReview.createdAt = new Date();
  } else {
    this.reviews.push({
      userId,
      rating,
      comment,
      createdAt: new Date(),
      isVerified: false,
      helpful: 0,
    });
  }

  this.calculateAverageRating();
  return this.save();
};

export default model<ICourse>("Course", courseSchema); 