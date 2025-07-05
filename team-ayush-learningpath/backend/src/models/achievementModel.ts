import { Schema, model, Document, Types } from 'mongoose';

// Interfaces for Achievement model
export interface IAchievementCriteria {
  type: 'count' | 'percentage' | 'time' | 'streak' | 'score' | 'custom';
  target: number;
  metric: string;
  context?: string;
  timeframe?: string;
}

export interface IAchievementRewards {
  experiencePoints: number;
  badge?: string;
  title?: string;
  unlocks?: string[];
}

export interface IAchievementPrerequisite {
  achievementId: Types.ObjectId;
  required: boolean;
}

export interface IAchievementStats {
  totalUnlocked: number;
  firstUnlockedAt?: Date;
  lastUnlockedAt?: Date;
  averageTimeToUnlock: number;
}

export interface IAchievementLocalization {
  title: Map<string, string>;
  description: Map<string, string>;
}

export interface IAchievement extends Document {
  title: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  badge?: string;
  type: 'milestone' | 'streak' | 'skill' | 'completion' | 'performance' | 'social' | 'special';
  category: 'learning' | 'engagement' | 'achievement' | 'social' | 'special';
  criteria: IAchievementCriteria;
  difficulty: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  rarity: number;
  rewards: IAchievementRewards;
  isVisible: boolean;
  isActive: boolean;
  isSecret: boolean;
  prerequisites: IAchievementPrerequisite[];
  stats: IAchievementStats;
  localization: IAchievementLocalization;
  
  // Virtuals
  unlockRate?: number;
  
  // Methods
  checkCriteria(userStats: any): boolean;
  awardToUser(userId: Types.ObjectId): Promise<boolean>;
}

const achievementSchema = new Schema<IAchievement>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, default: "#3B82F6" },
    badge: { type: String },
    type: {
      type: String,
      enum: ["milestone", "streak", "skill", "completion", "performance", "social", "special"],
      required: true,
    },
    category: {
      type: String,
      enum: ["learning", "engagement", "achievement", "social", "special"],
      required: true,
    },
    criteria: {
      type: {
        type: String,
        enum: ["count", "percentage", "time", "streak", "score", "custom"],
        required: true,
      },
      target: { type: Number, required: true },
      metric: { type: String, required: true },
      context: String,
      timeframe: String,
    },
    difficulty: {
      type: String,
      enum: ["common", "uncommon", "rare", "epic", "legendary"],
      default: "common",
    },
    rarity: { type: Number, default: 0 },
    rewards: {
      experiencePoints: { type: Number, default: 0 },
      badge: String,
      title: String,
      unlocks: [String],
    },
    isVisible: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    isSecret: { type: Boolean, default: false },
    prerequisites: [
      {
        achievementId: { type: Schema.Types.ObjectId, ref: "Achievement" },
        required: { type: Boolean, default: true },
      },
    ],
    stats: {
      totalUnlocked: { type: Number, default: 0 },
      firstUnlockedAt: Date,
      lastUnlockedAt: Date,
      averageTimeToUnlock: { type: Number, default: 0 },
    },
    localization: {
      title: { type: Map, of: String },
      description: { type: Map, of: String },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
achievementSchema.index({ slug: 1 }, { unique: true });
achievementSchema.index({ type: 1, category: 1 });
achievementSchema.index({ difficulty: 1 });
achievementSchema.index({ isActive: 1, isVisible: 1 });
achievementSchema.index({ "stats.totalUnlocked": -1 });

// Virtual for unlock rate
achievementSchema.virtual("unlockRate").get(function (this: IAchievement) {
  return this.rarity;
});

// Method to check if user meets criteria
achievementSchema.methods.checkCriteria = function (this: IAchievement, userStats: any): boolean {
  const { type, target, metric, context, timeframe } = this.criteria;

  switch (type) {
    case "count":
      return userStats[metric] >= target;

    case "percentage":
      return (userStats[metric] / userStats.total) * 100 >= target;

    case "time":
      return userStats[metric] >= target;

    case "streak":
      return userStats.currentStreak >= target;

    case "score":
      return userStats.averageScore >= target;

    default:
      return false;
  }
};

// Method to award achievement to user
achievementSchema.methods.awardToUser = async function (this: IAchievement, userId: Types.ObjectId): Promise<boolean> {
  const User = model("User");

  try {
    const user = await User.findById(userId);
    if (!user) return false;

    // Check if user already has this achievement
    const hasAchievement = user.achievements.some(
      (achievement: any) => achievement.achievementId.toString() === (this._id as any).toString(),
    );

    if (hasAchievement) return false;

    // Award the achievement
    user.achievements.push({
      achievementId: this._id as any,
      unlockedAt: new Date(),
      progress: 100,
    });

    // Add experience points
    user.stats.experiencePoints += this.rewards.experiencePoints;

    await user.save();

    // Update achievement stats
    this.stats.totalUnlocked += 1;
    if (!this.stats.firstUnlockedAt) {
      this.stats.firstUnlockedAt = new Date();
    }
    this.stats.lastUnlockedAt = new Date();

    await this.save();

    return true;
  } catch (error) {
    console.error("Error awarding achievement:", error);
    return false;
  }
};

export default model<IAchievement>("Achievement", achievementSchema); 