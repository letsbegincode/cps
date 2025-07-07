import mongoose, { Schema, Document, Types } from 'mongoose';

// Video Subdocument Schema
const VideoSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: String, required: true },
  videoUrl: { type: String, required: true },
  thumbnail: { type: String, required: true },
  order: { type: Number, required: true },
  isPreview: { type: Boolean, default: false }
}, { _id: true });

// Article Subdocument Schema
const ArticleSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  readTime: { type: String, required: true },
  order: { type: Number, required: true },
  author: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now }
}, { _id: true });

// TestCase Subdocument Schema
const TestCaseSchema = new Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  explanation: { type: String, required: true },
  isHidden: { type: Boolean, default: false }
}, { _id: true });

// CodingProblem Subdocument Schema
const CodingProblemSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'], 
    required: true 
  },
  category: { type: String, required: true },
  hints: [{ type: String }],
  starterCode: {
    python: String,
    java: String,
    javascript: String,
    cpp: String
  },
  solution: {
    python: String,
    java: String,
    javascript: String,
    cpp: String
  },
  testCases: [TestCaseSchema],
  constraints: [{ type: String }],
  timeLimit: { type: Number, required: true },
  memoryLimit: { type: String, required: true },
  order: { type: Number, required: true }
}, { _id: true });

// QuizQuestion Subdocument Schema
const QuizQuestionSchema = new Schema({
  type: { 
    type: String, 
    enum: ['mcq', 'true-false', 'fill-blank', 'coding'], 
    required: true 
  },
  question: { type: String, required: true },
  options: [{ type: String }],
  correctAnswers: [{ type: Schema.Types.Mixed }],
  explanation: { type: String, required: true },
  points: { type: Number, required: true },
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'], 
    required: true 
  }
}, { _id: true });

// Quiz Subdocument Schema
const QuizSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  timeLimit: { type: Number }, // seconds
  passingScore: { type: Number },
  questions: [QuizQuestionSchema],
  order: { type: Number }
}, { _id: true });

// Concept Subdocument Schema
const ConceptSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, required: true },
  estimatedTime: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'], 
    required: true 
  },
  videos: [VideoSchema],
  articles: [ArticleSchema],
  codingProblems: [CodingProblemSchema],
  quiz: QuizSchema,
  prerequisites: [{ type: Schema.Types.ObjectId }] // References to other concepts within the same course
}, { _id: true });

// Concept Reference Schema (for existing concepts)
const ConceptReferenceSchema = new Schema({
  conceptId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Concept', 
    required: true 
  },
  order: { type: Number, required: true },
  isRequired: { type: Boolean, default: true },
  estimatedTime: { type: String, required: true }, // e.g., "1h 30m"
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'], 
    required: true 
  },
  // Override fields (optional - will use concept defaults if not provided)
  customTitle: String,
  customDescription: String,
  customPrerequisites: [Schema.Types.ObjectId]
}, { _id: true });

// Topic Schema with both embedded and referenced concepts
const TopicSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, required: true },
  icon: { type: String, required: true },
  estimatedHours: { type: Number, required: true },
  
  // Support both embedded and referenced concepts
  concepts: [ConceptSchema], // Embedded concepts (for new content)
  conceptReferences: [ConceptReferenceSchema], // References to existing concepts
  
  // Helper field to determine which type of concepts to use
  useReferencedConcepts: { type: Boolean, default: false }
}, { _id: true });

// Main Course Schema
const CourseSchema = new Schema({
  title: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, required: true },
  shortDescription: { type: String, required: true },
    thumbnail: { type: String, required: true },
  instructor: {
    id: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    bio: { type: String, required: true },
    avatar: String,
    socialLinks: [{
      platform: String,
      url: String
    }]
  },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
    level: {
      type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Beginner to Advanced'],
    required: true 
  },
  tags: [{ type: String }],
  topics: [TopicSchema], // Embedded topics for fast access
  pricing: {
    type: { type: String, enum: ['free', 'paid'], required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    discountPrice: Number,
    originalPrice: String
  },
  stats: {
    totalStudents: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0, min: 0, max: 100 },
    totalDuration: { type: Number, default: 0 },
    totalConcepts: { type: Number, default: 0 },
    totalVideos: { type: Number, default: 0 },
    totalArticles: { type: Number, default: 0 },
    totalProblems: { type: Number, default: 0 },
    totalQuizzes: { type: Number, default: 0 }
  },
  requirements: [{ type: String }],
  learningOutcomes: [{ type: String }],
  targetAudience: [{ type: String }],
    status: {
      type: String,
    enum: ['draft', 'published', 'archived'], 
    default: 'draft' 
  },
  publishedAt: Date,
  seo: {
    keywords: [{ type: String }]
  },
  isPublic: { type: Boolean, default: false },
  comingSoon: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes for performance
CourseSchema.index({ slug: 1 }, { unique: true });
CourseSchema.index({ category: 1, level: 1 });
CourseSchema.index({ status: 1, isPublic: 1 });
CourseSchema.index({ 'instructor.id': 1 });
CourseSchema.index({ tags: 1 });

// Virtual for completion percentage
CourseSchema.virtual('completionPercentage').get(function() {
  return this.stats.completionRate;
});

// Method to calculate stats
CourseSchema.methods.calculateStats = function() {
  let totalConcepts = 0;
  let totalVideos = 0;
  let totalArticles = 0;
  let totalProblems = 0;
  let totalQuizzes = 0;
  let totalDuration = 0;

  this.topics.forEach((topic: any) => {
    if (topic.useReferencedConcepts) {
      totalConcepts += topic.conceptReferences.length;
    } else {
      totalConcepts += topic.concepts.length;
      
      topic.concepts.forEach((concept: any) => {
        totalVideos += concept.videos.length;
        totalArticles += concept.articles.length;
        totalProblems += concept.codingProblems.length;
        if (concept.quiz) totalQuizzes++;
      });
    }
    totalDuration += topic.estimatedHours;
  });

  this.stats.totalConcepts = totalConcepts;
  this.stats.totalVideos = totalVideos;
  this.stats.totalArticles = totalArticles;
  this.stats.totalProblems = totalProblems;
  this.stats.totalQuizzes = totalQuizzes;
  this.stats.totalDuration = totalDuration;
};

// Pre-save middleware to calculate stats
CourseSchema.pre('save', function(next) {
  this.calculateStats();
  next();
});

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  instructor: {
    id: Types.ObjectId;
    name: string;
    bio: string;
    avatar?: string;
    socialLinks?: Array<{
      platform: string;
      url: string;
    }>;
  };
  category: string;
  subcategory: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Beginner to Advanced';
  tags: string[];
  topics: Array<{
    _id: Types.ObjectId;
    title: string;
    description: string;
    order: number;
    icon: string;
    estimatedHours: number;
    useReferencedConcepts: boolean;
    concepts: Array<{
      _id: Types.ObjectId;
      title: string;
      description: string;
      order: number;
      estimatedTime: string;
      difficulty: 'Easy' | 'Medium' | 'Hard';
      videos: Array<{
        _id: Types.ObjectId;
        title: string;
        description: string;
        duration: string;
        videoUrl: string;
        thumbnail: string;
        order: number;
        isPreview: boolean;
      }>;
      articles: Array<{
        _id: Types.ObjectId;
        title: string;
        content: string;
        readTime: string;
        order: number;
        author: string;
        publishedAt: Date;
      }>;
      codingProblems: Array<{
        _id: Types.ObjectId;
        title: string;
        description: string;
        difficulty: 'Easy' | 'Medium' | 'Hard';
        category: string;
        hints: string[];
        starterCode: {
          python?: string;
          java?: string;
          javascript?: string;
          cpp?: string;
        };
        solution: {
          python?: string;
          java?: string;
          javascript?: string;
          cpp?: string;
        };
        testCases: Array<{
          _id: Types.ObjectId;
          input: string;
          expectedOutput: string;
          explanation: string;
          isHidden: boolean;
        }>;
        constraints: string[];
        timeLimit: number;
        memoryLimit: string;
        order: number;
      }>;
      quiz?: {
        _id: Types.ObjectId;
        title: string;
        description: string;
        timeLimit: number;
        passingScore: number;
        questions: Array<{
          _id: Types.ObjectId;
          type: 'mcq' | 'true-false' | 'fill-blank' | 'coding';
          question: string;
          options?: string[];
          correctAnswers: number[] | string[];
          explanation: string;
          points: number;
          difficulty: 'Easy' | 'Medium' | 'Hard';
        }>;
        order: number;
      };
      prerequisites: Types.ObjectId[];
    }>;
    conceptReferences: Array<{
      _id: Types.ObjectId;
      conceptId: Types.ObjectId;
      order: number;
      isRequired: boolean;
      estimatedTime: string;
      difficulty: 'Easy' | 'Medium' | 'Hard';
      customTitle?: string;
      customDescription?: string;
      customPrerequisites?: Types.ObjectId[];
    }>;
  }>;
  pricing: {
    type: 'free' | 'paid';
    price: number;
    currency: string;
    discountPrice?: number;
    originalPrice?: string;
  };
  stats: {
    totalStudents: number;
    totalRatings: number;
    averageRating: number;
    totalReviews: number;
    completionRate: number;
    totalDuration: number;
    totalConcepts: number;
    totalVideos: number;
    totalArticles: number;
    totalProblems: number;
    totalQuizzes: number;
  };
  requirements: string[];
  learningOutcomes: string[];
  targetAudience: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  seo: {
    keywords: string[];
  };
  isPublic: boolean;
  comingSoon: boolean;
  isActive: boolean;
  calculateStats(): void;
  completionPercentage?: number;
}

const Course = mongoose.model<ICourse>('Course', CourseSchema);

export default Course; 